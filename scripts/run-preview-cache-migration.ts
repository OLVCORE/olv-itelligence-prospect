/**
 * Script para executar a migration preview_cache no Supabase
 * MÓDULO 1: Criar tabela de cache para deep-scan assíncrono
 * 
 * Uso:
 * npx tsx scripts/run-preview-cache-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function runMigration() {
  console.log('🚀 Executando migration preview_cache...')

  // Validar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
    console.error('Configure essas variáveis no arquivo .env.local')
    process.exit(1)
  }

  // Criar client Supabase com service role (admin)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Ler o arquivo SQL da migration
    const migrationPath = join(process.cwd(), 'prisma', 'migrations', 'preview_cache.sql')
    const migrationSql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Arquivo de migration carregado')
    console.log('🔧 Executando SQL...')

    // Executar a migration via raw SQL
    // Nota: Supabase JS não tem método direto para raw SQL, então usamos a REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: migrationSql })
    })

    if (!response.ok) {
      // Se RPC não funcionar, tentar via pgAdmin ou console do Supabase
      console.warn('⚠️ Não foi possível executar via REST API')
      console.log('\n📋 INSTRUÇÕES MANUAIS:')
      console.log('1. Acesse o Supabase Dashboard: https://app.supabase.com')
      console.log('2. Vá em "SQL Editor"')
      console.log('3. Cole o conteúdo do arquivo:')
      console.log('   prisma/migrations/preview_cache.sql')
      console.log('4. Execute o SQL')
      console.log('\nOu copie o SQL abaixo:\n')
      console.log('─'.repeat(60))
      console.log(migrationSql)
      console.log('─'.repeat(60))
      process.exit(0)
    }

    console.log('✅ Migration executada com sucesso!')
    
    // Verificar se a tabela foi criada
    const { data, error } = await supabase
      .from('preview_cache')
      .select('*')
      .limit(1)

    if (error) {
      console.warn('⚠️ Erro ao verificar tabela (pode ser OK se estiver vazia):', error.message)
    } else {
      console.log('✅ Tabela preview_cache verificada e funcional')
    }

  } catch (error: any) {
    console.error('❌ Erro ao executar migration:', error.message)
    console.log('\n📋 Execute a migration manualmente no Supabase Dashboard')
    console.log('Arquivo: prisma/migrations/preview_cache.sql')
    process.exit(1)
  }
}

runMigration()

