#!/usr/bin/env node

/**
 * Script de build inteligente para Prisma + Next.js
 * 
 * - Se DIRECT_URL existe: usa `prisma migrate deploy` (ideal para produção)
 * - Se DIRECT_URL não existe: usa `prisma db push` (funciona sem DIRECT_URL)
 * 
 * Isso garante que o build SEMPRE funciona, independente da configuração.
 */

const { execSync } = require('child_process');

console.log('🚀 OLV Intelligence - Build Script');
console.log('=====================================\n');

// Verificar DATABASE_URL
console.log('🔍 Verificando variáveis de ambiente...');
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL não configurada!');
  console.error('   Configure DATABASE_URL no Vercel para continuar.');
  process.exit(1);
}
console.log('✅ DATABASE_URL configurada');

// Verificar DIRECT_URL
const hasDirectUrl = !!process.env.DIRECT_URL;
if (hasDirectUrl) {
  console.log('✅ DIRECT_URL configurada');
} else {
  console.log('⚠️  DIRECT_URL não encontrada (usando fallback)');
}

try {
  // Passo 1: Gerar Prisma Client
  console.log('\n📦 Passo 1/3: Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso');

  // Passo 2: Sincronizar banco de dados
  console.log('\n🗄️  Passo 2/3: Sincronizando banco de dados...');
  
  // Tentar migrate deploy se DIRECT_URL existe
  if (hasDirectUrl) {
    console.log('   Tentando: prisma migrate deploy (com histórico de migrações)');
    console.log('   Conexão: DIRECT_URL (porta 5432 - direta)');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrações aplicadas com sucesso');
    } catch (error) {
      console.log('⚠️  Migrate deploy falhou (porta 5432 pode estar bloqueada)');
      console.log('   Usando fallback: prisma db push');
      console.log('   Conexão: DATABASE_URL (porta 6543 - pooler)');
      execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });
      console.log('✅ Banco sincronizado via db push');
    }
  } else {
    console.log('   Usando: prisma db push (sincronização direta)');
    console.log('   Conexão: DATABASE_URL (porta 6543 - pooler)');
    execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });
    console.log('✅ Banco sincronizado via db push');
  }

  // Passo 3: Build Next.js
  console.log('\n🏗️  Passo 3/3: Building Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build concluído');

  console.log('\n=====================================');
  console.log('🎉 Build concluído com sucesso!\n');
  
  // Informações adicionais
  if (!hasDirectUrl) {
    console.log('💡 DICA: Para usar migrações com histórico completo,');
    console.log('   adicione DIRECT_URL nas variáveis de ambiente do Vercel:');
    console.log('   DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require\n');
  }

} catch (error) {
  console.error('\n❌ Build falhou!');
  console.error('Erro:', error.message);
  process.exit(1);
}

