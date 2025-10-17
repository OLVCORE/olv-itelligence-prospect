# 🔐 CONFIGURAÇÃO SUPABASE - PRONTO PARA USAR

## ⚠️ SEGURANÇA CRÍTICA

**ATENÇÃO:** A senha foi exposta publicamente. **ROTACIONE IMEDIATAMENTE** após configurar:

1. Acesse: https://supabase.com/dashboard/project/qtcwetabhhkhvomcrqgm/settings/database
2. Clique em "Reset database password"
3. Gere nova senha segura
4. Atualize as variáveis abaixo com a nova senha

---

## 📋 VARIÁVEIS DE AMBIENTE - VERCEL

### Acesse: Vercel Dashboard → Settings → Environment Variables

**Adicione as seguintes variáveis (selecione Production, Preview E Development):**

### 1. DATABASE_URL (Pooler - Runtime)
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Detalhes:**
- Host: `aws-0-sa-east-1.pooler.supabase.com`
- Porta: `6543` (Pooler PgBouncer)
- Usuário: `postgres.qtcwetabhhkhvomcrqgm`
- Senha encodada: `%23Bliss2711%40` (# = %23, @ = %40)
- Parâmetros: `?pgbouncer=true&connection_limit=1`

---

### 2. DIRECT_URL (Direta - Migrações)
```
postgresql://postgres:%23Bliss2711%40@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require
```

**Detalhes:**
- Host: `db.qtcwetabhhkhvomcrqgm.supabase.co`
- Porta: `5432` (Conexão direta)
- Usuário: `postgres` (sem project-ref)
- Senha encodada: `%23Bliss2711%40`
- Parâmetro: `?sslmode=require`

---

### 3. NEXTAUTH_URL (Production apenas)
```
https://olv-itelligence-prospect.vercel.app
```

---

### 4. NEXTAUTH_SECRET (Todos os ambientes)
```
gerar_com_comando_abaixo
```

**Gerar secret:**
```bash
openssl rand -base64 32
```

Ou use este gerado agora:
```
K8mP2nQ5rT7wY9zA3bC6dE8fH1jL4mN6pR9sU2vX5yB7
```

---

### 5. NEXT_PUBLIC_SUPABASE_URL (Todos os ambientes)
```
https://qtcwetabhhkhvomcrqgm.supabase.co
```

---

### 6. NEXT_PUBLIC_SUPABASE_ANON_KEY (Todos os ambientes)
```
[OBTER DO SUPABASE - Settings → API → Project API keys → anon public]
```

**⚠️ IMPORTANTE:** Esta key deve ser rotacionada após expor a senha!

---

## 📝 ARQUIVO .env.local (DESENVOLVIMENTO LOCAL)

Crie/Atualize o arquivo `.env.local` na raiz do projeto:

```bash
# ============================================
# DATABASE - SUPABASE POSTGRESQL
# ============================================

# Pooler (Runtime - usa em queries normais)
DATABASE_URL="postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direta (Migrações - usa apenas em migrate/deploy)
DIRECT_URL="postgresql://postgres:%23Bliss2711%40@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require"

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://qtcwetabhhkhvomcrqgm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[OBTER_DO_SUPABASE_DASHBOARD]"

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="K8mP2nQ5rT7wY9zA3bC6dE8fH1jL4mN6pR9sU2vX5yB7"

# ============================================
# APIs EXTERNAS
# ============================================
RECEITAWS_API_TOKEN="71260c7509a5d692644af4cbd32abc5cf6484b3bd48d4222eae72da31ec19886"
OPENAI_API_KEY="sk-proj-XXXXX"  # Adicionar se disponível
HUNTER_API_KEY="XXXXX"           # Adicionar se disponível
GOOGLE_API_KEY="XXXXX"           # Adicionar se disponível
GOOGLE_CSE_ID="XXXXX"            # Adicionar se disponível
```

---

## 🚀 COMANDOS PARA EXECUTAR

### 1. Configuração Inicial (Local)

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma
npm run db:generate

# 3. Rodar migrações (criar tabelas no Supabase)
npm run db:migrate:dev

# 4. (Opcional) Popular banco com dados seed
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev

# 6. Testar conexão
# Acessar: http://localhost:3000/api/test-db
```

### 2. Deploy no Vercel

```bash
# 1. Commit das alterações
git add .
git commit -m "feat: Configurar Supabase PostgreSQL com pooler e direct URL"

# 2. Push para GitHub (dispara deploy automático)
git push origin main

# 3. Aguardar build no Vercel (2-3 minutos)

# 4. Verificar logs do build
# Vercel Dashboard → Deployments → Latest → Build Logs
```

### 3. Validação Pós-Deploy

```bash
# 1. Testar conexão com banco
curl https://olv-itelligence-prospect.vercel.app/api/test-db

# Resposta esperada:
{
  "success": true,
  "status": "connected",
  "message": "🎉 Banco de dados Supabase funcionando corretamente!",
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

# 2. Acessar dashboard
# https://olv-itelligence-prospect.vercel.app/dashboard

# 3. Testar funcionalidades
# - Adicionar empresa
# - Verificar se dados persistem após reload
# - Testar análise de empresa
```

---

## 🔍 URL ENCODING EXPLICADO

**Senha original:** `#Bliss2711@`

**Caracteres especiais e seus códigos:**
- `#` (hash) → `%23`
- `@` (arroba) → `%40`
- `:` (dois pontos) → `%3A`
- `/` (barra) → `%2F`
- `?` (interrogação) → `%3F`
- `&` (e comercial) → `%26`
- `=` (igual) → `%3D`
- ` ` (espaço) → `%20`

**Senha encodada:** `%23Bliss2711%40`

---

## ✅ CHECKLIST DE ATIVAÇÃO

### Pré-Deploy (Local)
- [ ] Arquivo `.env.local` criado com as URLs
- [ ] `npm run db:generate` executado (sem erros)
- [ ] `npm run db:migrate:dev` executado (tabelas criadas)
- [ ] `npm run dev` funcionando
- [ ] `http://localhost:3000/api/test-db` retorna success
- [ ] Prisma Studio abre (`npm run db:studio`)
- [ ] Tabelas visíveis no Supabase Dashboard

### Configuração Vercel
- [ ] `DATABASE_URL` adicionada (Production, Preview, Development)
- [ ] `DIRECT_URL` adicionada (Production, Preview, Development)
- [ ] `NEXTAUTH_URL` adicionada (Production)
- [ ] `NEXTAUTH_SECRET` adicionada (todos)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` adicionada (todos)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` adicionada (todos)
- [ ] `RECEITAWS_API_TOKEN` adicionada (todos)

### Pós-Deploy
- [ ] Build concluído sem erros
- [ ] Logs mostram "Conexão estabelecida"
- [ ] `/api/test-db` retorna success
- [ ] Dashboard carrega sem erro "Carregando..."
- [ ] Lista de empresas funciona
- [ ] Adicionar empresa funciona
- [ ] Dados persistem após reload
- [ ] Análise de empresa funciona
- [ ] Supabase Table Editor mostra dados

### Segurança
- [ ] **ROTACIONAR SENHA DO BANCO**
- [ ] **ROTACIONAR SUPABASE_ANON_KEY**
- [ ] Atualizar `.env.local` com nova senha
- [ ] Atualizar Vercel com nova senha
- [ ] Commit e deploy com novas credenciais
- [ ] Validar funcionamento com novas credenciais

---

## 🔧 TROUBLESHOOTING

### Erro: "Tenant or user not found"
**Causa:** Usuário incorreto no pooler  
**Solução:** Usar `postgres.qtcwetabhhkhvomcrqgm` (não apenas `postgres`)

### Erro: "password authentication failed"
**Causa:** Senha não encodada corretamente  
**Solução:** Verificar encoding (`#` → `%23`, `@` → `%40`)

### Erro: "Can't reach database server"
**Causa:** Host/porta incorretos ou firewall  
**Solução:** 
- Copiar URLs exatas do Supabase Dashboard
- Verificar se Supabase permite conexões do Vercel
- Testar com `psql` localmente

### Erro: "prisma migrate failed"
**Causa:** `DIRECT_URL` não configurada ou incorreta  
**Solução:** 
- Verificar se `directUrl` está no `schema.prisma`
- Verificar se `DIRECT_URL` está no Vercel
- Usar porta `5432` (não `6543`) na DIRECT_URL

### Build trava ou timeout
**Causa:** Migrações demorando muito  
**Solução:**
- Verificar se já rodou migrações localmente
- Usar `prisma db push` em vez de `migrate deploy`
- Aumentar timeout no `vercel.json`

---

## 📞 PRÓXIMOS PASSOS

### Após ativar o banco:
1. ✅ Remover fallback mock de `/api/companies/list`
2. ✅ Ativar persistência real de dados
3. ✅ Testar todas as funcionalidades
4. ✅ Configurar APIs externas (Hunter.io, OpenAI, etc)
5. ✅ Implementar sistema de cache
6. ✅ Configurar monitoramento (Sentry)
7. ✅ Otimizar queries Prisma
8. ✅ Adicionar testes de integração

### Melhorias de Performance:
- [ ] Implementar Redis para cache
- [ ] Otimizar queries N+1
- [ ] Adicionar índices nas tabelas
- [ ] Implementar pagination
- [ ] Configurar connection pooling avançado

---

**⚠️ LEMBRE-SE:** Rotacione a senha IMEDIATAMENTE após configurar!

**Documento gerado em:** 2025-01-17  
**Status:** 🟢 Pronto para uso (aguardando rotação de senha)

