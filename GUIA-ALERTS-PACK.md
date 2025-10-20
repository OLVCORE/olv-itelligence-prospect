# 🔔 GUIA DO ALERTS PACK - OLV Intelligence

**Versão:** 1.0  
**Data:** 20 de Outubro de 2025  
**Sistema:** Notificações Automáticas via Email (SMTP) e Slack

---

## 🎯 VISÃO GERAL

Sistema completo de **alertas automáticos** que monitora o OLV Intelligence e dispara notificações via **Email** (SMTP) e **Slack** quando detecta problemas ou anomalias.

### Recursos:
- ✅ **6 Regras Automáticas** (ingest errors, maturity drop, slow runs, cron gaps, stuck locks, quota)
- ✅ **Email SMTP** (mail.olvinternacional.com.br:587 com STARTTLS)
- ✅ **Slack Webhook** (opcional)
- ✅ **Webhook Genérico** (SIEM/Datadog/Splunk)
- ✅ **Cooldown & Deduplicação** (evita spam)
- ✅ **Vercel Cron** (varredura a cada 5 minutos)
- ✅ **Dashboard UI** (últimos 20 alertas)
- ✅ **APIs de Teste** e **Disparo Manual**

---

## ⚙️ CONFIGURAÇÃO (OBRIGATÓRIO)

### 1. Variáveis de Ambiente no Vercel

Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# === SMTP (OBRIGATÓRIO para Email) ===
SMTP_HOST=mail.olvinternacional.com.br
SMTP_PORT=587
SMTP_USER=olvsistemas@olvinternacional.com.br
SMTP_PASS=SUA_SENHA_SMTP_AQUI
SMTP_FROM="OLV Alerts <olvsistemas@olvinternacional.com.br>"

# === SLACK (OPCIONAL) ===
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/XXX

# === OLV ADMIN (JÁ EXISTE) ===
OLV_ADMIN_KEY=SEU_SECRET_KEY
```

**⚠️ IMPORTANTE:**
- `SMTP_PASS` é a senha do email `olvsistemas@olvinternacional.com.br`
- Porta 587 usa **STARTTLS** (não SSL direta)
- `SMTP_FROM` pode ser customizado para incluir nome bonito

---

### 2. Aplicar Migração Prisma (SQL)

Execute no SQL Editor do Supabase:

```sql
-- AlertRule
CREATE TABLE IF NOT EXISTS "AlertRule" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "severity" TEXT NOT NULL,
  "enabled" BOOLEAN DEFAULT true,
  "kind" TEXT NOT NULL,
  "params" JSONB,
  "cooldownSec" INTEGER DEFAULT 900,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- AlertChannel
CREATE TABLE IF NOT EXISTS "AlertChannel" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "enabled" BOOLEAN DEFAULT true,
  "config" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- AlertEvent
CREATE TABLE IF NOT EXISTS "AlertEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ts" TIMESTAMP DEFAULT NOW(),
  "ruleId" TEXT NOT NULL,
  "ruleName" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "companyId" TEXT,
  "vendor" TEXT,
  "runId" TEXT,
  "meta" JSONB,
  "delivered" BOOLEAN DEFAULT false,
  "channels" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_alert_ts" ON "AlertEvent"("ts");
CREATE INDEX IF NOT EXISTS "idx_rule_ts" ON "AlertEvent"("ruleName", "ts");
```

---

## 🔔 REGRAS AUTOMÁTICAS (6)

As regras são criadas automaticamente na primeira execução. Você pode editá-las no Supabase.

| Regra | Severity | Detecta | Cooldown |
|-------|----------|---------|----------|
| **ingest_error_prod** | 🔴 critical | IngestRun com status error/partial (1h) | 15min |
| **maturity_drop_15** | 🟠 high | Queda ≥15 pontos no overall score | 30min |
| **slow_run_p95_90s** | 🟡 medium | p95 de duração >90s (15min window) | 30min |
| **cron_gap_6h** | 🔴 critical | Nenhum IngestRun por 6h | 20min |
| **stuck_lock_20m** | 🟠 high | IngestLock preso >20min | 20min |
| **quota_hour** | 🟠 high | ≥3 erros de 429/402/quota em 1h | 20min |

---

## 📧 CANAIS DE NOTIFICAÇÃO

### 1. Email (Automático)
- **Tipo:** `email`
- **Target:** `email:olvsistemas@olvinternacional.com.br`
- **Configuração:** Criado automaticamente se `SMTP_PASS` estiver configurado
- **Template:** HTML formatado com severidade colorida

### 2. Slack (Opcional)
- **Tipo:** `slack`
- **Target:** `slack:#olv-ops`
- **Configuração:** Criado automaticamente se `SLACK_WEBHOOK_URL` existir
- **Formato:** Markdown com bullet points

### 3. Webhook (Manual)
- **Tipo:** `webhook`
- **Target:** URL completa (ex: `https://splunk.com/webhook`)
- **Payload:** JSON completo do AlertEvent

**Criar Canal Manual:**
```sql
INSERT INTO "AlertChannel" (name, type, target, enabled, config)
VALUES ('splunk_prod', 'webhook', 'https://seu-splunk.com/api/events', true, '{}');
```

---

## 🚀 COMO USAR

### 1. Testar Email e Slack

```bash
curl -X POST https://SEU-APP.vercel.app/api/alerts/test \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: SEU_OLV_ADMIN_KEY" \
  -d '{"to":"seu-email@example.com"}'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "mail": { "messageId": "<...@mail.olvinternacional.com.br>" },
  "slack": { "ok": true, "status": 200 }
}
```

**Validações:**
- ✅ Recebeu email em `seu-email@example.com`?
- ✅ Mensagem apareceu no Slack (se configurado)?
- ✅ AlertEvent foi criado no Supabase?

---

### 2. Disparar Varredura Manual

```bash
curl -X POST https://SEU-APP.vercel.app/api/cron/alerts \
  -H "x-olv-admin-key: SEU_OLV_ADMIN_KEY"
```

**Resposta:**
```json
{
  "ok": true,
  "fired": [
    {
      "eventId": "evt_xxx",
      "deliveries": [
        {"channel":"email_ops","type":"email","ok":true},
        {"channel":"slack_ops","type":"slack","ok":true,"status":200}
      ]
    }
  ]
}
```

---

### 3. Ver Alertas Recentes

**API:**
```bash
curl https://SEU-APP.vercel.app/api/alerts/events \
  -H "x-olv-admin-key: SEU_OLV_ADMIN_KEY"
```

**UI:**
```
https://SEU-APP.vercel.app/dashboard/operations
```

Veja a seção **"Últimos Alertas"** no final da página.

---

### 4. Disparar Alerta Custom

```bash
curl -X POST https://SEU-APP.vercel.app/api/alerts/fire \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: SEU_OLV_ADMIN_KEY" \
  -d '{
    "event": {
      "ruleName": "custom_alert",
      "severity": "high",
      "message": "Evento customizado de teste",
      "subject": "Alerta Custom - OLV",
      "html": "<h2>Alerta Custom</h2><p>Este é um teste.</p>"
    }
  }'
```

---

## 📊 REGRAS EM DETALHES

### 1. ingest_error_prod (CRITICAL)

**Detecta:** IngestRun com status `error` ou `partial` na última hora.

**Quando dispara:**
- Orchestrator falha ao processar empresa
- APIs externas retornam erro (Serper, Apollo, Hunter)
- Timeout de processamento

**Mensagem Exemplo:**
```
IngestRun run_abc123 terminou com status error. 
Erro: Apollo HTTP 401
```

**Ação Sugerida:**
- Verificar logs do Vercel
- Validar API keys
- Verificar se empresa/domain existe

---

### 2. maturity_drop_15 (HIGH)

**Detecta:** Overall score caiu ≥15 pontos entre 2 análises consecutivas.

**Quando dispara:**
- Empresa perdeu stack tecnológico (migrou?)
- Evidências foram removidas
- Erro de cálculo (bug?)

**Mensagem Exemplo:**
```
Queda de maturidade: 65 → 45 (Δ -20)
companyId: comp_kelludy
vendor: TOTVS
```

**Ação Sugerida:**
- Investigar o que mudou na empresa
- Verificar TechSignals e Firmographics
- Reprocessar se necessário

---

### 3. slow_run_p95_90s (MEDIUM)

**Detecta:** p95 (percentil 95) de duração de runs >90s nos últimos 15min.

**Quando dispara:**
- APIs externas lentas
- Muitas empresas sendo processadas simultaneamente
- Problemas de rede

**Mensagem Exemplo:**
```
p95 de duração dos runs = 125s (> 90s)
```

**Ação Sugerida:**
- Reduzir `concurrency` no cron
- Aumentar `delayMs` entre chamadas
- Verificar logs de timeout

---

### 4. cron_gap_6h (CRITICAL)

**Detecta:** Nenhum IngestRun nos últimos 6 horas.

**Quando dispara:**
- Vercel Cron parou de executar
- Nenhuma empresa cadastrada para monitor
- Erro sistêmico no /api/cron/reingest

**Mensagem Exemplo:**
```
Nenhuma execução de ingest nos últimos 6h
```

**Ação Sugerida:**
- Verificar Vercel Dashboard → Cron Jobs
- Disparar manualmente: `curl /api/cron/reingest`
- Verificar se há monitores ativos

---

### 5. stuck_lock_20m (HIGH)

**Detecta:** IngestLock travado por >20 minutos.

**Quando dispara:**
- Worker crashou antes de `releaseLock()`
- Timeout de processamento
- Erro não tratado no orchestrator

**Mensagem Exemplo:**
```
Lock de ingest preso para companyId comp_kelludy há > 20min
```

**Ação Sugerida:**
```sql
-- Remover lock manualmente
DELETE FROM "IngestLock" WHERE "companyId" = 'comp_kelludy';
```

---

### 6. quota_hour (HIGH)

**Detecta:** ≥3 erros de quota/rate-limit (429, 402) na última hora.

**Quando dispara:**
- Serper API atingiu limite (100 req/dia)
- Apollo atingiu quota (100 credits/mês)
- Hunter atingiu limite (50 req/mês)
- Billing issue (402 Payment Required)

**Mensagem Exemplo:**
```
5 indícios de quota/rate-limit/402 na última hora
```

**Ação Sugerida:**
- Pausar monitoramento temporariamente
- Atualizar plano das APIs
- Reduzir frequência de cron (6h → daily)

---

## 🎨 TEMPLATES DE EMAIL

### Email Padrão (HTML):

```html
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45">
  <h2>[CRITICAL] ingest_error_prod</h2>
  <p>IngestRun run_abc123 terminou com status error. Erro: Apollo HTTP 401</p>
  <ul>
    <li><b>companyId:</b> comp_kelludy</li>
    <li><b>vendor:</b> TOTVS</li>
    <li><b>runId:</b> run_abc123</li>
  </ul>
  <p style="color:#888">OLV Intelligent Prospecting System</p>
</div>
```

**Customizar Template:**

Editar `lib/jobs/alerts.ts` função `fmtEmailHTML()`.

---

## 🔧 GERENCIAMENTO

### Ativar/Desativar Regra

**SQL:**
```sql
-- Desativar regra específica
UPDATE "AlertRule" SET enabled = false WHERE name = 'slow_run_p95_90s';

-- Reativar
UPDATE "AlertRule" SET enabled = true WHERE name = 'slow_run_p95_90s';

-- Listar todas
SELECT name, severity, enabled, kind FROM "AlertRule";
```

---

### Ativar/Desativar Canal

**SQL:**
```sql
-- Desativar Slack
UPDATE "AlertChannel" SET enabled = false WHERE name = 'slack_ops';

-- Mudar destinatário de email
UPDATE "AlertChannel" 
SET target = 'email:marcos@olv.com.br' 
WHERE name = 'email_ops';
```

---

### Alterar Cooldown (Dedupe Window)

**SQL:**
```sql
-- Aumentar cooldown para 30min (1800s)
UPDATE "AlertRule" 
SET "cooldownSec" = 1800 
WHERE name = 'ingest_error_prod';
```

---

### Criar Regra Custom

**SQL:**
```sql
INSERT INTO "AlertRule" (name, description, severity, enabled, kind, params, "cooldownSec")
VALUES (
  'custom_my_rule',
  'Minha regra customizada',
  'medium',
  true,
  'custom_kind',
  '{"threshold": 50}',
  900
);
```

*Nota: Você precisará implementar a lógica no `lib/jobs/alerts.ts` função `runAlertsSweep()`.*

---

## 📊 DASHBOARD DE ALERTAS

### Acessar:
```
https://SEU-APP.vercel.app/dashboard/operations
```

### Seção "Últimos Alertas":

Tabela com últimos 20 eventos:

| Coluna | Conteúdo | Cor |
|--------|----------|-----|
| **Quando** | Timestamp do alerta | - |
| **Regra** | Nome da regra | - |
| **Sev** | Severity | 🔴 critical, 🟠 high, ⚫ medium/low |
| **Mensagem** | Descrição do problema | - |
| **Empresa** | companyId afetado | - |
| **Vendor** | Vendor relacionado | - |

---

## 🧪 TESTES

### Teste 1: Email SMTP

```bash
curl -X POST https://app.vercel.app/api/alerts/test \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: SEU_KEY" \
  -d '{"to":"marcos@example.com"}'
```

**Validações:**
- [ ] Email recebido em `marcos@example.com`
- [ ] Subject: "Teste de Alerta – OLV"
- [ ] HTML formatado corretamente
- [ ] Remetente: "OLV Alerts <olvsistemas@olvinternacional.com.br>"

---

### Teste 2: Slack Webhook

```bash
curl -X POST https://app.vercel.app/api/alerts/test \
  -H "x-olv-admin-key: SEU_KEY"
```

**Validações:**
- [ ] Mensagem apareceu no canal Slack configurado
- [ ] Formato: `Teste de alerta – OLV ✅`

---

### Teste 3: Varredura Completa

```bash
curl -X POST https://app.vercel.app/api/cron/alerts
```

**Validações:**
- [ ] Resposta: `{"ok":true,"fired":[...]}`
- [ ] Se houver problemas, `fired` não está vazio
- [ ] AlertEvent criado no Supabase

---

### Teste 4: Alertas no Dashboard

```
https://app.vercel.app/dashboard/operations
```

**Validações:**
- [ ] Seção "Últimos Alertas" aparece
- [ ] Tabela com eventos (se houver)
- [ ] Cores corretas (critical=vermelho, high=laranja)

---

## 📈 QUERIES ÚTEIS

### Ver Alertas por Severidade

```sql
SELECT severity, COUNT(*) as total
FROM "AlertEvent"
WHERE ts >= NOW() - INTERVAL '7 days'
GROUP BY severity
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

---

### Regras Mais Disparadas

```sql
SELECT ruleName, COUNT(*) as fires
FROM "AlertEvent"
WHERE ts >= NOW() - INTERVAL '7 days'
GROUP BY ruleName
ORDER BY fires DESC
LIMIT 10;
```

---

### Taxa de Entrega

```sql
SELECT 
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE delivered = true) as delivered,
  COUNT(*) FILTER (WHERE delivered = false) as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE delivered = true) / COUNT(*), 2) as delivery_rate
FROM "AlertEvent"
WHERE ts >= NOW() - INTERVAL '7 days';
```

---

### Alertas por Empresa

```sql
SELECT companyId, COUNT(*) as alert_count, severity
FROM "AlertEvent"
WHERE companyId IS NOT NULL
  AND ts >= NOW() - INTERVAL '7 days'
GROUP BY companyId, severity
ORDER BY alert_count DESC;
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Email não está sendo enviado

**Sintomas:** `delivered: false` em AlertEvent.

**Causas:**
1. `SMTP_PASS` não configurado
2. Senha incorreta
3. Porta 587 bloqueada pelo firewall Vercel
4. TLS/SSL issue

**Soluções:**
```bash
# 1. Verificar env vars
vercel env ls

# 2. Testar SMTP manualmente
curl -X POST https://app.vercel.app/api/alerts/test \
  -H "x-olv-admin-key: KEY" \
  -d '{"to":"teste@example.com"}'

# 3. Ver erro em AlertEvent.channels
SELECT channels FROM "AlertEvent" 
WHERE delivered = false 
ORDER BY ts DESC LIMIT 5;
```

---

### Problema: Slack não recebe mensagens

**Causa:** `SLACK_WEBHOOK_URL` inválida ou revogada.

**Solução:**
1. Gerar novo webhook: https://api.slack.com/messaging/webhooks
2. Testar manualmente:
```bash
curl -X POST https://hooks.slack.com/services/T00/B00/XXX \
  -H "Content-Type: application/json" \
  -d '{"text":"Teste manual"}'
```
3. Atualizar no Vercel

---

### Problema: Muitos alertas (spam)

**Causa:** Cooldown muito curto ou regras muito sensíveis.

**Soluções:**
```sql
-- Aumentar cooldown para 1h
UPDATE "AlertRule" SET "cooldownSec" = 3600;

-- Desativar regras menos críticas
UPDATE "AlertRule" SET enabled = false 
WHERE severity IN ('medium', 'low');

-- Ajustar thresholds
UPDATE "AlertRule" 
SET params = '{"dropThreshold": 25}' 
WHERE name = 'maturity_drop_15';
```

---

### Problema: Nenhum alerta disparando

**Causa:** Nenhum problema detectado (ótimo!) ou regras desabilitadas.

**Validar:**
```sql
-- Ver regras ativas
SELECT name, enabled, kind FROM "AlertRule";

-- Forçar erro para testar (DEV ONLY!)
-- Criar IngestRun com status error
INSERT INTO "IngestRun" (companyId, vendor, status, error)
VALUES ('test_001', 'TOTVS', 'error', 'Teste manual');

-- Disparar varredura
-- curl /api/cron/alerts
```

---

## 🔐 SEGURANÇA

### Headers Obrigatórios:

Todas as APIs de alertas exigem:
```bash
x-olv-admin-key: VALOR_DA_ENV_VAR
```

### Rate Limiting:

- **20 tokens burst**
- **5 tokens/segundo refill**
- **429** se exceder

### Auditoria:

Toda chamada às APIs de alertas é registrada em `ApiAuditLog`:

```sql
SELECT * FROM "ApiAuditLog" 
WHERE route LIKE '/api/alerts%' 
ORDER BY ts DESC;
```

---

## 📧 CONFIGURAR SLACK (OPCIONAL)

### Passo 1: Criar Webhook

1. Acessar: https://api.slack.com/apps
2. Create New App → From scratch
3. Nome: "OLV Alerts"
4. Workspace: Seu workspace
5. Features → Incoming Webhooks → Activate
6. Add New Webhook to Workspace
7. Selecionar canal (ex: #olv-ops)
8. Copiar URL: `https://hooks.slack.com/services/T.../B.../X...`

### Passo 2: Configurar no Vercel

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../X...
```

### Passo 3: Testar

```bash
curl -X POST https://app.vercel.app/api/alerts/test \
  -H "x-olv-admin-key: KEY"
```

Deve aparecer mensagem no canal Slack configurado.

---

## 🎯 ROADMAP

### Futuras Melhorias:

- [ ] **UI de Configuração** (criar/editar regras sem SQL)
- [ ] **Mute por Empresa** (silenciar alertas de empresa específica)
- [ ] **Escalonamento** (critical → email+slack, low → só slack)
- [ ] **Templates Customizados** (HTML rico com logos)
- [ ] **Digest Diário** (resumo de alertas por email 1x/dia)
- [ ] **Integração Discord** (webhook)
- [ ] **Integração Microsoft Teams** (webhook)
- [ ] **SMS** (Twilio) para critical

---

## 📞 SUPORTE

**Em caso de problemas:**

1. **Verificar logs do Vercel:**
   ```bash
   vercel logs --filter /api/alerts
   ```

2. **Verificar AlertEvent:**
   ```sql
   SELECT * FROM "AlertEvent" 
   WHERE delivered = false 
   ORDER BY ts DESC LIMIT 20;
   ```

3. **Contatar:**
   - **Marcos Oliveira**
   - Email: marcos@olv.com.br
   - Slack: @marcos

---

## ✅ CHECKLIST PÓS-INSTALAÇÃO

- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` configurados no Vercel
- [ ] (Opcional) `SLACK_WEBHOOK_URL` configurado
- [ ] SQL de criação de tabelas executado no Supabase
- [ ] Teste de email realizado (`/api/alerts/test`)
- [ ] Teste de Slack realizado (se configurado)
- [ ] Dashboard mostra seção "Últimos Alertas"
- [ ] Varredura manual funcionando (`/api/cron/alerts`)
- [ ] Vercel Cron ativo (Settings → Cron Jobs)

---

**Sistema de Alertas 100% Operacional!** 🔔

---

**Documento criado:** 20 de Outubro de 2025, 21:00  
**Autor:** Marcos Oliveira  
**Versão:** 1.0

