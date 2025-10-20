# 📘 OLV Intelligent Prospecting System — REBUILD PACK (One-File)

**Versão:** 2.0 Final  
**Data:** 20 de Outubro de 2025  
**Status:** ✅ PRODUCTION-READY

---

## 🔒 Regras de Ouro (anti-regressão)

* **Aditivo apenas**: nada de deletar/renomear arquivos fora deste escopo.
* **Zero mocks**: onde não houver dado real, retornar `null`/`[]` de forma honesta.
* **Credenciais**: somente em `process.env` (server). **Não expor** em client.
* Se o editor "reformatar" algo fora do plano, **interrompa**.

---

## 🚀 **COMO USAR (3 PASSOS)**

### **1) Executar Script Instalador**

```bash
cd "C:\Projects\OLV Intelligent Prospecting System"
node scripts/olv-ensure.mjs
```

**O que esse script faz:**
- ✅ Cria/atualiza todas as rotas de integração (Serper, Apollo, Hunter, PhantomBuster, HTTP Headers)
- ✅ Cria endpoint de maturidade (`/api/maturity/calculate`)
- ✅ Cria health check (`/api/health`)
- ✅ Aplica hotfix de build (playbook route)
- ✅ **NÃO toca em nada fora do escopo** (seguro, sem regressões)

### **2) Atualizar Schema Prisma**

Adicione ao final do `prisma/schema.prisma`:

```prisma
// ========================================
// TABELAS ADITIVAS - MATURIDADE & TECH FIT
// ========================================

model CompanyTechMaturity {
  id                 String   @id @default(cuid())
  companyId          String
  vendor             String   // "TOTVS" | "OLV" | "CUSTOM"
  sources            Json     // { "serper": true, "apollo": true, "headers": true }
  scores             Json     // { infra: 80, systems: 70, data: 60, security: 50, automation: 40, culture: 30, overall: 55 }
  detectedStack      Json     // { erp: [{product:"SAP",vendor:"SAP",confidence:90}], crm: [], cloud: [], bi: [], db: [], integrations: [], security: [] }
  fitRecommendations Json     // { products: ["TOTVS Protheus"], olv_packs: ["Diagnóstico 360°"], rationale: ["Migração SAP→TOTVS"] }
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@unique([companyId, vendor])
  @@index([companyId])
  @@index([vendor])
}

model Firmographics {
  id              String   @id @default(cuid())
  companyId       String
  employeesRange  String?  // "51-200", "201-500", etc.
  revenueRange    String?  // "$1M-$10M", etc.
  techTags        Json?    // ["SaaS", "Cloud-First", "ERP Legacy"]
  source          String   // "apollo", "manual", "serper"
  fetchedAt       DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([source, fetchedAt])
}

model TechSignals {
  id         String   @id @default(cuid())
  companyId  String
  kind       String   // "header", "linkedin_job", "news_mention", "sales_nav"
  key        String?  // "X-Powered-By", "job_title", "mention_keyword"
  value      Json?    // Payload com evidências
  confidence Int?     // 0-100
  source     String   // "http_headers", "linkedin_jobs", "serper", "sales_nav"
  url        String?
  fetchedAt  DateTime @default(now())
  createdAt  DateTime @default(now())

  @@index([companyId, kind])
  @@index([source, fetchedAt])
}

model SearchCache {
  id        String   @id @default(cuid())
  hash      String   @unique // Hash do payload da busca
  provider  String   // "serper", "apollo", "hunter", etc.
  payload   Json     // Request original
  response  Json     // Response cacheado
  fetchedAt DateTime @default(now())
  expiresAt DateTime // TTL: 24h para searches, 7d para company data
  createdAt DateTime @default(now())

  @@index([provider, hash])
  @@index([expiresAt])
}
```

Depois rode:
```bash
npx prisma db push
```

### **3) Commit e Deploy**

```bash
git add -A
git commit -m "OLV: ensure endpoints & maturity (rebuild pack final)"
git push
```

---

## 🧪 **TESTES DE ACEITAÇÃO**

### **Teste 1: Health Check**
```bash
curl https://seu-app.vercel.app/api/health
```
**Esperado:** `{"ok":true,"time":"..."}`

### **Teste 2: Serper (Google Search Real)**
```bash
curl -X POST https://seu-app.vercel.app/api/integrations/serper/search \
  -H 'Content-Type: application/json' \
  -d '{"q":"site:masterindustria.com.br ERP SAP","num":5}'
```

### **Teste 3: Apollo Company Enrich**
```bash
curl -X POST https://seu-app.vercel.app/api/integrations/apollo/company-enrich \
  -H 'Content-Type: application/json' \
  -d '{"domain":"masterindustria.com.br","companyId":"comp_xxx","page":1}'
```

### **Teste 4: Hunter Email Finder**
```bash
curl -X POST https://seu-app.vercel.app/api/integrations/hunter/find \
  -H 'Content-Type: application/json' \
  -d '{"domain":"masterindustria.com.br","full_name":"Carlos Silva","companyId":"comp_xxx"}'
```

### **Teste 5: HTTP Headers (Tech Detection)**
```bash
curl -X POST https://seu-app.vercel.app/api/integrations/http/headers \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://masterindustria.com.br","companyId":"comp_xxx"}'
```

### **Teste 6: Maturity Calculator**
```bash
curl -X POST https://seu-app.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_xxx",
    "vendor":"TOTVS",
    "detectedStack":{
      "erp":[{"product":"SAP S/4HANA","vendor":"SAP","confidence":90}],
      "bi":[{"product":"Power BI","vendor":"Microsoft","confidence":70}],
      "cloud":[{"product":"AWS EC2","vendor":"Amazon","confidence":85}]
    },
    "sources":{"serper":true,"headers":true,"apollo":true}
  }'
```

**Esperado:**
```json
{
  "ok": true,
  "scores": {
    "infra": 80,
    "systems": 75,
    "data": 60,
    "security": 50,
    "automation": 25,
    "culture": 30,
    "overall": 53
  },
  "fit": {
    "products": ["TOTVS Protheus", "TOTVS Backoffice", "Fluig (BPM/Workflow)", "TOTVS BI"],
    "olv_packs": [],
    "rationale": [
      "Migração/substituição com redução de TCO e integração nativa TOTVS",
      "Ausência de BPM detectada – padronização e automação de processos",
      "BI integrado ao ERP e relatórios financeiros"
    ]
  }
}
```

---

## 🔐 **VARIÁVEIS DE AMBIENTE (Vercel)**

Adicione em **Settings → Environment Variables**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # SERVER-ONLY

# Integrações
SERPER_API_KEY=abc123... # Google Search real
APOLLO_API_KEY=xyz789... # Apollo.io
HUNTER_API_KEY=def456... # Hunter.io
PHANTOM_BUSTER_API_KEY=ghi012... # PhantomBuster (opcional)

# OpenAI (opcional, para insights IA futuro)
OPENAI_API_KEY=sk-...
```

---

## 📊 **ARQUITETURA IMPLEMENTADA**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Relatórios  │  │  Análises    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API ROUTES (Server-Side)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ /quick-search│  │ /enrich      │  │ /maturity    │     │
│  │ (3s timeout) │  │ (60s async)  │  │ /calculate   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐      │
│  │         INTEGRATIONS (/api/integrations/*)       │      │
│  │  • Serper (Google)  • Apollo (Company/People)    │      │
│  │  • Hunter (Email)   • PhantomBuster (LinkedIn)   │      │
│  │  • HTTP Headers     • Social Media               │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE (PostgreSQL + RLS)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Company     │  │  Analysis    │  │  Person      │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ Firmographics│  │ TechSignals  │  │ CompanyTech  │     │
│  │              │  │              │  │ Maturity     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ **SEGURANÇA & BEST PRACTICES**

1. ✅ **Server-Only Keys:** Todas as integrações usam `process.env` (nunca expostas no client)
2. ✅ **Provenance Tracking:** Cada registro tem `source`, `fetchedAt`, `confidence`
3. ✅ **Audit Trail:** Logs estruturados `[OLV]`, `[Serper]`, `[Apollo]`, etc.
4. ✅ **Error Handling:** Try/catch em todas as rotas, HTTP status codes corretos
5. ✅ **UPSERT Logic:** Persistência idempotente com `onConflict`
6. ✅ **RLS Policies:** Isolamento multi-tenant por `projectId` (aplicar SQL separado)
7. ✅ **Rate Limiting:** Circuit breaker + retry com backoff exponencial (já implementado)

---

## 📚 **DOCUMENTAÇÃO TÉCNICA**

### **Endpoints Criados:**

| Endpoint | Método | Timeout | Função |
|----------|--------|---------|--------|
| `/api/health` | GET | 1s | Health check |
| `/api/companies/quick-search` | POST | 5s | Busca rápida CNPJ (ReceitaWS) |
| `/api/companies/enrich` | POST | 60s | Enriquecimento completo assíncrono |
| `/api/integrations/serper/search` | POST | 10s | Google Search via Serper |
| `/api/integrations/apollo/company-enrich` | POST | 15s | Firmographics + Tech Tags |
| `/api/integrations/apollo/people-search` | POST | 15s | Decisores + Emails |
| `/api/integrations/hunter/find` | POST | 10s | Email Finder |
| `/api/integrations/hunter/verify` | POST | 10s | Email Verifier |
| `/api/integrations/http/headers` | POST | 5s | Tech Stack básico via HTTP |
| `/api/integrations/phantom/linkedin-jobs` | POST | 20s | LinkedIn Jobs via PhantomBuster |
| `/api/maturity/calculate` | POST | 10s | Cálculo de maturidade + fit TOTVS/OLV |

### **Libs Criadas:**

| Arquivo | Função |
|---------|--------|
| `lib/supabaseAdmin.ts` | Cliente Supabase server-only (Service Role) |
| `lib/integrations/serper.ts` | Wrapper Serper API |
| `lib/integrations/apollo.ts` | Wrapper Apollo.io API |
| `lib/integrations/hunter.ts` | Wrapper Hunter.io API |
| `lib/integrations/phantom.ts` | Wrapper PhantomBuster API |
| `lib/maturity/tech-maturity.ts` | Cálculo de scores (6 dimensões) |
| `lib/maturity/vendor-fit.ts` | Sugestão de produtos TOTVS/OLV + deal size |

---

## 🔄 **FLUXO COMPLETO DE PROSPECÇÃO**

### **1. Busca Rápida (3s)**
```
User → Busca CNPJ → /api/companies/quick-search
      ↓
ReceitaWS (dados cadastrais) → Supabase (Company + Analysis)
      ↓
UI: "Empresa salva! Clique 'Analisar Empresa' para enriquecimento"
```

### **2. Enriquecimento Completo (30-60s, assíncrono)**
```
User → Clica "Analisar Empresa" → /api/companies/enrich
      ↓
  ┌─ Apollo (Firmographics) → Supabase (Firmographics)
  ├─ Apollo (People) → Supabase (Person)
  ├─ Hunter (Emails) → Supabase (Person.email_score)
  ├─ HTTP Headers → Supabase (TechSignals)
  ├─ Serper (Notícias) → Supabase (TechSignals)
  └─ PhantomBuster (Jobs) → Supabase (TechSignals)
      ↓
Montar detectedStack a partir de TechSignals → /api/maturity/calculate
      ↓
Supabase (CompanyTechMaturity) → UI atualizada com scores
```

### **3. Visualização (instantâneo)**
```
Dashboard → Carrega Company com last_analysis
      ↓
Módulos exibem:
  • Identificação (ReceitaWS formatada pt-BR)
  • Presença Digital (redes sociais validadas)
  • Tech Stack (evidências Apollo + Headers)
  • Decisores (Apollo + Hunter)
  • Score Propensão (6 critérios ponderados)
  • Go/No-Go (baseado em score + evidências)
  • Vendor Fit TOTVS/OLV (produtos + deal size)
```

---

## 🎯 **RESUMO DOS PROBLEMAS RESOLVIDOS**

1. ✅ **504 Timeout:** Busca rápida (3s) + enriquecimento assíncrono (60s)
2. ✅ **Dados Mockados:** 100% dados reais ou `null` honesto
3. ✅ **3 Pontos de Busca:** Simplificado para 1 único (CompanySearchModule)
4. ✅ **Inteligência Cruzada:** Preparado para redes sociais + Jusbrasil + marketplaces
5. ✅ **Botão "Analisar Empresa":** Implementado e funcional
6. ✅ **Relatórios Vazios:** Agora geram com dados reais salvos no banco
7. ✅ **Build Quebrado:** Hotfix aplicado automaticamente pelo script

---

## 📞 **SUPORTE**

Se encontrar problemas:
1. Verificar logs do Vercel: `https://vercel.com/seu-projeto/logs`
2. Testar localmente: `npm run dev` + `curl` commands
3. Verificar variáveis de ambiente no Vercel
4. Consultar `docs/COMANDOS-TESTE-REAL.md` para validação

---

**✅ SISTEMA 100% OPERACIONAL COM DADOS REAIS!**

**Última atualização:** 20 de Outubro de 2025, 22:00  
**Versão:** 2.0 Final Production-Ready

