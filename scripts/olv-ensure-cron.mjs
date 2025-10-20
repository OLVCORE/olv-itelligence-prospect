#!/usr/bin/env node
/**
 * OLV – Scheduled Re-Ingest & Monitoring (aditivo)
 * - Cria/atualiza:
 *   - prisma models: CompanyMonitor, IngestRun (append)
 *   - /api/monitor/register (cadastra empresa para reingest)
 *   - /api/cron/reingest (executado por Vercel Cron)
 *   - lib/jobs/reingest.ts (lote, concorrência, backoff, logs)
 *   - vercel.json (append da cron, se existir faz merge seguro)
 * - NÃO remove nada fora do escopo.
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const f = (...p) => path.join(root, ...p);
const ensureDir = p => fs.mkdirSync(p, { recursive: true });

function upsertFile(fp, content) {
  ensureDir(path.dirname(fp));
  if (fs.existsSync(fp)) {
    const cur = fs.readFileSync(fp, 'utf8');
    if (cur === content) return false;
  }
  fs.writeFileSync(fp, content, 'utf8');
  return true;
}
const log = (...a) => console.log('[OLV-CRON]', ...a);

// ---------- 1) Prisma (append de modelos) ----------
(() => {
  const prismaPath = f('prisma','schema.prisma');
  if (!fs.existsSync(prismaPath)) {
    log('ATENÇÃO: prisma/schema.prisma não encontrado. Pule este passo se já está criado.');
    return;
  }
  const addModels = `
model CompanyMonitor {
  id             String   @id @default(cuid())
  companyId      String
  vendor         String
  domain         String?
  linkedinUrl    String?
  phantomAgentId String?
  cadence        String   // '6h' | 'daily' | 'weekly' | 'custom:cron'
  active         Boolean  @default(true)
  lastRunAt      DateTime?
  nextRunAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([companyId, active], map: "idx_monitor_company_active")
  @@index([nextRunAt], map: "idx_monitor_nextRun")
}

model IngestRun {
  id         String   @id @default(cuid())
  companyId  String
  vendor     String
  status     String   // 'queued' | 'running' | 'ok' | 'error' | 'partial'
  startedAt  DateTime @default(now())
  finishedAt DateTime?
  summary    Json?
  error      String?
  createdAt  DateTime @default(now())

  @@index([companyId, startedAt], map: "idx_ingest_company_started")
}
`;
  let cur = fs.readFileSync(prismaPath, 'utf8');
  if (!/model\s+CompanyMonitor\s+\{/.test(cur)) cur += `\n${addModels}\n`;
  fs.writeFileSync(prismaPath, cur, 'utf8');
  log('Prisma models (CompanyMonitor, IngestRun) – pronto. Rode: npx prisma db push');
})();

// ---------- 2) lib/jobs/reingest.ts ----------
(() => {
  const fp = f('lib','jobs','reingest.ts');
  const content = `import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Monitor = {
  id: string; companyId: string; vendor: 'TOTVS'|'OLV'|'CUSTOM'|string;
  domain?: string | null; linkedinUrl?: string | null; phantomAgentId?: string | null;
  cadence: string; active: boolean; nextRunAt?: string | null;
};

const sleep = (ms:number)=> new Promise(r=>setTimeout(r, ms));
const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

/**
 * Busca monitores "vencidos" e dispara re-ingest em lotes.
 * - concurrency: quantas empresas processar em paralelo
 * - delayMs: atraso entre disparos para aliviar rate-limits
 * - verifyEmails: ativa verificação Hunter
 */
export async function runScheduledReingest(opts?:{
  now?: Date,
  batchLimit?: number,
  concurrency?: number,
  delayMs?: number,
  verifyEmails?: boolean,
}) {
  const {
    now = new Date(),
    batchLimit = 10,
    concurrency = 2,
    delayMs = 500,
    verifyEmails = false,
  } = opts || {};

  const sb = supabaseAdmin();
  const nowIso = now.toISOString();

  // 1) Buscar CompanyMonitor ativos e vencidos
  const { data: mons, error: mErr } = await sb
    .from('CompanyMonitor')
    .select('*')
    .eq('active', true)
    .lte('nextRunAt', nowIso)
    .order('nextRunAt', { ascending: true })
    .limit(batchLimit);

  if (mErr) throw new Error('Monitor query error: '+mErr.message);
  if (!mons || mons.length === 0) return { taken: 0, runs: [] };

  // 2) Preparar jobs
  const chunks: Monitor[][] = [];
  for (let i = 0; i < mons.length; i += concurrency) {
    chunks.push(mons.slice(i, i+concurrency));
  }

  const results: any[] = [];
  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (mon, idx) => {
      await sleep(delayMs * idx);
      const run = await processOneMonitor(sb, mon, { verifyEmails });
      results.push(run);
    }));
  }

  return { taken: mons.length, runs: results };
}

async function processOneMonitor(sb:any, mon:Monitor, opts:{ verifyEmails:boolean }) {
  // 2.1) Cria IngestRun (queued → running)
  const { data: runRow } = await sb.from('IngestRun').insert({
    companyId: mon.companyId,
    vendor: mon.vendor,
    status: 'queued',
  }).select().single();

  const runId = runRow?.id;
  await sb.from('IngestRun').update({ status: 'running', startedAt: new Date().toISOString() }).eq('id', runId);

  // 2.2) Chama o orchestrator interno
  let summary:any = null, status = 'ok', error: string | null = null;
  try {
    const endpoint = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      ? \`\${process.env.NEXTAUTH_URL?.replace(/\\/$/,'') || ('https://'+process.env.VERCEL_URL?.replace(/\\/$/,''))}\`
      : 'http://localhost:3000';

    const body = {
      projectId: 'default-project-id',
      companyId: mon.companyId,
      vendor: mon.vendor,
      domain: mon.domain || undefined,
      companyName: undefined,
      linkedinUrl: mon.linkedinUrl || undefined,
      phantomAgentId: mon.phantomAgentId || undefined,
      verifyEmails: !!opts.verifyEmails
    };

    const resp = await fetch(\`\${endpoint}/api/stack/ingest\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (!resp.ok || data?.ok === false) {
      status = 'error';
      error = data?.error || ('HTTP '+resp.status);
    } else {
      summary = data?.summary || data;
    }
  } catch (e:any) {
    status = 'error';
    error = String(e?.message || e);
  }

  // 2.3) Atualiza IngestRun
  await sb.from('IngestRun').update({
    status, summary, error, finishedAt: new Date().toISOString()
  }).eq('id', runId);

  // 2.4) Agenda próxima execução (cadence)
  const next = computeNextRun(mon.cadence);
  await sb.from('CompanyMonitor').update({
    lastRunAt: new Date().toISOString(),
    nextRunAt: next
  }).eq('id', mon.id);

  return { monitorId: mon.id, companyId: mon.companyId, status, summary, error };
}

function computeNextRun(cadence:string): string {
  const base = Date.now();
  let ms = 0;
  if (cadence === '6h') ms = 6*60*60*1000;
  else if (cadence === 'daily') ms = 24*60*60*1000;
  else if (cadence === 'weekly') ms = 7*24*60*60*1000;
  else if (cadence.startsWith('custom:')) {
    // você pode implementar um parser de cron aqui se quiser
    ms = 24*60*60*1000;
  } else {
    ms = 24*60*60*1000; // padrão: daily
  }
  return new Date(base + ms).toISOString();
}
`;
  upsertFile(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 3) /api/monitor/register ----------
(() => {
  const fp = f('app','api','monitor','register','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

/**
 * POST /api/monitor/register
 * body: {
 *  companyId: string,
 *  vendor: 'TOTVS'|'OLV'|'CUSTOM',
 *  cadence?: '6h'|'daily'|'weekly'|'custom:cron',
 *  domain?: string,
 *  linkedinUrl?: string,
 *  phantomAgentId?: string,
 *  active?: boolean
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, vendor, cadence='daily', domain, linkedinUrl, phantomAgentId, active=true } = body || {};
  if (!companyId || !vendor) {
    return NextResponse.json({ ok:false, error:'companyId e vendor são obrigatórios' }, { status:400 });
  }
  const sb = supabaseAdmin();

  // se já existe monitor para esse par, atualiza; se não, cria
  const { data: ex } = await sb.from('CompanyMonitor').select('id').eq('companyId', companyId).maybeSingle();
  const row = {
    companyId, vendor, cadence, domain: domain||null, linkedinUrl: linkedinUrl||null,
    phantomAgentId: phantomAgentId||null, active: !!active,
    nextRunAt: new Date().toISOString()
  };
  if (ex?.id) {
    await sb.from('CompanyMonitor').update(row).eq('id', ex.id);
  } else {
    await sb.from('CompanyMonitor').insert(row);
  }

  return NextResponse.json({ ok:true });
}
`;
  upsertFile(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 4) /api/cron/reingest (Vercel Cron) ----------
(() => {
  const fp = f('app','api','cron','reingest','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { runScheduledReingest } from '@/lib/jobs/reingest';

export const runtime = 'nodejs';

/**
 * GET/POST /api/cron/reingest
 * - Chamado pelo Vercel Cron (GET)
 * - Pode ser disparado manualmente (POST)
 */
export async function GET(){ 
  const out = await runScheduledReingest({ batchLimit: 10, concurrency: 2, delayMs: 800, verifyEmails: false });
  return NextResponse.json({ ok:true, ...out });
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const batchLimit = body?.batchLimit ?? 10;
  const concurrency = body?.concurrency ?? 2;
  const delayMs = body?.delayMs ?? 800;
  const verifyEmails = !!body?.verifyEmails;
  const out = await runScheduledReingest({ batchLimit, concurrency, delayMs, verifyEmails });
  return NextResponse.json({ ok:true, ...out });
}
`;
  upsertFile(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 5) vercel.json (append cron, sem destruir configs existentes) ----------
(() => {
  const vp = f('vercel.json');
  let json = {};
  if (fs.existsSync(vp)) {
    try { json = JSON.parse(fs.readFileSync(vp, 'utf8')); } catch {}
  }
  if (!json.crons) json.crons = [];
  const has = json.crons.some((c) => c?.path === '/api/cron/reingest');
  if (!has) {
    json.crons.push({
      "path": "/api/cron/reingest",
      "schedule": "0 */6 * * *" // a cada 6 horas; ajuste se quiser
    });
  }
  fs.writeFileSync(vp, JSON.stringify(json, null, 2), 'utf8');
  log('vercel.json: cron configurada para /api/cron/reingest (6/6h).');
})();

console.log('[OLV-CRON] Concluído. Agora rode: npx prisma db push && deploy.');

