# 🚀 Guia Rápido: Ativar APIs de Busca

## ⚡ 3 Passos - 10 Minutos Total

---

## 1️⃣ GOOGLE CSE - Ativar Billing ($10 já creditados)

### ✅ Você já tem $10 de crédito! Só precisa vincular ao projeto.

**Link direto:** https://console.cloud.google.com/billing/linkedaccount

**Passos:**
1. Clique no **projeto** onde está a API Custom Search
2. Clique **"Link a billing account"**
3. Selecione: **"My Billing Account"**
4. Confirme

**Pronto!** Quota não vai mais limitar (tem $10 para usar).

**Custo:** $5/1.000 queries após quota grátis (100/dia)

---

## 2️⃣ BING SEARCH API - 1.000 queries/mês GRÁTIS

### ✅ Tier F1 gratuito permanente!

**Link direto:** https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7

**Passos:**
1. Login com conta Microsoft
2. Preencha:
   - **Resource Group:** Crie novo `olv-search-apis`
   - **Region:** East US
   - **Name:** `olv-bing-search`
   - **Pricing tier:** **F1 (Free - 1K txn/mês)** ⚡
3. Clique **"Review + Create"**
4. Após criar, vá em **"Keys and Endpoint"**
5. Copie **KEY 1**

**Adicionar no Vercel:**
1. https://vercel.com/seu-workspace/olv-itelligence-prospect/settings/environment-variables
2. **Name:** `BING_SEARCH_API_KEY`
3. **Value:** Cole a KEY 1
4. **Environment:** Production + Preview + Development
5. **Save** → **Redeploy**

---

## 3️⃣ SERPER.DEV - 2.500 queries/mês GRÁTIS

### ✅ Quota grátis mais generosa!

**Link direto:** https://serper.dev/signup

**Passos:**
1. Sign up (Google ou email)
2. Confirme email
3. No dashboard, copie **API Key**

**Adicionar no Vercel:**
1. https://vercel.com/seu-workspace/olv-itelligence-prospect/settings/environment-variables
2. **Name:** `SERPER_API_KEY`
3. **Value:** Cole a API Key
4. **Environment:** Production + Preview + Development
5. **Save** → **Redeploy**

---

## ✅ RESULTADO FINAL

### **Quotas Totais (GRÁTIS):**
```
Google CSE:  100/dia  = 3.000/mês
Bing Search: 1.000/mês
Serper.dev:  2.500/mês
─────────────────────────────────
TOTAL:       6.500 queries/mês GRÁTIS! 🎉
```

### **Cobertura:**
```
Cada empresa = 2-3 queries
6.500 queries = ~2.000-3.000 empresas/mês

COM CACHE (7 dias):
= ~5.000-10.000 empresas/mês! 🚀
```

---

## 🎯 Após Configurar

1. ✅ Aguarde **5-10 minutos** (propagação)
2. ✅ **Redeploy** no Vercel (automático ao salvar env vars)
3. ✅ Teste busca: `55.446.835/0002-42` (FIORDE)
4. ✅ Deve aparecer presença digital completa!

---

## 📊 Verificar se Funcionou

**Logs da Vercel após busca:**
```
[MultiSearch] 🔍 Iniciando busca SIMULTÂNEA
[MultiSearch] ✅ Google CSE: 3 resultados
[MultiSearch] ✅ Bing Search: 5 resultados
[MultiSearch] ✅ Serper.dev: 4 resultados
[MultiSearch] 🎯 RESULTADO FINAL: 12 únicos (após dedup)
```

**Se só Google:**
```
[MultiSearch] ✅ Google CSE: 3 resultados
[MultiSearch] ⚠️ Bing falhou: não configurado
[MultiSearch] ⚠️ Serper falhou: não configurado
```

---

## 💡 Prioridade

**Configure na ordem:**
1. **Google Billing** (5 min) - Resolve imediato
2. **Bing** (5 min) - 1k grátis/mês
3. **Serper** (2 min) - 2.5k grátis/mês

**Total: 12 minutos para 6.5k queries grátis/mês!** 🎯

---

**Após configurar, me avise para continuarmos!** 👍

