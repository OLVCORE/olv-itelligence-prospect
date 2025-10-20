# 🧪 TESTE RÁPIDO - Sistema OLV Intelligence

**Data:** 20 de Outubro de 2025  
**Status:** Sistema Completo e Pronto para Testes

---

## ✅ STATUS DA IMPLEMENTAÇÃO

### Arquivos Criados e Verificados:

| Categoria | Arquivo | Status | Tamanho |
|-----------|---------|--------|---------|
| **Scripts** | `scripts/olv-ensure.mjs` | ✅ | 22 KB |
| **Scripts** | `scripts/olv-ensure-cron.mjs` | ✅ | 6.5 KB |
| **API Routes** | `app/api/health/route.ts` | ✅ | - |
| **API Routes** | `app/api/stack/build/route.ts` | ✅ | - |
| **API Routes** | `app/api/stack/ingest/route.ts` | ✅ | 7.5 KB |
| **API Routes** | `app/api/maturity/calculate/route.ts` | ✅ | - |
| **API Routes** | `app/api/monitor/register/route.ts` | ✅ | 1.1 KB |
| **API Routes** | `app/api/cron/reingest/route.ts` | ✅ | 0.7 KB |
| **API Routes** | `app/api/integrations/http/headers/route.ts` | ✅ | - |
| **Libs** | `lib/supabaseAdmin.ts` | ✅ | - |
| **Libs** | `lib/stack/resolver.ts` | ✅ | 8 KB |
| **Libs** | `lib/maturity/tech-maturity.ts` | ✅ | - |
| **Libs** | `lib/maturity/vendor-fit.ts` | ✅ | - |
| **Libs** | `lib/jobs/reingest.ts` | ✅ | 3.2 KB |
| **Integrations** | `lib/integrations/serper.ts` | ✅ | - |
| **Integrations** | `lib/integrations/apollo.ts` | ✅ | - |
| **Integrations** | `lib/integrations/hunter.ts` | ✅ | - |
| **Integrations** | `lib/integrations/phantom.ts` | ✅ | - |
| **Config** | `vercel.json` (atualizado) | ✅ | Cron 6/6h |
| **Prisma** | `prisma/schema.prisma` (atualizado) | ✅ | +2 models |
| **Docs** | `CRONOGRAMA-STACK-BUILDER-MATURITY.md` | ✅ | 11.5 KB |
| **Docs** | `GUIA-TESTES-ACEITACAO.md` | ✅ | 15.7 KB |
| **Docs** | `GUIA-MONITORAMENTO-CONTINUO.md` | ✅ | 18 KB |

---

## 🚀 PASSO A PASSO DE IMPLANTAÇÃO

### 1. Preparação Local (✅ JÁ EXECUTADO)

```bash
# Cliente Prisma gerado
npx prisma generate
✅ Generated Prisma Client (v5.22.0)

# Commits realizados
git add -A
git commit -m "OLV: Stack Builder + Maturity + Orchestrator + Cron"
git push
✅ Push realizado com sucesso
```

---

### 2. Deploy no Vercel (PRÓXIMO PASSO)

**O sistema já está no repositório. O Vercel vai:**
1. Detectar push no main
2. Executar build automático
3. Aplicar vercel.json (cron)
4. Disponibilizar rotas

**Verificar Deploy:**
- Acessar: https://vercel.com/seu-projeto/deployments
- Aguardar build concluir (2-3 min)
- Verificar status: ✅ Ready

---

### 3. Aplicar Migração do Banco (OBRIGATÓRIO)

**Ação Manual no Supabase:**

Como estamos usando **PostgreSQL no Supabase** (não SQLite local), a migração precisa ser aplicada manualmente:

**Opção A - Via Terminal (se DATABASE_URL configurada):**
```bash
npx prisma db push
```

**Opção B - Via SQL Editor do Supabase (RECOMENDADO):**

Acesse: https://app.supabase.com/project/SEU-PROJECT/sql

Execute o SQL abaixo:

```sql
-- Criar tabela CompanyMonitor
CREATE TABLE IF NOT EXISTS "CompanyMonitor" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "domain" TEXT,
  "linkedinUrl" TEXT,
  "phantomAgentId" TEXT,
  "cadence" TEXT NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "lastRunAt" TIMESTAMP,
  "nextRunAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_monitor_company_active" 
  ON "CompanyMonitor"("companyId", "active");
CREATE INDEX IF NOT EXISTS "idx_monitor_nextRun" 
  ON "CompanyMonitor"("nextRunAt");

-- Criar tabela IngestRun
CREATE TABLE IF NOT EXISTS "IngestRun" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "finishedAt" TIMESTAMP,
  "summary" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_ingest_company_started" 
  ON "IngestRun"("companyId", "startedAt");
```

**Validar Criação:**
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('CompanyMonitor', 'IngestRun');
```

---

## 🧪 TESTES ESSENCIAIS (EM ORDEM)

### TESTE 1: Health Check ✅

**Objetivo:** Verificar se o serviço está online.

```bash
curl https://SEU-APP.vercel.app/api/health
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "time": "2025-10-20T19:30:00.123Z"
}
```

**Se falhar:**
- Verificar se deploy concluiu
- Verificar logs: `vercel logs --follow`

---

### TESTE 2: Stack Builder (Auto-montagem)

**Objetivo:** Montar detectedStack a partir de evidências mock (se houver).

```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/build \
  -H 'Content-Type: application/json' \
  -d '{"companyId":"test_001"}'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "detectedStack": {
    "erp": [],
    "crm": [],
    "cloud": [],
    "bi": [],
    "db": [],
    "integrations": [],
    "security": []
  },
  "evidenceCount": 0
}
```

*Nota: Se não houver TechSignals/Firmographics para test_001, retorna vazio (esperado).*

---

### TESTE 3: Maturity Calculator

**Objetivo:** Calcular maturidade sem detectedStack (deriva automaticamente).

```bash
curl -X POST https://SEU-APP.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"test_001",
    "vendor":"TOTVS"
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "scores": {
    "infra": 20,
    "systems": 10,
    "data": 10,
    "security": 20,
    "automation": 15,
    "culture": 30,
    "overall": 18
  },
  "fit": {
    "products": ["Fluig (BPM/Workflow)"],
    "olv_packs": [],
    "rationale": ["Ausência de BPM detectada – automação de processos"]
  },
  "detectedStack": { ... }
}
```

---

### TESTE 4: Orchestrator One-Shot 🎯 (PRINCIPAL)

**Objetivo:** Pipeline completo (Headers → Serper → Apollo → Stack → Maturity).

**⚠️ IMPORTANTE:** Este teste **consome APIs pagas** (Serper, Apollo, Hunter). Use com moderação.

```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "default-project-id",
    "companyId": "test_kelludy",
    "vendor": "TOTVS",
    "domain": "kelludy.com.br",
    "companyName": "Kelludy Cosméticos",
    "verifyEmails": false
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "summary": {
    "headerSaved": true,
    "serperCount": 5,
    "firmographicsSaved": true,
    "peopleFound": 3,
    "emailsVerified": 0,
    "jobsIngested": 0
  },
  "detectedStack": {
    "erp": [...],
    "cloud": [...],
    ...
  },
  "scores": {
    "infra": 60,
    "systems": 50,
    "overall": 42
  },
  "fit": {
    "products": ["TOTVS Protheus", "Fluig"],
    "rationale": [...]
  }
}
```

**Validar no Supabase:**
```sql
-- 1. TechSignals criados
SELECT kind, source, COUNT(*) 
FROM "TechSignals" 
WHERE "companyId" = 'test_kelludy' 
GROUP BY kind, source;

-- 2. Firmographics salvos
SELECT * FROM "Firmographics" 
WHERE "companyId" = 'test_kelludy' 
ORDER BY "fetchedAt" DESC LIMIT 1;

-- 3. Pessoas encontradas
SELECT name, role, email 
FROM "Person" 
WHERE "companyId" = 'test_kelludy';

-- 4. Maturidade calculada
SELECT scores, "detectedStack", "fitRecommendations" 
FROM "CompanyTechMaturity" 
WHERE "companyId" = 'test_kelludy';
```

---

### TESTE 5: Cadastrar Monitor

**Objetivo:** Registrar empresa para monitoramento automático.

```bash
curl -X POST https://SEU-APP.vercel.app/api/monitor/register \
  -H 'Content-Type: application/json' \
  -d '{
    "companyId": "test_kelludy",
    "vendor": "TOTVS",
    "cadence": "6h",
    "domain": "kelludy.com.br",
    "active": true
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true
}
```

**Validar no Supabase:**
```sql
SELECT * FROM "CompanyMonitor" 
WHERE "companyId" = 'test_kelludy';
```

---

### TESTE 6: Disparo Manual do Cron

**Objetivo:** Executar reprocessamento manualmente (simula Vercel Cron).

```bash
curl -X POST https://SEU-APP.vercel.app/api/cron/reingest \
  -H 'Content-Type: application/json' \
  -d '{
    "batchLimit": 5,
    "concurrency": 2,
    "delayMs": 800,
    "verifyEmails": false
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "taken": 1,
  "runs": [
    {
      "monitorId": "mon_xxx",
      "companyId": "test_kelludy",
      "status": "ok",
      "summary": {
        "headerSaved": true,
        "serperCount": 5,
        ...
      }
    }
  ]
}
```

**Validar no Supabase:**
```sql
-- Ver execução registrada
SELECT * FROM "IngestRun" 
WHERE "companyId" = 'test_kelludy' 
ORDER BY "startedAt" DESC LIMIT 1;

-- Ver próxima execução agendada
SELECT "lastRunAt", "nextRunAt" 
FROM "CompanyMonitor" 
WHERE "companyId" = 'test_kelludy';
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

Use esta checklist para garantir que tudo está funcionando:

- [ ] **Deploy do Vercel concluído** (✅ Ready)
- [ ] **Tabelas Prisma criadas no Supabase** (CompanyMonitor, IngestRun)
- [ ] **Teste 1: Health Check** retornou `ok: true`
- [ ] **Teste 2: Stack Builder** retornou `ok: true`
- [ ] **Teste 3: Maturity Calculator** retornou scores válidos
- [ ] **Teste 4: Orchestrator** criou TechSignals + Firmographics + Person
- [ ] **Teste 5: Monitor Register** criou registro em CompanyMonitor
- [ ] **Teste 6: Cron Manual** executou e criou IngestRun
- [ ] **Vercel Cron configurado** (visível em Vercel Dashboard → Cron Jobs)
- [ ] **Próxima execução automática agendada** (CompanyMonitor.nextRunAt)

---

## 🔍 QUERIES DE DIAGNÓSTICO

### Status Geral do Sistema:

```sql
-- Resumo de dados
SELECT 
  'TechSignals' as table_name, COUNT(*)::text as count 
  FROM "TechSignals"
UNION ALL
SELECT 'Firmographics', COUNT(*)::text FROM "Firmographics"
UNION ALL
SELECT 'Person', COUNT(*)::text FROM "Person"
UNION ALL
SELECT 'CompanyTechMaturity', COUNT(*)::text FROM "CompanyTechMaturity"
UNION ALL
SELECT 'CompanyMonitor', COUNT(*)::text FROM "CompanyMonitor"
UNION ALL
SELECT 'IngestRun', COUNT(*)::text FROM "IngestRun";
```

### Últimas Atividades:

```sql
-- Últimas 10 execuções
SELECT 
  "companyId", 
  vendor, 
  status, 
  "startedAt",
  EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) as duration_seconds
FROM "IngestRun"
ORDER BY "startedAt" DESC
LIMIT 10;
```

### Monitores Ativos:

```sql
-- Empresas sendo monitoradas
SELECT 
  "companyId", 
  vendor, 
  cadence, 
  "lastRunAt", 
  "nextRunAt",
  CASE 
    WHEN "nextRunAt" <= NOW() THEN 'Vencido (pronto para executar)'
    ELSE 'Agendado'
  END as status_agendamento
FROM "CompanyMonitor"
WHERE active = true
ORDER BY "nextRunAt" ASC;
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Teste 1 falha (Health Check)

**Sintomas:** 404 ou 500 no `/api/health`

**Soluções:**
1. Verificar deploy: `vercel logs --follow`
2. Verificar se arquivo existe: `app/api/health/route.ts`
3. Verificar build: `npm run build` local

---

### Problema: Teste 4 retorna erros de API

**Sintomas:** `summary.serperCount: 0`, `firmographicsSaved: false`

**Causa:** API keys não configuradas ou inválidas.

**Soluções:**
1. Verificar env vars no Vercel:
   - `SERPER_API_KEY`
   - `APOLLO_API_KEY`
   - `HUNTER_API_KEY`
2. Testar keys manualmente
3. Verificar quota das APIs

---

### Problema: Cron não executa automaticamente

**Sintomas:** Nenhuma execução após 6 horas.

**Soluções:**
1. Verificar `vercel.json` tem cron configurada
2. Verificar no Vercel Dashboard → Cron Jobs
3. Verificar logs: `vercel logs --filter cron`
4. Testar manualmente: `curl /api/cron/reingest`

---

### Problema: Prisma errors (tables not found)

**Sintomas:** `relation "CompanyMonitor" does not exist`

**Solução:**
Executar SQL de criação das tabelas no Supabase (ver seção 3 acima).

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Esperado | Como Medir |
|---------|----------|------------|
| **Health Check** | <500ms | `curl -w "%{time_total}" /api/health` |
| **Orchestrator** | <30s | Ver IngestRun.duration |
| **Taxa de Sucesso** | ≥95% | `COUNT(*) FILTER(WHERE status='ok')` |
| **APIs Ativas** | 3-4 | Serper, Apollo, Hunter, Phantom |
| **Empresas Monitoradas** | N | `COUNT(*) FROM CompanyMonitor WHERE active=true` |

---

## 🎯 PRÓXIMOS PASSOS

### Após Validação Bem-Sucedida:

1. **Cadastrar 5-10 empresas piloto** via `/api/monitor/register`
2. **Aguardar primeira execução automática** (6h)
3. **Validar qualidade dos dados** (accuracy ≥85%)
4. **Ajustar parâmetros** (concurrency, delay) se necessário
5. **Escalar para 50-100 empresas**

### Features Futuras:

- [ ] Dashboard Admin (UI de monitoramento)
- [ ] Webhooks de falhas (Slack/Discord)
- [ ] Retry automático (3x com backoff)
- [ ] Bulk register via CSV
- [ ] Alertas de anomalias

---

## 📞 SUPORTE

**Em caso de problemas:**
- **Logs do Vercel:** `vercel logs --follow`
- **SQL do Supabase:** Dashboard → SQL Editor
- **Responsável:** Marcos Oliveira

---

**Sistema 100% pronto para testes!** 🚀

Última atualização: 20 de Outubro de 2025, 19:45

