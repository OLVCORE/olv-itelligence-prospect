const { execSync } = require('child_process');

console.log('🚀 OLV Intelligence - Build Script');
console.log('=====================================\n');

console.log('🔍 Verificando variáveis de ambiente...');
const hasDatabase = !!process.env.DATABASE_URL;

console.log(`${hasDatabase ? '✅' : '❌'} DATABASE_URL: ${hasDatabase ? 'configurada' : 'AUSENTE'}\n`);

try {
  // Passo 1: Gerar Prisma Client
  console.log('📦 Passo 1/3: Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso\n');

  // Passo 2: PULAR sincronização no Vercel (usar apenas em local)
  console.log('🗄️  Passo 2/3: Sincronização de schema');
  console.log('   ⏭️  PULANDO no Vercel (tabelas já existem no Supabase)');
  console.log('   💡 Execute "npx prisma db push" localmente se precisar atualizar schema\n');

  // Passo 3: Build do Next.js
  console.log('🏗️  Passo 3/3: Building Next.js...');
  execSync('next build', { stdio: 'inherit' });
  console.log('\n✅ Build concluído com sucesso! 🎉\n');

} catch (error) {
  console.error('\n❌ Build falhou!');
  console.error('Erro:', error.message);
  process.exit(1);
}
