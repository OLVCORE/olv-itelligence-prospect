import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[API /check-env] 🔍 Verificando variáveis de ambiente...')

    const envCheck = {
      // Variáveis públicas (client-side)
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // Variáveis privadas (server-side)
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      
      // APIs externas
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      GOOGLE_CSE_ID: !!process.env.GOOGLE_CSE_ID,
      HUNTER_API_KEY: !!process.env.HUNTER_API_KEY,
      RECEITAWS_API_TOKEN: !!process.env.RECEITAWS_API_TOKEN,
    }

    const missingVars = Object.entries(envCheck)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key)

    const status = missingVars.length === 0 ? 'success' : 'error'

    return NextResponse.json({
      status,
      message: missingVars.length === 0 
        ? '✅ Todas as variáveis de ambiente estão configuradas'
        : `❌ ${missingVars.length} variáveis faltando`,
      environment: process.env.NODE_ENV,
      variables: envCheck,
      missing: missingVars,
      publicVars: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Faltando',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltando',
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[API /check-env] ❌ Erro:', error.message)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao verificar variáveis de ambiente',
      },
      { status: 500 }
    )
  }
}
