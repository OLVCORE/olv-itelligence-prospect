import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    
    const [userCount, companyCount] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
    ]);

    return NextResponse.json({
      status: 'success',
      message: '✅ Conexão com Supabase estabelecida com sucesso!',
      database: 'Supabase PostgreSQL',
      connection: {
        user: 'postgres.qtcwetabhhkhvomcrqgm',
        pooler: 'aws-0-sa-east-1.pooler.supabase.com:6543',
        region: 'sa-east-1 (São Paulo)',
      },
      counts: {
        users: userCount,
        companies: companyCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
