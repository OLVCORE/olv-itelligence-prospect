# 🔍 VERIFICAR CONFIGURAÇÕES DO SUPABASE - POOLER

## 🚨 PROBLEMA ATUAL:

```
Error: FATAL: Tenant or user not found
```

**Mesmo com senha correta (`#Bliss2711@`), a conexão está falhando!**

---

## ✅ VERIFICAÇÕES NECESSÁRIAS NO SUPABASE:

### **1. VERIFICAR SE POOLER ESTÁ ATIVO:**

1. Acesse: https://supabase.com/dashboard/project/qtcwetabhhkhvomcrqgm/settings/database
2. Procure por **"Connection Pooling"** ou **"Pooler"**
3. Verifique se está **ENABLED** (ativado)
4. Se estiver desabilitado, **ATIVE** o pooler

**Screenshot esperado:**
```
Connection Pooling
[✓] Enabled
Mode: Transaction
Port: 6543
```

---

### **2. VERIFICAR CONNECTION STRING NO SUPABASE:**

1. No mesmo painel, procure por **"Connection string"**
2. Selecione **"Connection pooling"** ou **"Transaction mode"**
3. Copie a connection string que aparece
4. Compare com a que você configurou no Vercel

**Formato esperado:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### **3. VERIFICAR USUÁRIO CORRETO:**

Para **Connection Pooling (porta 6543)**, o usuário deve ser:
```
postgres.qtcwetabhhkhvomcrqgm
```

**NÃO** apenas `postgres` (isso é para porta 5432).

---

### **4. VERIFICAR SE NÃO TEM ESPAÇOS/CARACTERES EXTRAS:**

No Vercel, edite a DATABASE_URL e verifique:
- ❌ Não tem espaços no início ou fim
- ❌ Não tem quebras de linha
- ❌ Não tem caracteres invisíveis
- ❌ Não tem aspas extras

---

## 🧪 TESTE ALTERNATIVO: COPIAR DO SUPABASE

### **No Supabase Dashboard:**

1. Settings → Database → Connection string
2. Selecione **"URI"** (não "JDBC" ou "ODBC")
3. Selecione **"Transaction mode"** ou **"Session mode"**
4. Copie a connection string COMPLETA
5. Ela vai parecer com:
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### **Substituir senha:**

1. Na string copiada, substitua `[PASSWORD]` por `%23Bliss2711%40`
2. Adicione `&connection_limit=1` no final
3. Resultado final:
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&connection_limit=1
```

---

## 🔐 TESTE A SENHA MANUALMENTE:

### **Usar ferramenta online:**

1. Acesse: https://www.urlencoder.org/
2. Cole: `#Bliss2711@`
3. Clique em "Encode"
4. Resultado deve ser: `%23Bliss2711%40`

Se for diferente, use o resultado da ferramenta.

---

## 📋 CHECKLIST DE VERIFICAÇÃO:

No Vercel, sua DATABASE_URL deve ter:

- [ ] `postgresql://` (protocolo)
- [ ] `postgres.qtcwetabhhkhvomcrqgm` (usuário COM project-ref)
- [ ] `:` (separador)
- [ ] `%23Bliss2711%40` (senha encodada)
- [ ] `@aws-0-sa-east-1.pooler.supabase.com` (host do pooler)
- [ ] `:6543` (porta do pooler)
- [ ] `/postgres` (database)
- [ ] `?pgbouncer=true&connection_limit=1` (parâmetros)

**URL COMPLETA:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6643/postgres?pgbouncer=true&connection_limit=1
```

---

## 🔍 POSSÍVEIS PROBLEMAS:

### **A. Pooler não está ativo no Supabase**
**Solução:** Ativar em Settings → Database → Connection Pooling

### **B. Região errada**
**Solução:** Verificar se é realmente `aws-0-sa-east-1` ou pode ser `sa-east-1`

### **C. Senha tem caracteres extras**
**Solução:** Verificar no Supabase se a senha é exatamente `#Bliss2711@`

### **D. Project reference errado**
**Solução:** Confirmar que é `qtcwetabhhkhvomcrqgm`

---

## 🎯 AÇÃO IMEDIATA:

**Me envie:**
1. Screenshot da seção "Connection Pooling" no Supabase
2. A connection string que aparece no Supabase (com [PASSWORD])
3. Confirme se há alguma configuração de "Allowed IPs" ou firewall

**Ou teste:**

Copie a connection string DIRETO do Supabase (com `[PASSWORD]`), substitua `[PASSWORD]` por `%23Bliss2711%40`, adicione `&connection_limit=1`, e cole no Vercel.

---

**Aguardando informações para identificar o problema exato!**

