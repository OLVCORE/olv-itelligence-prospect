import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { receitaWS } from '@/lib/services/receitaws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 15 // ReceitaWS + Google CSE: 15s

// Schema de validação
const searchSchema = z.object({
  cnpj: z.string().optional(),
  website: z.string().optional(),
}).refine(data => data.cnpj || data.website, {
  message: "É necessário fornecer CNPJ ou website"
})

// Circuit breaker simples
class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  private readonly threshold = 3
  private readonly timeout = 60000 // 60s

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      const now = Date.now()
      if (now - this.lastFailure < this.timeout) {
        return true
      }
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

// Retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`[Retry] Tentativa ${i + 1} falhou, aguardando ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

// Função para buscar dados da ReceitaWS com retry
async function fetchReceitaData(cnpj: string) {
  if (receitaBreaker.isOpen()) {
    throw new Error('Provider ReceitaWS temporariamente indisponível')
  }

  try {
    console.log(`[CompanySearch] 📋 Buscando ReceitaWS: ${cnpj}`)
    
    const data = await retryWithBackoff(
      () => receitaWS.buscarPorCNPJ(cnpj),
      3, // 3 tentativas
      2000 // 2s inicial
    )
    
    if (!data) {
      throw new Error('CNPJ não encontrado na ReceitaWS')
    }

    receitaBreaker.recordSuccess()
    console.log('[CompanySearch] ✅ Dados ReceitaWS recebidos:', data.nome)
    
    return receitaWS.converterParaFormatoInterno(data)
  } catch (error: any) {
    console.error('[CompanySearch] ❌ ReceitaWS falhou:', error.message)
    receitaBreaker.recordFailure()
    throw error
  }
}

// Função para buscar presença digital
async function fetchDigitalPresence(companyName: string, cnpj?: string) {
  if (googleBreaker.isOpen()) {
    throw new Error('Provider Google CSE temporariamente indisponível')
  }

  try {
    console.log(`[CompanySearch] 🌐 Buscando presença digital: ${companyName}`)
    
    const data = await retryWithBackoff(
      () => fetchGoogleCSE(companyName, cnpj),
      2, // 2 tentativas
      2000 // 2s inicial
    )
    
    googleBreaker.recordSuccess()
    console.log('[CompanySearch] ✅ Presença digital:', {
      website: data.website?.url || 'não encontrado',
      news: data.news.length
    })
    
    return data
  } catch (error: any) {
    console.error('[CompanySearch] ⚠️ Google CSE falhou:', error.message)
    googleBreaker.recordFailure()
    // Não throw - presença digital é opcional
    return { website: null, news: [] }
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    console.log('[CompanySearch] 🔍 Busca iniciada:', { 
      cnpj: body.cnpj?.substring(0, 5) + '...', 
      website: body.website 
    })

    // Validar input
    const validation = searchSchema.safeParse(body)
    if (!validation.success) {
      console.log('[CompanySearch] ❌ Input inválido:', validation.error.issues)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { cnpj: inputCnpj, website } = validation.data

    // Normalizar e validar CNPJ se fornecido
    let cnpj = inputCnpj ? normalizeCnpj(inputCnpj) : null
    
    if (cnpj && !isValidCnpj(cnpj)) {
      console.log('[CompanySearch] ❌ CNPJ inválido:', cnpj)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_CNPJ',
          message: 'CNPJ inválido. Verifique os dígitos.'
        }
      }, { status: 422 })
    }

    // Se forneceu website mas não CNPJ, tentar resolver CNPJ
    if (!cnpj && website) {
      const domain = normalizeDomain(website)
      console.log('[CompanySearch] 🔍 Tentando resolver CNPJ do website:', domain)
      
      // TODO: Implementar resolução de CNPJ via website
      // Por enquanto, retornar erro amigável
      return NextResponse.json({
        ok: false,
        error: {
          code: 'CNPJ_REQUIRED',
          message: 'Por favor, forneça o CNPJ da empresa. A busca por website será implementada em breve.'
        }
      }, { status: 422 })
    }

    if (!cnpj) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'CNPJ_REQUIRED',
          message: 'CNPJ é obrigatório'
        }
      }, { status: 422 })
    }

    // 1️⃣ Buscar dados cadastrais (ReceitaWS)
    let receitaData: any
    try {
      receitaData = await fetchReceitaData(cnpj)
    } catch (receitaError: any) {
      console.error('[CompanySearch] ❌ Erro na ReceitaWS:', receitaError.message)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'RECEITA_ERROR',
          message: `Erro ao buscar dados cadastrais: ${receitaError.message}`
        }
      }, { status: 502 })
    }

    // 2️⃣ Buscar presença digital (Google CSE/Serper)
    const digitalPresence = await fetchDigitalPresence(
      receitaData.fantasia || receitaData.razao,
      cnpj
    )

    // 3️⃣ Upsert no Supabase
    const sb = supabaseAdmin()
    const now = new Date().toISOString()

    try {
      console.log('[CompanySearch] 💾 Salvando no Supabase...')

      // Verificar se empresa já existe
      const { data: existing, error: selectError } = await sb
        .from('Company')
        .select('id')
        .eq('cnpj', cnpj)
        .maybeSingle()

      if (selectError) {
        console.error('[CompanySearch] ❌ Erro ao verificar empresa:', selectError)
        throw selectError
      }

      let companyId: string

      if (existing?.id) {
        // Atualizar empresa existente
        console.log('[CompanySearch] 🔄 Atualizando empresa existente:', existing.id)
        
        const { error: updateError } = await sb
          .from('Company')
          .update({
            name: receitaData.razao,
            tradeName: receitaData.fantasia || receitaData.razao,
            capital: parseFloat(receitaData.capitalSocial.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            status: receitaData.situacao,
            domain: digitalPresence.website?.url,
            cnae: receitaData.cnae,
            cnaeDescription: receitaData.cnaeDescricao,
            porte: receitaData.porte,
            city: receitaData.cidade,
            state: receitaData.uf,
            address: `${receitaData.logradouro}, ${receitaData.numero}`,
            updatedAt: now
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error('[CompanySearch] ❌ Erro ao atualizar:', updateError)
          throw updateError
        }

        companyId = existing.id
      } else {
        // Criar nova empresa
        console.log('[CompanySearch] ➕ Criando nova empresa')
        
        const { data: newCompany, error: insertError } = await sb
          .from('Company')
          .insert({
            cnpj,
            name: receitaData.razao,
            tradeName: receitaData.fantasia || receitaData.razao,
            capital: parseFloat(receitaData.capitalSocial.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
            status: receitaData.situacao,
            domain: digitalPresence.website?.url,
            cnae: receitaData.cnae,
            cnaeDescription: receitaData.cnaeDescricao,
            porte: receitaData.porte,
            city: receitaData.cidade,
            state: receitaData.uf,
            address: `${receitaData.logradouro}, ${receitaData.numero}`,
            createdAt: now,
            updatedAt: now
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('[CompanySearch] ❌ Erro ao inserir:', insertError)
          throw insertError
        }

        companyId = newCompany.id
      }

      console.log('[CompanySearch] ✅ Empresa salva:', companyId)

      // 4️⃣ Salvar notícias (se houver)
      if (digitalPresence.news.length > 0) {
        console.log('[CompanySearch] 📰 Salvando notícias:', digitalPresence.news.length)
        
        // TODO: Implementar salvamento de notícias em tabela separada
        // Por enquanto, apenas log
      }

      const latency = Date.now() - startTime
      console.log(`[CompanySearch] ✅ Busca completa em ${latency}ms`)

      return NextResponse.json({
        ok: true,
        data: {
          company: {
            id: companyId,
            cnpj,
            name: receitaData.razao,
            tradeName: receitaData.fantasia || receitaData.razao,
            capital: receitaData.capitalSocial,
            porte: receitaData.porte,
            situacao: receitaData.situacao
          },
          receitaData,
          digitalPresence,
          latency
        }
      })

    } catch (dbError: any) {
      console.error('[CompanySearch] ❌ Erro no banco:', dbError.message)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erro ao salvar dados no banco'
        }
      }, { status: 500 })
    }

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[CompanySearch] ❌ Erro geral em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}
