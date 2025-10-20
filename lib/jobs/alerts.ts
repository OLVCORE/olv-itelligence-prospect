import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
    `*[${ev.severity.toUpperCase()}]* ${ev.ruleName}`,
    ev.message,
    ev.companyId ? `• companyId: ${ev.companyId}` : '',
    ev.vendor ? `• vendor: ${ev.vendor}` : '',
    ev.runId ? `• runId: ${ev.runId}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}
function fmtEmailHTML(ev:any){
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45">
    <h2>[${(ev.severity||'info').toUpperCase()}] ${ev.ruleName}</h2>
    <p>${ev.message}</p>
    <ul>
      ${ev.companyId? `<li><b>companyId:</b> ${ev.companyId}</li>`:''}
      ${ev.vendor? `<li><b>vendor:</b> ${ev.vendor}</li>`:''}
      ${ev.runId? `<li><b>runId:</b> ${ev.runId}</li>`:''}
    </ul>
    <p style="color:#888">OLV Intelligent Prospecting System</p>
  </div>`;
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
      const subject = `[${rule.severity.toUpperCase()}] ${rule.name}`;
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
          const msg = `IngestRun ${r.id} terminou com status ${r.status}. Erro: ${r.error||'-'}`;
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
            const msg = `Queda de maturidade: ${prev} → ${cur} (Δ ${delta})`;
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
              const msg = `p95 de duração dos runs = ${p95}s (> ${thr}s)`;
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
            const msg = `Nenhuma execução de ingest nos últimos ${gapH}h`;
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
          const msg = `Lock de ingest preso para companyId ${lk.companyId} há > ${minutes}min`;
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
            const msg = `${quotaRuns.length} indícios de quota/rate-limit/402 na última hora`;
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
