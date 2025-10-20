import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getDefaultProjectId } from '@/lib/projects/get-default-project'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'

// Schema de validação
const searchSchema = z.object({
  cnpj: z.string().optional(),
  website: z.string().optional()
}).refine(data => data.cnpj || data.website, {
  message: "CNPJ ou website deve ser fornecido"
}).refine(data => !(data.cnpj && data.website), {
  message: "Forneça apenas CNPJ ou website, não ambos"
})

// Circuit breaker simples
class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  private readonly threshold = 3
  private readonly timeout = 30000 // 30s

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const now = Date.now()
      if (now - this.lastFailure < this.timeout) {
        return true
      }
      // Reset após timeout
      this.failures = 0
    }
    return false
  }

  recordSuccess(): void {
    this.failures = 0
  }

  recordFailure(): void {
    this.failures++
    this.lastFailure = Date.now()
  }
}

const receitaBreaker = new CircuitBreaker()
const googleBreaker = new CircuitBreaker()

// Função para buscar dados da ReceitaWS com retry
async function fetchReceitaWS(cnpj: string): Promise<any> {
  const enabled = process.env.ENABLE_RECEITA !== 'false'
  if (!enabled) {
    throw new Error('Provider ReceitaWS desabilitado')
  }

  if (receitaBreaker.isOpen()) {
    throw new Error('Provider ReceitaWS temporariamente indisponível')
  }

  const token = process.env.RECEITAWS_API_TOKEN
  if (!token) {
    throw new Error('RECEITAWS_API_TOKEN não configurado')
  }

  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[CompanySearch] Tentativa ${attempt}/3 para ReceitaWS: ${cnpj}`)
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        throw new Error(`ReceitaWS HTTP ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado na ReceitaWS')
      }

      receitaBreaker.recordSuccess()
      console.log(`[CompanySearch] ReceitaWS sucesso: ${data.nome}`)
      return data
    } catch (error: any) {
      console.error(`[CompanySearch] ReceitaWS tentativa ${attempt} falhou:`, error.message)
      
      if (attempt === 3) {
        receitaBreaker.recordFailure()
        throw error
      }
      
      // Backoff exponencial
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}

// Função para buscar dados do Google CSE
async function fetchGoogleCSE(companyName: string, cnpj?: string): Promise<any> {
  const enabled = process.env.ENABLE_GOOGLE_CSE !== 'false'
  if (!enabled) {
    throw new Error('Provider Google CSE desabilitado')
  }

  if (googleBreaker.isOpen()) {
    throw new Error('Provider Google CSE temporariamente indisponível')
  }

  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    throw new Error('GOOGLE_API_KEY ou GOOGLE_CSE_ID não configurados')
  }

  try {
    console.log(`[CompanySearch] Buscando Google CSE: ${companyName}`)
    
    const query = `${companyName} ${cnpj || ''}`.trim()
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5`
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Google CSE HTTP ${response.status}`)
    }

    const data = await response.json()
    googleBreaker.recordSuccess()
    
    console.log(`[CompanySearch] Google CSE sucesso: ${data.items?.length || 0} resultados`)
    return data
  } catch (error: any) {
    console.error('[CompanySearch] Google CSE falhou:', error.message)
    googleBreaker.recordFailure()
    throw error
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    console.log('[CompanySearch] Input recebido:', { cnpj: body.cnpj ? '***' : undefined, website: body.website })

    // Validar input
    const validation = searchSchema.safeParse(body)
    if (!validation.success) {
      console.log('[CompanySearch] Input inválido:', validation.error.issues)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { cnpj, website } = validation.data

    let companyData: any = null
    let analysisData: any = null

    if (cnpj) {
      // Busca por CNPJ
      const normalizedCnpj = normalizeCnpj(cnpj)
      
      if (!isValidCnpj(normalizedCnpj)) {
        console.log('[CompanySearch] CNPJ inválido:', normalizedCnpj)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'INVALID_CNPJ',
            message: 'CNPJ inválido. Verifique os dígitos verificadores.'
          }
        }, { status: 422 })
      }

      try {
        companyData = await fetchReceitaWS(normalizedCnpj)
        
        // Buscar dados complementares do Google CSE
        try {
          const googleData = await fetchGoogleCSE(companyData.nome, normalizedCnpj)
          analysisData = {
            website: googleData.items?.[0]?.link || null,
            news: googleData.items?.slice(0, 3).map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              date: item.pagemap?.metatags?.[0]?.['article:published_time']
            })) || []
          }
        } catch (googleError: any) {
          console.warn('[CompanySearch] Google CSE falhou, continuando sem dados complementares:', googleError.message)
          analysisData = { website: null, news: [] }
        }
      } catch (receitaError: any) {
        console.error('[CompanySearch] ReceitaWS falhou:', receitaError.message)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: `Erro ao buscar dados da Receita Federal: ${receitaError.message}`
          }
        }, { status: 502 })
      }
    } else if (website) {
      // Busca por website
      const domain = normalizeDomain(website)
      
      try {
        const googleData = await fetchGoogleCSE(domain)
        
        companyData = {
          nome: domain,
          fantasia: domain,
          situacao: 'ATIVA',
          website: `https://${domain}`
        }
        
        analysisData = {
          website: `https://${domain}`,
          news: googleData.items?.slice(0, 3).map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
            date: item.pagemap?.metatags?.[0]?.['article:published_time']
          })) || []
        }
      } catch (googleError: any) {
        console.error('[CompanySearch] Google CSE falhou:', googleError.message)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: `Erro ao buscar dados do website: ${googleError.message}`
          }
        }, { status: 502 })
      }
    }

    // Obter projeto padrão
    const projectId = await getDefaultProjectId()
    console.log('[CompanySearch] ProjectId obtido:', projectId)

    // Parse capital social
    const capitalNum = Number(
      (companyData.capital_social || '0')
        .toString()
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
    ) || 0

    // Preparar dados para inserção
    const companyInsert = {
      cnpj: cnpj ? normalizeCnpj(cnpj) : null,
      name: companyData.nome || 'Empresa sem razão social',
      tradeName: companyData.fantasia || null,
      projectId,
      capital: capitalNum,
      size: companyData.porte || 'MÉDIO',
      location: JSON.stringify({
        cidade: companyData.municipio || '',
        estado: companyData.uf || '',
        endereco: companyData.logradouro || '',
        numero: companyData.numero || '',
        bairro: companyData.bairro || '',
        cep: companyData.cep || ''
      }),
      financial: JSON.stringify({
        porte: companyData.porte || 'MÉDIO',
        situacao: companyData.situacao || 'ATIVA',
        abertura: companyData.abertura || '',
        naturezaJuridica: companyData.natureza_juridica || '',
        capitalSocial: companyData.capital_social || '0'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Inserir empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .insert(companyInsert)
      .select()
      .single()

    if (companyError) {
      console.error('[CompanySearch] Erro ao inserir empresa:', companyError)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erro ao salvar empresa no banco de dados'
        }
      }, { status: 500 })
    }

    // Inserir análise
    const analysisInsert = {
      companyId: company.id,
      projectId,
      insights: JSON.stringify({
        website: analysisData.website,
        news: analysisData.news,
        scoreRegras: 75, // Score baseado em regras
        scoreIA: 0,
        justificativa: 'Análise baseada em dados da Receita Federal e Google CSE'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('Analysis')
      .insert(analysisInsert)
      .select()
      .single()

    if (analysisError) {
      console.error('[CompanySearch] Erro ao inserir análise:', analysisError)
      // Não falhar aqui, empresa já foi criada
    }

    const latency = Date.now() - startTime
    console.log(`[CompanySearch] Sucesso em ${latency}ms:`, company.id)

    return NextResponse.json({
      ok: true,
      data: {
        company: {
          id: company.id,
          cnpj: company.cnpj,
          name: company.name,
          tradeName: company.tradeName,
          capital: company.capital,
          size: company.size
        },
        analysis: analysis ? {
          id: analysis.id,
          insights: analysis.insights
        } : null,
        enrichment: {
          website: analysisData.website,
          news: analysisData.news,
          latency
        }
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[CompanySearch] Erro geral em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cnpj = url.searchParams.get('cnpj')
  const website = url.searchParams.get('website')

  if (!cnpj && !website) {
    return NextResponse.json({
      ok: false,
      error: {
        code: 'MISSING_PARAMETERS',
        message: 'Forneça um parâmetro "cnpj" ou "website"'
      }
    }, { status: 400 })
  }

  // Redirecionar para POST
  return POST(req)
}
