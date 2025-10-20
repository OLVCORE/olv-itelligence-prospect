# 🔴 DIAGNÓSTICO: Projeto Sumiu do Vercel

**Data:** 20 de Outubro de 2025  
**Problema:** Projeto OLV Intelligence não aparece no Vercel Dashboard

---

## ✅ STATUS DO CÓDIGO (VERIFICADO)

| Item | Status | Detalhes |
|------|--------|----------|
| **Git Status** | ✅ OK | Branch main sincronizado |
| **Último Commit** | ✅ OK | `5ec8471` - Final Upgrade Pack |
| **GitHub** | ✅ OK | https://github.com/OLVCORE/olv-itelligence-prospect |
| **Commits Pushados** | ✅ OK | 5 commits hoje, todos em origin/main |
| **Link Local Vercel** | ❌ Ausente | Pasta `.vercel` não existe |

**CONCLUSÃO:** O código está perfeito e sincronizado no GitHub. O problema é **exclusivamente no Vercel**.

---

## 🔍 POSSÍVEIS CAUSAS

### 1. Projeto Foi Deletado Acidentalmente
**Sintoma:** Não aparece em nenhuma lista no Vercel Dashboard.

**Como Verificar:**
- Acessar: https://vercel.com/dashboard
- Procurar por: "olv-intelligence" ou "olv-itelligence-prospect"
- Verificar aba "All Projects"

**Solução:** Reimportar do GitHub (veja seção "Reimportar Projeto").

---

### 2. Mudança de Conta/Organização
**Sintoma:** Projeto existe, mas em outra conta/organização.

**Como Verificar:**
- Clicar no avatar (canto superior direito)
- Verificar se está na conta/organização correta
- Alternar entre "Personal Account" e organizações (se houver)

**Solução:** 
- Trocar para a conta/organização correta
- Ou transferir projeto de volta

---

### 3. Projeto Pausado/Archived
**Sintoma:** Não aparece na lista principal, mas pode estar em "Archived".

**Como Verificar:**
- Dashboard → Settings (do workspace)
- Procurar seção "Archived Projects"

**Solução:**
- Restore project from archive

---

### 4. Deploy Falhou e Projeto Ficou "Fantasma"
**Sintoma:** Projeto existe, mas última build falhou e ficou invisível.

**Como Verificar:**
- Vercel Dashboard → Git Integrations
- Verificar se repositório ainda está conectado

**Solução:**
- Reconectar repositório GitHub
- Triggerar novo deploy

---

### 5. Problema de Permissões/Token GitHub
**Sintoma:** Vercel perdeu acesso ao repositório GitHub.

**Como Verificar:**
- Vercel Dashboard → Account Settings → Git
- Verificar conexão com GitHub

**Solução:**
- Reconnect GitHub account
- Grant access to repository novamente

---

## 🚀 SOLUÇÕES (PASSO A PASSO)

### SOLUÇÃO 1: Verificar Conta/Organização Correta

1. Acessar: https://vercel.com/dashboard
2. Clicar no **avatar** (canto superior direito)
3. Verificar se está em:
   - **Personal Account** (sua conta pessoal)
   - **Organização** (se criou uma org para OLVCORE)
4. Alternar entre elas usando o dropdown
5. Procurar projeto em cada uma

**Se encontrou:** Problema resolvido!  
**Se não encontrou:** Ir para Solução 2.

---

### SOLUÇÃO 2: Verificar Projetos Arquivados

1. Dashboard → **Settings** (do workspace)
2. Rolar até **"Archived Projects"**
3. Procurar "olv-intelligence" ou "olv-itelligence-prospect"
4. Se encontrou: **Restore**

**Se encontrou:** Problema resolvido!  
**Se não encontrou:** Ir para Solução 3.

---

### SOLUÇÃO 3: Reconectar GitHub Integration

1. Vercel Dashboard → **Settings** → **Git**
2. Verificar se GitHub está conectado
3. Se **não conectado**:
   - Clicar **"Connect GitHub"**
   - Autorizar Vercel
   - Grant access to "olv-itelligence-prospect" repository
4. Se **conectado** mas projeto sumiu:
   - Disconnected e reconectar
   - Grant access novamente

**Depois:**
- Dashboard → **Add New Project**
- Import from GitHub
- Selecionar "OLVCORE/olv-itelligence-prospect"

---

### SOLUÇÃO 4: Reimportar Projeto do Zero (RECOMENDADO)

**Este é o caminho mais seguro se o projeto realmente sumiu.**

#### Passo 1: Acessar Vercel Dashboard
```
https://vercel.com/dashboard
```

#### Passo 2: Add New Project
- Clicar botão **"Add New..."** → **"Project"**

#### Passo 3: Import Git Repository
- Clicar **"Import Git Repository"**
- Se não ver o repositório:
  - Clicar **"Adjust GitHub App Permissions"**
  - Grant access to **"OLVCORE/olv-itelligence-prospect"**
  - Voltar para Import

#### Passo 4: Selecionar Repositório
- Procurar: **"olv-itelligence-prospect"**
- Clicar **"Import"**

#### Passo 5: Configure Project
```
Project Name: olv-intelligence-prospect
Framework Preset: Next.js
Root Directory: ./
Build Command: next build
Output Directory: (deixar padrão)
Install Command: npm install
```

#### Passo 6: Environment Variables (CRÍTICO!)

**Copiar TODAS as variáveis anteriores:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Google
GOOGLE_CSE_API_KEY=...
GOOGLE_CSE_ID=...

# Serper
SERPER_API_KEY=...

# Apollo
APOLLO_API_KEY=...

# Hunter
HUNTER_API_KEY=...

# PhantomBuster
PHANTOM_BUSTER_API_KEY=...

# NextAuth
NEXTAUTH_URL=https://SEU-DOMINIO.vercel.app
NEXTAUTH_SECRET=... (gerar novo se não tem)

# OLV Admin (NOVO!)
OLV_ADMIN_KEY=SEU_SECRET_KEY_SUPER_SEGURO_32_CHARS
```

**⚠️ IMPORTANTE:** 
- Se perdeu as variáveis antigas, vai precisar recriar/regenerar algumas
- `NEXTAUTH_SECRET`: gerar novo com `openssl rand -base64 32`
- `OLV_ADMIN_KEY`: gerar novo com `openssl rand -base64 32`

#### Passo 7: Deploy
- Clicar **"Deploy"**
- Aguardar build (2-5 minutos)
- Verificar se concluiu com sucesso

#### Passo 8: Aplicar Migração Prisma (OBRIGATÓRIO)

Após deploy bem-sucedido:

**Opção A - Via Terminal (se DATABASE_URL configurada):**
```bash
npx prisma db push
```

**Opção B - Via SQL Editor Supabase (RECOMENDADO):**

Acessar: https://app.supabase.com/project/SEU-PROJECT/sql

Executar:
```sql
-- CompanyMonitor
CREATE TABLE IF NOT EXISTS "CompanyMonitor" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "domain" TEXT,
  "linkedinUrl" TEXT,
  "phantomAgentId" TEXT,
  "cadence" TEXT NOT NULL,
  "active" BOOLEAN DEFAULT true NOT NULL,
  "lastRunAt" TIMESTAMP,
  "nextRunAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_monitor_company_active" ON "CompanyMonitor"("companyId", "active");
CREATE INDEX IF NOT EXISTS "idx_monitor_nextRun" ON "CompanyMonitor"("nextRunAt");

-- IngestRun
CREATE TABLE IF NOT EXISTS "IngestRun" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL,
  "vendor" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "finishedAt" TIMESTAMP,
  "summary" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_ingest_company_started" ON "IngestRun"("companyId", "startedAt");

-- IngestLock
CREATE TABLE IF NOT EXISTS "IngestLock" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT UNIQUE NOT NULL,
  "lockedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "holder" TEXT,
  "note" TEXT
);

-- ApiAuditLog
CREATE TABLE IF NOT EXISTS "ApiAuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ts" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "actor" TEXT,
  "action" TEXT,
  "target" TEXT,
  "meta" JSONB,
  "ip" TEXT,
  "route" TEXT,
  "level" TEXT
);
CREATE INDEX IF NOT EXISTS "idx_api_audit_ts" ON "ApiAuditLog"("ts");
```

#### Passo 9: Aplicar Views SQL (OBRIGATÓRIO)

No mesmo SQL Editor:
```sql
-- v_ops_company_health
CREATE OR REPLACE VIEW v_ops_company_health AS
SELECT
  c.id as company_id,
  c.name as company_name,
  (ctm.scores->>'overall')::int as overall,
  ctm.vendor,
  ctm."updatedAt" as updated_at
FROM "Company" c
JOIN "CompanyTechMaturity" ctm on ctm."companyId" = c.id
WHERE (ctm."updatedAt") = (
  SELECT MAX(ctm2."updatedAt") 
  FROM "CompanyTechMaturity" ctm2 
  WHERE ctm2."companyId" = c.id
);

-- v_ops_run_summary
CREATE OR REPLACE VIEW v_ops_run_summary AS
SELECT
  r.id, r."companyId", r.vendor, r.status,
  r."startedAt", r."finishedAt",
  EXTRACT(EPOCH FROM (COALESCE(r."finishedAt", NOW()) - r."startedAt"))::int as duration_sec
FROM "IngestRun" r
ORDER BY r."startedAt" DESC;

-- olv_ops_counts
CREATE OR REPLACE FUNCTION olv_ops_counts()
RETURNS json LANGUAGE sql STABLE AS $$
  WITH a AS (SELECT COUNT(*) as companies FROM "Company"),
       b AS (SELECT COUNT(*) as monitors FROM "CompanyMonitor" WHERE active = true),
       c AS (SELECT COUNT(*) as runs24 FROM "IngestRun" WHERE "startedAt" >= NOW() - INTERVAL '24 hours'),
       d AS (SELECT COUNT(*) as techsignals FROM "TechSignals"),
       e AS (SELECT COUNT(*) as firmo FROM "Firmographics"),
       f AS (SELECT COUNT(*) as maturity FROM "CompanyTechMaturity")
  SELECT json_build_object(
    'companies', (SELECT companies FROM a),
    'monitors', (SELECT monitors FROM b),
    'runs24', (SELECT runs24 FROM c),
    'techsignals', (SELECT techsignals FROM d),
    'firmographics', (SELECT firmo FROM e),
    'maturity', (SELECT maturity FROM f)
  );
$$;
```

#### Passo 10: Verificar Health Check
```bash
curl https://SEU-NOVO-DOMINIO.vercel.app/api/health
```

**Esperado:**
```json
{
  "ok": true,
  "time": "2025-10-20T20:30:00.123Z"
}
```

---

## 🔗 RECONECTAR PROJETO LOCALMENTE

Após reimportar no Vercel:

```bash
# 1. Instalar Vercel CLI (se não tem)
npm i -g vercel

# 2. Login
vercel login

# 3. Link ao projeto
vercel link

# Quando perguntar:
# - Set up and deploy? N (não)
# - Link to existing project? Y (sim)
# - What's the name of your existing project? olv-intelligence-prospect
# - Link to OLVCORE? Y (sim)
```

Isso cria a pasta `.vercel` local.

---

## 📊 CHECKLIST PÓS-REIMPORT

Após reimportar e fazer deploy bem-sucedido:

- [ ] **Health check** funcionando (`/api/health`)
- [ ] **Dashboard** acessível (`/dashboard`)
- [ ] **Tabelas Prisma** criadas no Supabase
- [ ] **Views SQL** aplicadas
- [ ] **Environment Variables** todas configuradas
- [ ] **Vercel Cron** ativo (Settings → Cron Jobs)
- [ ] **Domain** configurado (se tinha custom domain)
- [ ] **OLV_ADMIN_KEY** configurado
- [ ] **Dashboard Ops** acessível (`/dashboard/operations`)

---

## 🔑 SE PERDEU AS VARIÁVEIS DE AMBIENTE

### Regenerar Secrets:

```bash
# NextAuth Secret
openssl rand -base64 32

# OLV Admin Key
openssl rand -base64 32
```

### APIs Externas (precisará das originais):
- **Supabase**: Dashboard → Settings → API
- **OpenAI**: https://platform.openai.com/api-keys
- **Google CSE**: https://console.cloud.google.com/apis/credentials
- **Serper**: https://serper.dev/dashboard
- **Apollo**: https://app.apollo.io/settings/integrations
- **Hunter**: https://hunter.io/api-keys
- **PhantomBuster**: https://phantombuster.com/api-store

---

## 🆘 SE NADA FUNCIONAR

### Opção Extrema: Criar Novo Projeto com Nome Diferente

```bash
# 1. Criar novo projeto no Vercel
# Nome: olv-intelligence-v2

# 2. Seguir passos de reimport acima

# 3. Atualizar NEXTAUTH_URL para novo domínio
NEXTAUTH_URL=https://olv-intelligence-v2.vercel.app
```

---

## 📞 SUPORTE VERCEL

Se realmente não conseguir resolver:

1. **Vercel Support**: https://vercel.com/support
2. **Vercel Community**: https://github.com/vercel/vercel/discussions
3. **Twitter**: @vercel

**Informações para fornecer ao suporte:**
- Repository: `OLVCORE/olv-itelligence-prospect`
- Último deploy visível: (data aproximada)
- Problema: "Projeto desapareceu do dashboard"

---

## 💡 PREVENÇÃO FUTURA

Para evitar este problema no futuro:

1. **Backup das Env Vars**: Salvar em arquivo local seguro (.env.production.backup)
2. **Screenshot do Dashboard**: Tirar print do projeto rodando
3. **Documentar Domain**: Salvar URL do projeto
4. **Vercel CLI**: Manter linkado localmente (`vercel link`)
5. **Git Tags**: Marcar releases importantes (`git tag v1.0.0`)

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

1. **Verificar Conta/Org correta** no Vercel Dashboard
2. Se não encontrou: **Reimportar do GitHub**
3. **Configurar todas env vars** (crítico!)
4. **Aplicar migrations Prisma** (SQL no Supabase)
5. **Aplicar views SQL** (ops_views.sql)
6. **Testar health check**
7. **Testar dashboard**

---

**Este problema é recuperável! O código está 100% seguro no GitHub.** 🔥

**Documento criado:** 20 de Outubro de 2025, 20:30  
**Status:** Diagnóstico completo + soluções prontas

