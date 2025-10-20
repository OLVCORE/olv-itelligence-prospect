# ⚡ SETUP RÁPIDO - APIs B2B Intelligence (15 minutos)

## 🎯 **OBJETIVO:**
Configurar APIs para B2B Intelligence em **15 minutos**

---

## 📋 **PASSO 1: Apollo.io (GRÁTIS - 5 min)**

### **1.1 Criar Conta:**
```
https://app.apollo.io/#/signup
```

### **1.2 Obter API Key:**
```
1. Login no Apollo
2. Settings (canto superior direito)
3. API (menu lateral esquerdo)
4. "Generate New Key"
5. Copiar a key
```

### **1.3 Adicionar no .env.local:**
```bash
APOLLO_API_KEY=sua_apollo_api_key_aqui
```

### **1.4 Testar:**
```bash
curl https://api.apollo.io/v1/auth/health \
  -H "X-Api-Key: SUA_KEY"
  
# Resposta: {"status": "ok"}
```

**✅ PRONTO! Apollo configurado!**

---

## 📋 **PASSO 2: Phantom Buster PRO ($100/mês - 5 min)**

### **2.1 Assinar Plano:**
```
https://phantombuster.com/pricing

Click em "Pro" → $100/month
- 2.000 actions/mês
- ~100 empresas/mês
- ~400 decisores/mês
```

### **2.2 Obter API Key:**
```
1. Login no Phantom Buster
2. Dashboard
3. API (menu superior)
4. "Generate API Key"
5. Copiar a key
```

### **2.3 Adicionar no .env.local:**
```bash
PHANTOM_BUSTER_API_KEY=sua_phantom_api_key_aqui
```

### **2.4 Instalar Phantoms:**
```
1. Dashboard → "New Phantom"
2. Buscar: "LinkedIn Sales Navigator Search Export"
3. Click "Use this Phantom"
4. Copiar ID do Phantom (vai precisar no código)
```

**✅ PRONTO! Phantom configurado!**

---

## 📋 **PASSO 3: Hunter.io (JÁ TEM ✅ - 0 min)**

### **Você já tem Hunter.io configurado!**
```
✅ HUNTER_API_KEY já está no .env
✅ Plano Basic ($49/mês) ativo
✅ 1.000 emails/mês disponíveis
```

**Nada a fazer aqui!**

---

## 📋 **PASSO 4: Verificar .env.local (2 min)**

### **Arquivo .env.local deve ter:**
```bash
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
DATABASE_URL="postgresql://..."

# B2B Intelligence
HUNTER_API_KEY=... ✅ (já tem)
APOLLO_API_KEY=... ← Adicionar (grátis)
PHANTOM_BUSTER_API_KEY=... ← Adicionar ($100/mês)

# Opcional (por enquanto)
OPENAI_API_KEY=...
GOOGLE_CSE_API_KEY=...
GOOGLE_CSE_ID=...
```

---

## 📋 **PASSO 5: Restart Dev Server (1 min)**

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

**✅ APIs carregadas!**

---

## 🧪 **PASSO 6: TESTAR (2 min)**

### **Teste 1: Gerar Relatório (ReceitaWS)**
```
1. Dashboard → Card de empresa
2. Click "Gerar Relatório"
3. Aguardar 5-10 segundos
4. Preview Modal deve abrir ✅
```

### **Teste 2: Analisar B2B (Sales Navigator)**
```
1. Dashboard → Card de empresa
2. Click "Analisar B2B"
3. Modal B2B abre
4. Click "Iniciar Análise B2B"
5. Aguardar 15-30 segundos
6. Tabs mostram: Overview, Decisores, Sinais, Vendor Fit ✅
```

### **Teste 3: Perfil Digital IA**
```
1. Dashboard → Tab "Pesquisa em Massa"
2. Click "✨ Perfil Digital IA"
3. Preencher nome + empresa
4. Click "Iniciar Busca Inteligente"
5. 4 tabs aparecem ✅
```

---

## ✅ **SETUP COMPLETO EM 15 MINUTOS!**

### **CUSTO TOTAL:**
```
Hunter.io: $49/mês ✅ (já tem)
Apollo.io: $0/mês ✅ (grátis)
Phantom Buster: $100/mês (assinar)

TOTAL: $149/mês ($100 se já tem Hunter)
```

### **CAPACIDADE:**
```
~100 empresas/mês completas
~400 decisores/mês
Email + Phone discovery
Sales Navigator scraping
```

---

## 🔗 **LINKS RÁPIDOS:**

```
Apollo signup: https://app.apollo.io/#/signup
Phantom pricing: https://phantombuster.com/pricing
Hunter login: https://hunter.io/users/sign_in
```

**Sistema pronto para prospecção ativa! 🚀**

