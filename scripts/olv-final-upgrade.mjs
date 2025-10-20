#!/usr/bin/env node
/**
 * OLV Final Upgrade Pack (aditivo, idempotente)
 * - UI: /dashboard/operations (cards de Monitores, Runs, Scores)
 * - APIs: /api/ops/metrics, /api/ops/runs, /api/ops/audit
 * - Hardening: admin header key + rate limit básico por IP/rota
 * - Concurrency-safe: lock de ingest por empresa (IngestLock)
 * - SQL Views: v_ops_company_health, v_ops_run_summary
 * - NÃO remove nada fora do escopo de prospecção/inteligência.
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
const log = (...a)=>console.log('[OLV-FINAL]', ...a);

// ---------- 0) Prisma: modelos extra (IngestLock, AuditLog) ----------
(() => {
  const prisma = f('prisma','schema.prisma');
  if (!fs.existsSync(prisma)) { log('AVISO: prisma/schema.prisma não encontrado.'); return; }
  let src = fs.readFileSync(prisma, 'utf8');
  if (!/model\s+IngestLock\s+\{/.test(src)) {
    src += `
model IngestLock {
  id         String   @id @default(cuid())
  companyId  String   @unique
  lockedAt   DateTime @default(now())
  holder     String?
  note       String?
}

model ApiAuditLog {
  id         String   @id @default(cuid())
  ts         DateTime @default(now())
  actor      String?  // sistema|cron|api|user:...
  action     String
  target     String?
  meta       Json?
  ip         String?
  route      String?
  level      String?  // info|warn|error
  @@index([ts], map: "idx_api_audit_ts")
}
`;
    fs.writeFileSync(prisma, src, 'utf8');
    log('Prisma models adicionados: IngestLock, ApiAuditLog');
  } else {
    log('Prisma: modelos já presentes (ok).');
  }
})();

// ---------- 1) Rate Limiter e Admin Guard (server utils) ----------
(() => {
  const fp = f('lib','server','guard.ts');
  const content = `type K=string; const buckets=new Map<K,{tokens:number,ts:number}>();
const BURST=20, REFILL_PER_SEC=5;
export function rateLimit(ip:string, route:string){
  const key=\`\${ip}|\${route}\`; const now=Date.now();
  const b=buckets.get(key) || { tokens: BURST, ts: now };
  const elapsed=(now-b.ts)/1000; b.tokens=Math.min(BURST, b.tokens + elapsed*REFILL_PER_SEC); b.ts=now;
  if (b.tokens < 1) return false; b.tokens-=1; buckets.set(key,b); return true;
}
export function requireAdmin(reqHeaders:Headers){
  const want=reqHeaders.get('x-olv-admin-key');
  const have=process.env.OLV_ADMIN_KEY;
  if (!have) return true; // se não configurado, permite (evita travar ambiente dev)
  return want && want === have;
}
`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 2) Ingest Lock helpers ----------
(() => {
  const fp = f('lib','server','locks.ts');
  const content = `import { supabaseAdmin } from '@/lib/supabaseAdmin';
export async function tryLockCompany(companyId:string, holder='ops'){
  const sb=supabaseAdmin();
  try{
    const { data, error } = await sb.from('IngestLock').insert({ companyId, holder }).select('*').single();
    if (error) return false;
    return !!data;
  }catch{ return false; }
}
export async function releaseLock(companyId:string){
  const sb=supabaseAdmin(); try{ await sb.from('IngestLock').delete().eq('companyId', companyId);}catch{}
}
`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 3) Audit helper ----------
(() => {
  const fp = f('lib','server','audit.ts');
  const content = `import { supabaseAdmin } from '@/lib/supabaseAdmin';
export async function audit({actor,action,target,meta,ip,route,level='info'}:any){
  try{ const sb=supabaseAdmin(); await sb.from('ApiAuditLog').insert({actor,action,target,meta,ip,route,level}); }catch{}
}
`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 4) APIs de Observabilidade ----------
(() => {
  // /api/ops/metrics
  let fp = f('app','api','ops','metrics','route.ts');
  let content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/metrics')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const stats:any={};
  
  // Contadores básicos
  const [companies, monitors, runs24, techSignals, firmo, maturity] = await Promise.all([
    sb.from('Company').select('id', {count:'exact', head:true}),
    sb.from('CompanyMonitor').select('id', {count:'exact', head:true}).eq('active', true),
    sb.from('IngestRun').select('id', {count:'exact', head:true}).gte('startedAt', new Date(Date.now() - 24*60*60*1000).toISOString()),
    sb.from('TechSignals').select('id', {count:'exact', head:true}),
    sb.from('Firmographics').select('id', {count:'exact', head:true}),
    sb.from('CompanyTechMaturity').select('id', {count:'exact', head:true})
  ]);
  
  stats.counts = {
    companies: companies.count || 0,
    monitors: monitors.count || 0,
    runs24: runs24.count || 0,
    techsignals: techSignals.count || 0,
    firmographics: firmo.count || 0,
    maturity: maturity.count || 0
  };
  
  // últimos scores por vendor
  const { data: lastScores } = await sb.from('CompanyTechMaturity').select('vendor, scores, updatedAt, companyId').order('updatedAt',{ascending:false}).limit(50);
  await audit({actor:'api',action:'ops_metrics',ip,route:'/api/ops/metrics'});
  return NextResponse.json({ok:true,counts:stats.counts,lastScores});
}`;
  put(fp, content) && log('Criado/atualizado:', fp);

  // /api/ops/runs
  fp = f('app','api','ops','runs','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/runs')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const { data: runs } = await sb.from('IngestRun').select('*').order('startedAt',{ascending:false}).limit(200);
  await audit({actor:'api',action:'ops_runs',ip,route:'/api/ops/runs'});
  return NextResponse.json({ok:true,runs:runs||[]});
}`;
  put(fp, content) && log('Criado/atualizado:', fp);

  // /api/ops/audit
  fp = f('app','api','ops','audit','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const ip=req.headers.get('x-forwarded-for')||'ip'; if(!rateLimit(ip,'/api/ops/audit')) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  const sb=supabaseAdmin();
  const { data } = await sb.from('ApiAuditLog').select('*').order('ts',{ascending:false}).limit(200);
  return NextResponse.json({ok:true,audit:data||[]});
}`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 5) Hardening dos endpoints críticos (wrap sem quebrar lógica) ----------
(() => {
  const fp = f('app','api','stack','ingest','guard.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, rateLimit } from '@/lib/server/guard';
import { audit } from '@/lib/server/audit';
export function guard(req:NextRequest, route:string){
  const ip=req.headers.get('x-forwarded-for')||'ip';
  if(!rateLimit(ip, route)) return NextResponse.json({ok:false,error:'rate_limited'},{status:429});
  if(!requireAdmin(req.headers)) return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  audit({actor:'api',action:'call',route,ip});
  return null;
}`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// Patch leve dentro de /api/stack/ingest (se presente)
(() => {
  const fp = f('app','api','stack','ingest','route.ts');
  if (!fs.existsSync(fp)) { log('AVISO: orchestrator ainda não presente; pule este patch.'); return; }
  let src = fs.readFileSync(fp,'utf8');
  if (!/from\s+['"]\.\/guard['"]/.test(src)) {
    src = src.replace(/(import.*NextResponse.*from.*next\/server['"];?\s*)/,
`$1import { guard } from './guard';
`
    );
    src = src.replace(/export async function POST\(req:\s*NextRequest\)\s*\{/,
`export async function POST(req: NextRequest){
  const g=guard(req,'/api/stack/ingest'); if(g) return g;`
    );
    fs.writeFileSync(fp, src, 'utf8');
    log('Guard acoplado ao orchestrator (rate-limit + admin key).');
  } else {
    log('Guard já presente no orchestrator (ok).');
  }
})();

// ---------- 6) Concurrency-safe: usar lock no reingest job ----------
(() => {
  const fp = f('lib','jobs','reingest.ts');
  if (!fs.existsSync(fp)) { log('AVISO: reingest job não encontrado; pule este patch.'); return; }
  let src = fs.readFileSync(fp, 'utf8');
  if (!/tryLockCompany/.test(src)) {
    src = src.replace(
      /(import.*supabaseAdmin.*from.*@\/lib\/supabaseAdmin['"];?\s*)/,
      `$1import { tryLockCompany, releaseLock } from '@/lib/server/locks';
`
    );
    src = src.replace(
      /const run = await processOneMonitor\(sb, mon, \{ verifyEmails \}\);/,
      `const got = await tryLockCompany(mon.companyId, 'cron');
      let run;
      if (got) {
        try { run = await processOneMonitor(sb, mon, { verifyEmails }); }
        finally { await releaseLock(mon.companyId); }
      } else {
        run = { monitorId: mon.id, companyId: mon.companyId, status: 'skipped_locked' };
      }`
    );
    fs.writeFileSync(fp, src, 'utf8');
    log('Lock de concorrência habilitado no reingest.');
  } else {
    log('Lock já aplicado no reingest (ok).');
  }
})();

// ---------- 7) Views & RPC (SQL helpers) ----------
(() => {
  const fp = f('sql','ops_views.sql');
  const content = `-- v_ops_company_health: último overall por empresa
create or replace view v_ops_company_health as
select
  c.id as company_id,
  c.name as company_name,
  (ctm.scores->>'overall')::int as overall,
  ctm.vendor,
  ctm."updatedAt" as updated_at
from "Company" c
join "CompanyTechMaturity" ctm on ctm."companyId" = c.id
qualify row_number() over (partition by c.id order by ctm."updatedAt" desc) = 1;

-- v_ops_run_summary: runs recentes e duração
create or replace view v_ops_run_summary as
select
  r.id, r."companyId", r.vendor, r.status,
  r."startedAt", r."finishedAt",
  extract(epoch from (coalesce(r."finishedAt", now()) - r."startedAt"))::int as duration_sec
from "IngestRun" r
order by r."startedAt" desc;

-- rpc: olv_ops_counts
create or replace function olv_ops_counts()
returns json language sql stable as $$
  with a as (select count(*) as companies from "Company"),
       b as (select count(*) as monitors from "CompanyMonitor" where active = true),
       c as (select count(*) as runs24 from "IngestRun" where "startedAt" >= now() - interval '24 hours'),
       d as (select count(*) as techsignals from "TechSignals"),
       e as (select count(*) as firmo from "Firmographics"),
       f as (select count(*) as maturity from "CompanyTechMaturity")
  select json_build_object(
    'companies', (select companies from a),
    'monitors', (select monitors from b),
    'runs24', (select runs24 from c),
    'techsignals', (select techsignals from d),
    'firmographics', (select firmo from e),
    'maturity', (select maturity from f)
  );
$$;`;
  put(fp, content) && log('Criado/atualizado:', fp);
})();

// ---------- 8) UI: /dashboard/operations ----------
(() => {
  const page = f('app','dashboard','operations','page.tsx');
  const content = `import Link from 'next/link';

async function fetchJSON(path:string){
  const h:any={'Content-Type':'application/json'};
  if (process.env.OLV_ADMIN_KEY) h['x-olv-admin-key']=process.env.OLV_ADMIN_KEY!;
  const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? \`https://\${process.env.VERCEL_URL}\` : 'http://localhost:3000');
  const r=await fetch(\`\${base}\${path}\`,{ cache:'no-store', headers:h as any });
  if(!r.ok) return null; return r.json();
}

export default async function OperationsPage(){
  const [metrics, runs] = await Promise.all([
    fetchJSON('/api/ops/metrics'),
    fetchJSON('/api/ops/runs'),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">⚙️ Operações & Observabilidade</h1>
        <Link href="/dashboard" className="text-sm underline">← Voltar ao Dashboard</Link>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {['companies','monitors','runs24','techsignals','firmographics','maturity'].map((k)=>(
          <div key={k} className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
            <div className="text-sm opacity-70 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-2xl font-bold">{metrics?.counts?.[k] ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Últimos scores */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">Últimos Scores (vendor)</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(metrics?.lastScores||[]).map((s:any,idx:number)=>(
            <div key={idx} className="rounded-xl border p-3 bg-gray-50 dark:bg-gray-700">
              <div className="text-sm opacity-70">{s.vendor}</div>
              <div className="text-2xl font-bold">{s?.scores?.overall ?? '—'}</div>
              <div className="text-xs mt-1 opacity-60">companyId: {s.companyId.substring(0,12)}...</div>
              <div className="text-xs opacity-60">atualizado: {new Date(s.updatedAt).toLocaleString()}</div>
            </div>
          ))}
          {(!metrics?.lastScores?.length) && <div className="opacity-60">Sem dados de maturidade ainda.</div>}
        </div>
      </div>

      {/* Execuções recentes */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">Execuções Recentes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Run</th>
                <th>Company</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {(runs?.runs||[]).slice(0,50).map((r:any)=>(
                <tr key={r.id} className="border-t">
                  <td className="py-2 text-xs">{r.id.substring(0,8)}...</td>
                  <td className="text-xs">{r.companyId.substring(0,12)}...</td>
                  <td>{r.vendor}</td>
                  <td className={r.status==='ok'?'text-green-600':(r.status?.includes('error')?'text-red-600':'')}>
                    {r.status}
                  </td>
                  <td className="text-xs">{new Date(r.startedAt).toLocaleString()}</td>
                  <td className="text-xs">{r.finishedAt? new Date(r.finishedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {(!runs?.runs?.length) && <tr><td className="py-3 opacity-60" colSpan={6}>Sem execuções registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
`;
  put(page, content) && log('Criado/atualizado:', page);
})();

console.log('[OLV-FINAL] Finalizado. Rode: npx prisma generate && npx prisma db push');

