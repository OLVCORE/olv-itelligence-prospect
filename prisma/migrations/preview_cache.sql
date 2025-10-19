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

