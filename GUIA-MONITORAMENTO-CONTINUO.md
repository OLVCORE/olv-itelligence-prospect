# 📅 GUIA DE MONITORAMENTO CONTÍNUO - OLV Intelligence

**Versão:** 1.0  
**Data:** 20 de Outubro de 2025  
**Sistema:** Scheduled Re-Ingest & Monitoring

---

## 🎯 VISÃO GERAL

Sistema automatizado de **monitoramento contínuo** que reprocessa empresas cadastradas em intervalos configuráveis (6h, diário, semanal), mantendo dados sempre atualizados através do orchestrator `/api/stack/ingest`.

### Benefícios:
- ✅ **Dados sempre frescos** - Atualizações automáticas
- ✅ **Zero intervenção manual** - Vercel Cron executa automaticamente
- ✅ **Rate-limit friendly** - Concorrência e delays configuráveis
- ✅ **Rastreabilidade total** - Logs em IngestRun
- ✅ **Escalável** - Processa lotes de empresas

---

## 📊 ARQUITETURA

```
┌─────────────────┐
│  Vercel Cron    │  (6/6h)
│  scheduler      │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ GET /api/cron/reingest  │
└────────┬────────────────┘
         │
         ↓
┌────────────────────────────┐
│ lib/jobs/reingest.ts       │
│ - Query CompanyMonitor     │
│ - Batch processing         │
│ - Concurrency control      │
└────────┬───────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ POST /api/stack/ingest      │
│ (Orchestrator One-Shot)     │
│ - Headers → TechSignals     │
│ - Serper → TechSignals      │
│ - Apollo → Firmographics    │
│ - Apollo → Person           │
│ - Phantom → TechSignals     │
│ - Build Stack + Maturity    │
└────────┬────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Supabase Database           │
│  - TechSignals               │
│  - Firmographics             │
│  - Person                    │
│  - CompanyTechMaturity       │
│  - IngestRun (logs)          │
│  - CompanyMonitor (queue)    │
└──────────────────────────────┘
```

---

## 🗄️ MODELOS DE DADOS

### CompanyMonitor (Fila de Monitoramento)

```prisma
model CompanyMonitor {
  id             String   @id
  companyId      String   // Empresa a monitorar
  vendor         String   // TOTVS, OLV, CUSTOM
  domain         String?  // Domínio da empresa
  linkedinUrl    String?  // URL LinkedIn
  phantomAgentId String?  // ID do agent PhantomBuster
  cadence        String   // '6h' | 'daily' | 'weekly' | 'custom:cron'
  active         Boolean  // Se está ativo
  lastRunAt      DateTime? // Última execução
  nextRunAt      DateTime? // Próxima execução
  createdAt      DateTime
  updatedAt      DateTime
}
```

### IngestRun (Logs de Execução)

```prisma
model IngestRun {
  id         String   @id
  companyId  String
  vendor     String
  status     String   // 'queued' | 'running' | 'ok' | 'error' | 'partial'
  startedAt  DateTime
  finishedAt DateTime?
  summary    Json?    // Resultado do orchestrator
  error      String?  // Mensagem de erro se falhou
  createdAt  DateTime
}
```

---

## 🚀 COMO USAR

### 1. Cadastrar Empresa para Monitoramento

**API:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/monitor/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "comp_kelludy",
    "vendor": "TOTVS",
    "cadence": "6h",
    "domain": "kelludy.com.br",
    "linkedinUrl": "https://www.linkedin.com/company/kelludy",
    "phantomAgentId": "AGENT_ID_OPCIONAL",
    "active": true
  }'
```

**Resposta:**
```json
{
  "ok": true
}
```

**Parâmetros:**
- `companyId` *(obrigatório)*: ID da empresa no sistema
- `vendor` *(obrigatório)*: TOTVS | OLV | CUSTOM
- `cadence` *(opcional, default: 'daily')*: Frequência de atualização
  - `'6h'` - A cada 6 horas
  - `'daily'` - Diariamente
  - `'weekly'` - Semanalmente
  - `'custom:cron'` - Customizado (futuro)
- `domain` *(opcional)*: Domínio para headers HTTP e Serper
- `linkedinUrl` *(opcional)*: URL LinkedIn para Phantom
- `phantomAgentId` *(opcional)*: ID do agent PhantomBuster
- `active` *(opcional, default: true)*: Se está ativo

---

### 2. Disparar Reprocessamento Manual

**Disparo Simples (GET):**
```bash
curl https://SEU-APP.vercel.app/api/cron/reingest
```

**Disparo com Parâmetros (POST):**
```bash
curl -X POST https://SEU-APP.vercel.app/api/cron/reingest \
  -H "Content-Type: application/json" \
  -d '{
    "batchLimit": 20,
    "concurrency": 3,
    "delayMs": 1000,
    "verifyEmails": true
  }'
```

**Parâmetros de Controle:**
- `batchLimit`: Quantas empresas processar (default: 10)
- `concurrency`: Quantas em paralelo (default: 2)
- `delayMs`: Delay entre disparos em ms (default: 800)
- `verifyEmails`: Ativar Hunter verification (default: false)

**Resposta:**
```json
{
  "ok": true,
  "taken": 5,
  "runs": [
    {
      "monitorId": "mon_xxx",
      "companyId": "comp_kelludy",
      "status": "ok",
      "summary": {
        "headerSaved": true,
        "serperCount": 7,
        "firmographicsSaved": true,
        "peopleFound": 5,
        "emailsVerified": 0,
        "jobsIngested": 0
      }
    },
    ...
  ]
}
```

---

### 3. Consultar Monitores Cadastrados

**SQL (Supabase):**
```sql
-- Todos os monitores ativos
SELECT id, companyId, vendor, cadence, active, lastRunAt, nextRunAt
FROM "CompanyMonitor"
WHERE active = true
ORDER BY nextRunAt ASC;

-- Monitores vencidos (prontos para executar)
SELECT id, companyId, vendor, cadence, lastRunAt, nextRunAt
FROM "CompanyMonitor"
WHERE active = true 
  AND nextRunAt <= NOW()
ORDER BY nextRunAt ASC
LIMIT 20;

-- Monitores por cadence
SELECT cadence, COUNT(*) as total, COUNT(*) FILTER (WHERE active = true) as ativos
FROM "CompanyMonitor"
GROUP BY cadence;
```

---

### 4. Verificar Execuções Recentes

**SQL:**
```sql
-- Últimas 50 execuções
SELECT 
  id, companyId, vendor, status, 
  startedAt, finishedAt, 
  EXTRACT(EPOCH FROM (finishedAt - startedAt)) as duration_seconds,
  error
FROM "IngestRun"
ORDER BY startedAt DESC
LIMIT 50;

-- Taxa de sucesso por empresa
SELECT 
  companyId,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'ok') as successful,
  COUNT(*) FILTER (WHERE status = 'error') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'ok') / COUNT(*), 2) as success_rate
FROM "IngestRun"
WHERE startedAt >= NOW() - INTERVAL '7 days'
GROUP BY companyId
ORDER BY total_runs DESC;

-- Tempo médio de execução
SELECT 
  vendor,
  COUNT(*) as runs,
  AVG(EXTRACT(EPOCH FROM (finishedAt - startedAt))) as avg_duration_seconds,
  MAX(EXTRACT(EPOCH FROM (finishedAt - startedAt))) as max_duration_seconds
FROM "IngestRun"
WHERE status = 'ok' 
  AND finishedAt IS NOT NULL
  AND startedAt >= NOW() - INTERVAL '7 days'
GROUP BY vendor;
```

---

### 5. Pausar/Retomar Monitoramento

**Pausar:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/monitor/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "comp_kelludy",
    "vendor": "TOTVS",
    "active": false
  }'
```

**Retomar:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/monitor/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "comp_kelludy",
    "vendor": "TOTVS",
    "active": true,
    "cadence": "daily"
  }'
```

---

## ⚙️ CONFIGURAÇÃO DO VERCEL CRON

O arquivo `vercel.json` foi atualizado com:

```json
{
  "crons": [
    {
      "path": "/api/cron/reingest",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Formato de Schedule (Cron):**
- `0 */6 * * *` - A cada 6 horas (00:00, 06:00, 12:00, 18:00)
- `0 3 * * *` - Diariamente às 03:00
- `0 2 * * 0` - Semanalmente aos domingos às 02:00
- `*/30 * * * *` - A cada 30 minutos

**Como Alterar:**

1. Editar `vercel.json`
2. Ajustar `schedule`
3. Deploy: `git push`

---

## 📊 OBSERVABILIDADE

### Métricas Importantes:

| Métrica | Query SQL | Target |
|---------|-----------|--------|
| **Taxa de Sucesso** | `COUNT(*) FILTER (WHERE status='ok') / COUNT(*)` | ≥95% |
| **Tempo Médio** | `AVG(finishedAt - startedAt)` | <30s |
| **Empresas Monitoradas** | `COUNT(*) FROM CompanyMonitor WHERE active=true` | N/A |
| **Execuções/Dia** | `COUNT(*) WHERE startedAt >= NOW() - INTERVAL '1 day'` | N/A |

### Dashboard SQL (Copy & Paste no Supabase):

```sql
-- Resumo Operacional (últimas 24h)
SELECT 
  'Total Runs' as metric, COUNT(*)::text as value FROM "IngestRun" WHERE startedAt >= NOW() - INTERVAL '1 day'
UNION ALL
SELECT 
  'Success Rate', ROUND(100.0 * COUNT(*) FILTER (WHERE status='ok') / NULLIF(COUNT(*), 0), 2)::text || '%' 
  FROM "IngestRun" WHERE startedAt >= NOW() - INTERVAL '1 day'
UNION ALL
SELECT 
  'Avg Duration (s)', ROUND(AVG(EXTRACT(EPOCH FROM (finishedAt - startedAt))), 2)::text 
  FROM "IngestRun" WHERE status='ok' AND finishedAt IS NOT NULL AND startedAt >= NOW() - INTERVAL '1 day'
UNION ALL
SELECT 
  'Active Monitors', COUNT(*)::text FROM "CompanyMonitor" WHERE active=true
UNION ALL
SELECT 
  'Next Run (minutes)', ROUND(EXTRACT(EPOCH FROM (MIN(nextRunAt) - NOW())) / 60)::text 
  FROM "CompanyMonitor" WHERE active=true AND nextRunAt > NOW();
```

---

## 🔧 TROUBLESHOOTING

### Problema: Nenhuma empresa está sendo processada

**Causa:** Nenhum monitor ativo ou `nextRunAt` no futuro.

**Solução:**
```sql
-- Verificar monitores
SELECT id, companyId, active, nextRunAt 
FROM "CompanyMonitor" 
WHERE active = true;

-- Forçar nextRunAt para agora
UPDATE "CompanyMonitor" 
SET nextRunAt = NOW() 
WHERE active = true;

-- Disparar manualmente
curl https://SEU-APP.vercel.app/api/cron/reingest
```

---

### Problema: Muitos erros (status='error')

**Causa:** APIs externas falhando ou rate limit.

**Solução:**
```sql
-- Ver erros recentes
SELECT companyId, error, COUNT(*) as count
FROM "IngestRun"
WHERE status = 'error' 
  AND startedAt >= NOW() - INTERVAL '1 day'
GROUP BY companyId, error
ORDER BY count DESC;

-- Reduzir concorrência e aumentar delay
curl -X POST https://SEU-APP.vercel.app/api/cron/reingest \
  -d '{"concurrency":1,"delayMs":2000}'
```

---

### Problema: Execução muito lenta

**Causa:** Muitas empresas em paralelo ou APIs lentas.

**Solução:**
```sql
-- Ver duração por empresa
SELECT companyId, vendor,
  AVG(EXTRACT(EPOCH FROM (finishedAt - startedAt))) as avg_seconds
FROM "IngestRun"
WHERE status = 'ok' 
  AND finishedAt IS NOT NULL
GROUP BY companyId, vendor
ORDER BY avg_seconds DESC
LIMIT 20;

-- Ajustar batchLimit para processar menos empresas por vez
curl -X POST https://SEU-APP.vercel.app/api/cron/reingest \
  -d '{"batchLimit":5,"concurrency":2}'
```

---

### Problema: Cron não está executando

**Causa:** Vercel cron não configurada ou deploy pendente.

**Solução:**
1. Verificar `vercel.json` tem a cron
2. Fazer deploy: `git push`
3. Verificar no Vercel Dashboard → Cron Jobs
4. Testar manualmente: `curl https://app.vercel.app/api/cron/reingest`

---

## 🎯 CASOS DE USO

### Caso 1: Monitorar 10 empresas VIP diariamente

```bash
# Cadastrar cada uma
for companyId in comp_001 comp_002 comp_003 ... comp_010; do
  curl -X POST https://app.vercel.app/api/monitor/register \
    -H "Content-Type: application/json" \
    -d "{
      \"companyId\": \"$companyId\",
      \"vendor\": \"TOTVS\",
      \"cadence\": \"daily\",
      \"domain\": \"empresa.com.br\",
      \"active\": true
    }"
done
```

---

### Caso 2: Reprocessar todas empresas NOW

```bash
# 1. Forçar nextRunAt para agora
# (via SQL no Supabase)
UPDATE "CompanyMonitor" SET nextRunAt = NOW() WHERE active = true;

# 2. Disparar cron
curl -X POST https://app.vercel.app/api/cron/reingest \
  -d '{"batchLimit":50,"concurrency":5}'
```

---

### Caso 3: Monitoramento por cadência

**6h - Empresas críticas:**
```bash
curl -X POST /api/monitor/register -d '{"companyId":"comp_vip","cadence":"6h"}'
```

**Daily - Empresas ativas:**
```bash
curl -X POST /api/monitor/register -d '{"companyId":"comp_active","cadence":"daily"}'
```

**Weekly - Empresas frias:**
```bash
curl -X POST /api/monitor/register -d '{"companyId":"comp_cold","cadence":"weekly"}'
```

---

## 📈 ROADMAP

### Próximas Funcionalidades:

- [ ] **Dashboard Admin** - UI para gerenciar monitores
- [ ] **Webhooks** - Notificação de falhas (Slack/Discord)
- [ ] **Retry Automático** - 3 tentativas com exponential backoff
- [ ] **Priorização** - Empresas VIP executam primeiro
- [ ] **Alertas** - Email quando sucesso rate <90%
- [ ] **Métricas em Tempo Real** - Grafana/Datadog
- [ ] **Bulk Register** - Cadastrar múltiplas empresas via CSV

---

## 🔐 SEGURANÇA

### Boas Práticas:

✅ **Implementado:**
- Todas as rotas com `runtime='nodejs'` (server-only)
- Service Role Key apenas no backend
- Validação de inputs obrigatórios
- Error handling graceful

⏳ **A Implementar:**
- Rate limiting (50 req/min por projeto)
- Autenticação na rota `/api/cron/reingest` (verificar Vercel Cron signature)
- Audit log de cadastro/alteração de monitores
- Alertas de anomalias (muitos erros, tempo excessivo)

---

## 📞 SUPORTE

**Em caso de problemas:**

1. **Verificar logs do Vercel:**
   ```bash
   vercel logs --follow
   ```

2. **Verificar IngestRun no Supabase:**
   ```sql
   SELECT * FROM "IngestRun" 
   WHERE status = 'error' 
   ORDER BY startedAt DESC 
   LIMIT 20;
   ```

3. **Contatar:**
   - **Marcos Oliveira** (Engenheiro Responsável)
   - Email: marcos@olv.com.br
   - Slack: @marcos

---

**Documento mantido por:** Marcos Oliveira  
**Última atualização:** 20 de Outubro de 2025, 19:00  
**Versão:** 1.0

