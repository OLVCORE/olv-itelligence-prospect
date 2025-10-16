import { NextRequest, NextResponse } from "next/server"
import { IntelligenceEngine } from "@/lib/intelligence-engine"
import { hunter } from "@/lib/services/hunter"
import { openai } from "@/lib/services/openai"
import { googleSearch } from "@/lib/services/google-search"
import { prisma } from "@/lib/db"

/**
 * POST /api/analyze/complete
 * 
 * Análise completa com todas as APIs integradas
 */
export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json()

    if (!companyId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 }
      )
    }

    console.log(`[API /analyze/complete] Iniciando análise completa para empresa ${companyId}`)

    // Buscar empresa no banco
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    // 1. Buscar dados web com Google Search
    console.log(`[API /analyze/complete] Buscando dados web para ${company.name}`)
    const webData = await googleSearch.searchCompany(company.name, company.cnpj)
    
    // 2. Buscar tech stack com Google Search
    const techStackWeb = await googleSearch.searchTechStack(company.name, company.domain)
    
    // 3. Buscar emails com Hunter.io
    console.log(`[API /analyze/complete] Buscando emails para ${company.domain}`)
    const emailData = company.domain ? await hunter.searchEmails(company.domain, company.name) : null

    // 4. Análise completa com Intelligence Engine
    console.log(`[API /analyze/complete] Executando análise completa...`)
    const engine = new IntelligenceEngine()
    const analysis = await engine.analyzeCompany(company)

    // 5. Gerar insights específicos com OpenAI
    console.log(`[API /analyze/complete] Gerando insights com IA...`)
    const aiInsights = await openai.analyzeCompany({
      razao: company.name,
      fantasia: company.name,
      cnpj: company.cnpj,
      porte: JSON.parse(company.financial as string).porte,
      situacao: 'ATIVA',
      capitalSocial: JSON.parse(company.financial as string).receita,
      cnae: company.cnae,
      cidade: JSON.parse(company.location as string).cidade,
      uf: JSON.parse(company.location as string).estado,
      abertura: company.createdAt.toISOString().split('T')[0],
      naturezaJuridica: 'Sociedade Empresária'
    })

    // 6. Salvar análise no banco
    await prisma.company.update({
      where: { id: companyId },
      data: {
        lastAnalyzed: new Date(),
        analysisData: JSON.stringify({
          analysis,
          webData,
          emailData,
          aiInsights,
          techStackWeb
        })
      }
    })

    console.log(`[API /analyze/complete] ✅ Análise completa concluída para ${company.name}`)

    return NextResponse.json({
      success: true,
      message: "Análise completa realizada com sucesso!",
      data: {
        company: {
          id: company.id,
          name: company.name,
          cnpj: company.cnpj
        },
        analysis: {
          scores: analysis.scores,
          techStack: analysis.techStack,
          decisionMakers: analysis.decisionMakers,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          ticketEstimate: analysis.ticketEstimate,
          fitScore: analysis.fitScore
        },
        webData: {
          website: webData?.website,
          socialMedia: webData?.socialMedia,
          news: webData?.news?.slice(0, 3), // Apenas 3 notícias
          technologies: techStackWeb,
          insights: webData?.insights
        },
        emailData: emailData ? {
          totalEmails: emailData.totalEmails,
          confidence: emailData.confidence,
          emails: emailData.emails.slice(0, 5), // Apenas 5 emails
          socialMedia: emailData.socialMedia
        } : null,
        aiInsights: {
          resumo: aiInsights.resumo,
          insights: aiInsights.insights.slice(0, 5), // Apenas 5 insights
          oportunidades: aiInsights.oportunidades,
          riscos: aiInsights.riscos,
          recomendacoes: aiInsights.recomendacoes,
          scoreIA: aiInsights.scoreIA,
          confianca: aiInsights.confianca
        }
      }
    })

  } catch (error: any) {
    console.error("[API /analyze/complete] Erro:", error)
    return NextResponse.json(
      { 
        error: "Erro ao executar análise completa",
        details: error.message 
      },
      { status: 500 }
    )
  }
}

