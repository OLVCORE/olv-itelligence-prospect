# ✅ CHECKLIST DE VALIDAÇÃO FINAL - OLV INTELLIGENCE

**Data:** 20 de Outubro de 2025  
**Status:** Aguardando validação do usuário

---

## 🎯 **O QUE FOI IMPLEMENTADO (100%)**

### **Backend (11 endpoints novos):**
- [x] `/api/health` - Health check
- [x] `/api/companies/quick-search` - Busca básica (3s)
- [x] `/api/companies/smart-search` - Busca + enrich background (3s)
- [x] `/api/companies/minimal-search` - Emergência (2s, apenas salva)
- [x] `/api/companies/enrich` - Enriquecimento completo (60s async)
- [x] `/api/companies/bulk-import` - Import CSV (60s)
- [x] `/api/integrations/serper/search` - Google Search
- [x] `/api/integrations/apollo/company-enrich` - Firmographics
- [x] `/api/integrations/apollo/people-search` - Decisores
- [x] `/api/integrations/hunter/find` - Email Finder
- [x] `/api/integrations/hunter/verify` - Email Verifier
- [x] `/api/integrations/http/headers` - Tech Detection
- [x] `/api/integrations/phantom/linkedin-jobs` - LinkedIn Jobs
- [x] `/api/integrations/digital-presence` - Redes Sociais + Jusbrasil + Marketplaces
- [x] `/api/maturity/calculate` - Maturidade + Fit TOTVS/OLV

### **Frontend:**
- [x] Botão "Analisar Empresa" funcional
- [x] BulkUploadModal usando /bulk-import
- [x] CompanySearchModule usando smart-search
- [x] Template CSV disponível em /template-empresas.csv

### **Database:**
- [x] Modelos Prisma: CompanyTechMaturity, Firmographics, TechSignals, SearchCache, ProjectMember
- [x] RLS Policies criadas (SQL pronto para aplicar)
- [x] Seed script disponível

### **Documentação:**
- [x] EBOOK Apresentação TOTVS (934 linhas)
- [x] Comandos de Teste Real (10 comandos curl)
- [x] Guia de Instalação Completa (455 linhas)
- [x] OLV Rebuild Pack (one-file completo)
- [x] Entendendo Timeouts Vercel (721 linhas)
- [x] Script Instalador (olv-ensure.mjs)

---

## 🧪 **TESTES DE ACEITAÇÃO (EXECUTAR AGORA)**

### **IMPORTANTE:** 
O dashboard do Vercel está com erro 500 interno (não é do seu app).  
**Teste DIRETAMENTE na URL do app**, não pelo dashboard.

---

### **Teste 1: Health Check**
```bash
curl https://olv-itelligence-prospect.vercel.app/api/health
```

**✅ PASS SE:** Retornar `{"ok":true,"time":"..."}`  
**❌ FAIL SE:** 404, 500, ou timeout

---

### **Teste 2: Smart-Search (SEM TIMEOUT)**
```bash
curl -w "\nTempo total: %{time_total}s\n" \
  -X POST https://olv-itelligence-prospect.vercel.app/api/companies/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"cnpj":"06.990.590/0001-23"}'
```

**✅ PASS SE:** 
- Retorna em <5 segundos
- Status 200 OK
- `enrichmentStatus: "queued"`

**❌ FAIL SE:** 
- 504 timeout
- Demora >10 segundos

---

### **Teste 3: Minimal-Search (EMERGÊNCIA - SEMPRE FUNCIONA)**
```bash
curl -w "\nTempo: %{time_total}s\n" \
  -X POST https://olv-itelligence-prospect.vercel.app/api/companies/minimal-search \
  -H 'Content-Type: application/json' \
  -d '{"cnpj":"18.627.195/0001-60","name":"Master Indústria"}'
```

**✅ PASS SE:**
- Retorna em <2 segundos
- Status 200 OK
- Empresa salva no banco

---

### **Teste 4: Enriquecimento Completo (Após obter companyId)**
```bash
# Substituir comp_xxx pelo ID retornado no teste 2 ou 3
curl -X POST https://olv-itelligence-prospect.vercel.app/api/companies/enrich \
  -H 'Content-Type: application/json' \
  -d '{"companyId":"comp_xxx"}'
```

**✅ PASS SE:**
- Retorna em <60 segundos
- `maturityScores` não é null
- `vendorFit` contém produtos TOTVS

---

### **Teste 5: Digital Presence**
```bash
curl -X POST https://olv-itelligence-prospect.vercel.app/api/integrations/digital-presence \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName":"KELLUDY INDUSTRIA E COMERCIO DE MAQUINAS E EQUIPAMENTOS LTDA",
    "cnpj":"06990590000123",
    "fantasia":"Kelludy",
    "companyId":"comp_xxx"
  }'
```

**✅ PASS SE:**
- Retorna `redesSociais` com pelo menos 1 rede social
- `jusbrasil` não é null (ou explicação de por que está vazio)

---

### **Teste 6: Bulk Import**
```bash
curl -X POST https://olv-itelligence-prospect.vercel.app/api/companies/bulk-import \
  -H 'Content-Type: application/json' \
  -d '{
    "companies":[
      {"cnpj":"06.990.590/0001-23","fantasia":"Kelludy"},
      {"cnpj":"18.627.195/0001-60","fantasia":"Master"}
    ]
  }'
```

**✅ PASS SE:**
- Retorna `data.success.length >= 1`
- Tempo <60s para 2 empresas

---

### **Teste 7: Maturity Calculator**
```bash
curl -X POST https://olv-itelligence-prospect.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_xxx",
    "vendor":"TOTVS",
    "detectedStack":{
      "erp":[{"product":"SAP S/4HANA","vendor":"SAP","confidence":90}],
      "cloud":[{"product":"AWS","vendor":"Amazon","confidence":85}]
    },
    "sources":{"manual":true}
  }'
```

**✅ PASS SE:**
- Retorna `scores.overall` entre 0-100
- `fit.products` contém produtos TOTVS

---

## 📊 **RESULTADO ESPERADO**

| Teste | Status | Tempo | Observação |
|-------|--------|-------|------------|
| Health Check | ✅ | <1s | Sempre deve funcionar |
| Smart-Search | ✅ | <5s | **SEM 504** |
| Minimal-Search | ✅ | <2s | Fallback de emergência |
| Enrich | ✅ | <60s | Pode demorar, mas não timeout |
| Digital Presence | ✅ | <10s | Redes sociais reais |
| Bulk Import | ✅ | <60s | 2 empresas |
| Maturity | ✅ | <5s | Cálculo rápido |

---

## 🚨 **SE ALGUM TESTE FALHAR**

### **Erro 404 (Endpoint não encontrado):**
**Solução:** Reexecutar `node scripts/olv-ensure.mjs` e fazer novo deploy.

### **Erro 500 (Internal Server Error):**
**Solução:** Verificar logs do Vercel:
```
https://vercel.com/seu-projeto/deployments/[deployment-id]/functions
```

### **Erro 504 (Timeout - ainda persiste):**
**Solução:** Usar `minimal-search` (salva sem buscar ReceitaWS):
```bash
curl -X POST https://seu-app.vercel.app/api/companies/minimal-search \
  -H 'Content-Type: application/json' \
  -d '{"cnpj":"06.990.590/0001-23","name":"Teste Manual"}'
```

### **Erro "Supabase envs ausentes":**
**Solução:** Adicionar variáveis no Vercel:
```
Settings → Environment Variables → Add
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📞 **VALIDAÇÃO COM O USUÁRIO**

Marcos, por favor execute os **7 testes acima** e me informe:

1. ✅ **Quantos passaram?** (0-7)
2. ❌ **Qual falhou?** (número do teste)
3. 📊 **Tempo de resposta** de cada um
4. 📝 **Mensagem de erro** (se houver)

Com essas informações, farei ajustes finais se necessário.

---

**✅ SISTEMA PRONTO PARA VALIDAÇÃO!**

