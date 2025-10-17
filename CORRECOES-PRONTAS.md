# 🔧 CORREÇÕES PRONTAS PARA APLICAR

## 1️⃣ ATUALIZAR `prisma/schema.prisma`

**Localização:** `prisma/schema.prisma` (linhas 8-11)

**❌ ANTES:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**✅ DEPOIS:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooler para runtime
  directUrl = env("DIRECT_URL")        // Direta para migrações
}
```

---

## 2️⃣ ATUALIZAR `package.json`

**Localização:** `package.json` (linha 7)

**❌ ANTES:**
```json
"build": "prisma generate && next build",
```

**✅ DEPOIS:**
```json
"build": "prisma migrate deploy && prisma generate && next build",
```

**OU (alternativa sem migrações automáticas):**
```json
"build": "prisma generate && next build",
"vercel-build": "prisma migrate deploy && prisma generate && next build",
```

---

## 3️⃣ CRIAR/ATUALIZAR `.env.local` (LOCAL)

**Localização:** `.env.local` (criar se não existir)

```bash
# Database - LOCAL (SQLite)
DATABASE_URL="file:./dev.db"

# APIs
RECEITAWS_API_TOKEN="71260c7509a5d692644af4cbd32abc5cf6484b3bd48d4222eae72da31ec19886"
OPENAI_API_KEY="sk-proj-XXXXX"  # Fornecer chave real
HUNTER_API_KEY="XXXXX"           # Fornecer chave real
GOOGLE_API_KEY="XXXXX"           # Fornecer chave real
GOOGLE_CSE_ID="XXXXX"            # Fornecer ID real

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="desenvolvimento_local_secret_key_32_caracteres_minimo"

# Supabase (opcional para testes locais)
# NEXT_PUBLIC_SUPABASE_URL="https://qtcwetabhhkhvomcrqgm.supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4️⃣ CONFIGURAR VARIÁVEIS NO VERCEL

### **🔴 CRÍTICAS - CONFIGURAR AGORA:**

**Acesse:** Vercel Dashboard → Project Settings → Environment Variables

#### **DATABASE_URL** (Pooler - Production, Preview, Development)
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:[SENHA_URL_ENCODED]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Substituir:**
- `[SENHA_URL_ENCODED]` pela senha com caracteres especiais encodados

**Exemplo se senha for `#Bliss2711#`:**
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:%23Bliss2711%23@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

#### **DIRECT_URL** (Direta - Production, Preview, Development)
```
postgresql://postgres:[SENHA_URL_ENCODED]@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require
```

**Exemplo se senha for `#Bliss2711#`:**
```
postgresql://postgres:%23Bliss2711%23@db.qtcwetabhhkhvomcrqgm.supabase.co:5432/postgres?sslmode=require
```

#### **NEXTAUTH_URL** (Production)
```
https://olv-itelligence-prospect.vercel.app
```

#### **NEXTAUTH_SECRET** (Production, Preview, Development)
```
[GERAR_NOVO_SECRET_32_CHARS_MINIMO]
```

**Gerar com:**
```bash
openssl rand -base64 32
```

### **🟡 IMPORTANTE - CONFIGURAR EM SEGUIDA:**

#### **RECEITAWS_API_TOKEN**
```
71260c7509a5d692644af4cbd32abc5cf6484b3bd48d4222eae72da31ec19886
```

#### **OPENAI_API_KEY** (se disponível)
```
sk-proj-XXXXXXXXXXXXXXXXXXXXX
```

#### **HUNTER_API_KEY** (se disponível)
```
XXXXXXXXXXXXXXXXXXXXX
```

#### **GOOGLE_API_KEY** (se disponível)
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
```

#### **GOOGLE_CSE_ID** (se disponível)
```
XXXXXXXXXXXXXXXXXXXXX
```

---

## 5️⃣ CRIAR `vercel.json` (OPCIONAL MAS RECOMENDADO)

**Localização:** `vercel.json` (raiz do projeto)

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  },
  "regions": ["gru1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "PRISMA_GENERATE_SKIP_AUTOINSTALL": "false"
    }
  }
}
```

**Benefícios:**
- ✅ Deploy em São Paulo (mais próximo do Supabase sa-east-1)
- ✅ Timeout maior para APIs (10s)
- ✅ Runtime Node.js explícito

---

## 6️⃣ CRIAR ROTA DE TESTE DO BANCO

**Localização:** `app/api/test-db/route.ts` (criar novo arquivo)

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/test-db
 * Testa conexão com banco de dados
 */
export async function GET() {
  try {
    console.log('[TEST-DB] Iniciando teste de conexão...')
    
    // Teste 1: Conectar
    await prisma.$connect()
    console.log('[TEST-DB] ✅ Conexão estabelecida')
    
    // Teste 2: Query simples
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`
    console.log('[TEST-DB] ✅ Query executada:', result)
    
    // Teste 3: Contar tabelas
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    console.log('[TEST-DB] ✅ Tabelas acessíveis')
    
    // Desconectar
    await prisma.$disconnect()
    console.log('[TEST-DB] ✅ Desconectado com sucesso')
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados funcionando corretamente!',
      data: {
        test: result,
        counts: {
          users: userCount,
          companies: companyCount
        },
        database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[TEST-DB] ❌ Erro:', error.message)
    console.error('[TEST-DB] Stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
```

**Uso:**
```bash
# Após deploy, testar:
https://olv-itelligence-prospect.vercel.app/api/test-db
```

---

## 7️⃣ COMANDOS PARA EXECUTAR

### **Local (Desenvolvimento):**

```bash
# 1. Instalar dependências (se necessário)
npm install

# 2. Gerar cliente Prisma
npm run db:generate

# 3. Rodar migrações (se estiver usando Supabase localmente)
# npm run db:push

# 4. Popular banco com dados seed (opcional)
# npm run db:seed

# 5. Iniciar servidor dev
npm run dev
```

### **Deploy no Vercel:**

```bash
# 1. Commit das alterações
git add prisma/schema.prisma package.json vercel.json app/api/test-db/route.ts
git commit -m "fix: Configurar Prisma para Supabase com pooler e direct URL"

# 2. Push para GitHub (dispara deploy automático)
git push origin main

# 3. OU deploy manual
# vercel --prod
```

### **Após Deploy:**

```bash
# 1. Aguardar build (1-2 min)

# 2. Testar conexão
curl https://olv-itelligence-prospect.vercel.app/api/test-db

# 3. Verificar dashboard
https://olv-itelligence-prospect.vercel.app/dashboard

# 4. Monitorar logs
# Vercel Dashboard → Deployments → Latest → Logs
```

---

## 8️⃣ CODIFICAÇÃO DE SENHA (URL ENCODING)

### **Caracteres Especiais → URL Encoded:**

| Caractere | URL Encoded |
|-----------|-------------|
| `#`       | `%23`       |
| `@`       | `%40`       |
| `:`       | `%3A`       |
| `/`       | `%2F`       |
| `?`       | `%3F`       |
| `&`       | `%26`       |
| `=`       | `%3D`       |
| `%`       | `%25`       |
| `+`       | `%2B`       |
| ` ` (espaço) | `%20`    |

### **Ferramentas de Encoding:**

**Online:**
- https://www.urlencoder.org/

**Node.js:**
```javascript
const senha = '#Bliss2711#'
const encoded = encodeURIComponent(senha)
console.log(encoded)  // %23Bliss2711%23
```

**Bash/Terminal:**
```bash
python3 -c "import urllib.parse; print(urllib.parse.quote('#Bliss2711#'))"
```

---

## 9️⃣ CHECKLIST DE VALIDAÇÃO

### **✅ Após Aplicar Correções:**

- [ ] `prisma/schema.prisma` atualizado com `directUrl`
- [ ] `package.json` com `prisma migrate deploy`
- [ ] Variáveis configuradas no Vercel (DATABASE_URL, DIRECT_URL)
- [ ] Senha URL encoded corretamente
- [ ] Commit e push realizados
- [ ] Deploy bem-sucedido no Vercel
- [ ] `/api/test-db` retorna success
- [ ] Dashboard carrega sem erro de banco
- [ ] Empresas são listadas corretamente
- [ ] Dados são persistidos (criar empresa e verificar)

### **🔍 Troubleshooting:**

**Se ainda houver erro:**

1. **Verificar senha:** Confirmar que está correta no Supabase
2. **Verificar encoding:** Testar URL no psql local
3. **Verificar região:** Confirmar sa-east-1
4. **Verificar user:** Pooler usa `postgres.PROJECT_REF`, direta usa `postgres`
5. **Verificar logs:** Vercel Dashboard → Logs
6. **Testar conexão direta:** psql com DIRECT_URL
7. **Verificar SSL:** Adicionar `sslmode=require`
8. **Verificar firewall:** Supabase permite conexões do Vercel?

---

## 🔟 CONTATOS E PRÓXIMOS PASSOS

### **Se tudo funcionar:**
1. ✅ Remover fallback mock de `/api/companies/list`
2. ✅ Ativar APIs externas (Hunter, OpenAI, etc)
3. ✅ Testar todas as funcionalidades
4. ✅ Validar persistência de dados
5. ✅ Configurar monitoramento (Sentry)

### **Se houver problemas:**
1. 📧 Enviar logs do Vercel
2. 📧 Confirmar credenciais do Supabase
3. 📧 Testar conexão local com as mesmas URLs
4. 📧 Verificar se há firewall/whitelist no Supabase

---

**Documento gerado em:** 2025-01-17  
**Status:** 🟢 Pronto para aplicar

