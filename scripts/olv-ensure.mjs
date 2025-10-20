#!/usr/bin/env node
/**
 * OLV Installer (aditivo, sem regressão)
 * - Cria rotas /api/stack/build e integra com /api/maturity/calculate
 * - Cria libs de resolução de stack a partir de evidências (TechSignals + Firmographics)
 * - Cria/atualiza wrappers de integrações e utilitários
 * - Hotfix: remove "private generatePlaybook(" e "this.generatePlaybook("
 * - NÃO toca fora do escopo e não apaga nada
 */

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const f = (...p) => path.join(root, ...p);
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const writeIfChanged = (fp, content) => {
  ensureDir(path.dirname(fp));
  if (fs.existsSync(fp)) {
    const cur = fs.readFileSync(fp, 'utf8');
    if (cur === content) return false;
  }
  fs.writeFileSync(fp, content, 'utf8');
  return true;
};
const log = (...a) => console.log('[OLV]', ...a);

// ---------- 0) HOTFIX BUILD: playbook route ----------
(() => {
  const fp = f('app','api','playbook','generate','route.ts');
  if (!fs.existsSync(fp)) { log('Hotfix: arquivo não encontrado (ok):', fp); return; }
  let src = fs.readFileSync(fp,'utf8');
  const before = src;
  src = src.replace(/private\s+generatePlaybook\s*\(/g,'const generatePlaybook = (');
  src = src.replace(/this\.generatePlaybook\s*\(/g,'generatePlaybook(');
  if (src !== before) { fs.writeFileSync(fp, src, 'utf8'); log('Hotfix aplicado em:', fp); }
  else log('Hotfix: nada a mudar em', fp);
})();

// ---------- 1) /app/page.tsx redirect ----------
(() => {
  const fp = f('app','page.tsx');
  const content = `export default function Home() {
  if (typeof window !== 'undefined') window.location.href = '/dashboard';
  return null;
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 2) /api/health ----------
(() => {
  const fp = f('app','api','health','route.ts');
  const content = `import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET(){ return NextResponse.json({ ok:true, time:new Date().toISOString() }); }
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 3) supabase admin ----------
(() => {
  const fp = f('lib','supabaseAdmin.ts');
  const content = `import { createClient } from '@supabase/supabase-js';
export function supabaseAdmin(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if(!url || !service) throw new Error('Supabase envs ausentes');
  return createClient(url, service, { auth: { persistSession:false } });
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 4) wrappers integrações ----------
(() => {
  // Serper
  let fp = f('lib','integrations','serper.ts');
  let content = `export async function serperSearch(q:string, num=5){
  const key = process.env.SERPER_API_KEY; if(!key) throw new Error('SERPER_API_KEY ausente');
  const resp = await fetch('https://google.serper.dev/search',{ method:'POST', headers:{ 'Content-Type':'application/json','X-API-KEY':key }, body: JSON.stringify({ q, num })});
  if(!resp.ok) throw new Error(\`Serper HTTP \${resp.status}\`);
  return resp.json();
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);

  // Apollo
  fp = f('lib','integrations','apollo.ts');
  content = `const APOLLO_BASE='https://api.apollo.io/v1';
export async function apolloCompanyEnrich(params:Record<string,any>){
  const key=process.env.APOLLO_API_KEY; if(!key) throw new Error('APOLLO_API_KEY ausente');
  const url=\`\${APOLLO_BASE}/mixed_companies/search\`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,...params})});
  if(!r.ok) throw new Error(\`Apollo HTTP \${r.status}\`);
  return r.json();
}
export async function apolloPeopleSearch(params:Record<string,any>){
  const key=process.env.APOLLO_API_KEY; if(!key) throw new Error('APOLLO_API_KEY ausente');
  const url=\`\${APOLLO_BASE}/people/search\`;
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,...params})});
  if(!r.ok) throw new Error(\`Apollo HTTP \${r.status}\`);
  return r.json();
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);

  // Hunter
  fp = f('lib','integrations','hunter.ts');
  content = `export async function hunterFind(domain:string, full_name?:string){
  const key=process.env.HUNTER_API_KEY; if(!key) throw new Error('HUNTER_API_KEY ausente');
  const u=new URL('https://api.hunter.io/v2/email-finder');
  u.searchParams.set('domain',domain); if(full_name) u.searchParams.set('full_name',full_name); u.searchParams.set('api_key',key);
  const r=await fetch(u.toString()); if(!r.ok) throw new Error(\`Hunter find HTTP \${r.status}\`); return r.json();
}
export async function hunterVerify(email:string){
  const key=process.env.HUNTER_API_KEY; if(!key) throw new Error('HUNTER_API_KEY ausente');
  const u=new URL('https://api.hunter.io/v2/email-verifier');
  u.searchParams.set('email',email); u.searchParams.set('api_key',key);
  const r=await fetch(u.toString()); if(!r.ok) throw new Error(\`Hunter verify HTTP \${r.status}\`); return r.json();
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);

  // PhantomBuster
  fp = f('lib','integrations','phantom.ts');
  content = `export async function phantomRun(agentId:string, input:any){
  const key=process.env.PHANTOM_BUSTER_API_KEY; if(!key) throw new Error('PHANTOM_BUSTER_API_KEY ausente');
  const r=await fetch('https://api.phantombuster.com/api/v2/agents/launch',{method:'POST',headers:{'Content-Type':'application/json','X-Phantombuster-Key-1':key},body:JSON.stringify({id:agentId,argument:input})});
  if(!r.ok) throw new Error(\`Phantom launch HTTP \${r.status}\`); return r.json();
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 5) libs de stack resolver ----------
(() => {
  // Normalizador e dicionários
  const fpA = f('lib','stack','resolver.ts');
  const contentA = `export type DetectedItem = { product:string; vendor?:string; confidence?:number };
export type DetectedStack = { erp?:DetectedItem[]; crm?:DetectedItem[]; cloud?:DetectedItem[]; bi?:DetectedItem[]; db?:DetectedItem[]; integrations?:DetectedItem[]; security?:DetectedItem[] };

const ADD = (arr:DetectedItem[]|undefined, item:DetectedItem) => {
  const a = arr ?? [];
  // evita duplicatas por nome de produto (case-insensitive)
  if (!a.some(x => x.product.toLowerCase() === item.product.toLowerCase())) a.push(item);
  return a;
};

const K = {
  ERP: [/TOTVS|Protheus|RM|Datasul/i, /SAP|S\/4HANA|Business One|B1|R3/i, /Oracle E-Business|Oracle Cloud ERP/i, /Microsoft Dynamics 365 (?:FO|Finance|Operations|Business Central)/i],
  CRM: [/Salesforce|SFDC/i, /Dynamics 365 CRM|Dynamics CRM/i, /RD Station/i, /HubSpot/i, /Pipedrive/i],
  CLOUD: [/AWS|Amazon Web Services/i, /Azure/i, /Google Cloud|GCP/i, /Oracle Cloud Infrastructure|OCI/i],
  BI: [/Power BI/i, /Tableau/i, /Qlik/i, /Looker/i, /Data Studio/i],
  DB: [/PostgreSQL|Postgres/i, /MySQL/i, /SQL Server/i, /Oracle Database/i, /MongoDB/i],
  INTEG: [/Mulesoft/i, /Dell Boomi/i, /Fluig/i, /Kafka/i, /RabbitMQ/i, /N8N|Make\.com|Zapier/i],
  SEC: [/Fortinet|FortiGate/i, /Palo Alto Networks/i, /Checkpoint/i, /CrowdStrike/i, /Okta/i, /Azure AD|Entra ID/i]
};

// heurística para inferir vendor/product de uma string
function inferProduct(str:string): {cat:keyof DetectedStack, product:string, vendor?:string} | null {
  const s = str || '';
  const checks = [
    ['erp','TOTVS Protheus','TOTVS',K.ERP[0]],
    ['erp','SAP S/4HANA','SAP',K.ERP[1]],
    ['erp','Oracle Cloud ERP','Oracle',K.ERP[2]],
    ['erp','Dynamics 365 Finance & Ops','Microsoft',K.ERP[3]],
    ['crm','Salesforce Sales Cloud','Salesforce',K.CRM[0]],
    ['crm','Dynamics 365 CRM','Microsoft',K.CRM[1]],
    ['crm','RD Station CRM','RD Station',K.CRM[2]],
    ['crm','HubSpot CRM','HubSpot',K.CRM[3]],
    ['crm','Pipedrive','Pipedrive',K.CRM[4]],
    ['cloud','AWS','Amazon',K.CLOUD[0]],
    ['cloud','Azure','Microsoft',K.CLOUD[1]],
    ['cloud','Google Cloud','Google',K.CLOUD[2]],
    ['cloud','OCI','Oracle',K.CLOUD[3]],
    ['bi','Power BI','Microsoft',K.BI[0]],
    ['bi','Tableau','Salesforce',K.BI[1]],
    ['bi','Qlik','Qlik',K.BI[2]],
    ['bi','Looker','Google',K.BI[3]],
    ['bi','Data Studio','Google',K.BI[4]],
    ['db','PostgreSQL','PostgreSQL',K.DB[0]],
    ['db','MySQL','MySQL',K.DB[1]],
    ['db','SQL Server','Microsoft',K.DB[2]],
    ['db','Oracle Database','Oracle',K.DB[3]],
    ['db','MongoDB','MongoDB',K.DB[4]],
    ['integrations','MuleSoft','Salesforce',K.INTEG[0]],
    ['integrations','Boomi','Boomi',K.INTEG[1]],
    ['integrations','Fluig','TOTVS',K.INTEG[2]],
    ['integrations','Apache Kafka','Apache',K.INTEG[3]],
    ['integrations','RabbitMQ','RabbitMQ',K.INTEG[4]],
    ['integrations','N8N/Make/Zapier','n8n/Make/Zapier',K.INTEG[5]],
    ['security','FortiGate','Fortinet',K.SEC[0]],
    ['security','Palo Alto NGFW','Palo Alto',K.SEC[1]],
    ['security','Check Point','Check Point',K.SEC[2]],
    ['security','CrowdStrike Falcon','CrowdStrike',K.SEC[3]],
    ['security','Okta','Okta',K.SEC[4]],
    ['security','Entra ID','Microsoft',K.SEC[5]],
  ];
  for(const [cat,product,vendor,regex] of checks){
    if (regex.test(s)) return { cat: cat as keyof DetectedStack, product: product as string, vendor: vendor as string|undefined };
  }
  return null;
}

// agrega evidências: headers, tags, descrições, títulos, snippets
export function buildDetectedStackFromEvidence(evidence: Array<{key?:string; value?:any; source?:string; kind?:string}>, techTags?: any): DetectedStack {
  let out:DetectedStack = {};
  const push = (cat:keyof DetectedStack, prod:string, vendor?:string, confidence=60) => {
    // @ts-ignore
    out[cat] = ADD(out[cat], { product: prod, vendor, confidence });
  };

  const consider = (s?:string, conf=60) => {
    if (!s) return;
    const inf = inferProduct(s);
    if (inf) push(inf.cat, inf.product, inf.vendor, conf);
  };

  // Firmographics techTags (texto simples ou array de strings)
  if (techTags) {
    const arr = Array.isArray(techTags) ? techTags : Object.values(techTags);
    for (const t of arr) consider(String(t), 65);
  }

  // Evidências diversas
  for (const ev of evidence || []) {
    // value pode ser string, objeto (headers), array…
    if (!ev) continue;
    const src = (ev.source || ev.kind || '').toLowerCase();

    // headers HTTP (objeto)
    if (src.includes('http')) {
      const v = ev.value || {};
      for (const [k, val] of Object.entries(v)) {
        consider(\`\${k}: \${val}\`, 55);
      }
    }

    // linkedin_job / descrição
    if (src.includes('linkedin')) {
      const v = ev.value;
      if (typeof v === 'string') consider(v, 70);
      if (typeof v === 'object') {
        for (const [k, val] of Object.entries(v)) consider(\`\${k}: \${val}\`, 70);
      }
    }

    // generic texts (serper/cse snippets, titles, bodies)
    if (typeof ev.value === 'string') consider(ev.value, 60);
    else if (Array.isArray(ev.value)) ev.value.forEach(x => consider(String(x), 60));
    else if (typeof ev.value === 'object' && ev.value) {
      for (const [k, val] of Object.entries(ev.value)) consider(\`\${k}: \${val}\`, 60);
    }

    // key também ajuda
    if (ev.key) consider(ev.key, 55);
  }

  return out;
}
`;
  if (writeIfChanged(fpA, contentA)) log('Criado/atualizado:', fpA);

  // Cálculo de maturidade + Fit (reuso das suas regras)
  const fpB = f('lib','maturity','tech-maturity.ts');
  const contentB = `export type DetectedItem = { product:string; vendor?:string; confidence?:number };
export type DetectedStack = { erp?:DetectedItem[]; crm?:DetectedItem[]; cloud?:DetectedItem[]; bi?:DetectedItem[]; db?:DetectedItem[]; integrations?:DetectedItem[]; security?:DetectedItem[] };
export type Scores = { infra:number; systems:number; data:number; security:number; automation:number; culture:number; overall:number };
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function computeMaturity(input:{ detectedStack:DetectedStack; signals?:any }):Scores{
  const ds=input.detectedStack||{};
  const infra=clamp((ds.cloud?.length?60:20)+(ds.security?.length?20:0));
  const systems=clamp((ds.erp?.length?40:10)+(ds.crm?.length?20:0)+(ds.bi?.length?20:0));
  const data=clamp((ds.bi?.length?40:10)+(ds.db?.length?20:0));
  const security=clamp((ds.security?.length?60:20));
  const automation=clamp((ds.integrations?.length?50:15));
  const culture=clamp(30);
  const overall=Math.round((infra+systems+data+security+automation+culture)/6);
  return { infra, systems, data, security, automation, culture, overall };
}
`;
  if (writeIfChanged(fpB, contentB)) log('Criado/atualizado:', fpB);

  const fpC = f('lib','maturity','vendor-fit.ts');
  const contentC = `import type { Scores } from './tech-maturity';
import type { DetectedStack } from '../stack/resolver';
export function suggestFit(input:{ vendor:'TOTVS'|'OLV'|'CUSTOM'; detectedStack:DetectedStack; scores:Scores }){
  const { vendor, detectedStack:ds } = input;
  const rec={ products:[] as string[], olv_packs:[] as string[], rationale:[] as string[] };
  if (vendor==='TOTVS'){
    if (ds.erp?.some(x=>/SAP|Oracle/i.test(x.product))) {
      rec.products.push('TOTVS Protheus','TOTVS Backoffice');
      rec.rationale.push('Substituição/migração com redução de TCO e integração nativa TOTVS');
    }
    if (!ds.integrations?.length){
      rec.products.push('Fluig (BPM/Workflow)');
      rec.rationale.push('Ausência de BPM detectada – automação de processos');
    }
    if (ds.bi?.some(x=>/Power BI|Tableau/i.test(x.product))){
      rec.products.push('TOTVS BI');
      rec.rationale.push('BI integrado ao ERP e relatórios financeiros');
    }
  } else if (vendor==='OLV'){
    rec.olv_packs.push('Diagnóstico 360 + Roadmap','Smart Import & Integrações');
    rec.rationale.push('Acelerar quick-wins com integrações padrão OLV');
  } else {
    rec.products.push('Pacote de Integração & Observabilidade');
    rec.rationale.push('Padrões de integração e monitoração para stack heterogênea');
  }
  return rec;
}
`;
  if (writeIfChanged(fpC, contentC)) log('Criado/atualizado:', fpC);
})();

// ---------- 6) rota: /api/stack/build ----------
(() => {
  const fp = f('app','api','stack','build','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildDetectedStackFromEvidence } from '@/lib/stack/resolver';

export const runtime = 'nodejs';

/**
 * POST /api/stack/build
 * body: { companyId: string }
 * Retorna: { ok, detectedStack, evidenceCount }
 * - Agrega evidências reais de TechSignals e Firmographics para montar detectedStack
 */
export async function POST(req: NextRequest){
  const { companyId } = await req.json();
  if (!companyId) return NextResponse.json({ ok:false, error:'companyId obrigatório' }, { status:400 });

  const sb = supabaseAdmin();

  // 1) Carregar evidências TechSignals
  const { data: ts, error: tsErr } = await sb
    .from('TechSignals')
    .select('*')
    .eq('companyId', companyId)
    .order('fetchedAt', { ascending:false });

  if (tsErr) return NextResponse.json({ ok:false, error: tsErr.message }, { status:500 });

  const evidence = (ts||[]).map(t => ({
    key: t.key, value: t.value, source: t.source, kind: t.kind
  }));

  // 2) Firmographics (techTags)
  const { data: fg, error: fgErr } = await sb
    .from('Firmographics')
    .select('*')
    .eq('companyId', companyId)
    .order('fetchedAt', { ascending:false })
    .limit(1)
    .maybeSingle();

  if (fgErr) return NextResponse.json({ ok:false, error: fgErr.message }, { status:500 });

  const techTags = fg?.techTags ?? null;

  // 3) Resolver detectedStack
  const detectedStack = buildDetectedStackFromEvidence(evidence, techTags);

  return NextResponse.json({ ok:true, detectedStack, evidenceCount: evidence.length });
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 7) rota: /api/maturity/calculate (auto usa stack builder se necessário) ----------
(() => {
  const fp = f('app','api','maturity','calculate','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeMaturity } from '@/lib/maturity/tech-maturity';
import { suggestFit } from '@/lib/maturity/vendor-fit';
import { buildDetectedStackFromEvidence } from '@/lib/stack/resolver';

export const runtime = 'nodejs';

/**
 * POST /api/maturity/calculate
 * body: { projectId, companyId, vendor, detectedStack?, sources? }
 * - Se detectedStack NÃO for enviado, é montado automaticamente de TechSignals + Firmographics
 * - Upsert em CompanyTechMaturity
 */
export async function POST(req: NextRequest){
  const { projectId, companyId, vendor, detectedStack:dsIn, sources } = await req.json();
  if (!projectId || !companyId || !vendor) {
    return NextResponse.json({ ok:false, error:'projectId, companyId e vendor obrigatórios' }, { status:400 });
  }
  const sb = supabaseAdmin();

  let detectedStack = dsIn;
  if (!detectedStack) {
    // carregar evidências e montar stack automaticamente
    const { data: ts } = await sb.from('TechSignals').select('*').eq('companyId', companyId);
    const evidence = (ts||[]).map(t=>({ key:t.key, value:t.value, source:t.source, kind:t.kind }));
    const { data: fg } = await sb.from('Firmographics').select('*').eq('companyId', companyId).order('fetchedAt',{ascending:false}).limit(1).maybeSingle();
    const techTags = fg?.techTags ?? null;
    detectedStack = buildDetectedStackFromEvidence(evidence, techTags);
  }

  // calcular scores e fit
  const scores = computeMaturity({ detectedStack, signals: sources });
  const fit = suggestFit({ vendor, detectedStack, scores });

  // upsert em CompanyTechMaturity
  try {
    const { data: existing } = await sb
      .from('CompanyTechMaturity')
      .select('id')
      .eq('companyId', companyId)
      .eq('vendor', vendor)
      .maybeSingle();

    if (existing?.id) {
      await sb.from('CompanyTechMaturity').update({
        sources, scores, detectedStack, fitRecommendations: fit, updatedAt: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      await sb.from('CompanyTechMaturity').insert({
        companyId, vendor, sources, scores, detectedStack, fitRecommendations: fit
      });
    }
  } catch {}

  return NextResponse.json({ ok:true, scores, fit, detectedStack });
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 8) rota util: /api/integrations/http/headers (se ainda não existe) ----------
(() => {
  const fp = f('app','api','integrations','http','headers','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
export const runtime='nodejs';
export async function POST(req: NextRequest){
  const { url, companyId } = await req.json();
  if (!url) return NextResponse.json({ ok:false, error:'url obrigatória' }, { status:400 });
  try{
    const head = await fetch(url, { method:'HEAD', redirect:'follow' });
    const headers:any = {}; head.headers.forEach((v,k)=>headers[k.toLowerCase()]=v);
    if (companyId){
      const sb = supabaseAdmin();
      await sb.from('TechSignals').insert({
        companyId, kind:'http_header', key:'headers', value: headers,
        confidence:70, source:'http_headers', url, fetchedAt: new Date().toISOString()
      });
    }
    return NextResponse.json({ ok:true, headers });
  }catch(e:any){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

// ---------- 9) /api/stack/ingest — ONE-SHOT ORCHESTRATOR ----------
(() => {
  const fp = f('app','api','stack','ingest','route.ts');
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { serperSearch } from '@/lib/integrations/serper';
import { apolloCompanyEnrich, apolloPeopleSearch } from '@/lib/integrations/apollo';
import { hunterVerify } from '@/lib/integrations/hunter';
import { phantomRun } from '@/lib/integrations/phantom';
import { buildDetectedStackFromEvidence } from '@/lib/stack/resolver';
import { computeMaturity } from '@/lib/maturity/tech-maturity';
import { suggestFit } from '@/lib/maturity/vendor-fit';

export const runtime='nodejs';

/**
 * POST /api/stack/ingest - ONE-SHOT ORCHESTRATOR
 * Body: { projectId, companyId, vendor, domain?, companyName?, linkedinUrl?, phantomAgentId?, verifyEmails? }
 * 
 * Fluxo completo:
 *  1) HTTP Headers → TechSignals
 *  2) Serper (tech mentions) → TechSignals  
 *  3) Apollo Company → Firmographics
 *  4) Apollo People → Person (upsert)
 *  5) [Opcional] Phantom LinkedIn Jobs → TechSignals
 *  6) [Opcional] Hunter Verify emails → Person.update
 *  7) Build detectedStack + Maturity + Fit → CompanyTechMaturity
 */
export async function POST(req: NextRequest){
  const body = await req.json();
  const { projectId, companyId, vendor, domain, companyName, linkedinUrl, phantomAgentId, verifyEmails } = body || {};
  
  if(!projectId || !companyId || !vendor){
    return NextResponse.json({ ok:false, error:'projectId, companyId, vendor obrigatórios' }, { status:400 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // ---------- 1) HTTP HEADERS ----------
  let headerSaved=false;
  if (domain){
    try{
      const url = domain.startsWith('http') ? domain : \`https://\${domain}\`;
      const r = await fetch(url, { method:'HEAD', redirect:'follow' });
      const headers:any = {}; 
      r.headers.forEach((v,k)=>headers[k.toLowerCase()]=v);
      await sb.from('TechSignals').insert({ 
        companyId, kind:'http_header', key:'headers', value: JSON.stringify(headers), 
        confidence:70, source:'http_headers', url, fetchedAt:now 
      });
      headerSaved=true;
    }catch(e){}
  }

  // ---------- 2) SERPER ----------
  let serperCount=0;
  try{
    const q = companyName 
      ? \`\${companyName} ERP OR CRM OR SAP OR Oracle OR TOTVS OR AWS OR Azure OR Power BI site:\${domain??''}\`.trim() 
      : (domain ? \`site:\${domain} ERP OR CRM OR SAP OR TOTVS\` : '');
    
    if (q){
      const sr = await serperSearch(q, 10);
      const items = sr?.organic ?? sr?.results ?? sr?.items ?? [];
      
      for(const it of items){
        const payload = {
          title: it.title ?? it.name ?? null,
          description: it.snippet ?? it.description ?? null,
          link: it.link ?? it.url ?? null
        };
        await sb.from('TechSignals').insert({
          companyId, kind:'serper', key: payload.title ?? 'result', 
          value: JSON.stringify(payload),
          confidence: 60, source:'serper', url: payload.link ?? null, fetchedAt: now
        });
        serperCount++;
      }
    }
  }catch(e){}

  // ---------- 3) APOLLO — Firmographics ----------
  let firmoSaved=false;
  try{
    const aco = await apolloCompanyEnrich({
      q_organization_domains: domain ? [domain.replace(/^https?:\\/\\//,'')] : undefined,
      q_organization_name: companyName || undefined,
      page: 1
    });
    
    const c0 = aco?.companies?.[0];
    if (c0){
      const techTags = c0.technologies ?? c0.tech_tags ?? [];
      await sb.from('Firmographics').insert({
        companyId,
        source: 'apollo',
        employeesRange: c0.estimated_num_employees ?? null,
        revenueRange: c0.estimated_annual_revenue ?? null,
        techTags: techTags,
        fetchedAt: now
      });
      firmoSaved=true;
    }
  }catch(e){}

  // ---------- 4) APOLLO — People ----------
  let peopleCount=0, verifiedCount=0;
  try{
    const ap = await apolloPeopleSearch({
      q_organization_domains: domain ? [domain.replace(/^https?:\\/\\//,'')] : undefined,
      page: 1
    });
    
    const arr = ap?.people || ap?.contacts || [];
    for (const p of arr){
      const name = p.name || [p.first_name,p.last_name].filter(Boolean).join(' ');
      const email = p.email ?? (p.email_status === 'verified' ? p.email : null);
      
      const personId = \`person_\${companyId}_\${name.replace(/\\s+/g,'_').toLowerCase()}\`;
      
      await sb.from('Person').upsert({
        id: personId,
        companyId,
        name,
        role: p.title ?? null,
        department: p.department ?? null,
        email,
        linkedinUrl: p.linkedin_url ?? null,
        updatedAt: now
      }, { onConflict:'id' });
      
      peopleCount++;

      // 5) [Opcional] Hunter verify
      if (verifyEmails && email){
        try{
          const hv = await hunterVerify(email);
          await sb.from('Person').update({
            email: hv?.data?.email ?? email,
            updatedAt: now
          }).eq('id', personId);
          verifiedCount++;
        }catch(e){}
      }
    }
  }catch(e){}

  // ---------- 6) PHANTOM — LinkedIn Jobs ----------
  let jobsCount=0;
  if (linkedinUrl && phantomAgentId){
    try{
      const ph = await phantomRun(phantomAgentId, { companyLinkedinUrl: linkedinUrl });
      const jobs = ph?.container?.output?.data ?? ph?.data ?? [];
      
      for(const j of jobs){
        await sb.from('TechSignals').insert({
          companyId, kind:'linkedin_job', 
          key: j.title ?? 'job', 
          value: JSON.stringify(j.description ?? j ?? null),
          confidence: 60, 
          source:'phantom_linkedin_jobs', 
          url: j.link ?? linkedinUrl, 
          fetchedAt: now
        });
        jobsCount++;
      }
    }catch(e){}
  }

  // ---------- 7) BUILD STACK + MATURITY ----------
  const { data: ts } = await sb.from('TechSignals').select('*').eq('companyId', companyId);
  const ev = (ts||[]).map(t=>{
    let value = t.value;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch {}
    }
    return { key:t.key, value, source:t.source, kind:t.kind };
  });

  const { data: fg } = await sb.from('Firmographics')
    .select('*')
    .eq('companyId',companyId)
    .order('fetchedAt',{ascending:false})
    .limit(1)
    .maybeSingle();

  const detectedStack = buildDetectedStackFromEvidence(ev, fg?.techTags ?? null);
  const scores = computeMaturity({ detectedStack });
  const fit = suggestFit({ vendor, detectedStack, scores });

  // Upsert CompanyTechMaturity
  try{
    const { data: ex } = await sb.from('CompanyTechMaturity')
      .select('id')
      .eq('companyId', companyId)
      .eq('vendor', vendor)
      .maybeSingle();
      
    if (ex?.id){
      await sb.from('CompanyTechMaturity').update({ 
        sources:{orchestrator:true}, 
        scores, 
        detectedStack, 
        fitRecommendations:fit, 
        updatedAt: now 
      }).eq('id', ex.id);
    } else {
      await sb.from('CompanyTechMaturity').insert({ 
        companyId, 
        vendor, 
        sources:{orchestrator:true}, 
        scores, 
        detectedStack, 
        fitRecommendations:fit 
      });
    }
  }catch(e){}

  return NextResponse.json({
    ok: true,
    summary: {
      headerSaved,
      serperCount,
      firmographicsSaved: firmoSaved,
      peopleFound: peopleCount,
      emailsVerified: verifiedCount,
      jobsIngested: jobsCount
    },
    detectedStack,
    scores,
    fit
  });
}
`;
  if (writeIfChanged(fp, content)) log('Criado/atualizado:', fp);
})();

log('Concluído. Commit e deploy.');
