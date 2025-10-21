#!/usr/bin/env node
/**
 * OLV Alerts – Mute Add-On (idempotente)
 * - Prisma: AlertMute
 * - Helpers: lib/alerts/mutes.ts (isMuted)
 * - Patch no job de alertas: checar mute antes de disparar
 * - APIs: /api/alerts/mute (GET/POST), /api/alerts/mute/delete (POST)
 * - UI: injeta card "Mutes Ativos" em /dashboard/operations
 * - Protegido por OLV_ADMIN_KEY + rate-limit (usa guard existente)
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
  fs.writeFileSync(fp, content, 'utf8'); return true;
};
const log = (...a)=>console.log('[OLV-MUTE]', ...a);

/** 0) Prisma: AlertMute */
(() => {
  const prisma = f('prisma','schema.prisma');
  if (!fs.existsSync(prisma)) { log('AVISO: prisma/schema.prisma não encontrado.'); return; }
  let src = fs.readFileSync(prisma, 'utf8');
  if (!/model\s+AlertMute\s+\{/.test(src)) {
    src += `
model AlertMute {
  id        String   @id @default(cuid())
  ruleName  String?
  companyId String?
  vendor    String?
  until     DateTime
  note      String?
  createdAt DateTime @default(now())

  @@index([until], map: "idx_mute_until")
  @@index([ruleName], map: "idx_mute_rule")
  @@index([companyId], map: "idx_mute_company")
  @@index([vendor], map: "idx_mute_vendor")
}
`;
    fs.writeFileSync(prisma, src, 'utf8');
    log('Prisma: modelo AlertMute adicionado.');
  } else {
    log('Prisma: AlertMute já existe (ok).');
  }
})();

/** 1) Helper: isMuted */
(() => {
  const fp = f('lib','alerts','mutes.ts');
  const content = `import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function isMuted(
  { ruleName, companyId, vendor }:
  { ruleName?:string|null; companyId?:string|null; vendor?:string|null }
){
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  let q = sb.from('AlertMute')
            .select('*')
            .gte('until', now)
            .order('until', { ascending: false });

  if (ruleName) q = q.eq('ruleName', ruleName);
  if (companyId) q = q.eq('companyId', companyId);
  if (vendor) q = q.eq('vendor', vendor);

  const { data } = await q.limit(1);
  // Também consideramos mutes "globais" (todos), se existirem (campos nulos)
  if (data && data.length) return true;

  const { data: globalMute } = await sb
    .from('AlertMute')
    .select('*')
    .is('ruleName', null).is('companyId', null).is('vendor', null)
    .gte('until', now)
    .limit(1);
  return !!(globalMute && globalMute.length);
}
`;
  put(fp, content) && log('Helper criado/atualizado:', fp);
})();

/** 2) Patch no job de alertas para checar mute */
(() => {
  const fp = f('lib','jobs','alerts.ts');
  if (!fs.existsSync(fp)) { log('AVISO: lib/jobs/alerts.ts não encontrado. Instale o Alerts Pack antes.'); return; }
  let src = fs.readFileSync(fp, 'utf8');
  if (!/from '@\/lib\/alerts\/mutes'/.test(src)) {
    src = src.replace(
      /import \{ supabaseAdmin \} from '@\/lib\/supabaseAdmin';/,
      `import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isMuted } from '@/lib/alerts/mutes';`
    );

    // inserir checagem de mute antes de fire() — em cada branch
    const injects = [
      { marker: /const msg = `IngestRun .*?`;/s, after:
        `\n          const muted = await isMuted({ ruleName: rule.name, companyId: r.companyId, vendor: r.vendor });\n          if (muted) { /* silenciado */ continue; }\n`},
      { marker: /const signature = \{ kind:'maturity_drop'.*?\};\s*const dup = .*?;\s*if \(dup\) continue;/s, after:
        `\n          const muted = await isMuted({ ruleName: rule.name, companyId: cid, vendor: arr[0]?.vendor });\n          if (muted) { /* silenciado */ continue; }\n`},
      { marker: /const msg = `p95 de duração .*?`;/s, after:
        `\n            const muted = await isMuted({ ruleName: rule.name });\n            if (muted) { /* silenciado */ continue; }\n`},
      { marker: /const msg = `Nenhuma execução de ingest .*?`;/s, after:
        `\n            const muted = await isMuted({ ruleName: rule.name });\n            if (muted) { /* silenciado */ continue; }\n`},
      { marker: /const msg = `Lock de ingest preso .*?`;/s, after:
        `\n          const muted = await isMuted({ ruleName: rule.name, companyId: lk.companyId });\n          if (muted) { /* silenciado */ continue; }\n`},
      { marker: /const msg = `\$\{quotaRuns.length\} indícios de quota.*?`;/s, after:
        `\n            const muted = await isMuted({ ruleName: rule.name });\n            if (muted) { /* silenciado */ continue; }\n`},
    ];

    for (const inj of injects) {
      if (inj.marker.test(src)) {
        src = src.replace(inj.marker, (m)=> m + inj.after);
      }
    }
    fs.writeFileSync(fp, src, 'utf8');
    log('Job de alertas: checagem de mute injetada.');
  } else {
    log('Job de alertas já referencia isMuted (ok).');
  }
})();

/** 3) APIs: /api/alerts/mute (GET/POST) e /api/alerts/mute/delete (POST) */
(() => {
  const base = f('app','api','alerts','mute');

  // GET/POST
  let fp = path.join(base,'route.ts');
  let content = `import { NextRequest, NextResponse } from 'next/server';
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
`;
  put(fp, content) && log('API criada/atualizada:', fp);

  // DELETE (por id)
  fp = path.join(base,'delete','route.ts');
  content = `import { NextRequest, NextResponse } from 'next/server';
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
`;
  put(fp, content) && log('API delete criada/atualizada:', fp);
})();

/** 4) UI: card "Mutes Ativos" em /dashboard/operations */
(() => {
  const page = f('app','dashboard','operations','page.tsx');
  if (!fs.existsSync(page)) { log('AVISO: /dashboard/operations não existe. Instale o Final Upgrade Pack antes.'); return; }
  let src = fs.readFileSync(page, 'utf8');

  // incluir chamada ao endpoint de mutes (server-side)
  if (!/\/api\/alerts\/mute'/.test(src)) {
    src = src.replace(
      /const \[alerts, metrics, runs\] = await Promise\.all\(\[/,
      `const [mutes, alerts, metrics, runs] = await Promise.all([
    fetchJSON('/api/alerts/mute'),`
    );

    // adicionar card antes do fechamento
    src = src.replace(
      /(<\/div>\s*<\/div>\s*\)\s*}\s*$)/,
      `
      {/* Mutes Ativos */}
      <div className="rounded-2xl shadow p-4 bg-white dark:bg-gray-800">
        <div className="mb-3 text-lg font-semibold">🔕 Mutes Ativos</div>
        <div className="text-sm mb-3 opacity-70">
          Regras/empresas silenciadas temporariamente (controlado via API segura).
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Regra</th>
                <th>Empresa</th>
                <th>Vendor</th>
                <th>Até</th>
                <th>Nota</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {(mutes?.mutes||[]).map((m:any)=>(
                <tr key={m.id} className="border-t">
                  <td className="py-2">{m.ruleName || '—'}</td>
                  <td className="text-xs">{m.companyId ? m.companyId.substring(0,12)+'...' : '—'}</td>
                  <td>{m.vendor || '—'}</td>
                  <td className="text-xs">{new Date(m.until).toLocaleString()}</td>
                  <td className="max-w-[360px] truncate text-xs" title={m.note || ''}>{m.note || '—'}</td>
                  <td className="opacity-60 text-xs">{m.id.substring(0,8)}...</td>
                </tr>
              ))}
              {(!mutes?.mutes?.length) && <tr><td colSpan={6} className="py-3 opacity-60">Nenhum mute ativo.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="text-xs mt-3 opacity-60">
          Para criar/remover mutes, use as APIs seguras com <code>x-olv-admin-key</code>.
        </div>
      </div>
$1`
    );
    fs.writeFileSync(page, src, 'utf8');
    log('UI: card "Mutes Ativos" injetado.');
  } else {
    log('UI: card de mutes já presente (ok).');
  }
})();

console.log('[OLV-MUTE] Concluído. Agora rode: npx prisma generate && npx prisma db push');

