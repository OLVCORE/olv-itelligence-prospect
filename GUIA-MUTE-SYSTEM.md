# 🔕 GUIA DO MUTE SYSTEM - OLV Alerts

**Versão:** 1.0  
**Data:** 20 de Outubro de 2025  
**Módulo:** Alerts Pack - Mute Add-On

---

## 🎯 VISÃO GERAL

Sistema de **silenciamento temporário** de alertas que permite pausar notificações por:
- **Regra específica** (ex: desabilitar `slow_run` durante migração)
- **Empresa específica** (ex: silenciar alertas de `comp_xxx` durante onboarding)
- **Vendor** (ex: pausar alertas TOTVS durante manutenção)
- **Combinação** (ex: `maturity_drop` + `comp_xxx`)

### Benefícios:
- ✅ **Janelas de Manutenção** sem spam de alertas
- ✅ **Onboarding Suave** (silenciar empresa nova temporariamente)
- ✅ **Migrações Planejadas** (pausar alerts de mudanças esperadas)
- ✅ **Auditável** (tudo registrado em AlertMute)
- ✅ **Temporário** (auto-expira após `until`)

---

## 🗄️ MODELO DE DADOS

```prisma
model AlertMute {
  id        String   @id
  ruleName  String?  // Qual regra silenciar (null = todas)
  companyId String?  // Qual empresa silenciar (null = todas)
  vendor    String?  // Qual vendor silenciar (null = todos)
  until     DateTime // Até quando (auto-expira)
  note      String?  // Motivo do mute
  createdAt DateTime
}
```

**Índices:**
- `until` - Para buscar mutes ativos
- `ruleName` - Para filtrar por regra
- `companyId` - Para filtrar por empresa
- `vendor` - Para filtrar por vendor

---

## 🚀 COMO USAR

### 1. Silenciar Regra Específica (Global)

**Caso de Uso:** Desabilitar alertas de `slow_run` por 2 horas durante migração.

```bash
curl -X POST https://SEU-APP.vercel.app/api/alerts/mute \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: SEU_KEY" \
  -d '{
    "ruleName": "slow_run_p95_90s",
    "minutes": 120,
    "note": "Migração de servidor - esperado latência alta"
  }'
```

**Efeito:**
- Durante 2 horas, alertas de `slow_run_p95_90s` **não** serão disparados
- Outras regras continuam funcionando normalmente
- Após 2h, a regra volta a disparar automaticamente

---

### 2. Silenciar Empresa Específica

**Caso de Uso:** Empresa nova sendo onboarding, evitar alertas de maturidade baixa.

```bash
curl -X POST https://app.vercel.app/api/alerts/mute \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{
    "companyId": "comp_nova_empresa",
    "minutes": 1440,
    "note": "Onboarding - primeira análise em progresso"
  }'
```

**Efeito:**
- Por 24h, **TODOS** os alertas relacionados a `comp_nova_empresa` são silenciados
- Outras empresas não são afetadas

---

### 3. Silenciar Combinação (Regra + Empresa)

**Caso de Uso:** Empresa em migração de ERP, evitar alertas de queda de maturidade.

```bash
curl -X POST https://app.vercel.app/api/alerts/mute \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{
    "ruleName": "maturity_drop_15",
    "companyId": "comp_migrando",
    "vendor": "TOTVS",
    "minutes": 4320,
    "note": "Migração SAP → TOTVS - queda temporária esperada"
  }'
```

**Efeito:**
- Por 72h (3 dias), alertas de `maturity_drop_15` para `comp_migrando` + `TOTVS` são silenciados
- Outros alertas desta empresa (ex: `ingest_error`) **continuam** funcionando
- Outros vendors/empresas não são afetados

---

### 4. Silenciar TUDO (Global Mute)

**Caso de Uso:** Manutenção programada do sistema completo.

```bash
curl -X POST https://app.vercel.app/api/alerts/mute \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{
    "minutes": 30,
    "note": "Manutenção programada do Supabase"
  }'
```

**Efeito:**
- Por 30min, **TODOS** os alertas são silenciados
- Use com cautela!

---

## 📋 GERENCIAMENTO

### Listar Mutes Ativos

**API:**
```bash
curl https://app.vercel.app/api/alerts/mute \
  -H "x-olv-admin-key: KEY"
```

**Resposta:**
```json
{
  "ok": true,
  "mutes": [
    {
      "id": "mute_abc123",
      "ruleName": "slow_run_p95_90s",
      "companyId": null,
      "vendor": null,
      "until": "2025-10-20T23:00:00Z",
      "note": "Migração de servidor",
      "createdAt": "2025-10-20T21:00:00Z"
    }
  ]
}
```

**SQL:**
```sql
-- Ver mutes ativos (ainda não expiraram)
SELECT * FROM "AlertMute" 
WHERE until >= NOW() 
ORDER BY until DESC;

-- Ver todos (incluindo expirados)
SELECT * FROM "AlertMute" 
ORDER BY "createdAt" DESC 
LIMIT 50;
```

---

### Remover Mute (Antes do Tempo)

**Cenário:** Manutenção terminou mais cedo, quer reativar alertas.

```bash
curl -X POST https://app.vercel.app/api/alerts/mute/delete \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{"id":"mute_abc123"}'
```

**Ou via SQL:**
```sql
DELETE FROM "AlertMute" WHERE id = 'mute_abc123';
```

---

### Estender Mute Existente

**Cenário:** Manutenção vai demorar mais, precisa estender o mute.

**Solução:** Criar novo mute (não há UPDATE na API por segurança).

```bash
# Deletar antigo
curl -X POST /api/alerts/mute/delete -d '{"id":"mute_old"}'

# Criar novo com mais tempo
curl -X POST /api/alerts/mute \
  -d '{"ruleName":"slow_run_p95_90s","minutes":240}'
```

---

## 🎛️ DASHBOARD (UI)

### Acessar:
```
https://SEU-APP.vercel.app/dashboard/operations
```

### Seção "Mutes Ativos":

Tabela mostrando mutes vigentes:

| Coluna | Conteúdo | Uso |
|--------|----------|-----|
| **Regra** | Nome da regra silenciada | Qual alerta está muted |
| **Empresa** | companyId afetado | Escopo do mute |
| **Vendor** | Vendor afetado | Contexto |
| **Até** | Timestamp de expiração | Quando volta a alertar |
| **Nota** | Motivo do mute | Auditoria/contexto |
| **ID** | ID do mute | Para deletar via API |

**Recursos:**
- ✅ **Read-only** (seguro, sem expor secrets)
- ✅ **Auto-refresh** (server-side)
- ✅ **Ordenado por expiração** (próximos a expirar no topo)
- ✅ **Truncate long IDs** (companyId, note)

---

## 📊 CASOS DE USO

### Caso 1: Janela de Manutenção

**Situação:** Migração de Supabase agendada para 22:00-23:00.

**Ação:**
```bash
# 21:55 - Criar mute global por 90min
curl -X POST /api/alerts/mute \
  -H "x-olv-admin-key: KEY" \
  -d '{"minutes":90,"note":"Migracao Supabase 22:00-23:00"}'

# 22:00 - Fazer migração
# ...

# 22:30 - Migração concluiu mais cedo, remover mute
curl -X POST /api/alerts/mute/delete \
  -H "x-olv-admin-key: KEY" \
  -d '{"id":"ID_DO_MUTE"}'
```

---

### Caso 2: Onboarding de Empresa

**Situação:** 10 empresas novas sendo adicionadas, evitar spam de `maturity_drop`.

```bash
# Para cada empresa
for companyId in comp_001 comp_002 ... comp_010; do
  curl -X POST /api/alerts/mute \
    -H "x-olv-admin-key: KEY" \
    -d "{
      \"ruleName\":\"maturity_drop_15\",
      \"companyId\":\"$companyId\",
      \"minutes\":1440,
      \"note\":\"Onboarding - primeira analise\"
    }"
done
```

---

### Caso 3: Migração de Stack

**Situação:** Empresa migrando de SAP para TOTVS (2 semanas).

```bash
curl -X POST /api/alerts/mute \
  -H "x-olv-admin-key: KEY" \
  -d '{
    "companyId": "comp_empresa_migrando",
    "vendor": "TOTVS",
    "minutes": 20160,
    "note": "Migração SAP → TOTVS (2 semanas)"
  }'
```

**Efeito:**
- Alertas de **qualquer regra** para `comp_empresa_migrando` + `TOTVS` são silenciados
- Alertas de `OLV` ou `CUSTOM` para a mesma empresa **continuam** funcionando

---

### Caso 4: Desabilitar Regra Temporariamente

**Situação:** Regra `quota_hour` disparando muito (falso positivo), desabilitar por 24h.

```bash
curl -X POST /api/alerts/mute \
  -H "x-olv-admin-key: KEY" \
  -d '{
    "ruleName": "quota_hour",
    "minutes": 1440,
    "note": "Falso positivo - ajustar threshold depois"
  }'
```

---

## 🔍 QUERIES ÚTEIS

### Mutes Ativos (Próximos a Expirar)

```sql
SELECT 
  ruleName, 
  companyId, 
  vendor, 
  until,
  EXTRACT(EPOCH FROM (until - NOW())) / 60 as minutes_remaining,
  note
FROM "AlertMute"
WHERE until >= NOW()
ORDER BY until ASC
LIMIT 20;
```

---

### Histórico de Mutes (Auditoria)

```sql
SELECT 
  ruleName,
  companyId,
  vendor,
  "createdAt",
  until,
  EXTRACT(EPOCH FROM (until - "createdAt")) / 60 as duration_minutes,
  note
FROM "AlertMute"
ORDER BY "createdAt" DESC
LIMIT 100;
```

---

### Mutes Expirados (Limpeza)

```sql
-- Ver mutes expirados
SELECT * FROM "AlertMute" 
WHERE until < NOW()
ORDER BY until DESC
LIMIT 50;

-- Limpar mutes expirados (> 7 dias)
DELETE FROM "AlertMute" 
WHERE until < NOW() - INTERVAL '7 days';
```

---

### Contagem por Tipo

```sql
SELECT 
  CASE 
    WHEN ruleName IS NOT NULL AND companyId IS NOT NULL THEN 'Regra+Empresa'
    WHEN ruleName IS NOT NULL THEN 'Regra Global'
    WHEN companyId IS NOT NULL THEN 'Empresa Global'
    WHEN vendor IS NOT NULL THEN 'Vendor Global'
    ELSE 'Global Total'
  END as tipo,
  COUNT(*) as total
FROM "AlertMute"
WHERE until >= NOW()
GROUP BY tipo;
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Alerta ainda está disparando (mesmo com mute)

**Causas:**
1. Mute expirou (`until < NOW()`)
2. Parâmetros não correspondem (ex: mute tem `companyId` mas alerta tem `vendor` diferente)
3. Cooldown da regra já tinha disparado antes do mute

**Soluções:**
```sql
-- Verificar se mute está ativo
SELECT * FROM "AlertMute" 
WHERE ruleName = 'ingest_error_prod' 
  AND until >= NOW();

-- Verificar último alerta disparado
SELECT * FROM "AlertEvent" 
WHERE ruleName = 'ingest_error_prod' 
ORDER BY ts DESC LIMIT 1;

-- Se necessário, criar mute mais abrangente
-- (ex: sem companyId para pegar todos)
```

---

### Problema: Mute não aparece no dashboard

**Causa:** Dashboard Operations faz cache server-side.

**Solução:**
- Refresh a página (F5)
- Ou aguardar próximo reload automático

---

### Problema: Não consigo criar mute (400 error)

**Causa:** Parâmetros inválidos ou `minutes` negativo.

**Solução:**
```bash
# Verificar resposta de erro
curl -X POST /api/alerts/mute \
  -H "x-olv-admin-key: KEY" \
  -d '{"ruleName":"invalid","minutes":-10}' -v

# Usar valores válidos
# minutes: > 0
# ruleName: existente em AlertRule (ou null)
```

---

## 🎯 PADRÕES DE USO

### Mute de Curto Prazo (<1h)

**Deploy ou restart:**
```bash
curl -X POST /api/alerts/mute \
  -d '{"minutes":15,"note":"Deploy em progresso"}' \
  -H "x-olv-admin-key: KEY"
```

---

### Mute de Médio Prazo (1h - 24h)

**Migração técnica:**
```bash
curl -X POST /api/alerts/mute \
  -d '{
    "ruleName":"maturity_drop_15",
    "companyId":"comp_xxx",
    "minutes":720,
    "note":"Migração de ERP"
  }' \
  -H "x-olv-admin-key: KEY"
```

---

### Mute de Longo Prazo (>24h)

**Projeto de longo prazo:**
```bash
curl -X POST /api/alerts/mute \
  -d '{
    "companyId":"comp_projeto_especial",
    "minutes":10080,
    "note":"Projeto especial - 1 semana"
  }' \
  -H "x-olv-admin-key: KEY"
```

---

## 📊 DASHBOARD UI

### Seção "Mutes Ativos" em /dashboard/operations

Mostra todos os mutes vigentes com:
- **Regra** silenciada
- **Empresa** afetada (se específico)
- **Vendor** afetado (se específico)
- **Até** quando (timestamp)
- **Nota** (motivo)
- **ID** (para deletar via API)

**Recursos:**
- Ordenado por `until` (próximos a expirar primeiro)
- Truncate de IDs longos para melhor legibilidade
- Read-only (seguro, sem forms expostos)
- Instruções para uso via API

---

## 🔒 SEGURANÇA

### Proteções Implementadas:

✅ **Admin Guard:** Todas as APIs exigem `x-olv-admin-key`  
✅ **Rate Limiting:** 20 burst, 5 tokens/sec refill  
✅ **Server-Side Only:** Zero JavaScript no cliente  
✅ **Auditoria:** Mutes registrados com timestamp  
✅ **Auto-Expiry:** Mutes não ficam eternos  

### Boas Práticas:

- ✅ **Sempre adicione `note`** (auditoria/contexto)
- ✅ **Use tempo mínimo necessário** (não exagerar)
- ✅ **Documente em ticket/issue** (rastreabilidade externa)
- ✅ **Cleanup periódico** de mutes expirados (>7 dias)

---

## 🧪 TESTES

### Teste 1: Criar Mute Global

```bash
curl -X POST https://app.vercel.app/api/alerts/mute \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{"ruleName":"slow_run_p95_90s","minutes":10,"note":"Teste"}'
```

**Validar:**
```sql
SELECT * FROM "AlertMute" 
WHERE ruleName = 'slow_run_p95_90s' 
  AND until >= NOW();
```

---

### Teste 2: Verificar que Alerta NÃO Dispara

```bash
# 1. Criar mute para regra
curl -X POST /api/alerts/mute \
  -d '{"ruleName":"ingest_error_prod","minutes":30}' \
  -H "x-olv-admin-key: KEY"

# 2. Forçar erro (criar IngestRun com error)
# (via SQL no Supabase)
INSERT INTO "IngestRun" (companyId, vendor, status, error)
VALUES ('test_mute', 'TOTVS', 'error', 'Teste de mute');

# 3. Disparar varredura de alertas
curl -X POST /api/cron/alerts

# 4. Verificar que NÃO criou AlertEvent
SELECT * FROM "AlertEvent" 
WHERE ruleName = 'ingest_error_prod' 
  AND companyId = 'test_mute'
ORDER BY ts DESC LIMIT 1;
-- Esperado: nenhum resultado (alerta foi muted)
```

---

### Teste 3: Deletar Mute

```bash
# Listar
curl https://app.vercel.app/api/alerts/mute -H "x-olv-admin-key: KEY"

# Copiar ID do mute

# Deletar
curl -X POST https://app.vercel.app/api/alerts/mute/delete \
  -H "Content-Type: application/json" \
  -H "x-olv-admin-key: KEY" \
  -d '{"id":"COPIAR_ID_AQUI"}'
```

**Validar:**
```sql
SELECT * FROM "AlertMute" WHERE id = 'ID_DELETADO';
-- Esperado: nenhum resultado
```

---

### Teste 4: Dashboard UI

```
https://app.vercel.app/dashboard/operations
```

**Validar:**
- [ ] Seção "Mutes Ativos" aparece
- [ ] Mutes criados aparecem na tabela
- [ ] Campos estão populados corretamente
- [ ] Instrução de uso via API está visível

---

## 📈 MÉTRICAS

### KPIs de Mutes:

| Métrica | Query | Significado |
|---------|-------|-------------|
| **Mutes Ativos** | `COUNT(*) WHERE until >= NOW()` | Quantos mutes vigentes |
| **Mutes Hoje** | `COUNT(*) WHERE createdAt >= NOW() - 1 day` | Atividade recente |
| **Duração Média** | `AVG(until - createdAt)` | Tempo típico de mute |
| **Mais Mutado** | `GROUP BY ruleName` | Qual regra mais silenciada |

---

## 🎯 ROADMAP

### Futuras Melhorias:

- [ ] **UI de Criação** (form no dashboard, sem precisar cURL)
- [ ] **Botão Delete** ao lado de cada mute na tabela
- [ ] **Auto-Suggest** de regras/empresas/vendors
- [ ] **Templates** de mutes (ex: "Manutenção Padrão 30min")
- [ ] **Notificação de Expiração** (email quando mute expira)
- [ ] **Mute Recorrente** (ex: todo sábado 02:00-04:00)

---

## 📞 SUPORTE

**Em caso de problemas:**

1. **Verificar mutes ativos:**
   ```sql
   SELECT * FROM "AlertMute" WHERE until >= NOW();
   ```

2. **Verificar se alerta foi muted:**
   ```sql
   -- Ver últimos AlertEvents
   SELECT * FROM "AlertEvent" 
   WHERE ruleName = 'SUA_REGRA' 
   ORDER BY ts DESC LIMIT 10;
   ```

3. **Limpar mutes expirados:**
   ```sql
   DELETE FROM "AlertMute" WHERE until < NOW() - INTERVAL '7 days';
   ```

---

## ✅ CHECKLIST PÓS-INSTALAÇÃO

- [ ] Script `olv-alerts-mute-addon.mjs` executado
- [ ] `npx prisma generate` executado
- [ ] Tabela `AlertMute` criada no Supabase
- [ ] APIs testadas (`/api/alerts/mute`)
- [ ] Dashboard mostra seção "Mutes Ativos"
- [ ] Teste de mute realizado (alerta silenciado com sucesso)
- [ ] Teste de delete realizado (mute removido)

---

**Sistema de Mute 100% Operacional!** 🔕

---

**Documento criado:** 20 de Outubro de 2025, 21:30  
**Autor:** Marcos Oliveira (AI Assistant)  
**Versão:** 1.0

