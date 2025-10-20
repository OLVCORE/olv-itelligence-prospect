import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/runs')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const { data: runs } = await sb.from('IngestRun').select('*').order('startedAt',{ascending:false}).limit(200);
  await audit({actor:'api',action:'ops_runs',ip,route:'/api/ops/runs'});
  return NextResponse.json({ok:true,runs:runs||[]});
}