import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { serperSearch } from '@/lib/integrations/serper';
import { apolloCompanyEnrich, apolloPeopleSearch } from '@/lib/integrations/apollo';
import { hunterVerify } from '@/lib/integrations/hunter';
import { phantomRun } from '@/lib/integrations/phantom';
import { buildDetectedStackFromEvidence } from '@/lib/stack/resolver';
import { computeMaturity } from '@/lib/maturity/tech-maturity';
import { suggestFit } from '@/lib/maturity/vendor-fit';

export const runtime='nodejs';

/**
 * POST /api/stack/ingest - ONE-SHOT ORCHESTRATOR
 * Body: { projectId, companyId, vendor, domain?, companyName?, linkedinUrl?, phantomAgentId?, verifyEmails? }
 * 
 * Fluxo completo:
 *  1) HTTP Headers → TechSignals
 *  2) Serper (tech mentions) → TechSignals  
 *  3) Apollo Company → Firmographics
 *  4) Apollo People → Person (upsert)
 *  5) [Opcional] Phantom LinkedIn Jobs → TechSignals
 *  6) [Opcional] Hunter Verify emails → Person.update
 *  7) Build detectedStack + Maturity + Fit → CompanyTechMaturity
 */
export async function POST(req: NextRequest){
  const body = await req.json();
  const { projectId, companyId, vendor, domain, companyName, linkedinUrl, phantomAgentId, verifyEmails } = body || {};
  
  if(!projectId || !companyId || !vendor){
    return NextResponse.json({ ok:false, error:'projectId, companyId, vendor obrigatórios' }, { status:400 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // ---------- 1) HTTP HEADERS ----------
  let headerSaved=false;
  if (domain){
    try{
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const r = await fetch(url, { method:'HEAD', redirect:'follow' });
      const headers:any = {}; 
      r.headers.forEach((v,k)=>headers[k.toLowerCase()]=v);
      await sb.from('TechSignals').insert({ 
        companyId, kind:'http_header', key:'headers', value: JSON.stringify(headers), 
        confidence:70, source:'http_headers', url, fetchedAt:now 
      });
      headerSaved=true;
    }catch(e){}
  }

  // ---------- 2) SERPER ----------
  let serperCount=0;
  try{
    const q = companyName 
      ? `${companyName} ERP OR CRM OR SAP OR Oracle OR TOTVS OR AWS OR Azure OR Power BI site:${domain??''}`.trim() 
      : (domain ? `site:${domain} ERP OR CRM OR SAP OR TOTVS` : '');
    
    if (q){
      const sr = await serperSearch(q, 10);
      const items = sr?.organic ?? sr?.results ?? sr?.items ?? [];
      
      for(const it of items){
        const payload = {
          title: it.title ?? it.name ?? null,
          description: it.snippet ?? it.description ?? null,
          link: it.link ?? it.url ?? null
        };
        await sb.from('TechSignals').insert({
          companyId, kind:'serper', key: payload.title ?? 'result', 
          value: JSON.stringify(payload),
          confidence: 60, source:'serper', url: payload.link ?? null, fetchedAt: now
        });
        serperCount++;
      }
    }
  }catch(e){}

  // ---------- 3) APOLLO — Firmographics ----------
  let firmoSaved=false;
  try{
    const aco = await apolloCompanyEnrich({
      q_organization_domains: domain ? [domain.replace(/^https?:\/\//,'')] : undefined,
      q_organization_name: companyName || undefined,
      page: 1
    });
    
    const c0 = aco?.companies?.[0];
    if (c0){
      const techTags = c0.technologies ?? c0.tech_tags ?? [];
      await sb.from('Firmographics').insert({
        companyId,
        source: 'apollo',
        employeesRange: c0.estimated_num_employees ?? null,
        revenueRange: c0.estimated_annual_revenue ?? null,
        techTags: techTags,
        fetchedAt: now
      });
      firmoSaved=true;
    }
  }catch(e){}

  // ---------- 4) APOLLO — People ----------
  let peopleCount=0, verifiedCount=0;
  try{
    const ap = await apolloPeopleSearch({
      q_organization_domains: domain ? [domain.replace(/^https?:\/\//,'')] : undefined,
      page: 1
    });
    
    const arr = ap?.people || ap?.contacts || [];
    for (const p of arr){
      const name = p.name || [p.first_name,p.last_name].filter(Boolean).join(' ');
      const email = p.email ?? (p.email_status === 'verified' ? p.email : null);
      
      const personId = `person_${companyId}_${name.replace(/\s+/g,'_').toLowerCase()}`;
      
      await sb.from('Person').upsert({
        id: personId,
        companyId,
        name,
        role: p.title ?? null,
        department: p.department ?? null,
        email,
        linkedinUrl: p.linkedin_url ?? null,
        updatedAt: now
      }, { onConflict:'id' });
      
      peopleCount++;

      // 5) [Opcional] Hunter verify
      if (verifyEmails && email){
        try{
          const hv = await hunterVerify(email);
          await sb.from('Person').update({
            email: hv?.data?.email ?? email,
            updatedAt: now
          }).eq('id', personId);
          verifiedCount++;
        }catch(e){}
      }
    }
  }catch(e){}

  // ---------- 6) PHANTOM — LinkedIn Jobs ----------
  let jobsCount=0;
  if (linkedinUrl && phantomAgentId){
    try{
      const ph = await phantomRun(phantomAgentId, { companyLinkedinUrl: linkedinUrl });
      const jobs = ph?.container?.output?.data ?? ph?.data ?? [];
      
      for(const j of jobs){
        await sb.from('TechSignals').insert({
          companyId, kind:'linkedin_job', 
          key: j.title ?? 'job', 
          value: JSON.stringify(j.description ?? j ?? null),
          confidence: 60, 
          source:'phantom_linkedin_jobs', 
          url: j.link ?? linkedinUrl, 
          fetchedAt: now
        });
        jobsCount++;
      }
    }catch(e){}
  }

  // ---------- 7) BUILD STACK + MATURITY ----------
  const { data: ts } = await sb.from('TechSignals').select('*').eq('companyId', companyId);
  const ev = (ts||[]).map(t=>{
    let value = t.value;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch {}
    }
    return { key:t.key, value, source:t.source, kind:t.kind };
  });

  const { data: fg } = await sb.from('Firmographics')
    .select('*')
    .eq('companyId',companyId)
    .order('fetchedAt',{ascending:false})
    .limit(1)
    .maybeSingle();

  const detectedStack = buildDetectedStackFromEvidence(ev, fg?.techTags ?? null);
  const scores = computeMaturity({ detectedStack });
  const fit = suggestFit({ vendor, detectedStack, scores });

  // Upsert CompanyTechMaturity
  try{
    const { data: ex } = await sb.from('CompanyTechMaturity')
      .select('id')
      .eq('companyId', companyId)
      .eq('vendor', vendor)
      .maybeSingle();
      
    if (ex?.id){
      await sb.from('CompanyTechMaturity').update({ 
        sources:{orchestrator:true}, 
        scores, 
        detectedStack, 
        fitRecommendations:fit, 
        updatedAt: now 
      }).eq('id', ex.id);
    } else {
      await sb.from('CompanyTechMaturity').insert({ 
        companyId, 
        vendor, 
        sources:{orchestrator:true}, 
        scores, 
        detectedStack, 
        fitRecommendations:fit 
      });
    }
  }catch(e){}

  return NextResponse.json({
    ok: true,
    summary: {
      headerSaved,
      serperCount,
      firmographicsSaved: firmoSaved,
      peopleFound: peopleCount,
      emailsVerified: verifiedCount,
      jobsIngested: jobsCount
    },
    detectedStack,
    scores,
    fit
  });
}
