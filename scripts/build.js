const { execSync } = require('child_process');

console.log('🚀 OLV Intelligence - Build Script');
console.log('=====================================\n');

// Verificar variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente...');
const hasDatabase = !!process.env.DATABASE_URL;
const hasDirect = !!process.env.DIRECT_URL;

console.log(`${hasDatabase ? '✅' : '❌'} DATABASE_URL: ${hasDatabase ? 'configurada' : 'AUSENTE'}`);
console.log(`${hasDirect ? '✅' : '❌'} DIRECT_URL: ${hasDirect ? 'configurada' : 'AUSENTE'}\n`);

try {
  // Passo 1: Gerar Prisma Client
  console.log('📦 Passo 1/3: Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso\n');

  // Passo 2: Sincronizar schema (FORÇAR uso de DATABASE_URL)
  if (hasDatabase) {
    console.log('🗄️  Passo 2/3: Sincronizando schema com banco...');
    console.log('   Método: Usando DATABASE_URL (pooler porta 6543)');
    console.log('   Nota: DIRECT_URL ignorada (porta 5432 bloqueada no Vercel)\n');
    
    // Temporariamente remover DIRECT_URL para forçar uso de DATABASE_URL
    const directUrlBackup = process.env.DIRECT_URL;
    delete process.env.DIRECT_URL;
    
    try {
      execSync('npx prisma db push --accept-data-loss --skip-generate', { 
        stdio: 'inherit',
        env: { ...process.env, DIRECT_URL: undefined }
      });
      console.log('✅ Schema sincronizado com sucesso\n');
    } finally {
      // Restaurar DIRECT_URL
      if (directUrlBackup) {
        process.env.DIRECT_URL = directUrlBackup;
      }
    }
  } else {
    console.log('⏭️  Passo 2/3: Pulando sincronização (DATABASE_URL não configurada)\n');
  }

  // Passo 3: Build do Next.js
  console.log('🏗️  Passo 3/3: Building Next.js...');
  execSync('next build', { stdio: 'inherit' });
  console.log('\n✅ Build concluído com sucesso! 🎉\n');

} catch (error) {
  console.error('\n❌ Build falhou!');
  console.error('Erro:', error.message);
  
  if (error.message.includes('Can\'t reach database server')) {
    console.error('\n🔴 ERRO DE CONEXÃO:');
    console.error('   - Verifique se DATABASE_URL está correta no Vercel');
    console.error('   - Confirme que a senha está URL-encoded (%23 para #, %40 para @)');
    console.error('   - DATABASE_URL deve usar porta 6543 (pooler)');
    console.error('   - Formato: postgresql://postgres.PROJECT:SENHA@aws-0-REGION.pooler.supabase.com:6543/postgres\n');
  }
  
  if (error.message.includes('Tenant or user not found')) {
    console.error('\n🔴 ERRO DE AUTENTICAÇÃO:');
    console.error('   - Senha incorreta ou mal encodada');
    console.error('   - Usuário deve ser postgres.qtcwetabhhkhvomcrqgm (com project ref)');
    console.error('   - Verifique a senha no Supabase Dashboard\n');
  }
  
  process.exit(1);
}