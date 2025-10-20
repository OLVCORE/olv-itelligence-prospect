import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export function guard(req:NextRequest, route:string){
  const ip=req.headers.get('x-forwarded-for')||'ip';
  if(!rateLimit(ip, route)) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  audit({actor:'api',action:'call',route,ip});
  return null;
}