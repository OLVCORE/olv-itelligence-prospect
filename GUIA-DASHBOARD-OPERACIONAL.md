# 🎛️ GUIA DO DASHBOARD OPERACIONAL - OLV Intelligence

**Versão:** 1.0  
**Data:** 20 de Outubro de 2025  
**Módulo:** Final Upgrade Pack - Operações & Observabilidade

---

## 🎯 VISÃO GERAL

O **Dashboard Operacional** (`/dashboard/operations`) é o **centro de comando** do OLV Intelligence System. Ele fornece visibilidade em tempo real sobre:

- 📊 **Métricas Agregadas** (empresas, monitores, execuções)
- 🎯 **Scores de Maturidade** (últimos 50 cálculos)
- ⚡ **Execuções Recentes** (status, duração, erros)
- 🔐 **Auditoria** (quem fez o quê, quando)
- 🔒 **Segurança** (rate limiting + admin key)

---

## 🚀 COMO ACESSAR

### 1. Configurar Variável de Ambiente (OBRIGATÓRIO)

No Vercel Dashboard → Project → Settings → Environment Variables:

```bash
OLV_ADMIN_KEY=seu_secret_key_super_seguro_aqui_1234567890
```

**⚠️ IMPORTANTE:**
- **Sem esta variável**, o dashboard funcionará em DEV (localhost)
- **Com esta variável**, todas as rotas de ops exigem o header `x-olv-admin-key`
- Use um valor **forte e único** (mínimo 32 caracteres)
- **NUNCA commite** este valor no código

### 2. Acessar o Dashboard

```
https://SEU-APP.vercel.app/dashboard/operations
```

**Ou localmente:**
```
http://localhost:3000/dashboard/operations
```

---

## 📊 COMPONENTES DO DASHBOARD

### Seção 1: Cards de Métricas (Topo)

6 cards exibindo totais em tempo real:

| Métrica | O que Mostra | Como é Calculado |
|---------|--------------|------------------|
| **companies** | Total de empresas cadastradas | `COUNT(*) FROM Company` |
| **monitors** | Monitores ativos | `COUNT(*) FROM CompanyMonitor WHERE active=true` |
| **runs24** | Execuções nas últimas 24h | `COUNT(*) FROM IngestRun WHERE startedAt >= NOW() - 24h` |
| **techsignals** | Evidências coletadas | `COUNT(*) FROM TechSignals` |
| **firmographics** | Firmográficos salvos | `COUNT(*) FROM Firmographics` |
| **maturity** | Análises de maturidade | `COUNT(*) FROM CompanyTechMaturity` |

**Uso:**
- **Acompanhe o crescimento** do banco de dados
- **Identifique gargalos** (ex: techsignals baixo = problema de coleta)
- **Monitore atividade** (runs24 = quantas empresas foram processadas hoje)

---

### Seção 2: Últimos Scores (Maturidade)

Grid com os **50 últimos cálculos de maturidade**, mostrando:

- **Vendor** (TOTVS, OLV, CUSTOM)
- **Overall Score** (0-100)
- **Company ID**
- **Data de Atualização**

**Uso:**
- **Acompanhe evolução** de scores ao longo do tempo
- **Identifique empresas com baixa maturidade** (candidatas a consultoria)
- **Valide qualidade** dos cálculos (scores fazem sentido?)
- **Filtre por vendor** para comparar TOTVS vs OLV

**Insights:**
- Score < 30: **Alta oportunidade** (empresa precisa de modernização)
- Score 30-60: **Oportunidade média** (gaps específicos)
- Score > 60: **Cliente maduro** (upsell/cross-sell)

---

### Seção 3: Execuções Recentes

Tabela com as **200 últimas execuções** do orchestrator, mostrando:

| Coluna | Conteúdo | Uso |
|--------|----------|-----|
| **Run** | ID da execução (hash único) | Rastreabilidade |
| **Company** | ID da empresa processada | Qual empresa foi analisada |
| **Vendor** | Vendor target (TOTVS/OLV) | Contexto da análise |
| **Status** | ok / error / partial / queued / running | Sucesso ou falha |
| **Início** | Timestamp de início | Quando começou |
| **Fim** | Timestamp de fim | Quando terminou |

**Cores de Status:**
- 🟢 **ok** (verde): Sucesso
- 🔴 **error** (vermelho): Falhou
- ⚫ **queued/running** (neutro): Em andamento
- 🟡 **partial** (amarelo): Sucesso parcial

**Uso:**
- **Monitore falhas** em tempo real
- **Identifique empresas problemáticas** (múltiplos erros)
- **Calcule tempo médio** de processamento
- **Debug** (clique no Run ID para ver detalhes no Supabase)

---

## 🔌 APIS DE OBSERVABILIDADE

Todas as APIs exigem o header `x-olv-admin-key` quando `OLV_ADMIN_KEY` está configurado.

### 1. GET /api/ops/metrics

**Descrição:** Métricas agregadas + últimos scores.

**Headers:**
```bash
x-olv-admin-key: SEU_SECRET_KEY
```

**Resposta:**
```json
{
  "ok": true,
  "counts": {
    "companies": 150,
    "monitors": 45,
    "runs24": 23,
    "techsignals": 1234,
    "firmographics": 150,
    "maturity": 150
  },
  "lastScores": [
    {
      "vendor": "TOTVS",
      "scores": { "overall": 65, "infra": 70, ... },
      "companyId": "comp_xxx",
      "updatedAt": "2025-10-20T19:00:00Z"
    },
    ...
  ]
}
```

**Uso:**
```bash
curl https://app.vercel.app/api/ops/metrics \
  -H "x-olv-admin-key: SEU_SECRET_KEY"
```

---

### 2. GET /api/ops/runs

**Descrição:** Últimas 200 execuções do orchestrator.

**Headers:**
```bash
x-olv-admin-key: SEU_SECRET_KEY
```

**Resposta:**
```json
{
  "ok": true,
  "runs": [
    {
      "id": "run_abc123",
      "companyId": "comp_xxx",
      "vendor": "TOTVS",
      "status": "ok",
      "startedAt": "2025-10-20T19:00:00Z",
      "finishedAt": "2025-10-20T19:00:15Z",
      "summary": {
        "headerSaved": true,
        "serperCount": 7,
        ...
      },
      "error": null
    },
    ...
  ]
}
```

**Uso:**
```bash
curl https://app.vercel.app/api/ops/runs \
  -H "x-olv-admin-key: SEU_SECRET_KEY"
```

---

### 3. GET /api/ops/audit

**Descrição:** Últimos 200 logs de auditoria.

**Headers:**
```bash
x-olv-admin-key: SEU_SECRET_KEY
```

**Resposta:**
```json
{
  "ok": true,
  "audit": [
    {
      "id": "audit_xyz789",
      "ts": "2025-10-20T19:00:00Z",
      "actor": "api",
      "action": "ops_metrics",
      "route": "/api/ops/metrics",
      "ip": "192.168.1.1",
      "level": "info"
    },
    ...
  ]
}
```

**Uso:**
```bash
curl https://app.vercel.app/api/ops/audit \
  -H "x-olv-admin-key: SEU_SECRET_KEY"
```

---

## 🔒 SEGURANÇA & HARDENING

### Rate Limiting

**Implementado em:**
- `/api/ops/*` (todas as rotas de observabilidade)
- `/api/stack/ingest` (orchestrator)
- `/api/cron/reingest` (scheduler)

**Parâmetros:**
- **BURST**: 20 tokens (requisições simultâneas)
- **REFILL**: 5 tokens/segundo
- **Bucket**: Por IP + rota

**Como Funciona:**
```
Cliente com IP 1.2.3.4 faz 20 req/s em /api/ops/metrics
→ Primeiras 20: ✅ OK
→ 21ª em diante: 429 Too Many Requests (até refill)
→ Após 4 segundos: bucket recarrega para 20 tokens
```

**Resposta de Rate Limit:**
```json
{
  "ok": false,
  "error": "rate_limited"
}
```

**Status HTTP:** `429 Too Many Requests`

---

### Admin Key Guard

**Como Funciona:**
1. Se `OLV_ADMIN_KEY` **NÃO** está configurada → **permite tudo** (dev mode)
2. Se `OLV_ADMIN_KEY` **está configurada** → **exige header** `x-olv-admin-key`

**Headers Obrigatórios (produção):**
```bash
x-olv-admin-key: valor_exato_da_env_var
```

**Resposta sem Admin Key:**
```json
{
  "ok": false,
  "error": "unauthorized"
}
```

**Status HTTP:** `401 Unauthorized`

---

### Auditoria Automática

Toda chamada às rotas de ops gera **log de auditoria**:

```sql
SELECT * FROM "ApiAuditLog" 
ORDER BY ts DESC 
LIMIT 50;
```

**Campos Registrados:**
- `ts`: Timestamp
- `actor`: Quem chamou (api/cron/user)
- `action`: Ação realizada
- `route`: Rota chamada
- `ip`: IP do cliente
- `level`: Severidade (info/warn/error)

**Uso:**
- **Compliance LGPD** (rastreabilidade)
- **Debug** de problemas
- **Detecção de abusos**

---

## 🔐 LOCKS DE CONCORRÊNCIA

### Problema Resolvido

Sem locks, múltiplas execuções simultâneas da mesma empresa podem:
- **Duplicar dados** em TechSignals
- **Conflitar** em CompanyTechMaturity (race condition)
- **Consumir quotas** de APIs desnecessariamente

### Solução: IngestLock

Tabela `IngestLock`:
```prisma
model IngestLock {
  id         String   @id
  companyId  String   @unique
  lockedAt   DateTime
  holder     String?
  note       String?
}
```

**Fluxo:**
1. Job de reingest tenta `INSERT` em IngestLock (companyId UNIQUE)
2. **Sucesso** → processa empresa → **delete** IngestLock
3. **Falha** (já locked) → **skip** (status: 'skipped_locked')

**Benefícios:**
- ✅ Zero duplicações
- ✅ Zero race conditions
- ✅ Quota preservada

**Verificar Locks Ativos:**
```sql
SELECT * FROM "IngestLock";
```

*Normalmente deve estar vazio. Se houver locks > 5min, são locks "órfãos" (crash do worker).*

**Limpar Locks Órfãos:**
```sql
DELETE FROM "IngestLock" 
WHERE "lockedAt" < NOW() - INTERVAL '10 minutes';
```

---

## 📊 VIEWS SQL (Relatórios Rápidos)

### Aplicar Views (Uma Vez)

Copie o conteúdo de `sql/ops_views.sql` e execute no **SQL Editor do Supabase**.

---

### 1. v_ops_company_health

**Descrição:** Último overall score por empresa.

**Query:**
```sql
SELECT * FROM v_ops_company_health
ORDER BY overall ASC
LIMIT 20;
```

**Colunas:**
- `company_id`: ID da empresa
- `company_name`: Nome da empresa
- `overall`: Score geral (0-100)
- `vendor`: Vendor analisado
- `updated_at`: Última atualização

**Uso:**
- Ranking de empresas por maturidade
- Identificar oportunidades (overall < 40)
- Priorizar prospecção

---

### 2. v_ops_run_summary

**Descrição:** Runs recentes com duração calculada.

**Query:**
```sql
SELECT * FROM v_ops_run_summary
WHERE status = 'ok'
ORDER BY duration_sec DESC
LIMIT 20;
```

**Colunas:**
- `id`: Run ID
- `companyId`: Empresa processada
- `vendor`: Vendor
- `status`: Status
- `startedAt`: Início
- `finishedAt`: Fim
- `duration_sec`: Duração em segundos

**Uso:**
- Identificar runs lentos (>60s)
- Calcular tempo médio de processamento
- Debug de performance

---

### 3. olv_ops_counts() (RPC)

**Descrição:** Função SQL que retorna JSON com contadores.

**Query:**
```sql
SELECT olv_ops_counts();
```

**Retorno:**
```json
{
  "companies": 150,
  "monitors": 45,
  "runs24": 23,
  "techsignals": 1234,
  "firmographics": 150,
  "maturity": 150
}
```

**Uso:**
- Dashboard em tempo real
- Métricas agregadas instantâneas
- Healthcheck do sistema

---

## 🎯 CASOS DE USO

### Caso 1: Identificar Empresas com Baixa Maturidade

**Objetivo:** Encontrar empresas com overall < 40 para prospecção.

**SQL:**
```sql
SELECT company_name, overall, vendor, updated_at
FROM v_ops_company_health
WHERE overall < 40
ORDER BY overall ASC
LIMIT 50;
```

**Ação:** Priorizar estas empresas para campanhas de consultoria.

---

### Caso 2: Monitorar Taxa de Sucesso

**Objetivo:** Calcular % de sucesso das últimas 100 execuções.

**SQL:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'ok') * 100.0 / COUNT(*) as success_rate
FROM "IngestRun"
WHERE "startedAt" >= NOW() - INTERVAL '7 days';
```

**Target:** ≥95% de sucesso.

**Se < 95%:** Investigar erros comuns.

---

### Caso 3: Tempo Médio de Processamento

**Objetivo:** Saber quanto tempo leva para processar uma empresa.

**SQL:**
```sql
SELECT 
  AVG(duration_sec) as avg_seconds,
  MAX(duration_sec) as max_seconds,
  MIN(duration_sec) as min_seconds
FROM v_ops_run_summary
WHERE status = 'ok' 
  AND "startedAt" >= NOW() - INTERVAL '7 days';
```

**Target:** <30s média.

---

### Caso 4: Empresas Mais Problemáticas

**Objetivo:** Identificar empresas com múltiplas falhas.

**SQL:**
```sql
SELECT 
  "companyId",
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  COUNT(*) FILTER (WHERE status = 'error') * 100 / COUNT(*) as error_rate
FROM "IngestRun"
WHERE "startedAt" >= NOW() - INTERVAL '7 days'
GROUP BY "companyId"
HAVING COUNT(*) FILTER (WHERE status = 'error') > 2
ORDER BY error_rate DESC;
```

**Ação:** Pausar monitoramento destas empresas ou investigar causa raiz.

---

### Caso 5: Auditoria de Acesso

**Objetivo:** Ver quem acessou APIs de ops nas últimas 24h.

**SQL:**
```sql
SELECT ts, actor, action, route, ip
FROM "ApiAuditLog"
WHERE ts >= NOW() - INTERVAL '24 hours'
ORDER BY ts DESC;
```

**Uso:** Compliance, detecção de abusos.

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Taxa de Sucesso** | ≥95% | `COUNT(ok) / COUNT(*)` |
| **Tempo Médio** | <30s | `AVG(duration_sec)` |
| **Cobertura** | ≥80% das empresas | `monitors / companies` |
| **Freshness** | <48h | `MAX(updated_at) - NOW()` |
| **Uptime** | 99.5% | Vercel Dashboard |

---

## 🔧 TROUBLESHOOTING

### Problema: Dashboard retorna 401 Unauthorized

**Causa:** `OLV_ADMIN_KEY` configurada mas não está sendo enviada no header.

**Solução:**
1. Verificar se `OLV_ADMIN_KEY` está no Vercel env vars
2. O Dashboard faz fetch server-side → deve usar `process.env.OLV_ADMIN_KEY`
3. Se chamar via curl, adicionar header manualmente

---

### Problema: Dashboard retorna 429 Rate Limited

**Causa:** Múltiplas requisições do mesmo IP.

**Solução:**
1. Aguardar 4-5 segundos (refill de tokens)
2. Se persistir, aumentar REFILL_PER_SEC em `lib/server/guard.ts`
3. Ou desabilitar rate limit temporariamente (dev)

---

### Problema: Metrics retornam todos zeros

**Causa:** Nenhuma empresa foi processada ainda.

**Solução:**
1. Cadastrar empresas: `curl /api/monitor/register`
2. Disparar cron: `curl /api/cron/reingest`
3. Aguardar processamento (5-30s por empresa)
4. Refresh dashboard

---

### Problema: Views SQL não existem

**Causa:** `sql/ops_views.sql` não foi executado no Supabase.

**Solução:**
1. Abrir Supabase → SQL Editor
2. Copiar conteúdo de `sql/ops_views.sql`
3. Executar (Run)
4. Verificar: `SELECT * FROM v_ops_company_health LIMIT 1;`

---

### Problema: Locks órfãos bloqueando empresas

**Causa:** Worker crashou antes de releaseLock.

**Solução:**
```sql
-- Ver locks ativos
SELECT * FROM "IngestLock";

-- Remover locks > 10min
DELETE FROM "IngestLock" 
WHERE "lockedAt" < NOW() - INTERVAL '10 minutes';
```

---

## 🚀 PRÓXIMAS FEATURES

### Roadmap Dashboard:

- [ ] **Gráficos** (Chart.js/Recharts) de evolução de scores
- [ ] **Filtros** (por vendor, por período, por status)
- [ ] **Export CSV** de runs e metrics
- [ ] **Alertas visuais** (empresas com errors > 3)
- [ ] **Comparação** antes/depois de cada run
- [ ] **Webhook config UI** (Slack/Discord/Email)
- [ ] **Retry manual** por empresa (botão)
- [ ] **Logs em tempo real** (WebSocket)

---

## 📞 SUPORTE

**Em caso de problemas:**

1. **Verificar logs do Vercel:**
   ```bash
   vercel logs --follow --filter /api/ops
   ```

2. **Verificar auditoria:**
   ```sql
   SELECT * FROM "ApiAuditLog" 
   WHERE level = 'error' 
   ORDER BY ts DESC LIMIT 20;
   ```

3. **Contatar:**
   - **Marcos Oliveira** (Engenheiro Responsável)
   - Email: marcos@olv.com.br
   - Slack: @marcos

---

**Dashboard 100% Operacional e Pronto para Gestão!** 🎛️

---

**Documento mantido por:** Marcos Oliveira  
**Última atualização:** 20 de Outubro de 2025, 20:00  
**Versão:** 1.0

