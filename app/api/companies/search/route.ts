import { NextResponse } from "next/server"
import { CompanySearchEngine } from "@/lib/company-search-engine"
import { receitaWS } from "@/lib/services/receitaws"

/**
 * POST /api/companies/search
 * 
 * Buscar empresa por CNPJ ou website e mostrar PREVIEW
 */
export async function POST(req: Request) {
  try {
    const { type, query } = await req.json()

    if (!type || !query) {
      return NextResponse.json(
        { error: "Tipo e query são obrigatórios" },
        { status: 400 }
      )
    }

    console.log(`[API /companies/search] Buscando ${type}: ${query}`)

    let result = null
    let receitaData = null

    if (type === "cnpj") {
      try {
        result = await CompanySearchEngine.searchByCNPJ(query)
        
        // Buscar dados completos da ReceitaWS para preview
        const cleanCNPJ = query.replace(/[^\d]/g, '')
        
        try {
          const rawData = await receitaWS.buscarPorCNPJ(cleanCNPJ)
          
          if (rawData) {
            // Gerar insights e scores
            const insights = receitaWS.gerarInsights(rawData)
            const redFlags = receitaWS.detectarRedFlags(rawData)
            const score = receitaWS.calcularScoreConfiabilidade(rawData)
            
            receitaData = {
              ...receitaWS.converterParaFormatoInterno(rawData),
              insights,
              redFlags,
              score
            }
          }
        } catch (receitaError: any) {
          console.error('[API /companies/search] Erro ReceitaWS (não crítico):', receitaError.message)
          // Continuar mesmo se ReceitaWS falhar (pode ser rate limit)
        }
      } catch (error: any) {
        console.error('[API /companies/search] Erro ao buscar empresa:', error)
        throw error
      }
    } else if (type === "website") {
      result = await CompanySearchEngine.searchByWebsite(query)
    } else {
      return NextResponse.json(
        { error: "Tipo deve ser 'cnpj' ou 'website'" },
        { status: 400 }
      )
    }

    if (!result) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    console.log(`[API /companies/search] ✅ Empresa encontrada: ${result.razao}`)

    return NextResponse.json({
      success: true,
      company: result,
      preview: receitaData // Dados completos para preview
    })

  } catch (error: any) {
    console.error("[API /companies/search] Erro:", error)
    
    return NextResponse.json(
      { 
        error: "Erro ao buscar empresa",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/companies/save
 * 
 * Salvar empresa no banco de dados
 */
export async function PUT(req: Request) {
  try {
    const { companyData, projectId } = await req.json()

    if (!companyData || !projectId) {
      return NextResponse.json(
        { error: "companyData e projectId são obrigatórios" },
        { status: 400 }
      )
    }

    const companyId = await CompanySearchEngine.saveCompany(companyData, projectId)

    return NextResponse.json({
      success: true,
      companyId
    })

  } catch (error: any) {
    console.error("[API /companies/save] Erro:", error)
    
    return NextResponse.json(
      { 
        error: "Erro ao salvar empresa",
        details: error.message 
      },
      { status: 500 }
    )
  }
}
