import { NextRequest, NextResponse } from 'next/server';
import { phantomRun } from '@/lib/integrations/phantom';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { agentId, companyLinkedinUrl, companyId } = await req.json();
  if (!agentId || !companyLinkedinUrl)
    return NextResponse.json({ ok:false, error:'agentId e companyLinkedinUrl obrigatórios' }, { status:400 });
  try {
    const data = await phantomRun(agentId, { companyLinkedinUrl });
    try {
      const sb = supabaseAdmin();
      const jobs = data?.container?.output?.data ?? data?.data ?? [];
      for (const j of jobs) {
        await sb.from('TechSignals').insert({
          companyId: companyId ?? null,
          kind: 'linkedin_job',
          key: j.title ?? null,
          value: j.description ?? null,
          confidence: 60,
          source: 'phantom_linkedin_jobs',
          url: j.link ?? companyLinkedinUrl,
          fetchedAt: new Date().toISOString()
        });
      }
    } catch {}
    return NextResponse.json({ ok:true, data });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
