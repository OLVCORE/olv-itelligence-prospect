import { NextResponse } from 'next/server'
import { CompanySearchEngine } from '@/lib/company-search-engine'
import { IntelligenceEngine } from '@/lib/intelligence-engine'
import { prisma } from '@/lib/db'

/**
 * POST /api/companies/add
 * 
 * Adicionar empresa e executar análise automática
 */
export async function POST(req: Request) {
  try {
    console.log('[API /companies/add] Iniciando processo de adição...')
    
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json(
        { error: "Query é obrigatória" },
        { status: 400 }
      )
    }

    console.log(`[API /companies/add] Buscando empresa: ${query}`)

    // Detectar se é CNPJ ou website
    const cleanQuery = query.replace(/[^\d]/g, '')
    const isCNPJ = cleanQuery.length === 14

    // Buscar dados da empresa
    let companyData = null
    if (isCNPJ) {
      console.log('[API /companies/add] Buscando por CNPJ...')
      companyData = await CompanySearchEngine.searchByCNPJ(query)
    } else {
      console.log('[API /companies/add] Buscando por website...')
      companyData = await CompanySearchEngine.searchByWebsite(query)
    }

    if (!companyData) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    console.log(`[API /companies/add] ✅ Empresa encontrada: ${companyData.razao}`)

    // Testar conexão com banco
    await prisma.$connect()
    console.log('[API /companies/add] ✅ Conexão com banco estabelecida')

    // Buscar projeto demo
    const project = await prisma.project.findFirst()
    
    if (!project) {
      console.log('[API /companies/add] ❌ Projeto não encontrado')
      return NextResponse.json(
        { error: "Projeto não encontrado. Execute o seed do banco." },
        { status: 500 }
      )
    }

    console.log(`[API /companies/add] ✅ Projeto encontrado: ${project.name}`)

    // Salvar empresa no banco
    console.log('[API /companies/add] Salvando empresa no banco...')
    const company = await prisma.company.create({
      data: {
        projectId: project.id,
        name: companyData.razao,
        cnpj: companyData.cnpj,
        domain: companyData.website || '',
        cnae: companyData.cnae,
        industry: determineIndustry(companyData.cnae),
        size: companyData.porte.toLowerCase(),
        financial: JSON.stringify({
          receita: parseCapitalSocial(companyData.capitalSocial),
          porte: companyData.porte,
          risco: determineRiskLevel(companyData.porte),
          faturamento: parseCapitalSocial(companyData.capitalSocial)
        }),
        location: JSON.stringify({
          cidade: companyData.cidade,
          estado: companyData.uf,
          pais: 'Brasil'
        })
      }
    })

    console.log(`[API /companies/add] ✅ Empresa salva: ${company.name} (${company.id})`)

    // Executar análise automática
    console.log(`[API /companies/add] Iniciando análise automática...`)
    const engine = new IntelligenceEngine()
    const analysis = await engine.analyzeCompany(company)

    console.log(`[API /companies/add] ✅ Análise concluída!`)

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        cnpj: company.cnpj
      },
      analysis: {
        maturity: analysis.scores.maturity,
        propensity: analysis.scores.propensity,
        priority: analysis.scores.priority,
        estimatedTicket: analysis.ticketEstimate.average
      }
    })

  } catch (error: any) {
    console.error("[API /companies/add] ❌ Erro:", error)
    console.error("[API /companies/add] Stack:", error.stack)
    
    return NextResponse.json(
      { 
        error: "Erro ao adicionar empresa",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Métodos auxiliares
function determineIndustry(cnae: string): string {
  if (cnae.startsWith('62')) return 'Tecnologia'
  if (cnae.startsWith('70')) return 'Consultoria'
  if (cnae.startsWith('47')) return 'Comércio'
  if (cnae.startsWith('41')) return 'Construção'
  return 'Outros'
}

function determineRiskLevel(porte: string): string {
  switch (porte) {
    case 'GRANDE': return 'BAIXO'
    case 'MÉDIO': return 'MÉDIO'
    case 'PEQUENO': return 'ALTO'
    default: return 'MÉDIO'
  }
}

function parseCapitalSocial(capitalSocial: string): number {
  return parseFloat(capitalSocial.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}
