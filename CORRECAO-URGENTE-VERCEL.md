# 🔴 CORREÇÃO URGENTE - VARIÁVEIS VERCEL

## ⚠️ PROBLEMAS IDENTIFICADOS:

### **1. DATABASE_URL - INCORRETA**
**Atual:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%23@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Problemas:**
- ❌ Senha errada: `%23Bliss2711%23` (deveria ser `%23Bliss2711%40`)
- ❌ Falta `&connection_limit=1` no final
- ❌ Isso causa timeout e erros de conexão

**CORRIGIR PARA:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

### **2. DIRECT_URL - FALTANDO (CRÍTICO)**
**Atual:** NÃO EXISTE

**Problema:**
- ❌ Prisma não consegue rodar migrações
- ❌ Build falha ou pula migrações
- ❌ Tabelas não são criadas automaticamente

**ADICIONAR:**
```
postgresql://postgres:%23Bliss2711%40@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require
```

---

## ✅ AÇÃO IMEDIATA - CORRIGIR NO VERCEL

### **PASSO 1: EDITAR DATABASE_URL**

1. Acesse: https://vercel.com/dashboard
2. Seu Projeto → Settings → Environment Variables
3. Localize `DATABASE_URL`
4. Clique em **Edit** (lápis)
5. Substitua o valor por:
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
6. Certifique-se que está marcado: **Production**, **Preview** E **Development**
7. Clique em **Save**

---

### **PASSO 2: ADICIONAR DIRECT_URL**

1. No mesmo painel de Environment Variables
2. Clique em **Add New**
3. Preencha:
   - **Key:** `DIRECT_URL`
   - **Value:** 
```
postgresql://postgres:%23Bliss2711%40@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require
```
4. Selecione: **Production**, **Preview** E **Development**
5. Clique em **Save**

---

### **PASSO 3: REDESPLOY**

1. Aba **Deployments**
2. Último deploy → 3 pontos (...)
3. **Redeploy**
4. Aguarde 2-3 minutos

---

### **PASSO 4: VALIDAR**

Teste após deploy:

```bash
# 1. Testar conexão
https://olv-itelligence-prospect.vercel.app/api/test-db

# Esperado:
{
  "success": true,
  "status": "connected",
  "message": "🎉 Banco de dados Supabase funcionando corretamente!"
}

# 2. Verificar logs de build
# Vercel → Deployments → Latest → Build Logs
# Procure por: "prisma migrate deploy" (deve executar sem erros)

# 3. Testar dashboard
https://olv-itelligence-prospect.vercel.app/dashboard
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### **DATABASE_URL:**
| Aspecto | ANTES (Errado) | DEPOIS (Correto) |
|---------|----------------|------------------|
| Senha | `%23Bliss2711%23` | `%23Bliss2711%40` |
| Connection Limit | ❌ Ausente | ✅ `&connection_limit=1` |
| Causa Erro | Timeout, P1001 | ✅ Funciona |

### **DIRECT_URL:**
| Aspecto | ANTES (Errado) | DEPOIS (Correto) |
|---------|----------------|------------------|
| Existe? | ❌ Não | ✅ Sim |
| Migrações | ❌ Não rodam | ✅ Rodam automaticamente |
| Porta | - | ✅ 5432 (direta) |
| SSL | - | ✅ `sslmode=require` |

---

## 🔐 SENHA URL ENCODING - EXPLICAÇÃO

**Senha original:** `#Bliss2711@`

**Conversão carácter por carácter:**
- `#` → `%23`
- `B` → `B` (letra normal)
- `l` → `l` (letra normal)
- `i` → `i` (letra normal)
- `s` → `s` (letra normal)
- `s` → `s` (letra normal)
- `2` → `2` (número normal)
- `7` → `7` (número normal)
- `1` → `1` (número normal)
- `1` → `1` (número normal)
- `@` → `%40`

**Resultado final:** `%23Bliss2711%40`

**⚠️ VOCÊ USOU:** `%23Bliss2711%23` (errado - faltou o `@` no final!)

---

## 📋 VARIÁVEIS COMPLETAS - CHECKLIST

### ✅ Corretas (não precisa alterar):
- [x] `NEXT_PUBLIC_SUPABASE_URL` ✅
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- [x] `RECEITAWS_API_TOKEN` ✅
- [x] `HUNTER_API_KEY` ✅
- [x] `OPENAI_API_KEY` ✅
- [x] `GOOGLE_API_KEY` ✅
- [x] `GOOGLE_CSE_ID` ✅
- [x] `NEXTAUTH_URL` ✅
- [x] `NEXTAUTH_SECRET` ✅

### 🔴 Incorretas (CORRIGIR AGORA):
- [ ] `DATABASE_URL` ❌ Senha errada + falta connection_limit
- [ ] `DIRECT_URL` ❌ NÃO EXISTE (adicionar)

---

## 🎯 RESULTADO ESPERADO

### **Antes da correção:**
❌ Build pode completar mas migrações não rodam  
❌ `/api/test-db` retorna erro ou timeout  
❌ Dashboard pode não funcionar corretamente  
❌ Dados não persistem  

### **Após correção:**
✅ Build completa COM migrações executadas  
✅ `/api/test-db` retorna `success: true`  
✅ Dashboard funciona perfeitamente  
✅ Dados persistem no Supabase  
✅ Todas as funcionalidades operacionais  

---

## 🔍 COMO IDENTIFICAR SE FUNCIONOU

### **1. Logs de Build (Vercel)**
```
✓ Running "prisma migrate deploy"
✓ 1 migration(s) applied successfully
✓ Prisma Client generated successfully
```

### **2. Resposta /api/test-db**
```json
{
  "success": true,
  "status": "connected",
  "connection": {
    "provider": "PostgreSQL (Supabase)",
    "region": "sa-east-1 (AWS São Paulo)"
  },
  "tests": {
    "counts": {
      "users": 0,
      "companies": 0,
      "projects": 0
    }
  }
}
```

### **3. Supabase Dashboard**
- Acesse: https://supabase.com/dashboard/project/qtcwetabhhkhvomcrqgm
- Table Editor → Deve mostrar todas as tabelas:
  - User
  - Company
  - Project
  - TechStack
  - Contact
  - Benchmark
  - Canvas
  - Report
  - Alert
  - Session
  - AuditLog

---

## ⚠️ SE AINDA NÃO FUNCIONAR

### **Erro: "password authentication failed"**
**Causa:** Senha ainda incorreta  
**Solução:** Verifique se usou `%23Bliss2711%40` (não `%23Bliss2711%23`)

### **Erro: "Can't reach database server"**
**Causa:** Host ou porta errados  
**Solução:** Copie EXATAMENTE as URLs deste documento

### **Erro: "P1012: Schema not found"**
**Causa:** Migrações não rodaram  
**Solução:** Verifique se `DIRECT_URL` foi adicionada e redesploy

### **Build OK mas dados não persistem**
**Causa:** Conexão funcionando mas sem `connection_limit`  
**Solução:** Adicione `&connection_limit=1` no final da `DATABASE_URL`

---

## 📞 SUPORTE

**Se após seguir todos os passos ainda houver erro:**

1. Acesse: https://olv-itelligence-prospect.vercel.app/api/test-db
2. Copie a resposta completa
3. Vercel → Deployments → Latest → Function Logs
4. Copie os logs do erro
5. Me envie ambos

---

**⏱️ Tempo estimado:** 5 minutos  
**🔴 Prioridade:** CRÍTICA  
**📍 Status:** Aguardando correção

---

**Documento gerado em:** 2025-01-17  
**Versão:** 2.0 - Correção Urgente

