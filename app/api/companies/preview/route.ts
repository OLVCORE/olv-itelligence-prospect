import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'

export const runtime = 'nodejs'
export const maxDuration = 10 // Preview with ReceitaWS + Google CSE: 10s

// Schema de validação
const previewSchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
  mode: z.enum(['cnpj', 'website'], {
    errorMap: () => ({ message: "Mode deve ser 'cnpj' ou 'website'" })
  })
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

// Função para buscar preview da ReceitaWS
async function fetchReceitaPreview(cnpj: string): Promise<any> {
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
  
  try {
    console.log(`[CompanyPreview] Buscando ReceitaWS: ${cnpj}`)
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`ReceitaWS HTTP ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status === 'ERROR') {
      throw new Error(data.message || 'CNPJ não encontrado na ReceitaWS')
    }

    receitaBreaker.recordSuccess()
    
    console.log('[CompanyPreview] ✅ Dados ReceitaWS recebidos:', JSON.stringify(data, null, 2))
    
    // Retornar TODOS os dados da ReceitaWS sem modificar
    return data
  } catch (error: any) {
    console.error('[CompanyPreview] ReceitaWS falhou:', error.message)
    receitaBreaker.recordFailure()
    throw error
  }
}

// Função para buscar preview de website
async function fetchWebsitePreview(domain: string): Promise<any> {
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
    console.log(`[CompanyPreview] Buscando website: ${domain}`)
    
    const query = `site:${domain}`
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=3`
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Google CSE HTTP ${response.status}`)
    }

    const data = await response.json()
    googleBreaker.recordSuccess()
    
    return {
      website: `https://${domain}`,
      title: data.items?.[0]?.title || domain,
      description: data.items?.[0]?.snippet || 'Website encontrado',
      results: data.items?.length || 0
    }
  } catch (error: any) {
    console.error('[CompanyPreview] Google CSE falhou:', error.message)
    googleBreaker.recordFailure()
    throw error
  }
}

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    console.log('[CompanyPreview] Input recebido:', { query: body.query?.substring(0, 20) + '...', mode: body.mode })

    // Validar input
    const validation = previewSchema.safeParse(body)
    if (!validation.success) {
      console.log('[CompanyPreview] Input inválido:', validation.error.issues)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { query, mode } = validation.data
    let previewData: any = null

    if (mode === 'cnpj') {
      // Preview por CNPJ
      const normalizedCnpj = normalizeCnpj(query)
      
      if (!isValidCnpj(normalizedCnpj)) {
        console.log('[CompanyPreview] CNPJ inválido:', normalizedCnpj)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'INVALID_CNPJ',
            message: 'CNPJ inválido. Verifique os dígitos verificadores.'
          }
        }, { status: 422 })
      }

      try {
        previewData = await fetchReceitaPreview(normalizedCnpj)
      } catch (receitaError: any) {
        console.error('[CompanyPreview] ReceitaWS falhou:', receitaError.message)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: `Erro ao buscar dados da Receita Federal: ${receitaError.message}`
          }
        }, { status: 502 })
      }
    } else if (mode === 'website') {
      // Preview por website
      const domain = normalizeDomain(query)
      
      try {
        previewData = await fetchWebsitePreview(domain)
      } catch (googleError: any) {
        console.error('[CompanyPreview] Google CSE falhou:', googleError.message)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: `Erro ao buscar dados do website: ${googleError.message}`
          }
        }, { status: 502 })
      }
    }

    const latency = Date.now() - startTime
    console.log(`[CompanyPreview] Sucesso em ${latency}ms`)
    
    return NextResponse.json({
      ok: true,
      data: {
        preview: previewData,
        mode,
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[CompanyPreview] Erro geral em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}
