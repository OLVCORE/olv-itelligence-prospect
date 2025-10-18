# 🚨 ERRO CRÍTICO: supabaseKey is required

## ❌ PROBLEMA

O erro no console do browser indica que as variáveis `NEXT_PUBLIC_*` não estão disponíveis no cliente.

```
Error: supabaseKey is required.
```

---

## 🔍 DIAGNÓSTICO

As variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` **DEVEM** estar configuradas no Vercel, mas podem:

1. Não estar configuradas
2. Estar configuradas sem o prefixo `NEXT_PUBLIC_`
3. Estar configuradas apenas para alguns ambientes

---

## ✅ SOLUÇÃO: VERIFICAR E ADICIONAR NO VERCEL

### **Acesse:**
https://vercel.com/seu-projeto/settings/environment-variables

### **Verifique se existem estas variáveis:**

#### ✅ NEXT_PUBLIC_SUPABASE_URL
```
https://qtcwetabhhkhvomcrqgm.supabase.co
```
- **Ambientes:** Production, Preview, Development ✅

#### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
```
sb_publishable_LuIL5CnnUcWqoce2qHtwDw_FHiFQ3fC
```
- **Ambientes:** Production, Preview, Development ✅

#### ✅ SUPABASE_SERVICE_ROLE_KEY (server-side)
```
sb_secret_WlgrhchXiP4jYqMoETm9hw_RGxNJKH0
```
- **Ambientes:** Production, Preview, Development ✅

---

## 📋 SE NÃO EXISTIREM, ADICIONE AGORA:

1. **Clique em "Add New"**
2. **Para cada variável:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://qtcwetabhhkhvomcrqgm.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - **Save**

3. **Repita para:**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔄 APÓS ADICIONAR

1. **Redeploy:**
   - Vá em Deployments
   - Clique no último
   - **Redeploy**

2. **Aguarde 2-3 minutos**

3. **Teste novamente:**
   ```
   https://olv-itelligence-prospect.vercel.app/dashboard
   ```

---

## ⚠️ IMPORTANTE: PREFIXO NEXT_PUBLIC_

Variáveis que começam com `NEXT_PUBLIC_` são **expostas no browser** e devem conter apenas chaves públicas (anon key).

**NUNCA** use `NEXT_PUBLIC_` com:
- ❌ DATABASE_URL
- ❌ DIRECT_URL
- ❌ SUPABASE_SERVICE_ROLE_KEY
- ❌ OPENAI_API_KEY (em APIs server-side está OK)

---

## 📊 CHECKLIST DE VARIÁVEIS NO VERCEL

### **Públicas (com NEXT_PUBLIC_):**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

### **Privadas (server-side apenas):**
- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] OPENAI_API_KEY
- [ ] GOOGLE_API_KEY
- [ ] GOOGLE_CSE_ID
- [ ] HUNTER_API_KEY
- [ ] RECEITAWS_API_TOKEN
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL

---

## 🎯 AÇÃO NECESSÁRIA

**Verifique no Vercel** se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem e estão em ALL ENVIRONMENTS.

**Me responda:**
```
✅ Variáveis públicas existem no Vercel
```

**OU**

```
❌ Faltam variáveis públicas, vou adicionar agora
```

---

Assim que adicionar, faça o redeploy e o erro deve sumir!

