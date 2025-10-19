import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Testar conexão e contar registros
    const [usersResult, companiesResult, analysesResult] = await Promise.allSettled([
      supabaseAdmin.from('User').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('Company').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('Analysis').select('*', { count: 'exact', head: true }),
    ]);

    // Extrair counts
    const userCount = usersResult.status === 'fulfilled' ? (usersResult.value.count ?? 0) : 0;
    const companyCount = companiesResult.status === 'fulfilled' ? (companiesResult.value.count ?? 0) : 0;
    const analysisCount = analysesResult.status === 'fulfilled' ? (analysesResult.value.count ?? 0) : 0;

    // Verificar se houve algum erro
    const errors = [
      usersResult.status === 'rejected' ? usersResult.reason : null,
      companiesResult.status === 'rejected' ? companiesResult.reason : null,
      analysesResult.status === 'rejected' ? analysesResult.reason : null,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Erros ao consultar Supabase:', errors);
    }

    return NextResponse.json({
      status: 'success',
      message: '✅ Conexão com Supabase estabelecida com sucesso!',
      database: 'Supabase PostgreSQL',
      connection: {
        method: 'Supabase Client (não Prisma)',
        pooler: 'aws-0-sa-east-1.pooler.supabase.com:6543',
        region: 'sa-east-1 (São Paulo)',
      },
      counts: {
        users: userCount,
        companies: companyCount,
        analyses: analysisCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao conectar com Supabase:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro desconhecido ao conectar com Supabase',
        code: error.code || 'UNKNOWN_ERROR',
        hint: error.hint || 'Verifique as credenciais do Supabase no Vercel',
      },
      { status: 500 }
    );
  }
}
