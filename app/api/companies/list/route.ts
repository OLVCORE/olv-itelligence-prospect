import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Mock companies para fallback
const mockCompaniesData = [
  {
    id: 'demo-1',
    cnpj: '34.338.165/0001-90',
    razao: 'XRP LTDA',
    fantasia: 'XRP',
    cidade: 'São Paulo',
    uf: 'SP',
    porte: 'GRANDE',
    status: 'Ativo',
    lastAnalyzed: new Date().toISOString(),
    capitalSocial: 'R$ 5.000.000,00'
  },
  {
    id: 'demo-2',
    cnpj: '67.867.580/0001-90',
    razao: 'TOTVS SA',
    fantasia: 'TOTVS',
    cidade: 'São Paulo',
    uf: 'SP',
    porte: 'GRANDE',
    status: 'Ativo',
    lastAnalyzed: new Date().toISOString(),
    capitalSocial: 'R$ 100.000.000,00'
  },
  {
    id: 'demo-3',
    cnpj: '98.765.432/0001-10',
    razao: 'Tech Solutions Brasil LTDA',
    fantasia: 'Tech Solutions',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    porte: 'MÉDIO',
    status: 'Ativo',
    lastAnalyzed: new Date().toISOString(),
    capitalSocial: 'R$ 2.500.000,00'
  }
]

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
    console.error('[API /companies/list] ❌ Erro ao buscar do banco:', error.message)
    console.log('[API /companies/list] 🔄 Usando dados mock como fallback')
    
    // Retornar dados mock em caso de erro (problema com banco de dados)
    return NextResponse.json({
      success: true,
      companies: mockCompaniesData,
      usingMockData: true,
      message: 'Dados de demonstração (banco de dados indisponível)'
    })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('[API /companies/list] Erro ao desconectar:', disconnectError)
    }
  }
}

