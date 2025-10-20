import { NextResponse } from 'next/server'
import { hunterEmailFinder } from '@/lib/integrations/hunter'

export async function POST(req: Request) {
  try {
    const params = await req.json()

    if (!params.domain) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_DOMAIN', message: 'domain é obrigatório' }
      }, { status: 400 })
    }

    const data = await hunterEmailFinder(params)

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Hunter] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'HUNTER_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

