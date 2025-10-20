import { NextRequest, NextResponse } from 'next/server';
import { hunterFind } from '@/lib/integrations/hunter';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { domain, full_name, companyId } = await req.json();
  if (!domain) return NextResponse.json({ ok:false, error:'domain obrigatório' }, { status:400 });
  try {
    const data = await hunterFind(domain, full_name);
    try {
      const sb = supabaseAdmin();
      const email = data?.data?.email;
      if (email && companyId) {
        await sb.from('Person').upsert({
          id: undefined,
          companyId, name: full_name ?? null,
          email,
          email_confidence: data?.data?.score ?? null,
          source: 'hunter',
          updatedAt: new Date().toISOString()
        });
      }
    } catch {}
    return NextResponse.json({ ok:true, data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
