import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface ProviderStatus {
  status: 'ok' | 'fail' | 'disabled'
  latency?: number
  error?: string
}

interface HealthResponse {
  timestamp: string
  providers: {
    supabase: ProviderStatus
    receita: ProviderStatus
    googleCse: ProviderStatus
    openai: ProviderStatus
  }
  overall: 'healthy' | 'degraded' | 'unhealthy'
}

async function checkSupabase(): Promise<ProviderStatus> {
  const start = Date.now()
  try {
    const { error } = await supabaseAdmin
      .from('Project')
      .select('id')
      .limit(1)
      .single()
    
    const latency = Date.now() - start
    
    if (error) {
      return { status: 'fail', latency, error: error.message }
    }
    
    return { status: 'ok', latency }
  } catch (error: any) {
    return { status: 'fail', latency: Date.now() - start, error: error.message }
  }
}

async function checkReceita(): Promise<ProviderStatus> {
  const enabled = process.env.ENABLE_RECEITA !== 'false'
  if (!enabled) {
    return { status: 'disabled' }
  }

  const start = Date.now()
  try {
    const token = process.env.RECEITAWS_API_TOKEN
    if (!token) {
      return { status: 'fail', error: 'RECEITAWS_API_TOKEN não configurado' }
    }

    // Teste com CNPJ público conhecido (Receita Federal)
    const response = await fetch('https://receitaws.com.br/v1/cnpj/00000000000191', {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    })

    const latency = Date.now() - start
    
    if (!response.ok) {
      return { status: 'fail', latency, error: `HTTP ${response.status}` }
    }

    return { status: 'ok', latency }
  } catch (error: any) {
    return { status: 'fail', latency: Date.now() - start, error: error.message }
  }
}

async function checkGoogleCSE(): Promise<ProviderStatus> {
  const enabled = process.env.ENABLE_GOOGLE_CSE !== 'false'
  if (!enabled) {
    return { status: 'disabled' }
  }

  const start = Date.now()
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID

    if (!apiKey || !cseId) {
      return { status: 'fail', error: 'GOOGLE_API_KEY ou GOOGLE_CSE_ID não configurados' }
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=test&num=1`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    })

    const latency = Date.now() - start
    
    if (!response.ok) {
      return { status: 'fail', latency, error: `HTTP ${response.status}` }
    }

    return { status: 'ok', latency }
  } catch (error: any) {
    return { status: 'fail', latency: Date.now() - start, error: error.message }
  }
}

async function checkOpenAI(): Promise<ProviderStatus> {
  const enabled = process.env.ENABLE_OPENAI !== 'false'
  if (!enabled) {
    return { status: 'disabled' }
  }

  const start = Date.now()
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return { status: 'fail', error: 'OPENAI_API_KEY não configurado' }
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000)
    })

    const latency = Date.now() - start
    
    if (!response.ok) {
      return { status: 'fail', latency, error: `HTTP ${response.status}` }
    }

    return { status: 'ok', latency }
  } catch (error: any) {
    return { status: 'fail', latency: Date.now() - start, error: error.message }
  }
}

export async function GET() {
  try {
    console.log('[EngineHealth] Verificando status dos providers...')

    const [supabase, receita, googleCse, openai] = await Promise.all([
      checkSupabase(),
      checkReceita(),
      checkGoogleCSE(),
      checkOpenAI()
    ])

    const providers = { supabase, receita, googleCse, openai }
    
    // Determinar status geral
    const hasFailures = Object.values(providers).some(p => p.status === 'fail')
    const hasDisabled = Object.values(providers).some(p => p.status === 'disabled')
    
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (hasFailures) {
      overall = 'unhealthy'
    } else if (hasDisabled) {
      overall = 'degraded'
    }

    const response: HealthResponse = {
      timestamp: new Date().toISOString(),
      providers,
      overall
    }

    console.log('[EngineHealth] Status geral:', overall)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[EngineHealth] Erro geral:', error.message)
    return NextResponse.json(
      { 
        ok: false, 
        error: { 
          code: 'HEALTH_CHECK_FAILED', 
          message: 'Erro ao verificar providers' 
        } 
      },
      { status: 500 }
    )
  }
}
