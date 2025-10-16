/**
 * Motor de Inteligência OLV
 * 
 * Este é o cérebro do sistema - analisa dados, calcula scores,
 * gera insights e orquestra toda a inteligência da plataforma.
 */

import { prisma } from "./db"
import { hunter } from "./services/hunter"
import { openai } from "./services/openai"
import { googleSearch } from "./services/google-search"

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface CompanyAnalysis {
  companyId: string
  techStack: TechStackAnalysis[]
  decisionMakers: DecisionMakerAnalysis[]
  financial: FinancialAnalysis
  scores: {
    maturity: number
    propensity: number
    priority: number
    confidence: number
  }
  insights: AIInsight[]
  recommendations: Recommendation[]
  ticketEstimate: {
    min: number
    max: number
    average: number
  }
  fitScore: number
  timestamp: Date
}

export interface TechStackAnalysis {
  category: string
  product: string
  vendor: string
  confidence: number
  status: "Confirmado" | "Indeterminado" | "Em Avaliação"
  evidence: Evidence[]
  aiInsights: string
  modernizationPriority: number
}

export interface DecisionMakerAnalysis {
  name: string
  title: string
  influenceScore: number
  department: string
  contact: {
    email?: string
    phone?: string
    linkedin?: string
  }
  aiProfile: string
}

export interface FinancialAnalysis {
  revenue: number
  size: "PEQUENO" | "MÉDIO" | "GRANDE"
  creditRisk: "BAIXO" | "MÉDIO" | "ALTO"
  marketPosition: string
  growthTrend: number
}

export interface AIInsight {
  type: "opportunity" | "risk" | "trend" | "recommendation"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high"
  actionable: boolean
}

export interface Recommendation {
  title: string
  description: string
  priority: number
  expectedROI: number
  effort: "low" | "medium" | "high"
  timeline: string
}

export interface Evidence {
  source: string
  data: any
  confidence: number
  timestamp: Date
}

// ============================================================================
// MOTOR DE CÁLCULOS INTELIGENTES
// ============================================================================

export class IntelligenceEngine {
  
  /**
   * Análise completa de uma empresa
   */
  async analyzeCompany(company: any): Promise<CompanyAnalysis> {
    console.log(`[🧠 Intelligence Engine] Iniciando análise completa para empresa ${company.name}`)
    
    // 1. Buscar dados da empresa do banco
    const companyData = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        stacks: true,
        contacts: true,
        benchmarks: true
      }
    })

    if (!companyData) {
      throw new Error(`Empresa ${company.id} não encontrada`)
    }

    // 2. Buscar dados web com Google Search
    console.log(`[🧠 Intelligence Engine] Buscando dados web para ${company.name}`)
    const webData = await googleSearch.searchCompany(company.name, company.cnpj)
    
    // 3. Buscar tech stack com Google Search
    const techStackWeb = await googleSearch.searchTechStack(company.name, company.domain)
    
    // 4. Buscar emails com Hunter.io
    console.log(`[🧠 Intelligence Engine] Buscando emails para ${company.domain}`)
    const emailData = company.domain ? await hunter.searchEmails(company.domain, company.name) : null

    // 5. Analisar Tech Stack (dados do banco + web)
    const techStackAnalysis = await this.analyzeTechStack(companyData.stacks, techStackWeb)
    
    // 6. Analisar Decision Makers (dados do banco + Hunter.io)
    const decisionMakersAnalysis = await this.analyzeDecisionMakers(companyData.contacts, emailData)
    
    // 7. Análise Financeira
    const financialAnalysis = this.analyzeFinancial(companyData)
    
    // 8. Calcular Scores
    const scores = this.calculateScores(
      techStackAnalysis,
      decisionMakersAnalysis,
      financialAnalysis
    )
    
    // 9. Gerar Insights com IA
    console.log(`[🧠 Intelligence Engine] Gerando insights com IA para ${company.name}`)
    const aiAnalysis = await openai.analyzeCompany({
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
    
    // 10. Gerar Recomendações
    const recommendations = this.generateRecommendations(
      techStackAnalysis,
      scores,
      aiAnalysis.insights
    )
    
    // 11. Calcular Ticket Estimado
    const ticketEstimate = this.calculateTicketEstimate(
      financialAnalysis,
      scores,
      techStackAnalysis.length
    )
    
    // 12. Calcular Fit Score
    const fitScore = this.calculateFitScore(scores, financialAnalysis)

    const analysis: CompanyAnalysis = {
      companyId: company.id,
      techStack: techStackAnalysis,
      decisionMakers: decisionMakersAnalysis,
      financial: financialAnalysis,
      scores,
      insights: aiAnalysis.insights.map(insight => ({
        type: insight.tipo as any,
        title: insight.titulo,
        description: insight.descricao,
        confidence: insight.confianca,
        impact: insight.impacto as any,
        actionable: true
      })),
      recommendations,
      ticketEstimate,
      fitScore,
      timestamp: new Date()
    }

    console.log(`[✅ Intelligence Engine] Análise concluída com sucesso`)
    return analysis
  }

  /**
   * Análise de Tech Stack com IA
   */
  private async analyzeTechStack(stacks: any[], webTechStack?: string[]): Promise<TechStackAnalysis[]> {
    const analysis: TechStackAnalysis[] = []

    // Processar stacks do banco
    for (const stack of stacks) {
      const evidence = JSON.parse(stack.evidence || '{}')
      const modernizationPriority = this.calculateModernizationPriority(stack)
      
      analysis.push({
        category: stack.category,
        product: stack.product,
        vendor: stack.vendor || "Desconhecido",
        confidence: stack.confidence,
        status: stack.status,
        evidence: [
          {
            source: stack.source || "Manual",
            data: evidence,
            confidence: stack.confidence,
            timestamp: stack.updatedAt
          }
        ],
        aiInsights: this.generateTechStackInsight(stack, modernizationPriority),
        modernizationPriority
      })
    }

    // Adicionar tecnologias encontradas na web
    if (webTechStack && webTechStack.length > 0) {
      for (const tech of webTechStack) {
        // Verificar se já existe
        const exists = analysis.some(a => a.product.toLowerCase().includes(tech.toLowerCase()))
        if (!exists) {
          analysis.push({
            category: this.categorizeTechnology(tech),
            product: tech,
            vendor: this.getVendorFromTech(tech),
            confidence: 60, // Confiança menor para dados web
            status: "Em Avaliação",
            evidence: [
              {
                source: "Google Search",
                data: { technology: tech },
                confidence: 60,
                timestamp: new Date()
              }
            ],
            aiInsights: `Tecnologia ${tech} identificada através de busca web. Verificar uso atual e oportunidades.`,
            modernizationPriority: this.calculateModernizationPriority({ product: tech })
          })
        }
      }
    }

    return analysis
  }

  /**
   * Análise de Decision Makers com perfil AI
   */
  private async analyzeDecisionMakers(contacts: any[], emailData?: any): Promise<DecisionMakerAnalysis[]> {
    const analysis: DecisionMakerAnalysis[] = []

    // Processar contatos do banco
    for (const contact of contacts) {
      analysis.push({
        name: contact.name,
        title: contact.title,
        influenceScore: contact.score * 20, // Converter 1-5 para 0-100
        department: contact.department || "Não especificado",
        contact: {
          email: contact.email,
          phone: contact.phone,
          linkedin: contact.linkedin
        },
        aiProfile: this.generateDecisionMakerProfile(contact)
      })
    }

    // Adicionar emails encontrados no Hunter.io
    if (emailData && emailData.emails.length > 0) {
      for (const email of emailData.emails) {
        // Verificar se já existe
        const exists = analysis.some(a => a.contact.email === email.email)
        if (!exists && email.confidence > 70) {
          analysis.push({
            name: this.extractNameFromEmail(email.email),
            title: this.inferTitleFromEmail(email.email),
            influenceScore: email.confidence,
            department: this.inferDepartmentFromEmail(email.email),
            contact: {
              email: email.email,
              phone: undefined,
              linkedin: undefined
            },
            aiProfile: `Contato identificado via Hunter.io com ${email.confidence}% de confiança. ${email.type} profissional.`
          })
        }
      }
    }

    return analysis
  }

  /**
   * Análise Financeira
   */
  private analyzeFinancial(company: any): FinancialAnalysis {
    const financial = company.financial ? JSON.parse(company.financial) : {}
    
    return {
      revenue: financial.receita || 0,
      size: this.determineCompanySize(financial.receita),
      creditRisk: financial.risco || "MÉDIO",
      marketPosition: this.determineMarketPosition(company, financial),
      growthTrend: this.calculateGrowthTrend(financial)
    }
  }

  /**
   * Cálculo de todos os scores
   */
  private calculateScores(
    techStack: TechStackAnalysis[],
    decisionMakers: DecisionMakerAnalysis[],
    financial: FinancialAnalysis
  ) {
    // Score de Maturidade (0-100)
    const maturity = this.calculateMaturityScore(techStack, financial)
    
    // Score de Propensão (0-100)
    const propensity = this.calculatePropensityScore(decisionMakers, financial, techStack)
    
    // Score de Prioridade (0-100)
    const priority = this.calculatePriorityScore(maturity, propensity, financial)
    
    // Score de Confiança dos Dados (0-100)
    const confidence = this.calculateConfidenceScore(techStack, decisionMakers)

    return { maturity, propensity, priority, confidence }
  }

  /**
   * Score de Maturidade Digital
   */
  private calculateMaturityScore(
    techStack: TechStackAnalysis[],
    financial: FinancialAnalysis
  ): number {
    if (techStack.length === 0) return 25

    // Fatores de maturidade
    const avgConfidence = techStack.reduce((sum, t) => sum + t.confidence, 0) / techStack.length
    const cloudTechs = techStack.filter(t => t.category === "Cloud").length
    const automationTechs = techStack.filter(t => t.category === "Automação").length
    const erpModern = techStack.filter(t => 
      t.category === "ERP" && 
      ["SAP", "Oracle", "Microsoft", "TOTVS"].includes(t.vendor)
    ).length
    const biTools = techStack.filter(t => t.category === "BI").length

    // Cálculo ponderado
    let score = 0
    score += avgConfidence * 0.3
    score += cloudTechs * 15
    score += automationTechs * 12
    score += erpModern * 20
    score += biTools * 10

    // Ajuste por tamanho da empresa
    if (financial.size === "GRANDE") score += 10
    else if (financial.size === "MÉDIO") score += 5

    return Math.min(100, Math.round(score))
  }

  /**
   * Score de Propensão à Compra
   */
  private calculatePropensityScore(
    decisionMakers: DecisionMakerAnalysis[],
    financial: FinancialAnalysis,
    techStack: TechStackAnalysis[]
  ): number {
    let score = 35 // Base score

    // Decisores identificados
    if (decisionMakers.length > 0) score += 20
    if (decisionMakers.length >= 3) score += 10

    // C-Level identificados
    const cLevel = decisionMakers.filter(dm => 
      ["CEO", "CFO", "CTO", "CIO", "Diretor"].some(title => 
        dm.title.includes(title)
      )
    ).length
    score += cLevel * 8

    // Tamanho e capacidade financeira
    if (financial.size === "GRANDE") score += 20
    else if (financial.size === "MÉDIO") score += 12

    // Risco de crédito
    if (financial.creditRisk === "BAIXO") score += 10
    else if (financial.creditRisk === "ALTO") score -= 15

    // Tecnologias legadas (sinal de necessidade de modernização)
    const legacyTech = techStack.filter(t => 
      t.modernizationPriority > 70
    ).length
    score += legacyTech * 5

    return Math.min(100, Math.max(0, Math.round(score)))
  }

  /**
   * Score de Prioridade
   */
  private calculatePriorityScore(
    maturity: number,
    propensity: number,
    financial: FinancialAnalysis
  ): number {
    // Fórmula: 50% Propensão + 30% Ticket Potencial + 20% Urgência (inverso da maturidade)
    const ticketWeight = financial.size === "GRANDE" ? 30 : financial.size === "MÉDIO" ? 20 : 10
    const urgency = 100 - maturity // Quanto menor a maturidade, maior a urgência

    const score = (propensity * 0.5) + (ticketWeight * 0.3) + (urgency * 0.2)
    
    return Math.min(100, Math.round(score))
  }

  /**
   * Score de Confiança dos Dados
   */
  private calculateConfidenceScore(
    techStack: TechStackAnalysis[],
    decisionMakers: DecisionMakerAnalysis[]
  ): number {
    const techConfidence = techStack.length > 0 
      ? techStack.reduce((sum, t) => sum + t.confidence, 0) / techStack.length 
      : 0
    
    const contactConfidence = decisionMakers.length > 0 
      ? decisionMakers.reduce((sum, d) => sum + d.influenceScore, 0) / decisionMakers.length 
      : 0

    return Math.round((techConfidence * 0.6) + (contactConfidence * 0.4))
  }

  /**
   * Calcular prioridade de modernização de uma tecnologia
   */
  private calculateModernizationPriority(stack: any): number {
    const legacyVendors = ["Microsoft Dynamics NAV", "Protheus", "RM", "SAP R/3"]
    const modernVendors = ["SAP S/4HANA", "Microsoft Dynamics 365", "Oracle Cloud"]
    
    if (legacyVendors.some(v => stack.product.includes(v))) return 85
    if (modernVendors.some(v => stack.product.includes(v))) return 20
    
    return 50
  }

  /**
   * Gerar insights com IA
   */
  private static generateAIInsights(
    techStack: TechStackAnalysis[],
    decisionMakers: DecisionMakerAnalysis[],
    financial: FinancialAnalysis,
    scores: any
  ): AIInsight[] {
    const insights: AIInsight[] = []

    // Insight sobre maturidade
    if (scores.maturity < 40) {
      insights.push({
        type: "opportunity",
        title: "Grande Oportunidade de Modernização",
        description: `A empresa apresenta baixa maturidade digital (${scores.maturity}%). Há um potencial significativo para transformação digital e adoção de soluções modernas.`,
        confidence: 85,
        impact: "high",
        actionable: true
      })
    }

    // Insight sobre decision makers
    if (decisionMakers.length >= 3) {
      insights.push({
        type: "opportunity",
        title: "Rede de Decisores Mapeada",
        description: `${decisionMakers.length} decisores identificados, incluindo ${decisionMakers.filter(d => d.influenceScore > 80).length} com alta influência. Caminho para aprovação bem mapeado.`,
        confidence: scores.confidence,
        impact: "high",
        actionable: true
      })
    }

    // Insight sobre tech stack
    const legacyTech = techStack.filter(t => t.modernizationPriority > 70)
    if (legacyTech.length > 0) {
      insights.push({
        type: "opportunity",
        title: "Tecnologias Legadas Identificadas",
        description: `${legacyTech.length} tecnologia(s) legada(s) detectada(s). Sinaliza necessidade de modernização e pode ser um ponto de entrada para venda.`,
        confidence: 90,
        impact: "high",
        actionable: true
      })
    }

    // Insight financeiro
    if (financial.size === "GRANDE" && financial.creditRisk === "BAIXO") {
      insights.push({
        type: "opportunity",
        title: "Perfil Financeiro Excelente",
        description: "Empresa de grande porte com baixo risco de crédito. Capacidade financeira sólida para investimentos em TI.",
        confidence: 95,
        impact: "high",
        actionable: true
      })
    }

    return insights
  }

  /**
   * Gerar recomendações
   */
  private generateRecommendations(
    techStack: TechStackAnalysis[],
    scores: any,
    insights: AIInsight[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (scores.propensity > 70) {
      recommendations.push({
        title: "Agendar Reunião Executiva",
        description: "Alta propensão detectada. Agendar reunião com decisores C-level para apresentação de soluções.",
        priority: 95,
        expectedROI: 250,
        effort: "medium",
        timeline: "1-2 semanas"
      })
    }

    if (techStack.some(t => t.modernizationPriority > 70)) {
      recommendations.push({
        title: "Propor Migração de ERP",
        description: "Identificadas tecnologias legadas. Apresentar casos de sucesso de migração e ROI.",
        priority: 85,
        expectedROI: 180,
        effort: "high",
        timeline: "3-6 meses"
      })
    }

    return recommendations
  }

  /**
   * Calcular ticket estimado
   */
  private calculateTicketEstimate(
    financial: FinancialAnalysis,
    scores: any,
    techCount: number
  ) {
    let baseTicket = 50000

    // Ajuste por tamanho
    if (financial.size === "GRANDE") baseTicket = 200000
    else if (financial.size === "MÉDIO") baseTicket = 100000

    // Ajuste por maturidade e propensão
    const scoreMultiplier = (scores.maturity + scores.propensity) / 200
    const techMultiplier = Math.min(techCount / 5, 1.5)

    const min = Math.round(baseTicket * 0.7)
    const max = Math.round(baseTicket * scoreMultiplier * techMultiplier * 1.8)
    const average = Math.round((min + max) / 2)

    return { min, max, average }
  }

  /**
   * Calcular Fit Score total
   */
  private calculateFitScore(scores: any, financial: FinancialAnalysis): number {
    let fit = (scores.maturity + scores.propensity + scores.priority) / 3

    // Bônus para grandes empresas com baixo risco
    if (financial.size === "GRANDE" && financial.creditRisk === "BAIXO") {
      fit = Math.min(100, fit + 15)
    }

    return Math.round(fit)
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private determineCompanySize(revenue: number): "PEQUENO" | "MÉDIO" | "GRANDE" {
    if (revenue > 50000000) return "GRANDE"
    if (revenue > 10000000) return "MÉDIO"
    return "PEQUENO"
  }

  private determineMarketPosition(company: any, financial: any): string {
    // Lógica simplificada - pode ser expandida
    if (financial.receita > 100000000) return "Líder de Mercado"
    if (financial.receita > 50000000) return "Player Consolidado"
    if (financial.receita > 10000000) return "Empresa em Crescimento"
    return "Empresa Emergente"
  }

  private calculateGrowthTrend(financial: any): number {
    // Simulated - em produção viria de dados históricos
    return Math.round(Math.random() * 40 - 10) // -10% a +30%
  }

  private generateTechStackInsight(stack: any, modernizationPriority: number): string {
    if (modernizationPriority > 70) {
      return `Tecnologia legada detectada. Alta prioridade para modernização. Oportunidade para propor soluções atualizadas.`
    }
    if (modernizationPriority < 30) {
      return `Tecnologia moderna em uso. Empresa demonstra investimento em inovação.`
    }
    return `Tecnologia intermediária. Monitorar evolução e oportunidades de upgrade.`
  }

  private generateDecisionMakerProfile(contact: any): string {
    const score = contact.score
    if (score >= 5) {
      return "Decisor C-Level com alta influência. Perfil estratégico, foca em ROI e transformação. Abordagem consultiva recomendada."
    }
    if (score >= 4) {
      return "Gerente com poder de influência. Perfil operacional, busca eficiência. Demonstrar ganhos práticos."
    }
    if (score >= 3) {
      return "Especialista técnico. Perfil analítico, valoriza especificações. Apresentar detalhes técnicos."
    }
    return "Contato operacional. Perfil executor, busca facilidade de uso. Demonstração hands-on."
  }

  private categorizeTechnology(tech: string): string {
    const categories: { [key: string]: string[] } = {
      'ERP': ['SAP', 'Oracle', 'Microsoft', 'TOTVS', 'Protheus'],
      'CRM': ['Salesforce', 'HubSpot', 'Microsoft Dynamics'],
      'Cloud': ['AWS', 'Azure', 'Google Cloud', 'Amazon'],
      'BI': ['Power BI', 'Tableau', 'Qlik', 'Looker'],
      'Automação': ['Zapier', 'Microsoft Power Automate', 'UiPath'],
      'Comunicação': ['Slack', 'Microsoft Teams', 'Zoom', 'Google Meet'],
      'Desenvolvimento': ['React', 'Angular', 'Vue', 'Node.js', 'Python']
    }

    for (const [category, techs] of Object.entries(categories)) {
      if (techs.some(t => tech.toLowerCase().includes(t.toLowerCase()))) {
        return category
      }
    }
    return 'Outros'
  }

  private getVendorFromTech(tech: string): string {
    const vendors: { [key: string]: string } = {
      'SAP': 'SAP',
      'Oracle': 'Oracle',
      'Microsoft': 'Microsoft',
      'Salesforce': 'Salesforce',
      'HubSpot': 'HubSpot',
      'AWS': 'Amazon',
      'Azure': 'Microsoft',
      'Google Cloud': 'Google',
      'Power BI': 'Microsoft',
      'Tableau': 'Salesforce',
      'Slack': 'Slack',
      'Zoom': 'Zoom'
    }

    for (const [techKey, vendor] of Object.entries(vendors)) {
      if (tech.toLowerCase().includes(techKey.toLowerCase())) {
        return vendor
      }
    }
    return 'Desconhecido'
  }

  private extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0]
    const nameParts = localPart.split('.')
    return nameParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  private inferTitleFromEmail(email: string): string {
    const localPart = email.split('@')[0].toLowerCase()
    
    if (localPart.includes('ceo') || localPart.includes('presidente')) return 'CEO'
    if (localPart.includes('cto') || localPart.includes('diretor-tecnologia')) return 'CTO'
    if (localPart.includes('cfo') || localPart.includes('diretor-financeiro')) return 'CFO'
    if (localPart.includes('diretor') || localPart.includes('director')) return 'Diretor'
    if (localPart.includes('gerente') || localPart.includes('manager')) return 'Gerente'
    if (localPart.includes('coordenador') || localPart.includes('coordinator')) return 'Coordenador'
    if (localPart.includes('analista') || localPart.includes('analyst')) return 'Analista'
    
    return 'Profissional'
  }

  private inferDepartmentFromEmail(email: string): string {
    const localPart = email.split('@')[0].toLowerCase()
    
    if (localPart.includes('ti') || localPart.includes('tech') || localPart.includes('it')) return 'TI'
    if (localPart.includes('financeiro') || localPart.includes('finance')) return 'Financeiro'
    if (localPart.includes('comercial') || localPart.includes('sales')) return 'Comercial'
    if (localPart.includes('marketing') || localPart.includes('mkt')) return 'Marketing'
    if (localPart.includes('rh') || localPart.includes('recursos-humanos')) return 'RH'
    if (localPart.includes('operacoes') || localPart.includes('operations')) return 'Operações'
    
    return 'Não especificado'
  }
}

// Export singleton instance
export const intelligenceEngine = new IntelligenceEngine()
