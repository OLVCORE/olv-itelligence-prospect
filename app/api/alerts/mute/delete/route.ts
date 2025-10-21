import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';

export const runtime='nodejs';

export async function POST(req:NextRequest){
  const ip = req.headers.get('x-forwarded-for')||'ip';
  if (!rateLimit(ip, '/api/alerts/mute/delete')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if (!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});

  const body = await req.json().catch(()=>({}));
  const id = body?.id;
  if (!id) return NextResponse.json({ok:false,error:'id_required'},{status:400});

  const sb = supabaseAdmin();
  const { error } = await sb.from('AlertMute').delete().eq('id', id);
  if (error) return NextResponse.json({ok:false,error:String(error.message||error)}, {status:400});
  return NextResponse.json({ ok:true, deleted:id });
}
