import { NextResponse } from 'next/server'
import { apolloPeopleSearch } from '@/lib/integrations/apollo'

export async function POST(req: Request) {
  try {
    const params = await req.json()

    const data = await apolloPeopleSearch(params)

    return NextResponse.json({
      ok: true,
      data
    })
  } catch (error: any) {
    console.error('[API Apollo People] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'APOLLO_ERROR',
        message: error.message
      }
    }, { status: 502 })
  }
}

