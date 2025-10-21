import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';

export const runtime = 'nodejs';

export async function GET(req:NextRequest){
  const ip = req.headers.get('x-forwarded-for')||'ip';
  if (!rateLimit(ip, '/api/alerts/mute')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if (!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});

  const sb = supabaseAdmin();
  const { data } = await sb.from('AlertMute').select('*').order('until',{ascending:false}).limit(200);
  return NextResponse.json({ ok:true, mutes: data||[] });
}

export async function POST(req:NextRequest){
  const ip = req.headers.get('x-forwarded-for')||'ip';
  if (!rateLimit(ip, '/api/alerts/mute')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if (!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});

  const body = await req.json().catch(()=>({}));
  const { ruleName=null, companyId=null, vendor=null, minutes=60, note=null } = body||{};
  const until = new Date(Date.now() + Math.max(1, Number(minutes))*60*1000).toISOString();

  const sb = supabaseAdmin();
  const { data, error } = await sb.from('AlertMute').insert({ ruleName, companyId, vendor, until, note }).select().single();
  if (error) return NextResponse.json({ ok:false, error:String(error.message||error)}, {status:400});
  return NextResponse.json({ ok:true, mute: data });
}
