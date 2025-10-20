import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { sendEmail } from '@/lib/notifications/mailer';
import { sendSlack } from '@/lib/notifications/slack';
export const runtime='nodejs';
export async function POST(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip';
  if(!rateLimit(ip,'/api/alerts/fire')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const body = await req.json().catch(()=>({}));
  const ev = body?.event || {};
  // dispara direto para os canais ativos
  const sb = supabaseAdmin();
  const { data: channels } = await sb.from('AlertChannel').select('*').eq('enabled', true);
  const deliveries:any[]=[];
  for (const ch of (channels||[])) {
    if (ch.type === 'slack') {
      const r = await sendSlack(ev.message||'(sem mensagem)');
      deliveries.push({channel: ch.name, type:'slack', ok:r.ok});
    } else if (ch.type === 'email') {
      const to = ch.target.replace(/^email:/,'').trim();
      try {
        await sendEmail({to, subject: ev.subject||'Alerta – OLV', html: ev.html||ev.message||'(sem conteúdo)'});
        deliveries.push({channel: ch.name, type:'email', ok:true});
      } catch(e:any){ deliveries.push({channel: ch.name, type:'email', ok:false, error:String(e?.message||e)}); }
    }
  }
  await sb.from('AlertEvent').insert({
    ruleId: 'manual_fire', ruleName: ev.ruleName || 'manual_fire', severity: ev.severity || 'low',
    message: ev.message || 'Manual fire', delivered: deliveries.every(d=>d.ok), channels: deliveries
  });
  return NextResponse.json({ ok:true, deliveries });
}
