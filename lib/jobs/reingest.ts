import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
      ? `${process.env.NEXTAUTH_URL?.replace(/\/$/,'') || ('https://'+process.env.VERCEL_URL?.replace(/\/$/,''))}`
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

    const resp = await fetch(`${endpoint}/api/stack/ingest`, {
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
