import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/metrics')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const stats:any={};
  
  // Contadores básicos
  const [companies, monitors, runs24, techSignals, firmo, maturity] = await Promise.all([
    sb.from('Company').select('id', {count:'exact', head:true}),
    sb.from('CompanyMonitor').select('id', {count:'exact', head:true}).eq('active', true),
    sb.from('IngestRun').select('id', {count:'exact', head:true}).gte('startedAt', new Date(Date.now() - 24*60*60*1000).toISOString()),
    sb.from('TechSignals').select('id', {count:'exact', head:true}),
    sb.from('Firmographics').select('id', {count:'exact', head:true}),
    sb.from('CompanyTechMaturity').select('id', {count:'exact', head:true})
  ]);
  
  stats.counts = {
    companies: companies.count || 0,
    monitors: monitors.count || 0,
    runs24: runs24.count || 0,
    techsignals: techSignals.count || 0,
    firmographics: firmo.count || 0,
    maturity: maturity.count || 0
  };
  
  // últimos scores por vendor
  const { data: lastScores } = await sb.from('CompanyTechMaturity').select('vendor, scores, updatedAt, companyId').order('updatedAt',{ascending:false}).limit(50);
  await audit({actor:'api',action:'ops_metrics',ip,route:'/api/ops/metrics'});
  return NextResponse.json({ok:true,counts:stats.counts,lastScores});
}