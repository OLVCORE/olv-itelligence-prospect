import { NextRequest, NextResponse } from 'next/server';
import { computeMaturity } from '@/lib/maturity/tech-maturity';
import { suggestFit } from '@/lib/maturity/vendor-fit';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { projectId, companyId, vendor, detectedStack, sources } = await req.json();
  if (!projectId || !companyId || !vendor) {
    return NextResponse.json({ ok:false, error:'projectId, companyId e vendor obrigatórios' }, { status:400 });
  }
  try {
    const scores = computeMaturity({ detectedStack, signals: sources });
    const fit = suggestFit({ vendor, detectedStack, scores });
    try {
      const sb = supabaseAdmin();
      const { data: existing } = await sb.from('CompanyTechMaturity')
        .select('id').eq('companyId', companyId).eq('vendor', vendor).maybeSingle();
      if (existing?.id) {
        await sb.from('CompanyTechMaturity').update({
          sources, scores, detectedStack, fitRecommendations: fit, updatedAt: new Date().toISOString()
        }).eq('id', existing.id);
      } else {
        await sb.from('CompanyTechMaturity').insert({
          companyId, vendor, sources, scores, detectedStack, fitRecommendations: fit
        });
      }
    } catch {}
    return NextResponse.json({ ok:true, scores, fit });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
