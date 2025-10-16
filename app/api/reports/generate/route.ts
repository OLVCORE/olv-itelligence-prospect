import { NextRequest, NextResponse } from "next/server"
import { mockCompanies, mockTechStack, mockDecisionMakers, calculateMaturityScore, calculatePropensityScore } from "@/lib/mock-data"
import { aiReportGenerator } from "@/lib/ai/report-generator"

// Simulação de IA para geração de relatórios
async function generateAIReport(template: any, companyData: any, analysisData: any) {
  // Simular delay de processamento da IA
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const maturity = calculateMaturityScore(mockTechStack)
  const propensity = calculatePropensityScore(mockDecisionMakers, companyData)
  
  // Usar insights de IA se disponíveis
  const insights = analysisData.aiInsights?.map((insight: any) => insight.description) || [
    `A empresa ${companyData.fantasia} apresenta maturidade digital de ${maturity}%, indicando ${maturity > 80 ? 'alta' : maturity > 60 ? 'média' : 'baixa'} sofisticação tecnológica.`,
    `Identificados ${mockDecisionMakers.length} decisores-chave com estratégias de abordagem personalizadas.`,
    `Stack tecnológico robusto com ${mockTechStack.length} tecnologias confirmadas, incluindo soluções enterprise.`,
    `Propensão de compra calculada em ${propensity}%, sugerindo ${propensity > 80 ? 'alta' : propensity > 60 ? 'média' : 'baixa'} probabilidade de conversão.`,
    `Oportunidades identificadas: integração com soluções TOTVS, modernização de processos e expansão digital.`
  ]

  // Gerar conteúdo do relatório baseado no tipo
  let reportContent = ""
  
  switch (template.type) {
    case "executive":
      reportContent = generateExecutiveReport(companyData, analysisData, insights)
      break
    case "technical":
      reportContent = generateTechnicalReport(companyData, mockTechStack, insights)
      break
    case "strategic":
      reportContent = generateStrategicReport(companyData, mockDecisionMakers, insights)
      break
    default:
      reportContent = generateDefaultReport(companyData, insights)
  }

  return {
    content: reportContent,
    insights,
    metrics: {
      pages: Math.floor(Math.random() * 15) + 8,
      sections: template.sections?.length || 5,
      charts: Math.floor(Math.random() * 8) + 3,
      confidence: Math.floor(Math.random() * 20) + 80
    }
  }
}

function generateExecutiveReport(company: any, analysis: any, insights: string[]) {
  return `
# RELATÓRIO EXECUTIVO - ${company.fantasia}

## RESUMO EXECUTIVO
${insights[0]}

## ANÁLISE DE MERCADO
A empresa ${company.fantasia} opera no segmento ${company.cidade}/${company.uf} com porte ${company.porte}. 
Capital social de ${company.capitalSocial} indica capacidade de investimento significativa.

## OPORTUNIDADES IDENTIFICADAS
${insights[4]}

## DECISORES-CHAVE
${insights[1]}

## RECOMENDAÇÕES ESTRATÉGICAS
1. Abordagem personalizada baseada no perfil dos decisores identificados
2. Foco em soluções que complementem o stack tecnológico atual
3. Apresentação de ROI claro baseado na maturidade digital da empresa
4. Timeline de implementação adaptada ao porte e capacidade da organização

## PRÓXIMOS PASSOS
- Agendar reunião com decisores-chave identificados
- Preparar proposta técnica personalizada
- Definir estratégia de abordagem baseada em insights de IA
- Estabelecer métricas de acompanhamento do processo
  `
}

function generateTechnicalReport(company: any, techStack: any[], insights: string[]) {
  return `
# ANÁLISE TÉCNICA DETALHADA - ${company.fantasia}

## STACK TECNOLÓGICO ATUAL
${insights[2]}

### Tecnologias Identificadas:
${techStack.map(tech => `- ${tech.product} (${tech.vendor}) - Confiança: ${tech.confidence}%`).join('\n')}

## INFRAESTRUTURA
Análise de infraestrutura baseada em tecnologias detectadas:
- Presença de soluções enterprise (SAP, Salesforce)
- Uso de cloud computing (Microsoft Azure)
- Ferramentas de BI e analytics (Power BI)

## OPORTUNIDADES DE INTEGRAÇÃO
1. Integração com soluções TOTVS para complementar stack atual
2. Modernização de sistemas legados identificados
3. Expansão de capacidades de analytics e BI
4. Implementação de soluções de automação

## ROADMAP TÉCNICO SUGERIDO
- Fase 1: Avaliação detalhada de integrações possíveis
- Fase 2: Prova de conceito com soluções TOTVS
- Fase 3: Implementação piloto em área específica
- Fase 4: Expansão gradual para toda a organização
  `
}

function generateStrategicReport(company: any, decisionMakers: any[], insights: string[]) {
  return `
# ESTRATÉGIA DE PROSPECÇÃO - ${company.fantasia}

## PERFIL DA EMPRESA
${company.fantasia} - ${company.cidade}/${company.uf}
Porte: ${company.porte}
Capital Social: ${company.capitalSocial}

## DECISORES-CHAVE IDENTIFICADOS
${insights[1]}

### Perfil dos Decisores:
${decisionMakers.map(dm => `- ${dm.name} (${dm.title}) - Departamento: ${dm.department}`).join('\n')}

## ESTRATÉGIA DE ABORDAGEM
1. **Abordagem Multi-Canal**: Email, LinkedIn, telefone
2. **Personalização**: Baseada no perfil e histórico de cada decisor
3. **Timing**: Considerar ciclo de decisão da empresa
4. **Proposta de Valor**: Alinhada com necessidades identificadas

## TIMELINE DE PROSPECÇÃO
- Semana 1-2: Primeiro contato e qualificação
- Semana 3-4: Apresentação de proposta técnica
- Semana 5-6: Negociação e fechamento
- Semana 7-8: Implementação e acompanhamento

## KPIs DE ACOMPANHAMENTO
- Taxa de resposta inicial: Meta 25%
- Taxa de qualificação: Meta 60%
- Taxa de conversão: Meta 15%
- Tempo médio de ciclo: Meta 45 dias
  `
}

function generateDefaultReport(company: any, insights: string[]) {
  return `
# RELATÓRIO DE ANÁLISE - ${company.fantasia}

## DADOS GERAIS
${insights[0]}

## INSIGHTS PRINCIPAIS
${insights.join('\n\n')}

## RECOMENDAÇÕES
Baseado na análise realizada, recomenda-se:
1. Abordagem personalizada considerando o perfil da empresa
2. Foco em soluções que agreguem valor ao negócio atual
3. Apresentação clara de ROI e benefícios
4. Acompanhamento próximo durante todo o processo
  `
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, companyId } = await request.json()

    if (!templateId || !companyId) {
      return NextResponse.json({ error: "Template ID e Company ID são obrigatórios" }, { status: 400 })
    }

    // Buscar dados da empresa (simulado)
    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Template simulado
    const template = {
      id: templateId,
      type: templateId.includes('exec') ? 'executive' : templateId.includes('tech') ? 'technical' : 'strategic',
      sections: ['Resumo', 'Análise', 'Oportunidades', 'Recomendações']
    }

    // Gerar insights com IA real
    const maturity = calculateMaturityScore(mockTechStack)
    const propensity = calculatePropensityScore(mockDecisionMakers, company)
    
    const aiData = {
      companyData: company,
      techStack: mockTechStack,
      decisionMakers: mockDecisionMakers,
      financialData: {},
      maturityScore: maturity,
      propensityScore: propensity
    }

    let aiInsights = []
    if (template.type === "executive") {
      aiInsights = await aiReportGenerator.generateExecutiveInsights(aiData)
    } else if (template.type === "technical") {
      aiInsights = await aiReportGenerator.generateTechnicalAnalysis(aiData)
    } else {
      aiInsights = await aiReportGenerator.generateStrategicRecommendations(aiData)
    }

    // Gerar relatório com IA
    const reportData = await generateAIReport(template, company, {
      techStack: mockTechStack,
      decisionMakers: mockDecisionMakers,
      maturity,
      propensity,
      aiInsights
    })

    return NextResponse.json({
      success: true,
      report: {
        id: `report-${Date.now()}`,
        templateId,
        companyId,
        content: reportData.content,
        insights: reportData.insights,
        metrics: reportData.metrics,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error("Erro na geração de relatório:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: "ID do relatório é obrigatório" }, { status: 400 })
    }

    // Simular busca de relatório
    const mockReport = {
      id: reportId,
      title: "Relatório Executivo - TechCorp",
      content: "# RELATÓRIO EXECUTIVO\n\nEste é um relatório gerado automaticamente...",
      insights: [
        "Empresa com alta maturidade digital",
        "Oportunidades de integração identificadas"
      ],
      metrics: {
        pages: 12,
        sections: 5,
        charts: 6,
        confidence: 87
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({ report: mockReport })

  } catch (error: any) {
    console.error("Erro ao buscar relatório:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}