# 🔑 Adicionar Variáveis do Supabase ao .env.local

## ⚠️ Problema
O script de migration precisa das seguintes variáveis que estão faltando no `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Solução Rápida

### Passo 1: Extrair informações do DATABASE_URL existente

Do seu `DATABASE_URL` atual:
```
postgresql://postgres.qtcwetabhhkhvomcrqgm:...@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Seu Project Reference é:** `qtcwetabhhkhvomcrqgm`

Portanto, sua **NEXT_PUBLIC_SUPABASE_URL** é:
```
https://qtcwetabhhkhvomcrqgm.supabase.co
```

---

### Passo 2: Obter as chaves no Supabase Dashboard

1. Acesse: https://app.supabase.com/project/qtcwetabhhkhvomcrqgm

2. Vá em **Settings** (⚙️) > **API**

3. Você verá 3 chaves:
   - **URL**: https://qtcwetabhhkhvomcrqgm.supabase.co (confirme)
   - **anon public**: `eyJhbGc...` (chave pública, segura para usar no frontend)
   - **service_role**: `eyJhbGc...` (chave secreta, **NUNCA** expor no frontend)

---

### Passo 3: Adicionar ao .env.local

Abra o arquivo `.env.local` e adicione estas linhas:

```bash
# ========================================
# SUPABASE (Client)
# ========================================

NEXT_PUBLIC_SUPABASE_URL="https://qtcwetabhhkhvomcrqgm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="cole_sua_anon_key_aqui"
SUPABASE_SERVICE_ROLE_KEY="cole_sua_service_role_key_aqui"
```

---

### Passo 4: Executar a migration novamente

Após adicionar as variáveis:

```bash
npx tsx scripts/run-preview-cache-migration.ts
```

---

## 🚨 Alternativa: Migration Manual (Mais Rápido)

Se preferir não mexer no `.env.local` agora, execute a migration diretamente no Supabase:

### Passo 1: Acessar SQL Editor
1. Vá em: https://app.supabase.com/project/qtcwetabhhkhvomcrqgm/sql/new
2. Cole o SQL abaixo
3. Clique em **Run**

### Passo 2: SQL da Migration

```sql
-- Migration: Criar tabela preview_cache para deep-scan assíncrono
-- MÓDULO 1: Suporte para resposta parcial + background job

-- Criar tabela de cache para preview
CREATE TABLE IF NOT EXISTS preview_cache (
  job_id TEXT PRIMARY KEY,
  cnpj TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'error')),
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por CNPJ (caso queiramos reutilizar cache)
CREATE INDEX IF NOT EXISTS idx_preview_cache_cnpj ON preview_cache(cnpj);

-- Índice para limpeza de expirados
CREATE INDEX IF NOT EXISTS idx_preview_cache_expires_at ON preview_cache(expires_at);

-- Comentários
COMMENT ON TABLE preview_cache IS 'Cache para deep-scan assíncrono de preview de empresas';
COMMENT ON COLUMN preview_cache.job_id IS 'UUID único do job de deep-scan';
COMMENT ON COLUMN preview_cache.status IS 'Status: pending, completed, error';
COMMENT ON COLUMN preview_cache.data IS 'Resultado do deep-scan (presença digital, notícias, IA)';
COMMENT ON COLUMN preview_cache.expires_at IS 'Data de expiração do cache (TTL 24h)';

-- Política RLS (Row Level Security) - permitir acesso público interno
ALTER TABLE preview_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow internal access to preview_cache"
  ON preview_cache
  FOR ALL
  USING (true);
```

### Passo 3: Verificar
Execute para confirmar:
```sql
SELECT * FROM preview_cache LIMIT 1;
```

Se retornar sem erro (mesmo que vazio), está pronto! ✅

---

## ✅ Após a Migration

**Teste o pré-relatório:**
1. Aguarde o deploy do Vercel completar
2. Abra o dashboard
3. Pesquise um CNPJ: `33.683.111/0001-07`
4. **Esperado:** Modal abre rápido (< 7s) sem erro 504

---

**Dica:** A migration manual é mais rápida. Depois, você pode adicionar as variáveis do Supabase ao `.env.local` para testes locais.

