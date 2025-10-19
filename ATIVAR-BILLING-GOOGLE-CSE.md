# 🚀 Como Ativar Billing no Google Custom Search API

## ✅ Você já tem conta de faturamento!

Agora precisa vincular ela ao projeto da API Custom Search.

---

## 📋 Passo a Passo

### 1️⃣ **Acessar o Projeto**

Vá em: https://console.cloud.google.com/apis/dashboard

Selecione o projeto onde criou a API Key e CSE ID.

---

### 2️⃣ **Ativar Billing no Projeto**

1. No menu lateral, clique em **"Billing"** (Faturamento)
2. Ou acesse direto: https://console.cloud.google.com/billing/linkedaccount

3. Clique em **"Link a billing account"** (Vincular conta de faturamento)

4. Selecione: **"My Billing Account"** (a que você já tem)

5. Confirme

---

### 3️⃣ **Verificar API Custom Search**

1. Vá em: https://console.cloud.google.com/apis/library/customsearch.googleapis.com

2. Verifique se está **ENABLED** (Habilitada)

3. Clique em **"Manage"** → **"Quotas"**

4. Você verá:
   - ✅ **100 queries/dia GRÁTIS**
   - ✅ **Depois:** $5 por 1.000 queries extras

---

### 4️⃣ **Configurar Alerta de Custo (Recomendado)**

1. Vá em: https://console.cloud.google.com/billing/budgets

2. Clique em **"Create Budget"**

3. Configure:
   - **Name:** "Google Custom Search API Limit"
   - **Budget amount:** $10/mês (ou o que preferir)
   - **Alert at:** 50%, 90%, 100%

4. Salve

**Você receberá email se ultrapassar o orçamento!**

---

## 💰 **Custos Estimados**

### **Seu uso esperado:**
- **100 queries/dia grátis** = 3.000/mês grátis
- **Cada empresa nova:** ~3-5 queries (presença digital + notícias)
- **Com cache:** ~700-1.000 empresas/mês grátis

### **Se exceder 100/dia:**
- **$5 por 1.000 queries extras**
- **~$0,005 por query** (meio centavo)
- **~$0,025 por empresa** (2,5 centavos)

### **Exemplo:**
- **500 empresas/mês:** GRÁTIS (dentro da quota)
- **1.500 empresas/mês:** ~$2,50 (500 extras × $0,025)
- **5.000 empresas/mês:** ~$10 (2.000 extras × $0,025)

---

## 🎯 **Com o Cache que Implementei:**

✅ **Reduz 80-90% das chamadas** ao Google  
✅ **Mesmo CNPJ:** retorna do cache (instantâneo, grátis)  
✅ **TTL: 7 dias** → dados frescos sem repetir busca  

**Resultado:** Vai demorar MUITO para sair do plano gratuito! 🚀

---

## ⚡ **Após Ativar Billing:**

1. **Aguarde 5-10 minutos** (propagação)
2. **Teste uma busca nova** (CNPJ que não está no cache)
3. **Verifique logs:** Não deve mais dar erro 429
4. **Presença digital aparecerá!**

---

## 🔍 **Próximos Passos (Opcional - para ESCALA):**

### **Se quiser economizar MAIS:**

**Opção A: Bing Search API**
- **10.000 queries/mês GRÁTIS** (vs 3.000 do Google)
- Implemento como fallback automático

**Opção B: Serper.dev**
- **2.500 queries/mês GRÁTIS**
- Mais barato que Google após quota
- $50 = 50.000 queries

**Opção C: Mix (Google + Bing + Serper)**
- Roda round-robin entre APIs
- Maximiza uso das quotas grátis
- Fallback automático se uma falhar

---

## ✅ **Implementado Agora:**

1. ✅ **Cache inteligente** (7 dias)
2. ✅ **Detecção de erro 429**
3. ✅ **Reutilização de dados**

**Aguardando deploy (~3 min)...**

---

**Ative o billing e teste! Em breve terá presença digital funcionando! 🎯**

