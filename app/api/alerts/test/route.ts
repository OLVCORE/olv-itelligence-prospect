import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/notifications/mailer';
import { sendSlack } from '@/lib/notifications/slack';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
export const runtime='nodejs';
export async function POST(req:NextRequest){
  const ip = req.headers.get('x-forwarded-for')||'ip';
  if(!rateLimit(ip,'/api/alerts/test')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const body = await req.json().catch(()=>({}));
  const to = body?.to || (process.env.SMTP_USER||'olvsistemas@olvinternacional.com.br');
  const html = '<b>Teste de alerta</b> – OLV Alerts Pack operacional ✅';
  const mail = await sendEmail({ to, subject: 'Teste de Alerta – OLV', html });
  const slack = await sendSlack('Teste de alerta – OLV ✅ (se este canal estiver configurado)');
  const sb = supabaseAdmin();
  await sb.from('AlertEvent').insert({
    ruleId:'manual', ruleName:'manual_test', severity:'low', message:'Disparo manual de teste', delivered:true, channels:[{type:'email', ok:true},{type:'slack', ok:!!slack?.ok}]
  });
  return NextResponse.json({ ok:true, mail, slack });
}
