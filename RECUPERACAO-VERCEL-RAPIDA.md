# ⚡ RECUPERAÇÃO RÁPIDA - Vercel Sumiu

**Ação Imediata:** Reimportar projeto do GitHub

---

## 🚀 PASSO A PASSO (10 MINUTOS)

### 1. Acessar Vercel
```
https://vercel.com/dashboard
```

### 2. Add New Project
- Botão **"Add New..."** → **"Project"**

### 3. Import from GitHub
- Procurar: **"olv-itelligence-prospect"**
- Se não aparecer:
  - **"Adjust GitHub App Permissions"**
  - Marcar repositório
  - Save
- Clicar **"Import"**

### 4. Settings
```
Framework: Next.js
Root: ./
Build: next build
Install: npm install
```

### 5. Environment Variables (COPIAR TODAS)

**⚠️ CRÍTICO - Sem estas vars o sistema não funciona:**

```bash
# === SUPABASE (OBRIGATÓRIO) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# === NEXTAUTH (OBRIGATÓRIO) ===
NEXTAUTH_URL=https://SEU-DOMINIO.vercel.app
NEXTAUTH_SECRET=

# === OPENAI (OBRIGATÓRIO) ===
OPENAI_API_KEY=

# === GOOGLE CSE (OPCIONAL MAS RECOMENDADO) ===
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_ID=

# === INTEGRAÇÕES EXTERNAS (OPCIONAL) ===
SERPER_API_KEY=
APOLLO_API_KEY=
HUNTER_API_KEY=
PHANTOM_BUSTER_API_KEY=

# === OLV ADMIN (NOVO!) ===
OLV_ADMIN_KEY=
```

**Se não tem os valores:**
- Supabase: Dashboard → Settings → API
- OpenAI: https://platform.openai.com/api-keys
- NEXTAUTH_SECRET: `openssl rand -base64 32`
- OLV_ADMIN_KEY: `openssl rand -base64 32`

### 6. Deploy
- Clicar **"Deploy"**
- Aguardar 2-3 minutos
- Verificar status: ✅ Ready

### 7. Aplicar SQL (UMA VEZ)

Supabase → SQL Editor → Executar:

```sql
-- Apenas se tabelas não existirem
CREATE TABLE IF NOT EXISTS "CompanyMonitor" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "domain" TEXT,
  "linkedinUrl" TEXT,
  "phantomAgentId" TEXT,
  "cadence" TEXT NOT NULL,
  "active" BOOLEAN DEFAULT true,
  "lastRunAt" TIMESTAMP,
  "nextRunAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "IngestRun" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "finishedAt" TIMESTAMP,
  "summary" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "IngestLock" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT UNIQUE NOT NULL,
  "lockedAt" TIMESTAMP DEFAULT NOW(),
  "holder" TEXT,
  "note" TEXT
);

CREATE TABLE IF NOT EXISTS "ApiAuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ts" TIMESTAMP DEFAULT NOW(),
  "actor" TEXT,
  "action" TEXT,
  "target" TEXT,
  "meta" JSONB,
  "ip" TEXT,
  "route" TEXT,
  "level" TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_monitor_company_active ON "CompanyMonitor"("companyId", "active");
CREATE INDEX IF NOT EXISTS idx_monitor_nextRun ON "CompanyMonitor"("nextRunAt");
CREATE INDEX IF NOT EXISTS idx_ingest_company_started ON "IngestRun"("companyId", "startedAt");
CREATE INDEX IF NOT EXISTS idx_api_audit_ts ON "ApiAuditLog"("ts");
```

### 8. Testar
```bash
curl https://SEU-DOMINIO.vercel.app/api/health
```

**Se retornou `{"ok":true,...}` → SUCESSO!** ✅

---

## 📋 CHECKLIST RÁPIDO

- [ ] Vercel Dashboard acessado
- [ ] Projeto reimportado do GitHub
- [ ] Env vars configuradas (mínimo: Supabase + OpenAI + NextAuth)
- [ ] Deploy concluído com sucesso (✅ Ready)
- [ ] SQL executado no Supabase
- [ ] Health check funcionando
- [ ] Dashboard acessível (`/dashboard`)

---

## 🆘 PROBLEMAS COMUNS

### Build falhou
**Erro:** `Module not found` ou `Type error`

**Solução:**
```bash
# Local
npm install
npm run build

# Se passar local, é problema de env vars no Vercel
```

### 500 Internal Server Error
**Causa:** Env vars ausentes.

**Solução:** Verificar todas as vars obrigatórias (Supabase, OpenAI, NextAuth).

### Supabase connection failed
**Causa:** DATABASE_URL ou DIRECT_URL inválida.

**Solução:** 
- Supabase → Settings → Database → Connection String
- Copiar exatamente como está

---

## ⏱️ TEMPO ESTIMADO

- **Reimport:** 2 minutos
- **Env vars:** 3 minutos
- **Deploy:** 3 minutos
- **SQL:** 2 minutos

**TOTAL:** ~10 minutos para recuperação completa

---

**Documento criado:** 20/10/2025, 20:30  
**Objetivo:** Recuperação rápida do projeto no Vercel

