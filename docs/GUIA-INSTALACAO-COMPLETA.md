# 🚀 GUIA DE INSTALAÇÃO COMPLETA

> **OLV Intelligent Prospecting System - Setup do Zero**  
> Versão: 2.0 | Data: Outubro 2025

---

## 📋 **PRÉ-REQUISITOS**

- ✅ Node.js 18+ instalado
- ✅ PostgreSQL 14+ (ou Supabase account)
- ✅ Git configurado
- ✅ Chaves de API obtidas:
  - Supabase Project URL + Anon Key + Service Role Key
  - Serper API Key (https://serper.dev)
  - Apollo.io API Key (https://apollo.io)
  - Hunter.io API Key (https://hunter.io)
  - PhantomBuster API Key (opcional, https://phantombuster.com)

---

## 🔧 **PASSO 1: Clonar e Instalar Dependências**

```bash
# 1. Clonar repositório
git clone https://github.com/SEU-ORG/olv-intelligence-prospect.git
cd olv-intelligence-prospect

# 2. Instalar dependências
npm install

# 3. Copiar .env de exemplo
cp .env.example .env.local
```

---

## 🔑 **PASSO 2: Configurar Variáveis de Ambiente**

Edite o arquivo `.env.local` e adicione suas chaves:

```bash
# ========================================
# SUPABASE (Obrigatório)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SERVER-ONLY

# DATABASE (Supabase fornece automaticamente)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# ========================================
# INTEGRAÇÕES (Obrigatórias para funcionar 100%)
# ========================================
SERPER_API_KEY=abc123... # Google Search real
APOLLO_API_KEY=xyz789... # Apollo.io company/people enrichment
HUNTER_API_KEY=def456... # Hunter.io email finder/verifier
PHANTOM_BUSTER_API_KEY=ghi012... # PhantomBuster LinkedIn scraper (opcional)

# ========================================
# OPENAI (Opcional, para insights IA)
# ========================================
OPENAI_API_KEY=sk-... # GPT-4 para análises avançadas (futuro)

# ========================================
# NEXTAUTH (Desabilitado temporariamente)
# ========================================
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**IMPORTANTE:**
- ❌ **NUNCA** commite o arquivo `.env.local`
- ✅ No Vercel, adicione todas as variáveis em **Settings → Environment Variables**
- ✅ Use variáveis diferentes para Development e Production

---

## 🗄️ **PASSO 3: Configurar Banco de Dados (Supabase)**

### 3.1) Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Configure:
   - **Name:** OLV Intelligence Prospect
   - **Database Password:** (salve em local seguro)
   - **Region:** South America (São Paulo)
   - **Pricing Plan:** Free (até 500MB)
4. Aguarde ~2 minutos para provisionar

### 3.2) Obter Credenciais

1. No dashboard do projeto, vá em **Settings → API**
2. Copie:
   - **URL:** `https://xxxxx.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public:** `eyJhbG...` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role:** `eyJhbG...` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA EXPONHA NO CLIENT**

3. Copie também a **Connection String**:
   - **Settings → Database → Connection String → URI**
   - Exemplo: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`
   - Cole em `DATABASE_URL` no `.env.local`

### 3.3) Aplicar Schema Prisma

```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Aplicar schema no banco (cria todas as tabelas)
npx prisma db push

# 3. Verificar se tabelas foram criadas
npx prisma studio
```

**Abra o Prisma Studio** (http://localhost:5555) e verifique se as tabelas existem:
- `Company`, `Project`, `User`, `Organization`
- `Firmographics`, `TechSignals`, `CompanyTechMaturity`, `SearchCache`
- `ProjectMember` (nova!)

### 3.4) Aplicar RLS Policies (IMPORTANTE)

```bash
# No Supabase Dashboard → SQL Editor, cole e execute:
# prisma/migrations/rls-policies.sql
```

**OU via CLI (se tiver psql instalado):**

```bash
psql postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres < prisma/migrations/rls-policies.sql
```

Isso irá:
- ✅ Ativar Row Level Security (RLS) nas tabelas novas
- ✅ Criar políticas de acesso por `projectId`
- ✅ Garantir isolamento multi-tenant
- ✅ Criar views auxiliares para debugging

---

## 🌱 **PASSO 4: Popular Dados Iniciais (Seed)**

```bash
# Executar seed script
npx ts-node prisma/seed-project-members.ts
```

**O que esse script faz:**
1. ✅ Cria usuário de teste: `admin@olvintelligence.com.br`
2. ✅ Cria organização: `OLV Intelligence`
3. ✅ Cria projeto padrão: `default-project-id`
4. ✅ Cria `ProjectMember` (necessário para RLS funcionar)
5. ✅ Cria empresa de teste: Kelludy (CNPJ real)
6. ✅ Popula `Firmographics`, `TechSignals`, `CompanyTechMaturity` de exemplo

**Saída esperada:**
```
🌱 Iniciando seed de ProjectMember...
✅ Usuário criado: test-user-admin-001
✅ Organização criada: org-olv-001
✅ Projeto criado: default-project-id
✅ ProjectMember criado: admin@olvintelligence.com.br → Prospecção TOTVS 2025 (owner)
✅ Empresa criada: comp_xxx
✅ Firmographics criado
✅ TechSignal criado
✅ CompanyTechMaturity criado

🎉 Seed concluído com sucesso!
```

---

## 🧪 **PASSO 5: Testar Localmente**

```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev

# 2. Abrir navegador
http://localhost:3000
```

**O que deve acontecer:**
- ✅ Redireciona automaticamente para `/dashboard`
- ✅ Sidebar com módulos visíveis
- ✅ Dashboard carrega empresas do banco
- ✅ Botão "Buscar Empresas" funcional

### 5.1) Testar Health Check

```bash
curl http://localhost:3000/api/health
```

**Saída esperada:**
```json
{"ok":true,"time":"2025-10-20T18:00:00.000Z"}
```

### 5.2) Testar Apollo Integration

```bash
curl -X POST http://localhost:3000/api/integrations/apollo/company-enrich \
  -H 'Content-Type: application/json' \
  -d '{"domain":"kelludy.com.br","companyId":"comp_xxx"}'
```

**Saída esperada:**
```json
{
  "ok": true,
  "data": {
    "organizations": [
      {
        "name": "Kelludy",
        "estimated_num_employees": "11-50",
        "estimated_annual_revenue": "$1M-$5M"
      }
    ]
  }
}
```

### 5.3) Testar Maturity Calculator

```bash
curl -X POST http://localhost:3000/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_xxx",
    "vendor":"TOTVS",
    "detectedStack":{"erp":[{"product":"SAP","vendor":"SAP","confidence":90}]},
    "sources":{"manual":true}
  }'
```

**Saída esperada:**
```json
{
  "ok": true,
  "scores": {
    "infra": 60,
    "systems": 75,
    "data": 40,
    "security": 50,
    "automation": 30,
    "culture": 20,
    "overall": 46
  },
  "fit": {
    "products": ["TOTVS Protheus", "Fluig"],
    "olv_packs": [],
    "rationale": ["Migração/substituição com redução de TCO"]
  }
}
```

---

## ☁️ **PASSO 6: Deploy em Produção (Vercel)**

### 6.1) Push para GitHub

```bash
git add -A
git commit -m "feat: setup completo com RLS e seed"
git push origin main
```

### 6.2) Conectar Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `.` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 6.3) Adicionar Variáveis de Ambiente

No Vercel → **Settings → Environment Variables**, adicione **TODAS** as variáveis do `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
SERPER_API_KEY=...
APOLLO_API_KEY=...
HUNTER_API_KEY=...
PHANTOM_BUSTER_API_KEY=...
```

**IMPORTANTE:**
- ✅ Adicione para **Production**, **Preview**, e **Development**
- ✅ Use valores **diferentes** para cada ambiente (ex: Supabase dev vs prod)
- ❌ **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY` publicamente

### 6.4) Deploy

```bash
# Vercel irá deployar automaticamente após push
# Ou force um deploy:
vercel --prod
```

**URL de Produção:**
```
https://seu-app.vercel.app
```

---

## 🧪 **PASSO 7: Testar em Produção**

```bash
# 1. Health check
curl https://seu-app.vercel.app/api/health

# 2. Apollo company enrich
curl -X POST https://seu-app.vercel.app/api/integrations/apollo/company-enrich \
  -H 'Content-Type: application/json' \
  -d '{"domain":"masterindustria.com.br","companyId":"comp_123"}'

# 3. Maturity calculator
curl -X POST https://seu-app.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"default-project-id",
    "companyId":"comp_123",
    "vendor":"TOTVS",
    "detectedStack":{"erp":[{"product":"SAP","confidence":90}]},
    "sources":{"serper":true}
  }'
```

---

## 🛡️ **PASSO 8: Segurança & Best Practices**

### 8.1) Rotacionar Chaves

Se você expôs acidentalmente alguma chave (ex: em histórico de chat, commit público):

1. **Supabase:**
   - Dashboard → Settings → API → **Generate new anon key**
   - **NUNCA rotacione o service_role_key** sem backup completo

2. **APIs externas:**
   - Serper: Dashboard → API Keys → Revoke + Create New
   - Apollo: Settings → API → Regenerate
   - Hunter: Settings → API Keys → Revoke + New

### 8.2) Configurar Webhooks de Segurança

1. **Supabase Database Webhooks:**
   - Dashboard → Database → Webhooks
   - Criar webhook para tabela `AuditLog` → enviar para Slack/Discord

2. **Vercel Notifications:**
   - Settings → Notifications → Slack Integration
   - Alertas de build failures, deployment success

### 8.3) Habilitar 2FA

- ✅ Supabase: Account → Security → Enable 2FA
- ✅ Vercel: Account → Security → Two-Factor Authentication
- ✅ GitHub: Settings → Password and authentication → Enable 2FA

---

## 📊 **PASSO 9: Monitoramento (Opcional)**

### 9.1) Supabase Analytics

- **Dashboard → Reports:**
  - Database Size (quota 500MB no free tier)
  - API Requests (quota 50k/mês no free tier)
  - Auth Users (quota 50k MAU no free tier)

### 9.2) Vercel Analytics

- **Project → Analytics:**
  - Pageviews
  - Unique Visitors
  - Top Pages
  - Devices/Browsers

### 9.3) Logs em Tempo Real

```bash
# Vercel CLI
vercel logs https://seu-app.vercel.app --follow

# Supabase CLI (instalar primeiro: npm i -g supabase)
supabase logs --project-id xxxxx
```

---

## 🐛 **TROUBLESHOOTING**

### Erro: "NEXT_PUBLIC_SUPABASE_URL não definida"

**Solução:**
1. Verifique se `.env.local` existe na raiz do projeto
2. Reinicie o servidor: `npm run dev`
3. Se persistir, adicione as variáveis em `.env` (fallback)

### Erro: "Prisma Client não foi gerado"

**Solução:**
```bash
npx prisma generate
npm run dev
```

### Erro: "RLS impede acesso aos dados"

**Solução:**
1. Verifique se o seed foi executado (cria `ProjectMember`)
2. Desabilite RLS temporariamente no Supabase:
   ```sql
   ALTER TABLE "Firmographics" DISABLE ROW LEVEL SECURITY;
   ```
3. Use Service Role Key no backend (ignora RLS)

### Erro: "Apollo/Hunter API retorna 401"

**Solução:**
1. Verifique se a chave está correta no `.env.local`
2. Teste a chave diretamente:
   ```bash
   curl -H "X-API-KEY: $APOLLO_API_KEY" https://api.apollo.io/v1/auth/health
   ```
3. Se inválida, regenere no dashboard da API

---

## 📚 **RECURSOS ADICIONAIS**

- 📘 [Documentação Completa](./EBOOK_APRESENTACAO_TOTVS.md)
- 🧪 [Comandos de Teste Reais](./COMANDOS-TESTE-REAL.md)
- 🔐 [RLS Policies SQL](../prisma/migrations/rls-policies.sql)
- 🌱 [Seed Script](../prisma/seed-project-members.ts)
- 🏗️ [Prisma Schema](../prisma/schema.prisma)

---

## ✅ **CHECKLIST FINAL**

Antes de considerar a instalação completa:

- [ ] `.env.local` configurado com todas as chaves
- [ ] `npx prisma db push` executado sem erros
- [ ] RLS policies aplicadas no Supabase
- [ ] Seed executado com sucesso
- [ ] Health check retorna `{"ok":true}`
- [ ] Apollo/Serper/Hunter testados localmente
- [ ] Maturity calculator retorna scores válidos
- [ ] Deploy na Vercel bem-sucedido
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Testes em produção passando
- [ ] Dashboard carrega empresas do banco
- [ ] Logs sem erros críticos
- [ ] Backup do `.env.local` em local seguro

---

**🎉 SISTEMA 100% OPERACIONAL! Pronto para apresentação TOTVS!**

---

**Última atualização:** 20 de Outubro de 2025  
**Versão do Guia:** 2.0  
**Suporte:** contato@olvintelligence.com.br

