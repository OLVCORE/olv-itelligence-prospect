-- Script para corrigir valores exorbitantes de capital social
-- Executar no Supabase SQL Editor

-- 1. Verificar valores problemáticos
SELECT id, name, capital, 
       CASE 
         WHEN capital > 1000000000 THEN 'VALOR EXORBITANTE'
         ELSE 'OK'
       END as status
FROM "Company" 
WHERE capital > 1000000000;

-- 2. Corrigir valores exorbitantes (dividir por 1000 ou 10000 conforme necessário)
UPDATE "Company" 
SET capital = CASE 
  WHEN capital > 1000000000000 THEN capital / 1000000  -- Dividir por 1 milhão
  WHEN capital > 100000000000 THEN capital / 100000    -- Dividir por 100 mil
  WHEN capital > 10000000000 THEN capital / 10000      -- Dividir por 10 mil
  WHEN capital > 1000000000 THEN capital / 1000        -- Dividir por 1 mil
  ELSE capital
END
WHERE capital > 1000000000;

-- 3. Verificar correções
SELECT id, name, capital, 
       CASE 
         WHEN capital > 1000000000 THEN 'AINDA EXORBITANTE'
         ELSE 'CORRIGIDO'
       END as status
FROM "Company" 
WHERE capital > 1000000000;
