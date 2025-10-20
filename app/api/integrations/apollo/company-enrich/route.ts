import { NextResponse } from 'next/server'
import { apolloCompanyEnrich } from '@/lib/integrations/apollo'

export async function POST(req: Request) {
  try {
    const params = await req.json()

    if (!params.domain && !params.organization_name) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_PARAMS', message: 'domain ou organization_name é obrigatório' }
      }, { status: 400 })
    }

    const data = await apolloCompanyEnrich(params)

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Apollo] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'APOLLO_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

