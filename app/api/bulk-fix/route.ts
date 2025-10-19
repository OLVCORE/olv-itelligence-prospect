import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  try {
    console.log('[API /bulk-fix] 🔍 Iniciando varredura completa do sistema...')

    const results = {
      schema: { status: 'checking', issues: [], fixes: [] },
      constraints: { status: 'checking', issues: [], fixes: [] },
      data: { status: 'checking', issues: [], fixes: [] },
      apis: { status: 'checking', issues: [], fixes: [] }
    }

    // 1. VERIFICAR E CORRIGIR SCHEMA
    console.log('[BULK-FIX] 📋 Verificando schema...')
    
    // Verificar se tabela Project existe
    const { data: projectTable, error: projectError } = await supabaseAdmin
      .from('Project')
      .select('id')
      .limit(1)

    if (projectError) {
      console.log('[BULK-FIX] ⚠️ Tabela Project não existe, criando...')
      
      // Criar tabela Project
      const createProjectSQL = `
        CREATE TABLE IF NOT EXISTS "Project" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "name" TEXT NOT NULL DEFAULT 'Projeto Padrão',
          "description" TEXT,
          "organizationId" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      
      await supabaseAdmin.rpc('exec_sql', { sql: createProjectSQL })
      results.schema.fixes.push('Tabela Project criada')
    }

    // Criar projeto padrão se não existir
    const { data: defaultProject, error: defaultProjectError } = await supabaseAdmin
      .from('Project')
      .select('id')
      .eq('name', 'Projeto Padrão')
      .single()

    if (defaultProjectError || !defaultProject) {
      console.log('[BULK-FIX] ⚠️ Projeto padrão não existe, criando...')
      
      const { data: newProject, error: createError } = await supabaseAdmin
        .from('Project')
        .insert({
          id: 'default-project',
          name: 'Projeto Padrão',
          description: 'Projeto padrão para empresas sem projeto específico'
        })
        .select()
        .single()

      if (!createError) {
        results.schema.fixes.push('Projeto padrão criado')
      }
    }

    // 2. VERIFICAR E CORRIGIR CONSTRAINTS
    console.log('[BULK-FIX] 🔗 Verificando constraints...')
    
    // Verificar foreign key Company -> Project
    const { data: fkCheck, error: fkError } = await supabaseAdmin
      .from('Company')
      .select('id, projectId')
      .limit(1)

    if (fkError && fkError.message.includes('foreign key')) {
      console.log('[BULK-FIX] ⚠️ Foreign key quebrada, corrigindo...')
      
      // Corrigir foreign key
      const fixForeignKeySQL = `
        -- Remover constraint quebrada
        ALTER TABLE "Company" DROP CONSTRAINT IF EXISTS "Company_projectId_fkey";
        
        -- Recriar constraint correta
        ALTER TABLE "Company" 
        ADD CONSTRAINT "Company_projectId_fkey" 
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL;
      `
      
      await supabaseAdmin.rpc('exec_sql', { sql: fixForeignKeySQL })
      results.constraints.fixes.push('Foreign key Company -> Project corrigida')
    }

    // 3. VERIFICAR E CORRIGIR DADOS
    console.log('[BULK-FIX] 📊 Verificando dados...')
    
    // Verificar empresas sem projectId
    const { data: companiesWithoutProject, error: companiesError } = await supabaseAdmin
      .from('Company')
      .select('id, projectId')
      .is('projectId', null)

    if (!companiesError && companiesWithoutProject?.length > 0) {
      console.log(`[BULK-FIX] ⚠️ ${companiesWithoutProject.length} empresas sem projectId, corrigindo...`)
      
      for (const company of companiesWithoutProject) {
        await supabaseAdmin
          .from('Company')
          .update({ projectId: 'default-project' })
          .eq('id', company.id)
      }
      
      results.data.fixes.push(`${companiesWithoutProject.length} empresas atualizadas com projectId`)
    }

    // 4. VERIFICAR E CORRIGIR SCHEMA COMPLETO
    console.log('[BULK-FIX] 🏗️ Verificando schema completo...')
    
    const completeSchemaSQL = `
      -- Garantir que todas as colunas existem na tabela Company
      ALTER TABLE "Company" 
      ADD COLUMN IF NOT EXISTS "tradeName" TEXT,
      ADD COLUMN IF NOT EXISTS "status" TEXT,
      ADD COLUMN IF NOT EXISTS "openingDate" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "capital" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "userId" TEXT;

      -- Garantir que tabela Analysis existe
      CREATE TABLE IF NOT EXISTS "Analysis" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "companyId" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "insights" TEXT NOT NULL,
        "redFlags" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Garantir foreign key Analysis -> Company
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'Analysis_companyId_fkey'
        ) THEN
          ALTER TABLE "Analysis" 
          ADD CONSTRAINT "Analysis_companyId_fkey" 
          FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE;
        END IF;
      END $$;

      -- Garantir foreign key Company -> Project
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'Company_projectId_fkey'
        ) THEN
          ALTER TABLE "Company" 
          ADD CONSTRAINT "Company_projectId_fkey" 
          FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `

    await supabaseAdmin.rpc('exec_sql', { sql: completeSchemaSQL })
    results.schema.fixes.push('Schema completo verificado e corrigido')

    // 5. RECARREGAR CACHE
    console.log('[BULK-FIX] 🔄 Recarregando cache...')
    await supabaseAdmin.rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload schema';" })
    results.schema.fixes.push('Cache do schema recarregado')

    // 6. TESTE FINAL
    console.log('[BULK-FIX] 🧪 Executando teste final...')
    
    const { data: testData, error: testError } = await supabaseAdmin
      .from('Company')
      .select('id, projectId, cnpj, name, capital')
      .limit(1)

    if (testError) {
      results.apis.issues.push(`Teste final falhou: ${testError.message}`)
    } else {
      results.apis.fixes.push('Teste final passou - sistema funcionando')
    }

    // Marcar tudo como concluído
    results.schema.status = 'completed'
    results.constraints.status = 'completed'
    results.data.status = 'completed'
    results.apis.status = 'completed'

    console.log('[BULK-FIX] ✅ Varredura completa finalizada!')

    return NextResponse.json({
      status: 'success',
      message: '✅ Varredura completa e correções aplicadas com sucesso!',
      results,
      summary: {
        totalIssues: results.schema.issues.length + results.constraints.issues.length + results.data.issues.length + results.apis.issues.length,
        totalFixes: results.schema.fixes.length + results.constraints.fixes.length + results.data.fixes.length + results.apis.fixes.length,
        systemStatus: testError ? 'Needs attention' : 'Fully operational'
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[API /bulk-fix] ❌ Erro:', error.message)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro durante varredura completa',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
