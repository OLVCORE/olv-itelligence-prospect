// Teste de conexão com Supabase - Nova senha Hp3wvkaevss9oxhk
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    console.log('🔐 Nova senha: Hp3wvkaevss9oxhk');
    
    // Conectar
    await prisma.$connect();
    console.log('✅ Conexão estabelecida!');
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query teste:', result);
    
    // Contar registros
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    
    console.log('📊 Dados encontrados:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Companies: ${companyCount}`);
    
    console.log('🎉 Teste de conexão bem-sucedido!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('🔴 PROBLEMA: Senha incorreta!');
      console.error('   - Verifique a senha no Supabase Dashboard');
      console.error('   - Confirme se DATABASE_URL está correta');
    }
    
    if (error.message.includes('Can\'t reach database server')) {
      console.error('🔴 PROBLEMA: Servidor inacessível!');
      console.error('   - Verifique se o host está correto');
      console.error('   - Confirme se a porta é 6543 (pooler)');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
