import { NextResponse } from 'next/server'
import { serperSearch } from '@/lib/integrations/serper'

export async function POST(req: Request) {
  try {
    const { q, num, gl, hl } = await req.json()

    if (!q) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_QUERY', message: 'Query (q) é obrigatório' }
      }, { status: 400 })
    }

    const data = await serperSearch({ q, num, gl, hl })

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Serper] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'SERPER_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

