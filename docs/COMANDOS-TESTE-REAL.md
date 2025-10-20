# 🧪 COMANDOS DE TESTE - APIs REAIS

## ✅ TESTE LOCAL (localhost:3000)

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "ok": true,
  "service": "OLV Intelligence API",
  "time": "2025-10-20T17:15:00.000Z",
  "version": "1.0.0",
  "status": "operational"
}
```

---

### 2. Serper (Google Search REAL)
```bash
curl -X POST http://localhost:3000/api/integrations/serper/search \
  -H "Content-Type: application/json" \
  -d "{\"q\":\"site:empresa.com.br ERP SAP\",\"num\":5}"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "data": {
    "organic": [
      {
        "title": "Empresa XYZ - Soluções SAP",
        "link": "https://empresa.com.br/sap",
        "snippet": "Implementação SAP S/4HANA..."
      }
    ]
  }
}
```

---

### 3. Apollo Company Enrichment
```bash
curl -X POST http://localhost:3000/api/integrations/apollo/company-enrich \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"empresa.com.br\",\"page\":1,\"companyId\":\"comp_xxx\"}"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "data": {
    "organizations": [
      {
        "name": "Empresa XYZ",
        "estimated_num_employees": "201-500",
        "estimated_annual_revenue": "$10M-$50M",
        "keywords": ["Manufacturing", "ERP", "B2B"]
      }
    ]
  }
}
```

**NOTA:** Se `companyId` for fornecido, salva automaticamente em `Firmographics`.

---

### 4. Hunter Email Finder
```bash
curl -X POST http://localhost:3000/api/integrations/hunter/find \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"empresa.com.br\",\"full_name\":\"Carlos Silva\"}"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "data": {
    "data": {
      "email": "carlos.silva@empresa.com.br",
      "score": 92,
      "type": "professional"
    }
  }
}
```

---

### 5. Hunter Email Verifier
```bash
curl -X POST http://localhost:3000/api/integrations/hunter/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"carlos.silva@empresa.com.br\"}"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "data": {
    "data": {
      "result": "deliverable",
      "score": 95,
      "email": "carlos.silva@empresa.com.br"
    }
  }
}
```

---

### 6. HTTP Headers (Tech Detection)
```bash
curl -X POST http://localhost:3000/api/integrations/http/headers \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://empresa.com.br\",\"companyId\":\"comp_xxx\"}"
```

**Resposta esperada:**
```json
{
  "ok": true,
  "data": {
    "url": "https://empresa.com.br",
    "status": 200,
    "headers": {
      "server": "nginx",
      "x-powered-by": "PHP/7.4",
      "cf-ray": "abc123"
    },
    "detectedTech": [
      {
        "technology": "Nginx",
        "confidence": 95,
        "evidence": "Server: nginx"
      },
      {
        "technology": "PHP",
        "confidence": 90,
        "evidence": "X-Powered-By: PHP/7.4"
      },
      {
        "technology": "Cloudflare",
        "confidence": 100,
        "evidence": "CF-Ray: abc123"
      }
    ]
  }
}
```

**NOTA:** Se `companyId` for fornecido, salva automaticamente em `TechSignals`.

---

### 7. Maturity Calculator
```bash
curl -X POST http://localhost:3000/api/maturity/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "companyId":"comp_1729456789_abc123xyz",
    "vendor":"TOTVS",
    "detectedStack":{
      "erp":[{"product":"SAP S/4HANA","vendor":"SAP"}],
      "bi":[{"product":"Power BI","vendor":"Microsoft"}],
      "cloud":[{"product":"AWS","vendor":"Amazon"}]
    },
    "sources":{"serper":true,"headers":true}
  }'
```

**Resposta esperada:**
```json
{
  "ok": true,
  "scores": {
    "infra": 70,
    "systems": 75,
    "data": 65,
    "security": 55,
    "automation": 50,
    "culture": 60,
    "overall": 65
  },
  "fit": {
    "vendor": "TOTVS",
    "score": 85,
    "products": [
      {
        "name": "TOTVS Protheus",
        "category": "ERP",
        "rationale": "Substituição de ERP legado (SAP) por solução nacional"
      },
      {
        "name": "TOTVS Fluig",
        "category": "BPM",
        "rationale": "Baixa automação detectada"
      }
    ],
    "dealSize": "R$ 300k - 600k",
    "rationale": [
      "Stack legado necessita modernização",
      "Automação em 50% - gap significativo"
    ]
  },
  "saved": true
}
```

**NOTA:** Salva automaticamente em `CompanyTechMaturity`.

---

## 🔐 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

Adicione no `.env.local`:

```bash
# Serper (Google Search)
SERPER_API_KEY=your_serper_key_here

# Apollo.io
APOLLO_API_KEY=your_apollo_key_here

# Hunter.io
HUNTER_API_KEY=your_hunter_key_here

# PhantomBuster
PHANTOM_BUSTER_API_KEY=your_phantom_key_here
```

---

## ⚠️ ERROS ESPERADOS (quando API key não configurada)

```json
{
  "ok": false,
  "error": {
    "code": "SERPER_ERROR",
    "message": "SERPER_API_KEY não configurado"
  }
}
```

**Isso é CORRETO.** Significa que a rota está funcionando, apenas precisa da chave.

---

## 📊 VERIFICAR NO BANCO

### Ver Firmographics salvos:
```sql
SELECT * FROM "Firmographics" 
WHERE "companyId" = 'comp_xxx' 
ORDER BY "fetchedAt" DESC;
```

### Ver TechSignals salvos:
```sql
SELECT * FROM "TechSignals" 
WHERE "companyId" = 'comp_xxx' 
ORDER BY "fetchedAt" DESC;
```

### Ver Maturity salvo:
```sql
SELECT * FROM "CompanyTechMaturity" 
WHERE "companyId" = 'comp_xxx';
```

---

## ✅ TESTE COMPLETO (FLUXO)

1. **Buscar empresa REAL:**
```bash
curl -X POST http://localhost:3000/api/companies/search \
  -H "Content-Type: application/json" \
  -d '{"cnpj":"18.627.195/0001-60"}'
```

2. **Pegar companyId da resposta** (ex: `comp_1729456789_abc123xyz`)

3. **Detectar headers:**
```bash
curl -X POST http://localhost:3000/api/integrations/http/headers \
  -H "Content-Type: application/json" \
  -d '{"url":"https://masterindustria.com.br","companyId":"comp_1729456789_abc123xyz"}'
```

4. **Enriquecer com Apollo:**
```bash
curl -X POST http://localhost:3000/api/integrations/apollo/company-enrich \
  -H "Content-Type: application/json" \
  -d '{"domain":"masterindustria.com.br","companyId":"comp_1729456789_abc123xyz"}'
```

5. **Calcular maturidade:**
```bash
curl -X POST http://localhost:3000/api/maturity/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "companyId":"comp_1729456789_abc123xyz",
    "vendor":"TOTVS",
    "detectedStack":{"erp":[],"cloud":[]},
    "sources":{}
  }'
```

6. **Ver no dashboard:**
- Abra `http://localhost:3000/dashboard`
- O TechMaturityCard vai aparecer com os scores calculados

---

**TODOS OS DADOS SÃO REAIS. ZERO MOCKS.** 🚀

