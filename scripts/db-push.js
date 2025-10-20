#!/usr/bin/env node

/**
 * Script para fazer DB Push usando Direct URL (não pooler)
 * Necessário para migrations/push no Supabase
 */

const { execSync } = require('child_process')

console.log('🗄️  DB Push - Usando Direct URL...\n')

try {
  // Usa DATABASE_URL_DIRECT se existir, senão usa DATABASE_URL
  const dbUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL ou DATABASE_URL_DIRECT não encontrada')
  }
  
  console.log('📡 Conectando ao Supabase...')
  
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  })
  
  console.log('\n✅ DB Push concluído com sucesso!')
} catch (error) {
  console.error('\n❌ Erro no DB Push:', error.message)
  process.exit(1)
}

