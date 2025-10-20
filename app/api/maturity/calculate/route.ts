import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeMaturity } from '@/lib/maturity/tech-maturity';
import { suggestFit } from '@/lib/maturity/vendor-fit';
import { buildDetectedStackFromEvidence } from '@/lib/stack/resolver';

export const runtime = 'nodejs';

/**
 * POST /api/maturity/calculate
 * body: { projectId, companyId, vendor, detectedStack?, sources? }
 * - Se detectedStack NÃO for enviado, é montado automaticamente de TechSignals + Firmographics
 * - Upsert em CompanyTechMaturity
 */
export async function POST(req: NextRequest){
  const { projectId, companyId, vendor, detectedStack:dsIn, sources } = await req.json();
  if (!projectId || !companyId || !vendor) {
    return NextResponse.json({ ok:false, error:'projectId, companyId e vendor obrigatórios' }, { status:400 });
  }
  const sb = supabaseAdmin();

  let detectedStack = dsIn;
  if (!detectedStack) {
    // carregar evidências e montar stack automaticamente
    const { data: ts } = await sb.from('TechSignals').select('*').eq('companyId', companyId);
    const evidence = (ts||[]).map(t=>({ key:t.key, value:t.value, source:t.source, kind:t.kind }));
    const { data: fg } = await sb.from('Firmographics').select('*').eq('companyId', companyId).order('fetchedAt',{ascending:false}).limit(1).maybeSingle();
    const techTags = fg?.techTags ?? null;
    detectedStack = buildDetectedStackFromEvidence(evidence, techTags);
  }

  // calcular scores e fit
  const scores = computeMaturity({ detectedStack, signals: sources });
  const fit = suggestFit({ vendor, detectedStack, scores });

  // upsert em CompanyTechMaturity
  try {
    const { data: existing } = await sb
      .from('CompanyTechMaturity')
      .select('id')
      .eq('companyId', companyId)
      .eq('vendor', vendor)
      .maybeSingle();

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

  return NextResponse.json({ ok:true, scores, fit, detectedStack });
}
