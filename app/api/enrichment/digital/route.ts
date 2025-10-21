import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 10

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const SERPER = process.env.SERPER_API_KEY

export async function POST(req: Request) {
  try {
    const { companyId, keywords = [] } = await req.json()
    
    const { data: company, error } = await supabaseAdmin
      .from('Company')
      .select('id,name,tradeName,cnpj')
      .eq('id', companyId)
      .single()

    if (error || !company) {
      return NextResponse.json({
        ok: false,
        error: { message: 'Empresa não encontrada' }
      }, { status: 404 })
    }

    if (!SERPER) {
      return NextResponse.json({
        ok: false,
        error: { message: 'SERPER_API_KEY não configurado' }
      }, { status: 503 })
    }

    const q = `${company.name ?? company.tradeName ?? ''} ${company.cnpj ?? ''} ${keywords.join(' ')}`.trim()
    
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q, num: 10 }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      throw new Error(`Serper HTTP ${res.status}`)
    }

    const data = await res.json()

    // Salvar snapshot de presença digital
    await supabaseAdmin.from('DigitalPresence').insert({
      companyId,
      snapshot: data?.organic ?? [],
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      results: data
    })
  } catch (e: any) {
    console.error('[DigitalEnrichment] Erro:', e.message)
    return NextResponse.json({
      ok: false,
      error: { message: e.message }
    }, { status: 500 })
  }
}

