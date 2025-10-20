import { NextResponse } from 'next/server'
import { fetchHeaders } from '@/lib/integrations/http-headers'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_URL', message: 'url é obrigatório' }
      }, { status: 400 })
    }

    const data = await fetchHeaders(url)

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API HTTP Headers] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'HEADERS_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

