#!/usr/bin/env node
/**
 * OLV Alerts Pack (one-file add-on)
 * - Tabelas Prisma: AlertRule, AlertChannel, AlertEvent (idempotentes)
 * - Libs: mailer (SMTP), slack webhook
 * - Job: lib/jobs/alerts.ts (varredura e disparo com cooldown/mute)
 * - APIs: /api/alerts/test, /api/alerts/events, /api/alerts/fire
 * - Cron: /api/cron/alerts (a cada 5 minutos, vercel.json append)
 * - UI: injeta "Últimos Alertas" em /dashboard/operations (sem quebrar nada)
 * - Hardening: usa OLV_ADMIN_KEY e rate-limit já existentes (guard)
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const f = (...p) => path.join(root, ...p);
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const put = (fp, content) => {
  ensureDir(path.dirname(fp));
  if (fs.existsSync(fp)) {
    const cur = fs.readFileSync(fp, 'utf8');
    if (cur === content) return false;
  }
  fs.writeFileSync(fp, content, 'utf8');
  return true;
};
const log = (...a)=>console.log('[OLV-ALERTS]', ...a);

// ---------- 0) Prisma models ----------
(() => {
  const prisma = f('prisma','schema.prisma');
  if (!fs.existsSync(prisma)) { log('AVISO: prisma/schema.prisma não encontrado.'); return; }
  let src = fs.readFileSync(prisma, 'utf8');
  if (!/model\s+AlertRule\s+\{/.test(src)) {
    src += `
model AlertRule {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  severity    String   // critical|high|medium|low
  enabled     Boolean  @default(true)
  // expressão semântica aplicada no job
  kind        String   // ingest_error | maturity_drop | slow_run | cron_gap | quota | stuck_lock
  // parâmetros da regra
  params      Json?
  cooldownSec Int      @default(900) // dedupe window
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AlertChannel {
  id        String   @id @default(cuid())
  name      String   @unique
  type      String   // slack|email|webhook
  target    String   // ex: slack:#olv-ops ou email:ops@...
  enabled   Boolean  @default(true)
  config    Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AlertEvent {
  id        String   @id @default(cuid())
  ts        DateTime @default(now())
  ruleId    String
  ruleName  String
  severity  String
  message   String
  companyId String?
  vendor    String?
  runId     String?
  meta      Json?
  delivered Boolean  @default(false)
  channels  Json?    // por onde foi disparado
  createdAt DateTime @default(now())
  @@index([ts], map: "idx_alert_ts")
  @@index([ruleName, ts], map: "idx_rule_ts")
}
`;
    fs.writeFileSync(prisma, src, 'utf8');
    log('Prisma: adicionados AlertRule, AlertChannel, AlertEvent.');
  } else {
    log('Prisma: modelos de alertas já presentes (ok).');
  }
})();

// ---------- 1) Mailer (SMTP) ----------
(() => {
  const fp = f('lib','notifications','mailer.ts');
  const content = `import nodemailer from 'nodemailer';

function getTransport(){
  const host = process.env.SMTP_HOST || 'mail.olvinternacional.com.br';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || 'olvsistemas@olvinternacional.com.br';
  const pass = process.env.SMTP_PASS;
  if (!pass) throw new Error('SMTP_PASS não configurado');
  // Porta 587 -> secure=false (STARTTLS)
  return nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

export async function sendEmail({to, subject, html}:{to:string|string[],subject:string,html:string}) {
  const from = process.env.SMTP_FROM || 'OLV Alerts <olvsistemas@olvinternacional.com.br>';
  const transporter = getTransport();
  const info = await transporter.sendMail({ from, to, subject, html });
  return { messageId: info.messageId };
}
`;
  put(fp, content) && log('Mailer SMTP criado/atualizado:', fp);
})();

// ---------- 2) Slack webhook ----------
(() => {
  const fp = f('lib','notifications','slack.ts');
  const content = `export async function sendSlack(text:string){
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return { ok:false, skipped:'no_webhook' };
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ text })
  });
  return { ok: res.ok, status: res.status };
}
`;
  put(fp, content) && log('Slack webhook criado/atualizado:', fp);
})();

// ---------- 3) Alerts job ----------
(() => {
  const fp = f('lib','jobs','alerts.ts');
  const content = `import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/notifications/mailer';
import { sendSlack } from '@/lib/notifications/slack';

type Rule = {
  id:string; name:string; description?:string|null; severity:'critical'|'high'|'medium'|'low'|string;
  enabled:boolean; kind:string; params:any; cooldownSec:number;
};

async function getRules(sb:any):Promise<Rule[]>{
  const { data } = await sb.from('AlertRule').select('*').eq('enabled', true);
  return data || [];
}
async function getChannels(sb:any){
  const { data } = await sb.from('AlertChannel').select('*').eq('enabled', true);
  return data || [];
}
async function alreadyFired(sb:any, ruleName:string, key:any, cooldownSec:number){
  const since = new Date(Date.now() - cooldownSec*1000).toISOString();
  const { data } = await sb.from('AlertEvent')
    .select('id, ts, ruleName, meta')
    .gte('ts', since)
    .eq('ruleName', ruleName)
    .order('ts', { ascending:false })
    .limit(50);
  if (!data) return false;
  const sig = JSON.stringify(key || {});
  return data.some((e:any)=> JSON.stringify(e.meta?.signature||{}) === sig);
}
async function recordEvent(sb:any, payload:any){
  const { data } = await sb.from('AlertEvent').insert(payload).select().single();
  return data;
}
function fmtSlack(ev:any){
  const lines = [
    \`*[\${ev.severity.toUpperCase()}]* \${ev.ruleName}\`,
    ev.message,
    ev.companyId ? \`• companyId: \${ev.companyId}\` : '',
    ev.vendor ? \`• vendor: \${ev.vendor}\` : '',
    ev.runId ? \`• runId: \${ev.runId}\` : '',
  ].filter(Boolean);
  return lines.join('\\n');
}
function fmtEmailHTML(ev:any){
  return \`
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45">
    <h2>[\${(ev.severity||'info').toUpperCase()}] \${ev.ruleName}</h2>
    <p>\${ev.message}</p>
    <ul>
      \${ev.companyId? \`<li><b>companyId:</b> \${ev.companyId}</li>\`:''}
      \${ev.vendor? \`<li><b>vendor:</b> \${ev.vendor}</li>\`:''}
      \${ev.runId? \`<li><b>runId:</b> \${ev.runId}</li>\`:''}
    </ul>
    <p style="color:#888">OLV Intelligent Prospecting System</p>
  </div>\`;
}

async function fire(sb:any, rule:Rule, ev:{
  message:string, companyId?:string, vendor?:string, runId?:string, meta?:any
}){
  const channels = await getChannels(sb);
  const payload = {
    ts: new Date().toISOString(),
    ruleId: rule.id,
    ruleName: rule.name,
    severity: rule.severity,
    message: ev.message,
    companyId: ev.companyId || null,
    vendor: ev.vendor || null,
    runId: ev.runId || null,
    meta: ev.meta || {},
    delivered: false,
    channels: null,
  };
  const rec = await recordEvent(sb, payload);
  const deliveries:any[] = [];
  for (const ch of channels) {
    if (!ch?.type || !ch?.target) continue;
    if (ch.type === 'slack') {
      const text = fmtSlack(rec);
      const r = await sendSlack(text);
      deliveries.push({channel: ch.name, type:'slack', ok:r.ok, status:r.status});
    } else if (ch.type === 'email') {
      const to = ch.target.replace(/^email:/,'').trim();
      const subject = \`[\${rule.severity.toUpperCase()}] \${rule.name}\`;
      const html = fmtEmailHTML(rec);
      try {
        await sendEmail({ to, subject, html });
        deliveries.push({channel: ch.name, type:'email', ok:true});
      } catch(e:any){
        deliveries.push({channel: ch.name, type:'email', ok:false, error: String(e?.message||e)});
      }
    } else if (ch.type === 'webhook') {
      try {
        await fetch(ch.target, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(rec) });
        deliveries.push({channel: ch.name, type:'webhook', ok:true});
      } catch(e:any){
        deliveries.push({channel: ch.name, type:'webhook', ok:false, error:String(e?.message||e)});
      }
    }
  }
  await sb.from('AlertEvent').update({ delivered: deliveries.every(d=>d.ok), channels: deliveries }).eq('id', rec.id);
  return { eventId: rec.id, deliveries };
}

export async function runAlertsSweep(){
  const sb = supabaseAdmin();
  const rules = await getRules(sb);
  if (!rules.length) return { ok:true, fired: [] };

  const fired:any[] = [];

  for (const rule of rules) {
    try {
      if (rule.kind === 'ingest_error') {
        const since = new Date(Date.now() - 60*60*1000).toISOString(); // 1h
        const { data: runs } = await sb.from('IngestRun')
          .select('id, companyId, vendor, status, error, startedAt, finishedAt')
          .gte('startedAt', since)
          .in('status', ['error','partial'])
          .order('startedAt', { ascending: false })
          .limit(100);
        for (const r of (runs||[])) {
          const signature = { kind:'ingest_error', runId: r.id };
          const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
          if (dup) continue;
          const msg = \`IngestRun \${r.id} terminou com status \${r.status}. Erro: \${r.error||'-'}\`;
          const out = await fire(sb, rule, { message: msg, companyId: r.companyId, vendor: r.vendor, runId: r.id, meta:{ signature } });
          fired.push(out);
        }
      }

      if (rule.kind === 'maturity_drop') {
        const drop = Number(rule.params?.dropThreshold ?? 15);
        // último e penúltimo por empresa
        const { data } = await sb.from('CompanyTechMaturity')
          .select('companyId, vendor, scores, updatedAt')
          .order('updatedAt', { ascending:false })
          .limit(500);
        const lastByCompany = new Map<string, any[]>();
        for (const row of (data||[])) {
          const arr = lastByCompany.get(row.companyId) || [];
          arr.push(row); lastByCompany.set(row.companyId, arr);
        }
        for (const [cid, arr] of lastByCompany.entries()) {
          if (arr.length < 2) continue;
          const cur = Number(arr[0]?.scores?.overall ?? NaN);
          const prev = Number(arr[1]?.scores?.overall ?? NaN);
          if (!isFinite(cur) || !isFinite(prev)) continue;
          const delta = cur - prev;
          if (delta <= -drop) {
            const signature = { kind:'maturity_drop', companyId: cid, prev, cur };
            const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
            if (dup) continue;
            const msg = \`Queda de maturidade: \${prev} → \${cur} (Δ \${delta})\`;
            const out = await fire(sb, rule, { message: msg, companyId: cid, vendor: arr[0]?.vendor, meta:{ signature } });
            fired.push(out);
          }
        }
      }

      if (rule.kind === 'slow_run') {
        const thr = Number(rule.params?.p95ThresholdSec ?? 90);
        const since = new Date(Date.now() - 15*60*1000).toISOString(); // 15min
        const { data } = await sb.from('IngestRun')
          .select('id, companyId, vendor, status, startedAt, finishedAt')
          .gte('startedAt', since)
          .order('startedAt', { ascending:false })
          .limit(500);
        const durations = (data||[]).map((r:any)=>{
          const end = r.finishedAt ? new Date(r.finishedAt) : new Date();
          return Math.max(0, Math.floor((end.getTime() - new Date(r.startedAt).getTime())/1000));
        }).sort((a,b)=>a-b);
        if (durations.length >= 10) {
          const p95 = durations[Math.floor(durations.length*0.95)];
          if (p95 > thr) {
            const signature = { kind:'slow_run', p95 };
            const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
            if (!dup) {
              const msg = \`p95 de duração dos runs = \${p95}s (> \${thr}s)\`;
              const out = await fire(sb, rule, { message: msg, meta:{ signature } });
              fired.push(out);
            }
          }
        }
      }

      if (rule.kind === 'cron_gap') {
        const gapH = Number(rule.params?.hours ?? 6);
        const since = new Date(Date.now() - gapH*60*60*1000).toISOString();
        const { data } = await sb.from('IngestRun').select('id').gte('startedAt', since).limit(1);
        if (!data || !data.length) {
          const signature = { kind:'cron_gap', hours: gapH };
          const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
          if (!dup) {
            const msg = \`Nenhuma execução de ingest nos últimos \${gapH}h\`;
            const out = await fire(sb, rule, { message: msg, meta:{ signature } });
            fired.push(out);
          }
        }
      }

      if (rule.kind === 'stuck_lock') {
        const minutes = Number(rule.params?.minutes ?? 20);
        const older = new Date(Date.now() - minutes*60*1000).toISOString();
        const { data: locks } = await sb.from('IngestLock').select('companyId, lockedAt').lt('lockedAt', older).limit(100);
        for (const lk of (locks||[])) {
          const signature = { kind:'stuck_lock', companyId: lk.companyId };
          const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
          if (dup) continue;
          const msg = \`Lock de ingest preso para companyId \${lk.companyId} há > \${minutes}min\`;
          const out = await fire(sb, rule, { message: msg, companyId: lk.companyId, meta:{ signature } });
          fired.push(out);
        }
      }

      if (rule.kind === 'quota') {
        const since = new Date(Date.now() - 60*60*1000).toISOString(); // 1h
        const { data: runs } = await sb.from('IngestRun')
          .select('id, status, error, startedAt')
          .gte('startedAt', since)
          .order('startedAt', { ascending:false }).limit(300);
        const quotaRuns = (runs||[]).filter((r:any)=>{
          const e = (r.error||'').toString().toLowerCase();
          return e.includes('429') || e.includes('rate') || e.includes('quota') || e.includes('402');
        });
        if (quotaRuns.length >= (rule.params?.minCount ?? 3)) {
          const signature = { kind:'quota', count: quotaRuns.length };
          const dup = await alreadyFired(sb, rule.name, signature, rule.cooldownSec);
          if (!dup) {
            const msg = \`\${quotaRuns.length} indícios de quota/rate-limit/402 na última hora\`;
            const out = await fire(sb, rule, { message: msg, meta:{ signature } });
            fired.push(out);
          }
        }
      }

    } catch (e:any) {
      // continua avaliando as demais regras
    }
  }

  return { ok:true, fired };
}

// Instala regras e canais padrão (idempotente)
export async function ensureDefaultAlerts(){
  const sb = supabaseAdmin();
  const defaults = [
    { name:'ingest_error_prod', description:'Ingest erro/partial (1h window)', severity:'critical', kind:'ingest_error', params:{}, cooldownSec: 900 },
    { name:'maturity_drop_15', description:'Queda ≥ 15 pontos no overall', severity:'high', kind:'maturity_drop', params:{ dropThreshold: 15 }, cooldownSec: 1800 },
    { name:'slow_run_p95_90s', description:'p95 > 90s (15min window)', severity:'medium', kind:'slow_run', params:{ p95ThresholdSec: 90 }, cooldownSec: 1800 },
    { name:'cron_gap_6h', description:'Sem runs por 6h', severity:'critical', kind:'cron_gap', params:{ hours: 6 }, cooldownSec: 1200 },
    { name:'stuck_lock_20m', description:'Lock preso > 20min', severity:'high', kind:'stuck_lock', params:{ minutes: 20 }, cooldownSec: 1200 },
    { name:'quota_hour', description:'Surto de 429/402/quota na última hora', severity:'high', kind:'quota', params:{ minCount: 3 }, cooldownSec: 1200 },
  ];
  for (const r of defaults) {
    await sb.from('AlertRule').upsert({ ...r, enabled:true }, { onConflict:'name' });
  }
  // Canais: e-mail padrão do ops e slack (se quiser)
  const email = process.env.SMTP_USER || 'olvsistemas@olvinternacional.com.br';
  await sb.from('AlertChannel').upsert({
    name:'email_ops', type:'email', target: 'email:'+email, enabled: true, config: {}
  }, { onConflict:'name' });
  if (process.env.SLACK_WEBHOOK_URL) {
    await sb.from('AlertChannel').upsert({
      name:'slack_ops', type:'slack', target:'slack:#olv-ops', enabled:true, config:{}
    }, { onConflict:'name' });
  }
  return { ok:true };
}
`;
  put(fp, content) && log('Job de alertas criado/atualizado:', fp);
})();

// ---------- 4) APIs ----------
(() => {
  // /api/cron/alerts
  let fp = f('app','api','cron','alerts','route.ts');
  let content = `import { NextResponse } from 'next/server';
import { ensureDefaultAlerts, runAlertsSweep } from '@/lib/jobs/alerts';
export const runtime = 'nodejs';
export async function GET(){
  await ensureDefaultAlerts();
  const out = await runAlertsSweep();
  return NextResponse.json({ ok:true, ...out });
}
export async function POST(){
  await ensureDefaultAlerts();
  const out = await runAlertsSweep();
  return NextResponse.json({ ok:true, ...out });
}
`;
  put(fp, content) && log('API cron alerts:', fp);

  // /api/alerts/test
  fp = f('app','api','alerts','test','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
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
`;
  put(fp, content) && log('API alerts/test:', fp);

  // /api/alerts/events
  fp = f('app','api','alerts','events','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip';
  if(!rateLimit(ip,'/api/alerts/events')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const { data } = await sb.from('AlertEvent').select('*').order('ts',{ascending:false}).limit(200);
  return NextResponse.json({ ok:true, events: data||[] });
}
`;
  put(fp, content) && log('API alerts/events:', fp);

  // /api/alerts/fire (programático)
  fp = f('app','api','alerts','fire','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
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
`;
  put(fp, content) && log('API alerts/fire:', fp);
})();

// ---------- 5) Cron no vercel.json ----------
(() => {
  const vp = f('vercel.json');
  let json = {};
  if (fs.existsSync(vp)) { try { json = JSON.parse(fs.readFileSync(vp,'utf8')); } catch{} }
  if (!json.crons) json.crons = [];
  const has = json.crons.some((c)=>c?.path==='/api/cron/alerts');
  if (!has) json.crons.push({ path:'/api/cron/alerts', schedule:'*/5 * * * *' }); // a cada 5 min
  fs.writeFileSync(vp, JSON.stringify(json, null, 2), 'utf8');
  log('vercel.json: cron /api/cron/alerts a cada 5 min.');
})();

// ---------- 6) UI: injeta card de alertas em /dashboard/operations ----------
(() => {
  const page = f('app','dashboard','operations','page.tsx');
  if (!fs.existsSync(page)) { log('AVISO: /dashboard/operations não existe (Final Upgrade Pack deve ter criado).'); return; }
  let src = fs.readFileSync(page,'utf8');
  if (!/\/api\/alerts\/events/.test(src)) {
    src = src.replace(
      /const \[metrics, runs\] = await Promise\.all\(\[/,
      `const [alerts, metrics, runs] = await Promise.all([
    fetchJSON('/api/alerts/events'),`
    );
    // adiciona o card antes do fechamento do return
    src = src.replace(
      /(<\/div>\s*<\/div>\s*\)\s*}\s*$)/,
      `
      {/* Últimos Alertas */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">🔔 Últimos Alertas</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Quando</th>
                <th>Regra</th>
                <th>Sev</th>
                <th>Mensagem</th>
                <th>Empresa</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {(alerts?.events||[]).slice(0,20).map((e:any)=>(
                <tr key={e.id} className="border-t">
                  <td className="py-2 text-xs">{new Date(e.ts).toLocaleString()}</td>
                  <td className="text-xs">{e.ruleName}</td>
                  <td className={e.severity==='critical'?'text-red-600 font-bold':(e.severity==='high'?'text-orange-600':'text-gray-600')}>
                    {e.severity}
                  </td>
                  <td className="max-w-[420px] truncate" title={e.message}>{e.message}</td>
                  <td className="text-xs">{e.companyId ? e.companyId.substring(0,10)+'...' : '—'}</td>
                  <td className="text-xs">{e.vendor||'—'}</td>
                </tr>
              ))}
              {(!alerts?.events?.length) && <tr><td colSpan={6} className="py-3 opacity-60">Sem alertas até o momento.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
$1`
    );
    fs.writeFileSync(page, src, 'utf8');
    log('UI: card de alertas injetado em /dashboard/operations.');
  } else {
    log('UI: card de alertas já presente (ok).');
  }
})();

console.log('[OLV-ALERTS] Concluído. Rode: npx prisma generate && npx prisma db push');

