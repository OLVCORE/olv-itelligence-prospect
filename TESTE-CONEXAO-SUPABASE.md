# 🔍 TESTE DE CONEXÃO SUPABASE - DIAGNÓSTICO COMPLETO

## 🚨 ERRO PERSISTENTE:

```
Error: FATAL: Tenant or user not found
```

**Mesmo após resetar senha e atualizar variáveis, o erro continua!**

---

## 🔐 POSSIBILIDADES:

### **1. Senha está errada no Vercel**
Você atualizou mas colocou valor errado

### **2. Usuário está errado**
Pode estar usando formato incorreto

### **3. Project reference errado**
Pode não ser `qtcwetabhhkhvomcrqgm`

### **4. Região errada**
Pode não ser `aws-0-sa-east-1`

---

## ✅ SOLUÇÃO: COPIAR CONNECTION STRING DO SUPABASE

### **PASSO A PASSO DEFINITIVO:**

#### **1. No Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/qtcwetabhhkhvomcrqgm
2. Clique em **Settings** (engrenagem, canto inferior esquerdo)
3. Clique em **Database** no menu lateral
4. Role até **"Connection string"**
5. Selecione **"URI"**
6. Selecione o modo **"Transaction"** (pooler)
7. Clique em **"Copy"** ou selecione o texto

**Vai parecer com:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

#### **2. Substituir [YOUR-PASSWORD]:**

Na string copiada:
1. Localize `[YOUR-PASSWORD]`
2. Substitua por `%23Bliss2711%40` (senha encodada)
3. Adicione `&connection_limit=1` no FINAL (após `postgres`)

**Resultado:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### **3. Colar no Vercel:**

1. Vercel → Settings → Environment Variables
2. DATABASE_URL → Edit
3. APAGUE tudo
4. COLE a string montada no passo 2
5. Save

#### **4. Redesploy**

---

## 🧪 TESTE ALTERNATIVO: VERIFICAR SE POOLER ESTÁ ATIVO

### **No Supabase Dashboard:**

1. Settings → Database
2. Procure por **"Connection Pooling"**
3. Verifique se está **ENABLED**

**Se estiver desabilitado:**
- Clique em **Enable Connection Pooling**
- Selecione modo **Transaction**
- Aguarde 1-2 minutos
- Copie a nova connection string

---

## 🎯 FORMATO VISUAL DA URL

```
postgresql://
  ┌─────────────────────────────┐
  │ postgres.qtcwetabhhkhvomcrqgm │ ← USUÁRIO (COM project-ref)
  └─────────────────────────────┘
  :
  ┌────────────────┐
  │ %23Bliss2711%40 │ ← SENHA (# e @ encodados)
  └────────────────┘
  @
  ┌─────────────────────────────────────────┐
  │ aws-0-sa-east-1.pooler.supabase.com     │ ← HOST (pooler)
  └─────────────────────────────────────────┘
  :
  ┌────┐
  │ 6543│ ← PORTA (pooler)
  └────┘
  /
  ┌────────┐
  │ postgres│ ← DATABASE
  └────────┘
  ?
  ┌───────────────────────────────────┐
  │ pgbouncer=true&connection_limit=1 │ ← PARÂMETROS
  └───────────────────────────────────┘
```

---

## 📋 CHECKLIST - VERIFIQUE CADA PARTE:

No Vercel, sua DATABASE_URL deve ter:

```
[✓] postgresql://
[✓] postgres.qtcwetabhhkhvomcrqgm (não "postgres")
[✓] :
[✓] %23Bliss2711%40 (não "%23Bliss2711%23")
[✓] @
[✓] aws-0-sa-east-1.pooler.supabase.com
[✓] :6543
[✓] /postgres
[✓] ?pgbouncer=true&connection_limit=1
```

---

## 🔍 DEBUGGING - ME ENVIE:

Para eu ajudar melhor, me envie:

1. **Screenshot** da connection string no Supabase (pode esconder a senha)
2. **Primeira parte** da DATABASE_URL do Vercel (até o `@`):
   ```
   postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@...
   ```
3. **Confirme:** O pooler está ENABLED no Supabase?
4. **Confirme:** O project reference é realmente `qtcwetabhhkhvomcrqgm`?

---

## 🎯 TESTE SIMPLES:

**No Supabase, copie a connection string e me envie assim:**

```
postgresql://postgres.qtcwetabhhkhvomcrqgm:[YOUR-PASSWORD]@HOST:PORT/DATABASE
```

Eu vou montar a URL correta para você colar no Vercel.

---

**Aguardando as informações para identificar o problema exato!** 🔍

