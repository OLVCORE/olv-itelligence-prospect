import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/audit')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const { data } = await sb.from('ApiAuditLog').select('*').order('ts',{ascending:false}).limit(200);
  return NextResponse.json({ok:true,audit:data||[]});
}