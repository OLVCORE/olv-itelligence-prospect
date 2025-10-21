-- HOTFIX PACK V2 - Correções de esquema
-- Executar no Supabase SQL Editor

-- 1. Company: capital como NUMERIC estável
ALTER TABLE public."Company"
  ALTER COLUMN capital TYPE NUMERIC(16,2) USING NULLIF(capital::text, '')::numeric;

-- 2. Garantir cnpj limpo + único
ALTER TABLE public."Company"
  ALTER COLUMN cnpj TYPE TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_cnpj_unique 
  ON public."Company"(cnpj) 
  WHERE cnpj IS NOT NULL;

-- 3. TechStack confidence entre 0 e 100
ALTER TABLE public."TechStack"
  ALTER COLUMN confidence TYPE NUMERIC(5,2) 
  USING COALESCE(confidence,0)::numeric;

-- 4. Maturity scores como JSONB
ALTER TABLE public."CompanyTechMaturity"
  ALTER COLUMN scores TYPE JSONB 
  USING COALESCE(scores::jsonb, '{}'::jsonb);

-- 5. BuyingSignal detectedAt com timezone
ALTER TABLE public."BuyingSignal"
  ALTER COLUMN "detectedAt" TYPE TIMESTAMP WITH TIME ZONE
  USING COALESCE("detectedAt", now());

-- 6. Trigger updatedAt automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname='set_company_updated_at'
  ) THEN
    CREATE TRIGGER set_company_updated_at
    BEFORE UPDATE ON public."Company"
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- 7. Sanitizar capitais absurdos (> 1 trilhão)
UPDATE public."Company" 
SET capital = NULL 
WHERE capital > 1000000000000;

-- 8. Criar tabela DigitalPresence se não existir
CREATE TABLE IF NOT EXISTS public."DigitalPresence" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL REFERENCES public."Company"(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_digital_presence_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id)
);

CREATE INDEX IF NOT EXISTS idx_digital_presence_company 
  ON public."DigitalPresence"("companyId");

-- 9. Criar tabela Canvas se não existir
CREATE TABLE IF NOT EXISTS public."Canvas" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" TEXT UNIQUE REFERENCES public."Company"(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para Canvas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname='set_canvas_updated_at'
  ) THEN
    CREATE TRIGGER set_canvas_updated_at
    BEFORE UPDATE ON public."Canvas"
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- 10. Adicionar índices de performance
CREATE INDEX IF NOT EXISTS idx_company_status 
  ON public."Company"(status);

CREATE INDEX IF NOT EXISTS idx_company_size 
  ON public."Company"(size);

CREATE INDEX IF NOT EXISTS idx_analysis_company 
  ON public."Analysis"("companyId");

CREATE INDEX IF NOT EXISTS idx_person_company 
  ON public."Person"("companyId");

-- FIM

