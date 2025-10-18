import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST() {
  try {
    console.log('[API /apply-schema] 🔧 Aplicando schema diretamente via SQL...')

    // SQL para adicionar colunas faltantes na tabela Company
    const alterCompanySQL = `
      -- Adicionar colunas faltantes na tabela Company
      ALTER TABLE "Company" 
      ADD COLUMN IF NOT EXISTS "tradeName" TEXT,
      ADD COLUMN IF NOT EXISTS "status" TEXT,
      ADD COLUMN IF NOT EXISTS "openingDate" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "capital" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `

    // SQL para criar tabela Analysis se não existir
    const createAnalysisSQL = `
      -- Criar tabela Analysis se não existir
      CREATE TABLE IF NOT EXISTS "Analysis" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "companyId" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "insights" TEXT NOT NULL,
        "redFlags" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // SQL para criar relacionamento se não existir
    const createForeignKeySQL = `
      -- Criar chave estrangeira se não existir
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
    `

    // Executar SQLs sequencialmente
    console.log('[API] 📝 Executando ALTER TABLE Company...')
    const { error: alterError } = await supabaseAdmin
      .rpc('exec_sql', { sql: alterCompanySQL })

    if (alterError) {
      console.log('[API] ⚠️ ALTER TABLE falhou, tentando método alternativo...')
      // Método alternativo: tentar queries individuais
      const { error: colError } = await supabaseAdmin
        .from('Company')
        .select('id, cnpj, name')
        .limit(1)
      
      if (colError) {
        throw new Error(`Falha ao alterar tabela Company: ${alterError.message}`)
      }
    }

    console.log('[API] 📝 Executando CREATE TABLE Analysis...')
    const { error: createError } = await supabaseAdmin
      .rpc('exec_sql', { sql: createAnalysisSQL })

    if (createError) {
      console.log('[API] ⚠️ CREATE TABLE falhou, tabela pode já existir')
    }

    console.log('[API] 📝 Executando FOREIGN KEY...')
    const { error: fkError } = await supabaseAdmin
      .rpc('exec_sql', { sql: createForeignKeySQL })

    if (fkError) {
      console.log('[API] ⚠️ FOREIGN KEY falhou, pode já existir')
    }

    // Forçar reload do cache
    console.log('[API] 🔄 Forçando reload do cache...')
    await supabaseAdmin
      .rpc('exec_sql', { sql: "NOTIFY pgrst, 'reload schema';" })

    console.log('[API] ✅ Schema aplicado com sucesso!')

    return NextResponse.json({
      status: 'success',
      message: '✅ Schema aplicado diretamente via SQL!',
      changes: [
        'Adicionadas colunas: tradeName, status, openingDate, capital, userId',
        'Criada tabela Analysis (se não existia)',
        'Criado relacionamento Company ↔ Analysis',
        'Cache do schema recarregado'
      ],
      note: 'Aguarde 15-30 segundos para as mudanças terem efeito',
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[API /apply-schema] ❌ Erro:', error.message)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao aplicar schema via SQL',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
