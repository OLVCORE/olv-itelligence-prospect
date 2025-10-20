# 🔗 APIs PARA B2B INTELLIGENCE - Links e Setup

## ✅ **APIs QUE VOCÊ JÁ TEM:**

### **1. Hunter.io ($49/mês) - Email Discovery**
```
✅ JÁ CONTRATADO
Login: https://hunter.io/users/sign_in
Dashboard: https://hunter.io/dashboard
API Key: Settings → API → Copy Key
```

**Como configurar:**
```env
# .env.local
HUNTER_API_KEY=seu_hunter_api_key_aqui
```

---

## 🆓 **APIs GRATUITAS (Para Começar):**

### **2. Apollo.io (GRÁTIS) - Email + Phone**
```
✅ GRÁTIS para começar!
Signup: https://app.apollo.io/#/signup
Free Tier: 50 email credits/mês
Upgrade: $49/mês (ilimitado)
```

**Como configurar:**
```env
# .env.local
APOLLO_API_KEY=seu_apollo_api_key_aqui
```

**Como obter API key:**
1. Criar conta grátis
2. Settings → API → Generate New Key
3. Copiar e colar no .env

---

## 🤖 **PHANTOM BUSTER - Sales Navigator Scraper:**

### **LINK DIRETO:**
```
https://phantombuster.com/
```

### **PLANOS:**

#### **Starter ($30/mês):**
```
500 actions/mês
~25 empresas completas/mês
~100 decisores/mês

LINK: https://phantombuster.com/pricing
```

#### **Pro ($100/mês) - RECOMENDADO:**
```
2.000 actions/mês
~100 empresas completas/mês
~400 decisores/mês

LINK: https://phantombuster.com/pricing
```

#### **Team ($300/mês):**
```
10.000 actions/mês
~500 empresas completas/mês
~2.000 decisores/mês

LINK: https://phantombuster.com/pricing
```

### **PHANTOMS NECESSÁRIOS:**

1. **LinkedIn Sales Navigator Search Export**
```
https://phantombuster.com/automations/linkedin/3112/linkedin-sales-navigator-search-export
```

2. **LinkedIn Profile Scraper**
```
https://phantombuster.com/automations/linkedin/3112/linkedin-profile-scraper
```

3. **LinkedIn Company Employees Export**
```
https://phantombuster.com/automations/linkedin/3308/linkedin-company-employees-export
```

### **Como configurar:**
```env
# .env.local
PHANTOM_BUSTER_API_KEY=seu_phantom_api_key_aqui
```

**Como obter API key:**
1. Criar conta: https://phantombuster.com/
2. Dashboard → API → Generate Key
3. Copiar e colar no .env

---

## 💰 **CUSTO TOTAL RECOMENDADO (Início):**

```
Hunter.io Basic: $49/mês ✅ (JÁ TEM)
Apollo.io Free: $0/mês ✅ (GRÁTIS)
Phantom Buster Pro: $100/mês

TOTAL: $149/mês ($100 se já tem Hunter)

CAPACIDADE:
- ~100 empresas/mês completas
- ~400 decisores/mês
- Email + Phone discovery
- Sales Navigator scraping
```

---

## 📈 **UPGRADE PATH (Conforme Volume Cresce):**

### **FASE 1 (Agora):**
```
Hunter.io: $49/mês ✅
Apollo.io: Grátis ✅
Phantom Buster Pro: $100/mês
TOTAL: $149/mês
```

### **FASE 2 (50-100 empresas/mês):**
```
Apollo.io Basic: $99/mês (upgrade)
Phantom Buster Pro: $100/mês
TOTAL: $199/mês
```

### **FASE 3 (200-500 empresas/mês):**
```
Apollo.io Professional: $149/mês
Phantom Buster Team: $300/mês
TOTAL: $449/mês
```

---

## 🔧 **SETUP RÁPIDO (15 minutos):**

### **PASSO 1: Apollo.io (GRÁTIS):**
```bash
1. https://app.apollo.io/#/signup
2. Settings → API → Generate Key
3. Copiar key
4. .env.local → APOLLO_API_KEY=xxx
```

### **PASSO 2: Phantom Buster (PRO $100):**
```bash
1. https://phantombuster.com/pricing
2. Escolher "Pro" ($100/mês)
3. Dashboard → API → Generate Key
4. .env.local → PHANTOM_BUSTER_API_KEY=xxx
5. Adicionar Phantom: "Sales Navigator Search Export"
```

### **PASSO 3: Testar:**
```bash
# No Dashboard:
Company Card → "Gerar Relatório"
→ Preview abre com ReceitaWS + Digital Presence
→ FUNCIONANDO!

Company Card → "🔍 Analisar B2B" (novo botão)
→ Modal B2B Intelligence abre
→ Busca Sales Navigator
→ Encontra decisores
→ Enriquece contatos (email/phone)
→ FUNCIONANDO!
```

---

## ✅ **VERIFICAÇÃO:**

### **APIs Configuradas:**
```bash
# Verificar .env.local:
HUNTER_API_KEY=xxx ✅ (JÁ TEM)
APOLLO_API_KEY=xxx (adicionar - GRÁTIS)
PHANTOM_BUSTER_API_KEY=xxx (adicionar - $100/mês)
```

### **Testes:**
```bash
# Testar Hunter:
curl https://api.hunter.io/v2/domain-search?domain=techcorp.com&api_key=SEU_KEY

# Testar Apollo:
curl https://api.apollo.io/v1/auth/health \
  -H "X-Api-Key: SEU_KEY"

# Testar Phantom:
curl https://api.phantombuster.com/api/v2/user \
  -H "X-Phantombuster-Key: SEU_KEY"
```

---

## 🎯 **PRIORIDADE:**

```
1. Apollo.io GRÁTIS → Configurar AGORA (0 custo)
2. Phantom Buster Pro → Assinar se aprovar ($100/mês)
3. Hunter.io → JÁ TEM ✅
```

**Links salvos neste arquivo para referência rápida! 🚀**

