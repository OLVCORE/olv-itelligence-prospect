# 📋 DIAGNÓSTICO TÉCNICO COMPLETO - OLV INTELLIGENT PROSPECTING SYSTEM

**Data:** 2025-01-17  
**Status Atual:** Sistema funcional no Vercel com dados mock (aguardando configuração correta do Supabase)

---

## 1️⃣ STACK DE ACESSO AO BANCO DE DADOS

### **ORM Utilizado:**
- **Prisma ORM** (`@prisma/client` v5.20.0)
- **Prisma CLI** (`prisma` v5.20.0)

### **Schema Prisma Atual:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### **⚠️ PROBLEMA IDENTIFICADO:**
O schema **NÃO** possui `directUrl` configurado, o que é **CRÍTICO** para Supabase com PgBouncer.

### **✅ CORREÇÃO NECESSÁRIA:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooler (6543 + pgbouncer)
  directUrl = env("DIRECT_URL")        // Direta (5432) para migrações
}
```

### **Migrações:**
- **Método Atual:** `prisma migrate dev` (local)
- **Build Script:** `prisma generate && next build`
- **Postinstall:** `prisma generate`
- **Migrations Existentes:** `/prisma/migrations/20241016_init/migration.sql`

### **⚠️ PROBLEMA:** 
Não há execução automática de migrações no Vercel. O `prisma generate` apenas gera o cliente, não roda migrations.

---

## 2️⃣ AMBIENTE DE EXECUÇÃO

### **Plataforma:**
- **Vercel** (Serverless Functions)
- **Runtime:** Node.js (não Edge Runtime)
- **Versão Node:** >= 18.0.0 (definido em `package.json`)

### **Regiões:**
- **Supabase:** `sa-east-1` (AWS São Paulo)
- **Vercel:** Provavelmente `iad1` (US East) - **não configurado explicitamente**
  
### **⚠️ RECOMENDAÇÃO:**
Configure a função Vercel para rodar na região mais próxima do Supabase:
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  },
  "regions": ["gru1"]  // São Paulo (mais próximo de sa-east-1)
}
```

### **Framework:**
- **Next.js** v15.0.2 (App Router)
- **React** v18.3.1
- **TypeScript** v5.6.3

---

## 3️⃣ VARIÁVEIS DE AMBIENTE

### **📌 VARIÁVEIS ATUAIS NO CÓDIGO:**

#### **Banco de Dados:**
```bash
DATABASE_URL="file:./dev.db"  # ❌ SQLite local (dev.db) - NÃO FUNCIONA NO VERCEL
```

#### **Autenticação:**
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua_secret_key_aqui_minimo_32_caracteres"
```

#### **APIs Externas (Configuradas):**
```bash
RECEITAWS_API_TOKEN="token_receitaws"
OPENAI_API_KEY="sk-proj-xxxxx"
HUNTER_API_KEY="hunter_key"
GOOGLE_API_KEY="AIzaSyxxxxx"
GOOGLE_CSE_ID="cse_id"
```

### **❌ VARIÁVEIS FALTANDO NO VERCEL:**

```bash
# CRÍTICAS - NECESSÁRIAS AGORA:
DATABASE_URL="postgresql://postgres.qtcwetabhhkhvomcrqgm:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require"

# IMPORTANTE - CONFIGURAR EM SEGUIDA:
NEXTAUTH_URL="https://olv-itelligence-prospect.vercel.app"
NEXTAUTH_SECRET="gerar_secret_seguro_32_chars_minimo"

# SUPABASE (Opcional mas recomendado):
NEXT_PUBLIC_SUPABASE_URL="https://qtcwetabhhkhvomcrqgm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4️⃣ CONNECTION STRINGS SUPABASE

### **📍 INFORMAÇÕES EXTRAÍDAS DO CÓDIGO:**

**Project Reference:** `qtcwetabhhkhvomcrqgm`  
**Região:** `sa-east-1` (AWS São Paulo)

### **✅ FORMATO CORRETO - POOLER (Transaction Mode):**

```bash
DATABASE_URL="postgresql://postgres.qtcwetabhhkhvomcrqgm:[PASSWORD_URL_ENCODED]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Detalhes:**
- **Host:** `aws-0-sa-east-1.pooler.supabase.com`
- **Porta:** `6543`
- **Usuário:** `postgres.qtcwetabhhkhvomcrqgm`
- **Database:** `postgres`
- **Parâmetros obrigatórios:** `?pgbouncer=true&connection_limit=1`

### **✅ FORMATO CORRETO - DIRETA (Para Migrações):**

```bash
DIRECT_URL="postgresql://postgres:[PASSWORD_URL_ENCODED]@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require"
```

**Detalhes:**
- **Host:** `db.qtcwetabhhkhvomcrqgm.supabase.co`
- **Porta:** `5432`
- **Usuário:** `postgres` (sem o project-ref)
- **Database:** `postgres`
- **Parâmetro recomendado:** `?sslmode=require`

### **🔐 IMPORTANTE - CODIFICAÇÃO DE SENHA:**

Se a senha contém caracteres especiais (ex: `#Bliss2711#`):

| Caractere | URL Encoded |
|-----------|-------------|
| `#`       | `%23`       |
| `@`       | `%40`       |
| `:`       | `%3A`       |
| `/`       | `%2F`       |
| `?`       | `%3F`       |
| `&`       | `%26`       |
| `=`       | `%3D`       |
| ` ` (espaço) | `%20`    |

**Exemplo:**
```
Senha real: #Bliss2711#
URL encoded: %23Bliss2711%23
```

---

## 5️⃣ LOGS DE ERRO NO VERCEL

### **Erro Atual Identificado:**

```
[API /companies/list] ❌ Erro ao buscar do banco: [erro específico]
[API /companies/list] 🔄 Usando dados mock como fallback
```

### **Status:**
✅ **Sistema funcionando com fallback** - retorna dados mock quando banco falha  
⚠️ **Banco de dados indisponível** - precisa configurar DATABASE_URL correta

### **Onde Ocorre:**
- **Runtime** (não build time)
- **Rota:** `/api/companies/list` (GET)
- **Outras rotas afetadas:** Todas que usam Prisma

### **Stack Trace Esperado (quando houver erro real):**
```
PrismaClientInitializationError: Can't reach database server at ...
```

---

## 6️⃣ PLANO DE MIGRAÇÃO

### **⚠️ PROBLEMA ATUAL:**
As migrações do Prisma **NÃO** rodam automaticamente no Vercel.

### **✅ OPÇÕES DE SOLUÇÃO:**

#### **OPÇÃO 1: Migrate Deploy (Recomendado)**
Adicionar ao `package.json`:
```json
{
  "scripts": {
    "build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

#### **OPÇÃO 2: DB Push (Alternativa - sem histórico)**
```json
{
  "scripts": {
    "build": "prisma db push --accept-data-loss && prisma generate && next build"
  }
}
```

#### **OPÇÃO 3: Manual (Menos recomendado)**
1. Rodar `prisma migrate deploy` localmente conectado ao Supabase
2. Apenas `prisma generate` no Vercel

### **🎯 RECOMENDAÇÃO:**
Use **OPÇÃO 1** (`prisma migrate deploy`) pois:
- ✅ Mantém histórico de migrações
- ✅ Seguro para produção
- ✅ Não perde dados
- ✅ Roda apenas migrações pendentes

### **Shadow Database:**
**NÃO É NECESSÁRIO** com `prisma migrate deploy` (apenas para `migrate dev`).

---

## 7️⃣ ARQUITETURA DE CONEXÃO

### **Conexões Esperadas:**
- **Serverless Vercel:** 1-10 conexões simultâneas por request
- **Connection Limit:** `1` por função (recomendado para pooler)

### **⚠️ IMPORTANTE:**
Com PgBouncer (pooler), use `connection_limit=1` em cada função serverless para evitar:
- ❌ Connection pool exhaustion
- ❌ "prepared statement already exists" errors
- ❌ Timeout de conexões

### **SSL/TLS:**
✅ **Supabase exige TLS** - configurar `sslmode=require` na connection string direta.

---

## 8️⃣ ARQUIVOS DE CONFIGURAÇÃO CRÍTICOS

### **prisma/schema.prisma** - ⚠️ PRECISA ATUALIZAÇÃO
```prisma
// ATUAL (INCORRETO):
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// CORRIGIDO (NECESSÁRIO):
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooler
  directUrl = env("DIRECT_URL")        // Direta
}
```

### **lib/db.ts** - ✅ OK
```typescript
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})
```

### **package.json** - ⚠️ PRECISA ATUALIZAÇÃO
```json
// ATUAL:
"build": "prisma generate && next build"

// RECOMENDADO:
"build": "prisma migrate deploy && prisma generate && next build"
```

### **next.config.js** - ✅ OK
- Runtime: Node.js (não Edge)
- Puppeteer configurado
- TypeScript errors ignorados (temporariamente)

---

## 9️⃣ CHECKLIST DE ATIVAÇÃO

### **🔴 CRÍTICO - FAZER AGORA:**

- [ ] 1. Obter **senha correta** do Supabase
- [ ] 2. **URL encode** a senha (se tiver caracteres especiais)
- [ ] 3. Criar `DATABASE_URL` com pooler (porta 6543)
- [ ] 4. Criar `DIRECT_URL` com conexão direta (porta 5432)
- [ ] 5. Adicionar `directUrl` no `schema.prisma`
- [ ] 6. Atualizar variáveis no Vercel:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
- [ ] 7. Atualizar script de build: `prisma migrate deploy`
- [ ] 8. Fazer commit e push
- [ ] 9. Aguardar deploy (1-2 min)
- [ ] 10. Testar conexão com banco

### **🟡 IMPORTANTE - FAZER DEPOIS:**

- [ ] 11. Configurar região Vercel (`gru1` - São Paulo)
- [ ] 12. Testar todas as APIs
- [ ] 13. Validar persistência de dados
- [ ] 14. Ativar APIs externas (Hunter, OpenAI, etc)
- [ ] 15. Remover fallback mock

### **🟢 OPCIONAL - OTIMIZAÇÕES:**

- [ ] 16. Configurar connection pooling avançado
- [ ] 17. Adicionar monitoring (Sentry)
- [ ] 18. Configurar cache Redis
- [ ] 19. Otimizar queries Prisma
- [ ] 20. Adicionar testes de integração

---

## 🔟 TESTE RÁPIDO DE SANIDADE

### **Teste Local (psql):**
```bash
psql "postgresql://postgres:[PASSWORD]@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require"
```

**Esperado:** Conectar com sucesso

### **Teste Simples API:**
```typescript
// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 📌 RESUMO EXECUTIVO

### **PROBLEMA PRINCIPAL:**
❌ `DATABASE_URL` aponta para SQLite local (`file:./dev.db`) que **não funciona no Vercel**

### **SOLUÇÃO:**
✅ Configurar URLs corretas do Supabase (pooler + direta) com senha encodada

### **IMPACTO ATUAL:**
⚠️ Sistema funciona com dados mock, mas **não persiste dados**

### **TEMPO ESTIMADO DE CORREÇÃO:**
⏱️ **15-30 minutos** (se tiver todas as credenciais corretas)

### **PRIORIDADE:**
🔴 **CRÍTICA** - Sistema não é utilizável em produção sem banco de dados

---

## 📞 INFORMAÇÕES NECESSÁRIAS DO USUÁRIO

**Para finalizar a configuração, preciso:**

1. ✅ **Senha do banco Supabase** (a senha real, sem encoding - eu faço o encoding)
2. ✅ **Confirmar project reference:** `qtcwetabhhkhvomcrqgm`
3. ✅ **Confirmar região:** `sa-east-1`
4. ⚠️ **Decisão sobre migrações:** Automático no build ou manual?

**Opcional mas recomendado:**
5. NEXTAUTH_SECRET (gerar novo ou fornecer existente)
6. Chaves de APIs externas (se quiser ativar já)

---

**Documento gerado em:** 2025-01-17  
**Versão do sistema:** 0.1.0  
**Status:** 🟡 Aguardando credenciais Supabase

