import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('[API /companies/list] Iniciando busca de empresas...')
    
    // Testar conexão com banco
    await prisma.$connect()
    console.log('[API /companies/list] ✅ Conexão com banco estabelecida')
    
    const companies = await prisma.company.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log(`[API /companies/list] ✅ ${companies.length} empresas encontradas`)

    const formattedCompanies = companies.map(company => {
      try {
        const location = company.location ? JSON.parse(company.location) : {}
        const financial = company.financial ? JSON.parse(company.financial) : {}
        
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
      } catch (parseError) {
        console.error('[API /companies/list] Erro ao parsear dados da empresa:', company.id, parseError)
        return {
          id: company.id,
          cnpj: company.cnpj,
          razao: company.name,
          fantasia: company.name.split(' ')[0],
          cidade: '',
          uf: '',
          porte: company.size || 'MÉDIO',
          status: 'Ativo',
          lastAnalyzed: company.updatedAt.toISOString(),
          capitalSocial: 'R$ 0,00'
        }
      }
    })

    return NextResponse.json({
      success: true,
      companies: formattedCompanies
    })
  } catch (error: any) {
    console.error('[API /companies/list] ❌ Erro:', error)
    console.error('[API /companies/list] Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Erro ao listar empresas',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

