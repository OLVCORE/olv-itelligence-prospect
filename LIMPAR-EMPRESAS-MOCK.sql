-- Remover empresas MOCK do banco de dados
-- Manter apenas empresas REAIS

-- Lista de CNPJs MOCK para remover:
-- 1. Consultoria Empresarial Ltda: 11222333000144
-- 2. Inovação Digital S.A.: 98765432000110
-- 3. TechCorp Soluções Ltda: 12345678000190

-- REMOVER empresas mock
DELETE FROM "Company"
WHERE cnpj IN (
  '11222333000144',
  '11.222.333/0001-44',
  '98765432000110',
  '98.765.432/0001-10',
  '12345678000190',
  '12.345.678/0001-90'
);

-- Verificar empresas restantes (devem ser apenas REAIS)
SELECT 
  cnpj, 
  name,
  "tradeName",
  "createdAt"
FROM "Company"
ORDER BY "createdAt" DESC;

-- Se quiser remover TODAS as empresas e começar limpo:
-- DELETE FROM "Company";

