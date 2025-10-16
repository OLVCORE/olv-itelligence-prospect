# Guia de Migração: SQLite → Supabase (PostgreSQL)

## 🎯 Por Que Migrar?

Seu sistema está usando **SQLite** (arquivo local `dev.db`) que é ótimo para desenvolvimento, mas limitado para produção:

❌ **Problemas do SQLite:**
- Não funciona em ambientes serverless (Vercel)
- Sem conexões simultâneas
- Sem backups automáticos
- Sem replicação
- Arquivo local (perde ao fazer deploy)

✅ **Vantagens do Supabase:**
- PostgreSQL gerenciado na nuvem
- Auth integrado (pode substituir NextAuth)
- Storage para PDFs e exports
- Realtime para canvas colaborativo
- Backups automáticos diários
- API REST auto-gerada
- Integração perfeita com Vercel
- **GRÁTIS até 500MB + 2GB transferência/mês**

---

## 📋 Passo a Passo da Migração

### 1️⃣ Criar Conta no Supabase

1. Acesse: https://supabase.com/dashboard/sign-up
2. Cadastre-se (pode usar conta GitHub)
3. Clique em "New Project"
4. Preencha:
   - **Name**: `olv-intelligence`
   - **Database Password**: Gere uma senha forte (SALVE!)
   - **Region**: `South America (São Paulo)` (melhor latência BR)
   - **Pricing Plan**: `Free` (por enquanto)
5. Aguarde ~2 minutos (criação do banco)

### 2️⃣ Obter Connection String

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **Database**
3. Role até **Connection string**
4. Selecione a aba **URI**
5. Copie a string que parece com:
   ```
   postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Substitua `[SUA-SENHA]` pela senha que você criou

### 3️⃣ Atualizar Arquivo de Ambiente

Edite seu arquivo `env.local` (ou crie se não existe):

```env
# ANTES (SQLite)
# DATABASE_URL="file:./dev.db"

# DEPOIS (Supabase)
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# OPCIONAL: Connection Pooling (recomendado para produção)
# DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true"
```

### 4️⃣ Atualizar Schema do Prisma

Edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ← MUDOU DE "sqlite"
  url      = env("DATABASE_URL")
}
```

### 5️⃣ Aplicar Migrations

Execute os comandos:

```bash
# 1. Gerar novo client do Prisma
npx prisma generate

# 2. Aplicar schema no Supabase
npx prisma db push

# 3. (Opcional) Popular com dados de exemplo
npm run db:seed
```

### 6️⃣ Verificar no Supabase

1. Volte ao painel do Supabase
2. Clique em **Table Editor** (ícone de tabela)
3. Você deve ver todas as suas tabelas:
   - User
   - Organization
   - Project
   - Company
   - TechStack
   - Contact
   - etc.

### 7️⃣ Testar Localmente

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Testar login e adicionar empresa
# http://localhost:3000
```

### 8️⃣ Configurar Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[SUA-SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres`
   - **Environment**: Selecione `Production`, `Preview`, `Development`
5. Clique em **Save**
6. Vá em **Deployments** → Clique nos 3 pontinhos → **Redeploy**

---

## 🔄 Migrar Dados Existentes (Se Houver)

Se você já tem dados no SQLite que quer manter:

### Opção A: Export/Import Manual (Recomendado para poucos dados)

```bash
# 1. Abrir Prisma Studio no SQLite
DATABASE_URL="file:./dev.db" npx prisma studio

# 2. Exportar dados manualmente (copiar/anotar)

# 3. Aplicar nova DATABASE_URL do Supabase

# 4. Abrir Prisma Studio no Supabase
npx prisma studio

# 5. Inserir dados manualmente
```

### Opção B: Script de Migração (Para muitos dados)

Crie `scripts/migrate-to-supabase.ts`:

```typescript
import { PrismaClient as SqliteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SqliteClient({
  datasources: { db: { url: 'file:./dev.db' } }
})

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrate() {
  console.log('🚀 Iniciando migração...')

  // Migrar Users
  const users = await sqlite.user.findMany()
  console.log(`📦 Migrando ${users.length} usuários...`)
  for (const user of users) {
    await postgres.user.create({ data: user })
  }

  // Migrar Organizations
  const orgs = await sqlite.organization.findMany()
  console.log(`📦 Migrando ${orgs.length} organizações...`)
  for (const org of orgs) {
    await postgres.organization.create({ data: org })
  }

  // Migrar Companies
  const companies = await sqlite.company.findMany()
  console.log(`📦 Migrando ${companies.length} empresas...`)
  for (const company of companies) {
    await postgres.company.create({ data: company })
  }

  console.log('✅ Migração concluída!')
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  })
```

Execute:
```bash
npx tsx scripts/migrate-to-supabase.ts
```

---

## 🎁 BONUS: Recursos Adicionais do Supabase

### 1. Supabase Auth (Substituir NextAuth - Opcional)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@email.com',
  password: 'password'
})
```

### 2. Supabase Storage (Para PDFs/Exports)

```typescript
// Upload de PDF
const { data, error } = await supabase.storage
  .from('reports')
  .upload(`${companyId}/preview.pdf`, file)

// URL pública
const { data: { publicUrl } } = supabase.storage
  .from('reports')
  .getPublicUrl(`${companyId}/preview.pdf`)
```

### 3. Supabase Realtime (Para Canvas Colaborativo)

```typescript
// Substituir y-websocket
const channel = supabase.channel('canvas-room')
  .on('broadcast', { event: 'update' }, (payload) => {
    // Atualizar canvas
  })
  .subscribe()
```

### 4. API REST Auto-gerada

O Supabase gera automaticamente uma API REST para todas as suas tabelas!

```typescript
// Buscar empresas (via API REST)
const response = await fetch(
  'https://xxxxx.supabase.co/rest/v1/Company?select=*',
  {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${token}`
    }
  }
)
```

---

## 🔧 Troubleshooting

### Erro: "Connection refused"
- Verifique se copiou a connection string correta
- Verifique se substituiu `[SUA-SENHA]`
- Teste a conexão no Supabase SQL Editor

### Erro: "SSL required"
Adicione `?sslmode=require` no final da connection string:
```
postgresql://...postgres?sslmode=require
```

### Erro: "Too many connections"
Use o pooler do Supabase (porta 6543):
```
postgresql://...supabase.co:6543/postgres?pgbouncer=true
```

### Prisma Studio não abre
```bash
# Limpar cache do Prisma
npx prisma generate --force
rm -rf node_modules/.prisma
npm install
```

---

## ✅ Checklist Final

Após a migração, verifique:

- [ ] Servidor local funciona (`npm run dev`)
- [ ] Login funciona
- [ ] Adicionar empresa funciona
- [ ] Buscar empresa funciona
- [ ] Preview funciona
- [ ] Dados persistem após restart
- [ ] Deploy no Vercel funciona
- [ ] Todas as APIs funcionam
- [ ] Não há erros no console

---

## 📊 Comparação de Performance

| Operação | SQLite (Local) | Supabase (Cloud) |
|----------|----------------|-------------------|
| Query simples | ~1ms | ~50-100ms |
| Insert | ~2ms | ~80-150ms |
| Query complexa | ~10ms | ~200-300ms |
| Deploy Vercel | ❌ Não funciona | ✅ Funciona |
| Colaboração | ❌ Impossível | ✅ Múltiplos usuários |
| Backup | ❌ Manual | ✅ Automático |
| Escalabilidade | ❌ Limitada | ✅ Ilimitada |

**Conclusão**: A pequena latência adicional (~50-100ms) é insignificante comparada aos benefícios!

---

## 💰 Custos Supabase

### Free Tier (Atual - GRÁTIS):
- 500MB database
- 1GB file storage
- 2GB bandwidth/mês
- 50k API requests/mês
- Backups diários (7 dias)
- **Suficiente para começar!**

### Pro Tier ($25/mês - Quando crescer):
- 8GB database
- 100GB file storage
- 250GB bandwidth/mês
- Backups diários (30 dias)
- Point-in-time recovery
- **Upgrade quando atingir limites**

---

## 🚀 Próximos Passos

1. **Hoje**: Migrar para Supabase
2. **Esta semana**: Testar tudo funcionando
3. **Semana que vem**: Configurar Supabase Storage para PDFs
4. **Mês que vem**: Avaliar Supabase Auth (substituir NextAuth)

---

## 📞 Suporte

- **Documentação**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase
- **Status**: https://status.supabase.com

---

**Dúvidas? Problemas? Me avise e vou te ajudar!**

