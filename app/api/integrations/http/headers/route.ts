import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { url, companyId } = await req.json();
  if (!url) return NextResponse.json({ ok:false, error:'url obrigatória' }, { status:400 });
  try {
    const head = await fetch(url, { method:'HEAD', redirect:'follow' });
    const headers = {};
    head.headers.forEach((v, k) => headers[k.toLowerCase()] = v);
    try {
      if (companyId) {
        const sb = supabaseAdmin();
        await sb.from('TechSignals').insert({
          companyId, kind:'http_header', key:'headers', value: headers,
          confidence:70, source:'http_headers', url, fetchedAt: new Date().toISOString()
        });
      }
    } catch {}
    return NextResponse.json({ ok:true, headers });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
