import { NextResponse } from 'next/server'
import { hunterEmailVerifier } from '@/lib/integrations/hunter'

export async function POST(req: Request) {
  try {
    const params = await req.json()

    if (!params.email) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_EMAIL', message: 'email é obrigatório' }
      }, { status: 400 })
    }

    const data = await hunterEmailVerifier(params)

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Hunter Verify] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'HUNTER_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

