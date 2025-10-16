import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const formattedCompanies = companies.map(company => {
      const location = JSON.parse(company.location || '{}')
      const financial = JSON.parse(company.financial || '{}')
      
      return {
        id: company.id,
        cnpj: company.cnpj,
        razao: company.name,
        fantasia: company.name.split(' ')[0], // Simplificado
        cidade: location.cidade || '',
        uf: location.estado || '',
        porte: financial.porte || company.size || 'MÉDIO',
        status: 'Ativo', // TODO: Adicionar campo status no banco
        lastAnalyzed: company.updatedAt.toISOString(),
        capitalSocial: `R$ ${(financial.receita || 0).toLocaleString('pt-BR')}`
      }
    })

    return NextResponse.json({
      success: true,
      companies: formattedCompanies
    })
  } catch (error: any) {
    console.error('[API /companies/list] Erro:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao listar empresas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
