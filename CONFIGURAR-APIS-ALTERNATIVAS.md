# 🚀 Configurar APIs Alternativas (Bing + Serper)

## 🎯 Objetivo

Maximizar quotas gratuitas e ter fallback automático se uma API falhar.

**Total de queries grátis:**
- ✅ **Google CSE:** 100/dia = 3.000/mês
- ✅ **Bing Search:** 1.000/mês (tier gratuito)
- ✅ **Serper.dev:** 2.500/mês
- 🎉 **TOTAL:** ~6.500 queries/mês GRÁTIS!

---

## 📋 API #1: Bing Search (Microsoft Azure)

### **Quota Gratuita:**
- ✅ **1.000 transações/mês grátis** (tier F1)
- ✅ **3 queries/segundo**
- ✅ Após quota: $7 por 1.000 queries (mais barato que Google)

### **Passo a Passo:**

#### 1️⃣ Criar Conta Azure
- Vá em: https://portal.azure.com
- Crie uma conta (aceita cartão de crédito mas NÃO cobra no tier gratuito)

#### 2️⃣ Criar Recurso Bing Search
1. No portal, clique em **"Create a resource"**
2. Busque por: **"Bing Search v7"**
3. Clique em **"Create"**

#### 3️⃣ Configurar Recurso
- **Subscription:** Sua assinatura gratuita
- **Resource Group:** Crie novo (ex: `olv-search-apis`)
- **Region:** East US (ou qualquer)
- **Name:** `olv-bing-search`
- **Pricing tier:** **F1 (1K txn/mês grátis)** ⚡
- Clique em **"Review + Create"**

#### 4️⃣ Copiar API Key
1. Após criado, vá em **"Keys and Endpoint"**
2. Copie **KEY 1**
3. Anote (você vai adicionar no Vercel)

#### 5️⃣ Adicionar no Vercel
1. Vá em: https://vercel.com/seu-workspace/olv-itelligence-prospect/settings/environment-variables
2. Adicione:
   - **Name:** `BING_SEARCH_API_KEY`
   - **Value:** Cole a KEY 1
   - **Environment:** Production, Preview, Development
3. **Save**
4. **Redeploy** o projeto

---

## 📋 API #2: Serper.dev (Google Scraper)

### **Quota Gratuita:**
- ✅ **2.500 queries/mês grátis** (sign-up)
- ✅ **Ilimitado** depois (paga por uso)
- ✅ Após quota: $50 = 50.000 queries (10x mais barato que Google!)

### **Passo a Passo:**

#### 1️⃣ Criar Conta
- Vá em: https://serper.dev
- Clique em **"Start Free"**
- Login com Google ou Email

#### 2️⃣ Confirmar Email
- Verifique seu email
- Confirme a conta

#### 3️⃣ Copiar API Key
1. No dashboard, vá em **"API Key"**
2. Copie a chave (ex: `abc123...`)

#### 4️⃣ Adicionar no Vercel
1. Vá em: https://vercel.com/seu-workspace/olv-itelligence-prospect/settings/environment-variables
2. Adicione:
   - **Name:** `SERPER_API_KEY`
   - **Value:** Cole a API Key
   - **Environment:** Production, Preview, Development
3. **Save**
4. **Redeploy** o projeto

---

## ✅ Como Funciona (Automático!)

### **Sistema de Fallback Inteligente:**

```
┌─────────────────────────────────────────┐
│  Nova Busca                              │
└─────────────────────────────────────────┘
           │
           ▼
  ┌────────────────┐
  │ 1️⃣ Google CSE  │ (100/dia)
  └────────────────┘
           │
    ✅ OK? → Retorna
    ❌ 429 (quota)?
           │
           ▼
  ┌────────────────┐
  │ 2️⃣ Bing Search │ (1.000/mês)
  └────────────────┘
           │
    ✅ OK? → Retorna
    ❌ 429 (quota)?
           │
           ▼
  ┌────────────────┐
  │ 3️⃣ Serper.dev  │ (2.500/mês)
  └────────────────┘
           │
    ✅ OK? → Retorna
    ❌ Todas falharam?
           │
           ▼
  Retorna dados parciais
  (só Receita Federal)
```

---

## 💰 Custos Estimados (com 3 APIs)

### **Cenário 1: Uso Normal (500 empresas/mês)**
- **Google:** 100/dia × 30 = 3.000 queries → **GRÁTIS** ✅
- **Bing:** Não usa (Google suficiente)
- **Serper:** Não usa
- **Total:** $0/mês 🎉

### **Cenário 2: Uso Alto (2.000 empresas/mês)**
- **Google:** 3.000 queries → **GRÁTIS** ✅
- **Bing:** 1.000 queries → **GRÁTIS** ✅
- **Serper:** 2.500 queries → **GRÁTIS** ✅
- **Total:** $0/mês até 6.500 queries! 🎉

### **Cenário 3: Uso Muito Alto (10.000 empresas/mês)**
- **Google:** 3.000 queries → **GRÁTIS**
- **Bing:** 1.000 queries → **GRÁTIS** + 6.000 extras = ~$42
- **Serper:** 2.500 queries → **GRÁTIS**
- **Total:** ~$42/mês (muito melhor que só Google: $350/mês!)

---

## 🎯 Benefícios do Sistema Multi-API

1. ✅ **6.500 queries grátis/mês** (vs 3.000 só com Google)
2. ✅ **Resiliente:** Se Google cair, Bing assume
3. ✅ **Custo baixo:** Mix de APIs é 8x mais barato
4. ✅ **Zero configuração:** Funciona automaticamente
5. ✅ **Transparente:** Logs mostram qual API foi usada

---

## 📊 Monitorar Uso

### **Google:**
- https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas

### **Bing:**
- https://portal.azure.com → Seu recurso → "Metrics"

### **Serper:**
- https://serper.dev/dashboard → "Usage"

---

## ⚡ Status Atual

✅ **Implementado:** Sistema multi-API com fallback  
✅ **Google:** Ativo (você já tem)  
⏸️ **Bing:** Aguardando configuração (você faz agora)  
⏸️ **Serper:** Aguardando configuração (você faz agora)  

**Após configurar ambas APIs:**
- Redeploy automático do Vercel
- Sistema ativa fallback automaticamente
- Logs mostram qual API foi usada

---

## 🚀 Próximo Passo

**Configure AGORA:**
1. Bing (5 min): https://portal.azure.com
2. Serper (2 min): https://serper.dev

**Benefício imediato:**
- 6.500 queries grátis/mês
- Resiliente a falhas
- 8x mais barato em escala

**Deploy já está com o código pronto!** Só adicionar as keys! 🎯

