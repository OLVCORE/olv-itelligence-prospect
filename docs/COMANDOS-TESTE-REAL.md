# 📋 COMANDOS DE VALIDAÇÃO - OLV INTELLIGENT PROSPECTING SYSTEM

> **Comandos reais para testar integrações LIVE em produção ou local.**  
> Substitua `http://localhost:3000` por `https://SEU-APP.vercel.app` para testes em produção.

---

## ✅ **1. Healthcheck Geral**

Verifica se a API está respondendo.

```bash
curl http://localhost:3000/api/health
```

**Saída Esperada:**
```json
{"ok":true,"time":"2025-10-20T17:15:00.000Z"}
```

---

## 🔍 **2. Serper (Google Search REAL)**

Busca resultados do Google usando a API Serper. Requer `SERPER_API_KEY` configurada.

```bash
curl -X POST http://localhost:3000/api/integrations/serper/search \
  -H 'Content-Type: application/json' \
  -d '{"q":"site:masterindustria.com.br ERP SAP","num":5}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "organic": [
      {
        "title": "SAP na Master Indústria - Case de Sucesso",
        "link": "https://masterindustria.com.br/cases/sap",
        "snippet": "Implementação do SAP S/4HANA na Master Indústria resultou em 30% de otimização..."
      }
    ]
  }
}
```

---

## 🏢 **3. Apollo Company Enrich (Firmographics REAL)**

Enriquece dados de uma empresa via Apollo.io. Requer `APOLLO_API_KEY` configurada.  
**NOTA:** Este comando fará um `UPSERT` na tabela `Firmographics` se `companyId` for fornecido.

```bash
curl -X POST http://localhost:3000/api/integrations/apollo/company-enrich \
  -H 'Content-Type: application/json' \
  -d '{"domain":"masterindustria.com.br","companyId":"comp_exemplo_id","page":1}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "organizations": [
      {
        "id": "apollo_org_123",
        "name": "Master Indústria",
        "website_url": "masterindustria.com.br",
        "estimated_num_employees": "201-500",
        "estimated_annual_revenue": "$50M-$100M",
        "keywords": ["Manufatura", "Metalúrgica", "Autopeças"]
      }
    ]
  }
}
```

---

## 👥 **4. Apollo People Search (Decisores REAL)**

Busca pessoas em uma empresa via Apollo.io. Requer `APOLLO_API_KEY` configurada.

```bash
curl -X POST http://localhost:3000/api/integrations/apollo/people-search \
  -H 'Content-Type: application/json' \
  -d '{"q_organization_domains":"masterindustria.com.br","page":1,"per_page":10,"companyId":"comp_exemplo_id"}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "people": [
      {
        "id": "apollo_person_456",
        "first_name": "Carlos",
        "last_name": "Silva",
        "title": "Diretor de TI",
        "email": "carlos.silva@masterindustria.com.br",
        "linkedin_url": "https://linkedin.com/in/carlos-silva-tech",
        "seniority": "Director",
        "department": "Information Technology"
      }
    ]
  }
}
```

---

## 📧 **5. Hunter Email Finder (Pessoas REAL)**

Encontra emails de pessoas em um domínio via Hunter.io. Requer `HUNTER_API_KEY` configurada.

```bash
curl -X POST http://localhost:3000/api/integrations/hunter/find \
  -H 'Content-Type: application/json' \
  -d '{"domain":"masterindustria.com.br","full_name":"Carlos Silva","companyId":"comp_exemplo_id"}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "data": {
      "email": "carlos.silva@masterindustria.com.br",
      "score": 95,
      "status": "valid"
    }
  }
}
```

---

## ✅ **6. Hunter Email Verifier (Validação REAL)**

Verifica a validade de um email via Hunter.io. Requer `HUNTER_API_KEY` configurada.

```bash
curl -X POST http://localhost:3000/api/integrations/hunter/verify \
  -H 'Content-Type: application/json' \
  -d '{"email":"carlos.silva@masterindustria.com.br","personId":"person_exemplo_id"}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "data": {
      "status": "valid",
      "score": 98,
      "result": "deliverable"
    }
  }
}
```

---

## 🌐 **7. HTTP Headers (Tech Detection REAL)**

Detecta tecnologias a partir dos headers HTTP de um website.  
**NOTA:** Este comando fará um `INSERT` na tabela `TechSignals` se `companyId` for fornecido.

```bash
curl -X POST http://localhost:3000/api/integrations/http/headers \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://masterindustria.com.br","companyId":"comp_exemplo_id"}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "headers": {
    "server": "nginx",
    "x-powered-by": "PHP/7.4",
    "content-type": "text/html; charset=UTF-8"
  }
}
```

---

## 💼 **8. PhantomBuster LinkedIn Jobs (Sinais REAL)**

Lança um agente PhantomBuster para coletar vagas abertas no LinkedIn de uma empresa.  
Requer `PHANTOM_BUSTER_API_KEY` e `agentId` configurados.

```bash
curl -X POST http://localhost:3000/api/integrations/phantom/linkedin-jobs \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"YOUR_AGENT_ID","companyLinkedinUrl":"https://linkedin.com/company/master-industria","companyId":"comp_exemplo_id"}'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "data": {
    "containerId": "phantom_job_789",
    "status": "launched"
  }
}
```

---

## 📊 **9. Maturity Calculator (Cálculo REAL + UPSERT)**

Calcula a maturidade tecnológica e o fit com soluções TOTVS/OLV, persistindo os resultados.  
**NOTA:** Este comando fará um `UPSERT` na tabela `CompanyTechMaturity`.

```bash
curl -X POST http://localhost:3000/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_exemplo_id",
    "vendor":"TOTVS",
    "detectedStack":{
      "erp":[{"product":"SAP S/4HANA","vendor":"SAP","confidence":90}],
      "bi":[{"product":"Power BI","vendor":"Microsoft","confidence":70}],
      "cloud":[{"product":"AWS EC2","vendor":"Amazon","confidence":85}],
      "security":[{"product":"Fortinet Firewall","vendor":"Fortinet","confidence":80}]
    },
    "sources":{"serper":true,"headers":true,"apollo":true}
  }'
```

**Saída Esperada (exemplo):**
```json
{
  "ok": true,
  "scores": {
    "infra": 80,
    "systems": 75,
    "data": 60,
    "security": 80,
    "automation": 50,
    "culture": 30,
    "overall": 63
  },
  "fit": {
    "products": ["TOTVS Protheus", "TOTVS Backoffice", "Fluig (BPM/Workflow)", "TOTVS BI"],
    "olv_packs": [],
    "rationale": [
      "Migração/substituição com redução de TCO e integração nativa TOTVS",
      "Ausência de BPM detectada – padronização e automação de processos",
      "Camada de BI integrada ao ERP e relatórios financeiros"
    ]
  }
}
```

---

## 🔄 **10. Fluxo Completo de Ativação (Sequencial)**

Execute os comandos na ordem para popular o sistema com dados reais de uma empresa:

```bash
# 1. Buscar empresa via CNPJ (se já tiver endpoint de busca)
# curl -X POST http://localhost:3000/api/companies/search -d '{"cnpj":"06.990.590/0001-23"}'

# 2. Enriquecer com Apollo (empresa + firmographics)
curl -X POST http://localhost:3000/api/integrations/apollo/company-enrich \
  -d '{"domain":"masterindustria.com.br","companyId":"comp_123"}' \
  -H 'Content-Type: application/json'

# 3. Buscar decisores via Apollo
curl -X POST http://localhost:3000/api/integrations/apollo/people-search \
  -d '{"q_organization_domains":"masterindustria.com.br","companyId":"comp_123"}' \
  -H 'Content-Type: application/json'

# 4. Encontrar emails via Hunter
curl -X POST http://localhost:3000/api/integrations/hunter/find \
  -d '{"domain":"masterindustria.com.br","full_name":"Carlos Silva","companyId":"comp_123"}' \
  -H 'Content-Type: application/json'

# 5. Detectar tech stack via HTTP headers
curl -X POST http://localhost:3000/api/integrations/http/headers \
  -d '{"url":"https://masterindustria.com.br","companyId":"comp_123"}' \
  -H 'Content-Type: application/json'

# 6. Buscar sinais de compra via Serper
curl -X POST http://localhost:3000/api/integrations/serper/search \
  -d '{"q":"site:masterindustria.com.br contratando diretor TI OR vaga ERP","num":10}' \
  -H 'Content-Type: application/json'

# 7. Calcular maturidade e fit
curl -X POST http://localhost:3000/api/maturity/calculate \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_123",
    "vendor":"TOTVS",
    "detectedStack":{"erp":[{"product":"SAP S/4HANA","vendor":"SAP","confidence":90}]},
    "sources":{"serper":true,"headers":true,"apollo":true}
  }' \
  -H 'Content-Type: application/json'
```

---

## 🚀 **Produção (Vercel)**

Troque `http://localhost:3000` por `https://seu-app.vercel.app` em todos os comandos acima.

**Exemplo:**
```bash
curl https://seu-app.vercel.app/api/health
```

---

## 🔒 **Segurança**

- ✅ **Todas as chaves são server-only** (`process.env` em rotas API, NUNCA no client)
- ✅ **RLS policies** isolam dados por `projectId` no Supabase
- ✅ **Rate limiting** via Vercel Edge Config (opcional, adicionar posteriormente)
- ✅ **Logs sem secrets** (prefixos `[Serper]`, `[Apollo]`, etc., sem expor chaves)

---

## 📚 **Referências**

- [Serper API Docs](https://serper.dev/docs)
- [Apollo.io API Docs](https://apolloio.github.io/apollo-api-docs/)
- [Hunter.io API Docs](https://hunter.io/api-documentation/v2)
- [PhantomBuster API Docs](https://docs.phantombuster.com/api-reference/)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

**✅ Sistema 100% conectado a dados REAIS. Zero mocks. Pronto para apresentação TOTVS!**
