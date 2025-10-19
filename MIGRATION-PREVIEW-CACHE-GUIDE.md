# 🗄️ Guia de Migration: preview_cache

## Objetivo
Criar a tabela `preview_cache` no Supabase para suportar o **deep-scan assíncrono** do MÓDULO 1.

## ⚡ Opção 1: Via Script Automático (Recomendado)

```bash
npx tsx scripts/run-preview-cache-migration.ts
```

**Requisitos:**
- `NEXT_PUBLIC_SUPABASE_URL` configurada no `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` configurada no `.env.local` (Service Role Key, não a anon key!)

---

## 🛠️ Opção 2: Manual via Supabase Dashboard

Se o script automático não funcionar (ex: por limitações da API do Supabase), execute manualmente:

### Passo 1: Acessar o SQL Editor
1. Vá em https://app.supabase.com
2. Selecione seu projeto **OLV Intelligence**
3. Clique em **"SQL Editor"** no menu lateral

### Passo 2: Executar o SQL
Cole o seguinte SQL e execute:

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
Execute para confirmar que a tabela foi criada:

```sql
SELECT * FROM preview_cache LIMIT 1;
```

---

## 📊 Estrutura da Tabela

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `job_id` | TEXT (PK) | UUID único do job de deep-scan |
| `cnpj` | TEXT | CNPJ da empresa |
| `status` | TEXT | Status: 'pending', 'completed', 'error' |
| `data` | JSONB | Resultado completo do deep-scan |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `expires_at` | TIMESTAMPTZ | Data de expiração (TTL 24h) |
| `updated_at` | TIMESTAMPTZ | Data da última atualização |

---

## 🔄 Fluxo de Uso

1. **API /api/companies/preview** (Fase 1 - Síncrona):
   - Retorna dados parciais + `jobId`
   - Dispara `/api/preview/deep-scan` em background

2. **API /api/preview/deep-scan** (Fase 2 - Assíncrona):
   - Executa busca profunda (redes sociais, marketplaces, jusbrasil, notícias)
   - Salva resultado em `preview_cache` com `status: 'completed'`

3. **API /api/preview/status?jobId=<id>**:
   - Frontend faz polling a cada 2s
   - Retorna `{ status: 'pending' | 'completed' | 'error', data: {...} }`

4. **PreviewModal (Frontend)**:
   - Exibe dados parciais imediatamente
   - Mostra indicador "Análise em andamento..."
   - Quando polling retorna `completed`, mescla os dados

---

## 🧹 Limpeza de Cache Expirado (Opcional)

Para limpar automaticamente os registros expirados, você pode criar uma função no Supabase:

```sql
-- Função para limpar cache expirado (executar diariamente via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_preview_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM preview_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

E agendar via **pg_cron** (requer extensão pg_cron ativada):

```sql
SELECT cron.schedule('cleanup-preview-cache', '0 3 * * *', 'SELECT cleanup_expired_preview_cache()');
```

---

## ✅ Status da Migration
- [ ] Tabela `preview_cache` criada
- [ ] Índices criados
- [ ] Políticas RLS configuradas
- [ ] Teste de inserção realizado

---

**Próximos Passos:** Após executar a migration, teste o pré-relatório e observe os logs para confirmar que o deep-scan está salvando e lendo do cache corretamente.

