# ⚡ GUIA RÁPIDO: Configurar Google Custom Search Engine

## 🎯 Objetivo
Obter `GOOGLE_API_KEY` e `GOOGLE_CSE_ID` para fazer a busca profunda funcionar.

**SEM ESSAS KEYS, A BUSCA NÃO FUNCIONA!**

---

## 📋 PASSO 1: Obter Google API Key (5 minutos)

### 1.1 Acessar Google Cloud Console
1. Vá em: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Se não tiver projeto, clique em "Select a project" > "New Project"
4. Dê um nome: `OLV Intelligence` > Create

### 1.2 Ativar API do Custom Search
1. No menu lateral, vá em: **APIs & Services** > **Library**
2. Pesquise por: `Custom Search API`
3. Clique em **Custom Search API**
4. Clique em **ENABLE**

### 1.3 Criar API Key
1. No menu lateral, vá em: **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS** > **API key**
3. Copie a key gerada (ex: `AIzaSyABC123...`)
4. **GUARDAR:** Esta é sua `GOOGLE_API_KEY`

### 1.4 Restringir a Key (Segurança)
1. Clique em "RESTRICT KEY"
2. Em "Application restrictions", selecione "HTTP referrers"
3. Adicione: `*.vercel.app/*`
4. Em "API restrictions", selecione "Restrict key"
5. Marque apenas: **Custom Search API**
6. Clique em "SAVE"

---

## 📋 PASSO 2: Criar Custom Search Engine (5 minutos)

### 2.1 Acessar Programmable Search Engine
1. Vá em: https://programmablesearchengine.google.com/
2. Faça login com a mesma conta Google
3. Clique em **Add** (ou "Criar")

### 2.2 Configurar o Search Engine
1. **Nome**: `OLV Intelligence Search`
2. **O que pesquisar:** Selecione "Search the entire web"
3. **Configurações de pesquisa:**
   - Marque: ☑️ "Search the entire web"
   - Marque: ☑️ "Image search" (opcional)
   - Marque: ☑️ "SafeSearch" (recomendado)
4. Clique em **CREATE**

### 2.3 Obter o CSE ID
1. Após criar, você verá o **Search engine ID** (ou "ID do mecanismo de pesquisa")
2. Copie o ID (ex: `a1b2c3d4e5f6g7h8i`)
3. **GUARDAR:** Este é seu `GOOGLE_CSE_ID`

### 2.4 Ajustar Configurações (Importante!)
1. Clique em **Setup** (ou "Configuração")
2. Em "Search features":
   - Ative: **Autocomplete**
   - Ative: **Spelling suggestions**
3. Clique em **Update** (ou "Atualizar")

---

## 📋 PASSO 3: Adicionar no Vercel (2 minutos)

### 3.1 Acessar Vercel
1. Vá em: https://vercel.com/seu-workspace/olv-itelligence-prospect/settings/environment-variables
2. Clique em **Add New**

### 3.2 Adicionar GOOGLE_API_KEY
1. **Name**: `GOOGLE_API_KEY`
2. **Value**: Cole a API Key do Passo 1.3
3. **Environment**: Marque: Production, Preview, Development
4. Clique em **Save**

### 3.3 Adicionar GOOGLE_CSE_ID
1. Clique em **Add New** novamente
2. **Name**: `GOOGLE_CSE_ID`
3. **Value**: Cole o CSE ID do Passo 2.3
4. **Environment**: Marque: Production, Preview, Development
5. Clique em **Save**

### 3.4 Redeploy
1. Vá em: https://vercel.com/seu-workspace/olv-itelligence-prospect/deployments
2. Clique nos "..." do último deployment
3. Clique em **Redeploy**
4. Aguarde 2-3 minutos

---

## ✅ TESTAR

Após o redeploy:

1. Abra o dashboard
2. Pesquise um CNPJ: `33.683.111/0001-07` (TOTVS)
3. **Aguarde 30 segundos**
4. Verifique se a seção "Presença Digital" está preenchida com:
   - ✅ Website oficial
   - ✅ Redes sociais
   - ✅ Notícias

Se ainda não funcionar, verifique os logs no Vercel.

---

## 💰 Custos

**Google Custom Search API:**
- **Gratuito:** 100 consultas/dia
- **Após 100:** $5 por 1.000 consultas

Para o OLV, com uso moderado, deve ficar dentro do limite gratuito.

---

## 🚨 ALTERNATIVA TEMPORÁRIA (Se não quiser configurar agora)

Se preferir testar sem Google CSE, posso criar um mock temporário que simula dados de presença digital para você validar o fluxo primeiro. Mas **para produção, as keys são obrigatórias**.

---

**Tem alguma dúvida nesse processo? Me avise e eu te ajudo!**

