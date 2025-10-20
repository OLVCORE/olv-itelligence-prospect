# 🧪 GUIA DE TESTES DE ACEITAÇÃO - Stack Builder & Maturity

**Projeto:** OLV Intelligent Prospecting System  
**Versão:** 1.0  
**Data:** 20 de Outubro de 2025

---

## 📋 PRÉ-REQUISITOS

### Variáveis de Ambiente Obrigatórias:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# APIs Externas (opcional, mas recomendado)
SERPER_API_KEY=xxx
APOLLO_API_KEY=xxx
HUNTER_API_KEY=xxx
PHANTOM_BUSTER_API_KEY=xxx
```

### Setup Inicial:

```bash
# 1. Clonar e instalar
git clone https://github.com/OLVCORE/olv-intelligence-prospect
cd olv-intelligence-prospect
npm install

# 2. Executar script instalador
node scripts/olv-ensure.mjs

# 3. Deploy (se local)
npm run dev
# ou deploy para Vercel
vercel --prod
```

---

## 🎯 SUITE DE TESTES

### TESTE 1: Health Check ✅

**Objetivo:** Verificar se o serviço está online.

**Comando:**
```bash
curl https://SEU-APP.vercel.app/api/health
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "time": "2025-10-20T16:45:30.123Z"
}
```

**Critérios de Sucesso:**
- [ ] Status 200
- [ ] Resposta em <500ms
- [ ] Campo `ok: true`
- [ ] Timestamp válido

---

### TESTE 2: HTTP Headers Capture 📡

**Objetivo:** Capturar headers HTTP e salvar em TechSignals.

**Comando:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/integrations/http/headers \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.totvs.com",
    "companyId": "test_company_001"
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "headers": {
    "server": "nginx",
    "content-type": "text/html",
    "x-powered-by": "PHP/8.1",
    ...
  }
}
```

**Validação no Supabase:**
```sql
SELECT * FROM "TechSignals" 
WHERE "companyId" = 'test_company_001' 
  AND kind = 'http_header';
```

**Critérios de Sucesso:**
- [ ] Status 200
- [ ] Headers retornados
- [ ] Registro criado em TechSignals
- [ ] Campo `value` contém JSON string dos headers
- [ ] Campo `confidence` = 70
- [ ] Campo `source` = 'http_headers'

---

### TESTE 3: Stack Builder (Manual) 🏗️

**Objetivo:** Construir detectedStack a partir de evidências existentes.

**Pré-condição:** Pelo menos 1 TechSignal + 1 Firmographic salvos para a empresa.

**Comando:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/build \
  -H 'Content-Type: application/json' \
  -d '{
    "companyId": "test_company_001"
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "detectedStack": {
    "erp": [
      { "product": "SAP S/4HANA", "vendor": "SAP", "confidence": 60 }
    ],
    "cloud": [
      { "product": "AWS", "vendor": "Amazon", "confidence": 55 }
    ],
    "bi": [],
    "crm": [],
    "db": [],
    "integrations": [],
    "security": []
  },
  "evidenceCount": 3
}
```

**Critérios de Sucesso:**
- [ ] Status 200
- [ ] `detectedStack` retornado
- [ ] Categorias corretas (erp, crm, cloud, bi, db, integrations, security)
- [ ] Produtos detectados fazem sentido (não aleatórios)
- [ ] `evidenceCount` > 0

---

### TESTE 4: Maturity Calculator 📊

**Objetivo:** Calcular scores de maturidade a partir de detectedStack.

**Comando:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "default-project-id",
    "companyId": "test_company_001",
    "vendor": "TOTVS"
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "scores": {
    "infra": 60,
    "systems": 50,
    "data": 30,
    "security": 40,
    "automation": 15,
    "culture": 30,
    "overall": 38
  },
  "fit": {
    "products": [
      "TOTVS Protheus",
      "TOTVS Backoffice",
      "Fluig (BPM/Workflow)"
    ],
    "olv_packs": [],
    "rationale": [
      "Substituição/migração com redução de TCO e integração nativa TOTVS",
      "Ausência de BPM detectada – automação de processos"
    ]
  },
  "detectedStack": { ... }
}
```

**Validação no Supabase:**
```sql
SELECT * FROM "CompanyTechMaturity" 
WHERE "companyId" = 'test_company_001' 
  AND vendor = 'TOTVS';
```

**Critérios de Sucesso:**
- [ ] Status 200
- [ ] Scores entre 0-100
- [ ] Overall é média dos 6 pilares
- [ ] Fit contém produtos TOTVS relevantes
- [ ] Rationale tem justificativas
- [ ] Registro criado/atualizado em CompanyTechMaturity

---

### TESTE 5: Orchestrator One-Shot 🚀 (PRINCIPAL)

**Objetivo:** Executar pipeline completo (Headers → Serper → Apollo → Hunter → Stack → Maturity).

**Comando:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "default-project-id",
    "companyId": "test_company_kelludy",
    "vendor": "TOTVS",
    "domain": "kelludy.com.br",
    "companyName": "Kelludy Cosméticos",
    "linkedinUrl": "https://www.linkedin.com/company/kelludy",
    "verifyEmails": true
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "summary": {
    "headerSaved": true,
    "serperCount": 7,
    "firmographicsSaved": true,
    "peopleFound": 5,
    "emailsVerified": 3,
    "jobsIngested": 0
  },
  "detectedStack": {
    "erp": [
      { "product": "SAP S/4HANA", "vendor": "SAP", "confidence": 60 }
    ],
    "cloud": [
      { "product": "AWS", "vendor": "Amazon", "confidence": 55 }
    ],
    "crm": [],
    "bi": [],
    "db": [],
    "integrations": [],
    "security": []
  },
  "scores": {
    "infra": 60,
    "systems": 50,
    "data": 30,
    "security": 40,
    "automation": 15,
    "culture": 30,
    "overall": 38
  },
  "fit": {
    "products": ["TOTVS Protheus", "Fluig (BPM/Workflow)"],
    "olv_packs": [],
    "rationale": [
      "Substituição/migração com redução de TCO e integração nativa TOTVS",
      "Ausência de BPM detectada – automação de processos"
    ]
  }
}
```

**Validações no Supabase:**

1. **TechSignals:**
```sql
SELECT kind, source, COUNT(*) as count
FROM "TechSignals" 
WHERE "companyId" = 'test_company_kelludy'
GROUP BY kind, source;
```
Esperado:
- http_header (1)
- serper (7+)

2. **Firmographics:**
```sql
SELECT * FROM "Firmographics" 
WHERE "companyId" = 'test_company_kelludy' 
ORDER BY "fetchedAt" DESC LIMIT 1;
```

3. **Person:**
```sql
SELECT name, role, email, "linkedinUrl" 
FROM "Person" 
WHERE "companyId" = 'test_company_kelludy';
```

4. **CompanyTechMaturity:**
```sql
SELECT scores, "detectedStack", "fitRecommendations" 
FROM "CompanyTechMaturity" 
WHERE "companyId" = 'test_company_kelludy' 
  AND vendor = 'TOTVS';
```

**Critérios de Sucesso:**
- [ ] Status 200
- [ ] Tempo de resposta <30s
- [ ] `summary.headerSaved` = true (se domain fornecido)
- [ ] `summary.serperCount` > 0 (se Serper API configurada)
- [ ] `summary.firmographicsSaved` = true (se Apollo API configurada)
- [ ] `summary.peopleFound` > 0 (se Apollo API configurada)
- [ ] `detectedStack` populado
- [ ] `scores.overall` entre 0-100
- [ ] `fit.products` não vazio
- [ ] Registros criados em todas as tabelas

---

### TESTE 6: Reprocessamento (Idempotência) 🔁

**Objetivo:** Chamar orchestrator 2x e verificar que não duplica dados.

**Comando:**
```bash
# 1ª chamada
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{ "projectId":"proj", "companyId":"comp_idem", "vendor":"TOTVS", "domain":"test.com.br" }'

# 2ª chamada (mesmos parâmetros)
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{ "projectId":"proj", "companyId":"comp_idem", "vendor":"TOTVS", "domain":"test.com.br" }'
```

**Validação:**
```sql
-- CompanyTechMaturity deve ter 1 registro (upsert)
SELECT COUNT(*) FROM "CompanyTechMaturity" 
WHERE "companyId" = 'comp_idem' AND vendor = 'TOTVS';
-- Esperado: 1

-- TechSignals pode ter duplicatas (insert sempre)
SELECT COUNT(*) FROM "TechSignals" 
WHERE "companyId" = 'comp_idem';
-- Esperado: 2x o número de evidências (headers + serper)
```

**Critérios de Sucesso:**
- [ ] CompanyTechMaturity tem 1 registro (atualizado)
- [ ] `updatedAt` da 2ª chamada > 1ª chamada
- [ ] TechSignals pode ter duplicatas (comportamento aceitável)

---

### TESTE 7: Sem APIs Externas (Fallback) ⚠️

**Objetivo:** Verificar comportamento quando APIs externas estão indisponíveis.

**Setup:** Remover temporariamente as API keys:
```bash
unset SERPER_API_KEY
unset APOLLO_API_KEY
unset HUNTER_API_KEY
```

**Comando:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "proj",
    "companyId": "comp_fallback",
    "vendor": "TOTVS",
    "domain": "test.com.br"
  }'
```

**Resposta Esperada:**
```json
{
  "ok": true,
  "summary": {
    "headerSaved": true,
    "serperCount": 0,
    "firmographicsSaved": false,
    "peopleFound": 0,
    "emailsVerified": 0,
    "jobsIngested": 0
  },
  "detectedStack": {
    "erp": [],
    "crm": [],
    "cloud": [],
    "bi": [],
    "db": [],
    "integrations": [],
    "security": []
  },
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
  }
}
```

**Critérios de Sucesso:**
- [ ] Status 200 (não 500!)
- [ ] `ok: true`
- [ ] `summary.serperCount` = 0
- [ ] `summary.firmographicsSaved` = false
- [ ] `detectedStack` vazio (todas categorias [])
- [ ] `scores` com valores mínimos (baseline)
- [ ] Não há crash ou exception

---

### TESTE 8: Parâmetros Inválidos ❌

**Objetivo:** Validar error handling de inputs inválidos.

#### 8.1 - Sem projectId:
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{ "companyId":"comp", "vendor":"TOTVS" }'
```
**Esperado:** `400 Bad Request` com `error: 'projectId, companyId, vendor obrigatórios'`

#### 8.2 - Vendor inválido:
```bash
curl -X POST https://SEU-APP.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{ "projectId":"proj", "companyId":"comp", "vendor":"INVALID" }'
```
**Esperado:** `200 OK` mas `fit` vazio ou com fallback

#### 8.3 - Domain malformado:
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{ "projectId":"proj", "companyId":"comp", "vendor":"TOTVS", "domain":"not-a-valid-domain" }'
```
**Esperado:** `200 OK` mas `summary.headerSaved: false` (erro silencioso)

**Critérios de Sucesso:**
- [ ] 400 para parâmetros obrigatórios ausentes
- [ ] 200 para parâmetros opcionais inválidos (graceful degradation)
- [ ] Mensagens de erro descritivas

---

### TESTE 9: Performance & Timeout ⏱️

**Objetivo:** Verificar que a API não trava em requisições lentas.

**Setup:** Usar domínio com timeout (ex: `httpstat.us/200?sleep=15000`).

**Comando:**
```bash
time curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "proj",
    "companyId": "comp_timeout",
    "vendor": "TOTVS",
    "domain": "httpstat.us/200?sleep=15000"
  }'
```

**Critérios de Sucesso:**
- [ ] Resposta em <30s (mesmo com APIs lentas)
- [ ] Não retorna 504 Gateway Timeout
- [ ] `summary.headerSaved: false` (timeout silencioso)
- [ ] Outras etapas (Serper, Apollo) continuam funcionando

---

### TESTE 10: Dados Reais (5 Empresas Piloto) 🏢

**Objetivo:** Validar accuracy em empresas reais.

#### Empresas Piloto:

| Empresa | CNPJ | Domain | Stack Conhecido |
|---------|------|--------|-----------------|
| Kelludy | 09.103.140/0001-96 | kelludy.com.br | ? |
| TOTVS | 53.113.791/0001-22 | totvs.com | TOTVS Protheus, AWS, Oracle DB |
| Magazine Luiza | 47.960.950/0001-21 | magazineluiza.com.br | SAP, AWS, Google Cloud |
| Ambev | 02.808.708/0001-07 | ambev.com.br | SAP S/4HANA, Azure, Salesforce |
| Nubank | 18.236.120/0001-58 | nubank.com.br | AWS, PostgreSQL, Kafka |

**Para cada empresa:**
```bash
curl -X POST https://SEU-APP.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "pilot_project",
    "companyId": "EMPRESA_ID",
    "vendor": "TOTVS",
    "domain": "DOMAIN",
    "companyName": "NOME",
    "verifyEmails": false
  }'
```

**Validação:**
1. Comparar `detectedStack` com stack conhecido
2. Calcular accuracy: `(acertos / total_produtos) * 100`
3. Target: **≥85% accuracy**

**Critérios de Sucesso:**
- [ ] 5 empresas analisadas
- [ ] Accuracy média ≥85%
- [ ] Zero crashes
- [ ] Tempo médio <15s por empresa

---

## 📊 RELATÓRIO DE TESTES

### Template de Relatório:

```markdown
# Relatório de Testes - Stack Builder & Maturity
**Data:** DD/MM/YYYY  
**Executor:** Nome  
**Ambiente:** Produção / Staging

## Resumo Executivo
- **Testes Executados:** X/10
- **Sucesso:** X (XX%)
- **Falhas:** X (XX%)
- **Bloqueadores:** X

## Detalhamento

### ✅ TESTE 1: Health Check
- Status: PASS
- Tempo: 120ms
- Observações: -

### ❌ TESTE 5: Orchestrator
- Status: FAIL
- Erro: Timeout na chamada Apollo
- Tempo: 35s
- Observações: API Apollo retornou 429 (rate limit)
- Ação: Adicionar retry com backoff

...

## Métricas
- **Accuracy Stack Detection:** 87% (target: 85%) ✅
- **Avg Response Time:** 12s (target: <30s) ✅
- **Error Rate:** 5% (target: <10%) ✅

## Próximos Passos
1. Corrigir TESTE 5 (rate limit Apollo)
2. Adicionar retry mechanism
3. Re-testar empresas piloto
```

---

## 🔧 TROUBLESHOOTING

### Problema: Headers não salvos (headerSaved: false)

**Causa Provável:**
- Domain inacessível
- Timeout de rede
- Certificado SSL inválido

**Solução:**
```bash
# Testar manualmente
curl -I https://DOMAIN

# Se falhar, verificar:
# 1. Domain com https:// ou http://
# 2. Firewall bloqueando Vercel IPs
# 3. Usar IP direto se DNS falhar
```

---

### Problema: Serper retorna 0 resultados

**Causa Provável:**
- API Key inválida
- Query muito específica
- Rate limit atingido

**Solução:**
```bash
# Validar key
curl https://google.serper.dev/search \
  -H "X-API-KEY: $SERPER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"q":"test"}'

# Se 401: key inválida
# Se 429: rate limit (aguardar 1 min)
# Se 200: ajustar query
```

---

### Problema: Apollo retorna 429 (Rate Limit)

**Causa Provável:**
- Muitas requisições em pouco tempo
- Plano gratuito (100 req/mês)

**Solução:**
```bash
# Verificar quota
curl https://api.apollo.io/v1/auth/health \
  -H "Content-Type: application/json" \
  -d '{"api_key":"YOUR_KEY"}'

# Implementar exponential backoff
# Aguardar 60s antes de retry
```

---

## 📞 SUPORTE

**Em caso de problemas:**

1. Verificar logs do Vercel:
   ```bash
   vercel logs --follow
   ```

2. Verificar Supabase logs:
   - Dashboard → Database → Logs

3. Contatar:
   - **Marcos Oliveira** (Engenheiro Responsável)
   - Email: marcos@olv.com.br
   - Slack: @marcos

---

**Documento mantido por:** Marcos Oliveira  
**Última atualização:** 20 de Outubro de 2025  
**Versão:** 1.0

