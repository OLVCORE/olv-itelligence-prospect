-- ========================================
-- RLS POLICIES - MULTI-TENANT POR projectId
-- OLV Intelligent Prospecting System
-- ========================================

-- IMPORTANTE:
-- Este script aplica Row Level Security (RLS) para isolamento multi-tenant.
-- As políticas garantem que usuários só acessem dados dos projetos aos quais pertencem.
-- 
-- PRÉ-REQUISITOS:
-- 1. Tabela "ProjectMember" deve existir (já está no schema.prisma)
-- 2. Supabase Auth configurado (ou usar Service Role para ignorar RLS)
-- 3. auth.uid() retorna o ID do usuário logado
--
-- ATENÇÃO:
-- - Service Role Key IGNORA RLS (ideal para backend/integrações)
-- - Anon Key OBEDECE RLS (ideal para frontend com usuários logados)

-- ========================================
-- 1) ATIVAR RLS NAS TABELAS ADITIVAS
-- ========================================

ALTER TABLE "Firmographics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TechSignals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompanyTechMaturity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SearchCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMember" ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2) POLÍTICAS PARA ProjectMember
-- ========================================

-- Usuários podem ver suas próprias memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON "ProjectMember";
CREATE POLICY "Users can view their own memberships"
  ON "ProjectMember" FOR SELECT
  USING (auth.uid()::text = "userId");

-- Admins/Owners do projeto podem ver todos os membros
DROP POLICY IF EXISTS "Project admins can view all members" ON "ProjectMember";
CREATE POLICY "Project admins can view all members"
  ON "ProjectMember" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "ProjectMember" pm
      WHERE pm."projectId" = "ProjectMember"."projectId"
        AND pm."userId" = auth.uid()::text
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Owners podem adicionar/remover membros
DROP POLICY IF EXISTS "Project owners can manage members" ON "ProjectMember";
CREATE POLICY "Project owners can manage members"
  ON "ProjectMember" FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "ProjectMember" pm
      WHERE pm."projectId" = "ProjectMember"."projectId"
        AND pm."userId" = auth.uid()::text
        AND pm.role = 'owner'
    )
  );

-- ========================================
-- 3) POLÍTICAS PARA Firmographics
-- ========================================

DROP POLICY IF EXISTS "firmographics_select" ON "Firmographics";
CREATE POLICY "firmographics_select" ON "Firmographics"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "Firmographics"."companyId"
      AND pm."userId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "firmographics_insert" ON "Firmographics";
CREATE POLICY "firmographics_insert" ON "Firmographics"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "Firmographics"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "firmographics_update" ON "Firmographics";
CREATE POLICY "firmographics_update" ON "Firmographics"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "Firmographics"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "Firmographics"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "firmographics_delete" ON "Firmographics";
CREATE POLICY "firmographics_delete" ON "Firmographics"
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "Firmographics"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin')
  )
);

-- ========================================
-- 4) POLÍTICAS PARA TechSignals
-- ========================================

DROP POLICY IF EXISTS "techsignals_select" ON "TechSignals";
CREATE POLICY "techsignals_select" ON "TechSignals"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "TechSignals"."companyId"
      AND pm."userId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "techsignals_insert" ON "TechSignals";
CREATE POLICY "techsignals_insert" ON "TechSignals"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "TechSignals"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "techsignals_update" ON "TechSignals";
CREATE POLICY "techsignals_update" ON "TechSignals"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "TechSignals"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "TechSignals"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "techsignals_delete" ON "TechSignals";
CREATE POLICY "techsignals_delete" ON "TechSignals"
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "TechSignals"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin')
  )
);

-- ========================================
-- 5) POLÍTICAS PARA CompanyTechMaturity
-- ========================================

DROP POLICY IF EXISTS "ctm_select" ON "CompanyTechMaturity";
CREATE POLICY "ctm_select" ON "CompanyTechMaturity"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "CompanyTechMaturity"."companyId"
      AND pm."userId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "ctm_insert" ON "CompanyTechMaturity";
CREATE POLICY "ctm_insert" ON "CompanyTechMaturity"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "CompanyTechMaturity"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "ctm_update" ON "CompanyTechMaturity";
CREATE POLICY "ctm_update" ON "CompanyTechMaturity"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "CompanyTechMaturity"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "CompanyTechMaturity"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin', 'member')
  )
);

DROP POLICY IF EXISTS "ctm_delete" ON "CompanyTechMaturity";
CREATE POLICY "ctm_delete" ON "CompanyTechMaturity"
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM "Company" c
    JOIN "ProjectMember" pm ON pm."projectId" = c."projectId"
    WHERE c.id = "CompanyTechMaturity"."companyId"
      AND pm."userId" = auth.uid()::text
      AND pm.role IN ('owner', 'admin')
  )
);

-- ========================================
-- 6) POLÍTICAS PARA SearchCache (GLOBAL)
-- ========================================

-- SearchCache é global (cache compartilhado entre projetos)
-- Todos podem ler, apenas membros autenticados podem inserir

DROP POLICY IF EXISTS "searchcache_select" ON "SearchCache";
CREATE POLICY "searchcache_select" ON "SearchCache"
FOR SELECT
USING (true); -- Cache é público (leitura)

DROP POLICY IF EXISTS "searchcache_insert" ON "SearchCache";
CREATE POLICY "searchcache_insert" ON "SearchCache"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL); -- Apenas usuários autenticados podem cachear

DROP POLICY IF EXISTS "searchcache_delete" ON "SearchCache";
CREATE POLICY "searchcache_delete" ON "SearchCache"
FOR DELETE
USING (auth.uid() IS NOT NULL); -- Apenas autenticados podem limpar cache (TTL automático via cronjob)

-- ========================================
-- 7) VIEWS AUXILIARES (DEBUGGING/ANALYTICS)
-- ========================================

-- View para facilitar queries com projectId já resolvido
CREATE OR REPLACE VIEW v_firmographics_with_project AS
SELECT f.*, c."projectId"
FROM "Firmographics" f
JOIN "Company" c ON c.id = f."companyId";

CREATE OR REPLACE VIEW v_techsignals_with_project AS
SELECT t.*, c."projectId"
FROM "TechSignals" t
JOIN "Company" c ON c.id = t."companyId";

CREATE OR REPLACE VIEW v_maturity_with_project AS
SELECT m.*, c."projectId"
FROM "CompanyTechMaturity" m
JOIN "Company" c ON c.id = m."companyId";

-- ========================================
-- 8) ÍNDICES ADICIONAIS (PERFORMANCE)
-- ========================================

-- Índices compostos para otimizar queries de membership
CREATE INDEX IF NOT EXISTS idx_company_projectId ON "Company" ("projectId");
CREATE INDEX IF NOT EXISTS idx_pm_projectId_userId ON "ProjectMember" ("projectId", "userId");
CREATE INDEX IF NOT EXISTS idx_pm_userId_role ON "ProjectMember" ("userId", "role");

-- Índices para queries de evidências
CREATE INDEX IF NOT EXISTS idx_firmo_companyId_source ON "Firmographics" ("companyId", "source");
CREATE INDEX IF NOT EXISTS idx_ts_companyId_kind_source ON "TechSignals" ("companyId", "kind", "source");
CREATE INDEX IF NOT EXISTS idx_ctm_companyId_vendor ON "CompanyTechMaturity" ("companyId", "vendor");

-- Índices para TTL/cleanup
CREATE INDEX IF NOT EXISTS idx_firmo_fetchedAt ON "Firmographics" ("fetchedAt");
CREATE INDEX IF NOT EXISTS idx_ts_fetchedAt ON "TechSignals" ("fetchedAt");
CREATE INDEX IF NOT EXISTS idx_sc_expiresAt ON "SearchCache" ("expiresAt");

-- ========================================
-- 9) FUNCTION PARA CLEANUP AUTOMÁTICO (TTL)
-- ========================================

-- Remove cache expirado (rodar via pg_cron ou Supabase Edge Function)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM "SearchCache"
  WHERE "expiresAt" < NOW();
  
  RAISE NOTICE 'Cache cleanup completed';
END;
$$;

-- Agendar cronjob (Supabase Dashboard → Database → Cron Jobs)
-- SELECT cron.schedule('cleanup-cache', '0 * * * *', 'SELECT cleanup_expired_cache();');

-- ========================================
-- 10) AUDITORIA (OPCIONAL)
-- ========================================

-- Trigger para auditar mudanças em CompanyTechMaturity
CREATE OR REPLACE FUNCTION audit_maturity_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log apenas se scores mudaram significativamente
    IF (NEW.scores::jsonb ->> 'overall')::int != (OLD.scores::jsonb ->> 'overall')::int THEN
      INSERT INTO "AuditLog" ("userId", "action", "resource", "resourceId", "changes", "createdAt")
      VALUES (
        COALESCE(auth.uid()::text, 'system'),
        'UPDATE',
        'CompanyTechMaturity',
        NEW.id,
        jsonb_build_object(
          'oldScore', (OLD.scores::jsonb ->> 'overall')::int,
          'newScore', (NEW.scores::jsonb ->> 'overall')::int
        )::text,
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Ativar trigger (opcional)
-- DROP TRIGGER IF EXISTS trigger_audit_maturity ON "CompanyTechMaturity";
-- CREATE TRIGGER trigger_audit_maturity
--   AFTER UPDATE ON "CompanyTechMaturity"
--   FOR EACH ROW
--   EXECUTE FUNCTION audit_maturity_changes();

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- VALIDAÇÃO (rodar após aplicar as policies):
-- 1. Verificar se RLS está ativo:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('Firmographics', 'TechSignals', 'CompanyTechMaturity', 'SearchCache', 'ProjectMember');

-- 2. Listar todas as políticas:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('Firmographics', 'TechSignals', 'CompanyTechMaturity', 'SearchCache', 'ProjectMember')
ORDER BY tablename, policyname;

-- 3. Testar com usuário de teste (criar ProjectMember primeiro):
-- INSERT INTO "ProjectMember" ("id", "projectId", "userId", "role", "createdAt", "updatedAt")
-- VALUES (gen_random_uuid()::text, 'default-project-id', 'test-user-id', 'member', NOW(), NOW());

