-- ==========================================
-- MÓDULO 2: PreviewCache Table
-- Aplicar este SQL no Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS "PreviewCache" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "jobId" TEXT NOT NULL UNIQUE,
  "cnpj" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "data" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "PreviewCache_jobId_idx" ON "PreviewCache"("jobId");
CREATE INDEX IF NOT EXISTS "PreviewCache_cnpj_idx" ON "PreviewCache"("cnpj");
CREATE INDEX IF NOT EXISTS "PreviewCache_expiresAt_idx" ON "PreviewCache"("expiresAt");

-- Comentários
COMMENT ON TABLE "PreviewCache" IS 'Cache de resultados de deep-scan assíncrono do preview';
COMMENT ON COLUMN "PreviewCache"."jobId" IS 'Identificador único do job de deep-scan';
COMMENT ON COLUMN "PreviewCache"."data" IS 'Resultado completo em JSON (presença digital)';
COMMENT ON COLUMN "PreviewCache"."expiresAt" IS 'Data de expiração (TTL 24h)';

