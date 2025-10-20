import { NextRequest, NextResponse } from 'next/server';
import { hunterVerify } from '@/lib/integrations/hunter';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { email, personId } = await req.json();
  if (!email) return NextResponse.json({ ok:false, error:'email obrigatório' }, { status:400 });
  try {
    const data = await hunterVerify(email);
    try {
      if (personId) {
        const sb = supabaseAdmin();
        await sb.from('Person').update({
          email_status: data?.data?.status ?? null,
          email_score: data?.data?.score ?? null,
          updatedAt: new Date().toISOString()
        }).eq('id', personId);
      }
    } catch {}
    return NextResponse.json({ ok:true, data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
