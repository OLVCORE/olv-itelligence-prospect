import { NextResponse } from 'next/server'
import { fetchHeaders } from '@/lib/integrations/http-headers'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { url, companyId } = await req.json()

    if (!url) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_URL', message: 'url é obrigatório' }
      }, { status: 400 })
    }

    const data = await fetchHeaders(url)

    // UPSERT TechSignals se tiver companyId
    if (companyId && data.detectedTech && data.detectedTech.length > 0) {
      for (const tech of data.detectedTech) {
        await supabaseAdmin.from('TechSignals').insert({
          companyId,
          kind: 'header',
          key: tech.technology,
          value: tech.evidence,
          confidence: tech.confidence,
          source: 'http_headers',
          url: data.url,
          fetchedAt: new Date().toISOString()
        })
      }
      
      console.log('[HTTP Headers] ✅', data.detectedTech.length, 'sinais salvos para:', companyId)
    }

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

