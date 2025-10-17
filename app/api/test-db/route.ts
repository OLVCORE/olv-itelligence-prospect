import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/test-db
 * 
 * Testa conexão com banco de dados Supabase
 * Retorna status, contagens e informações de diagnóstico
 */
export async function GET() {
  try {
    console.log('[TEST-DB] 🔍 Iniciando teste de conexão...')
    
    // Teste 1: Conectar ao banco
    await prisma.$connect()
    console.log('[TEST-DB] ✅ Conexão estabelecida com sucesso')
    
    // Teste 2: Query simples para validar comunicação
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp, version() as pg_version`
    console.log('[TEST-DB] ✅ Query executada:', result)
    
    // Teste 3: Contar registros nas tabelas principais
    const userCount = await prisma.user.count()
    const companyCount = await prisma.company.count()
    const projectCount = await prisma.project.count()
    console.log('[TEST-DB] ✅ Contagens obtidas - Users:', userCount, 'Companies:', companyCount, 'Projects:', projectCount)
    
    // Teste 4: Verificar informações do banco
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `
    console.log('[TEST-DB] ✅ Informações do banco obtidas')
    
    // Desconectar
    await prisma.$disconnect()
    console.log('[TEST-DB] ✅ Desconectado com sucesso')
    
    return NextResponse.json({
      success: true,
      status: 'connected',
      message: '🎉 Banco de dados Supabase funcionando corretamente!',
      connection: {
        provider: 'PostgreSQL (Supabase)',
        region: 'sa-east-1 (AWS São Paulo)',
        pooler: 'PgBouncer (porta 6543)',
        info: dbInfo
      },
      tests: {
        query: result,
        counts: {
          users: userCount,
          companies: companyCount,
          projects: projectCount
        }
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error: any) {
    console.error('[TEST-DB] ❌ Erro na conexão:', error.message)
    console.error('[TEST-DB] Código do erro:', error.code)
    console.error('[TEST-DB] Stack completo:', error.stack)
    
    // Análise do erro
    let errorType = 'unknown'
    let suggestion = ''
    
    if (error.message.includes('Tenant or user not found')) {
      errorType = 'authentication'
      suggestion = 'Verificar usuário (deve ser postgres.PROJECT_REF no pooler)'
    } else if (error.message.includes('password authentication failed')) {
      errorType = 'password'
      suggestion = 'Verificar senha e URL encoding de caracteres especiais'
    } else if (error.message.includes("Can't reach database server")) {
      errorType = 'connection'
      suggestion = 'Verificar host, porta e firewall do Supabase'
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout'
      suggestion = 'Verificar região e latência (considerar usar gru1 no Vercel)'
    } else if (error.code === 'P1001') {
      errorType = 'network'
      suggestion = 'Problema de rede - verificar DNS e conectividade'
    }
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: '❌ Falha ao conectar com banco de dados',
      error: {
        type: errorType,
        message: error.message,
        code: error.code,
        suggestion: suggestion
      },
      debug: {
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        meta: error.meta
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('[TEST-DB] ⚠️ Erro ao desconectar:', disconnectError)
    }
  }
}

