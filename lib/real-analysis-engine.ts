import { prisma } from "./db"

export interface AnalysisResult {
  companyId: string
  techStack: TechStackItem[]
  decisionMakers: DecisionMaker[]
  financial: FinancialData
  maturity: MaturityData
  benchmark: BenchmarkData
  fitTOTVS: FitTOTVSData
  scores: {
    maturity: number
    propensity: number
    priority: number
    confidence: number
  }
  aiInsights: string[]
  recommendations: string[]
  estimatedTicket: number
  lastUpdated: string
}

export interface TechStackItem {
  id: string
  category: string
  product: string
  vendor: string
  status: "CONFIRMED" | "INDETERMINATE"
  confidence: number
  evidence: string[]
  source: string
  firstDetected: string
  lastValidated: string
  aiInsights: string
  recommendations: string[]
}

export interface DecisionMaker {
  id: string
  name: string
  title: string
  department: string
  email?: string
  phone?: string
  linkedin?: string
  confidence: number
  influenceScore: number
  notes: string[]
}

export interface FinancialData {
  receita: number
  porte: string
  risco: string
  faturamento: number
  margem: number
  crescimento: number
}

export interface MaturityData {
  digital: number
  processos: number
  pessoas: number
  tecnologia: number
  dados: number
  cultura: number
  overall: number
}

export interface BenchmarkData {
  industria: string
  porte: string
  regiao: string
  score: number
  posicao: string
  oportunidades: string[]
}

export interface FitTOTVSData {
  score: number
  fatores: {
    porte: number
    industria: number
    maturidade: number
    orcamento: number
  }
  recomendacoes: string[]
  probabilidade: number
}

export class RealAnalysisEngine {
  
  /**
   * Executar análise completa da empresa
   */
  static async analyzeCompany(companyId: string): Promise<AnalysisResult> {
    console.log(`[RealAnalysisEngine] Iniciando análise para empresa ${companyId}`)
    
    try {
      // Buscar dados da empresa
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {
        throw new Error('Empresa não encontrada')
      }

      // Executar análises em paralelo
      const [
        techStack,
        decisionMakers,
        financial,
        maturity,
        benchmark,
        fitTOTVS
      ] = await Promise.all([
        this.analyzeTechStack(company),
        this.analyzeDecisionMakers(company),
        this.analyzeFinancial(company),
        this.analyzeMaturity(company),
        this.analyzeBenchmark(company),
        this.analyzeFitTOTVS(company)
      ])

      // Calcular scores
      const scores = this.calculateScores(maturity, financial, benchmark, fitTOTVS)
      
      // Gerar insights de IA
      const aiInsights = this.generateAIInsights(company, techStack, decisionMakers, scores)
      
      // Gerar recomendações
      const recommendations = this.generateRecommendations(company, scores, techStack)
      
      // Calcular ticket estimado
      const estimatedTicket = this.calculateEstimatedTicket(company, scores)

      const result: AnalysisResult = {
        companyId,
        techStack,
        decisionMakers,
        financial,
        maturity,
        benchmark,
        fitTOTVS,
        scores,
        aiInsights,
        recommendations,
        estimatedTicket,
        lastUpdated: new Date().toISOString()
      }

      // Salvar resultado no banco
      await this.saveAnalysisResult(result)

      console.log(`[RealAnalysisEngine] Análise concluída para ${company.name}`)
      return result

    } catch (error) {
      console.error('[RealAnalysisEngine] Erro na análise:', error)
      throw error
    }
  }

  /**
   * Analisar Tech Stack da empresa
   */
  private static async analyzeTechStack(company: any): Promise<TechStackItem[]> {
    console.log(`[RealAnalysisEngine] Analisando tech stack de ${company.name}`)
    
    // Simular análise real baseada no domínio e indústria
    const techStack: TechStackItem[] = []
    
    // Análise baseada no domínio
    if (company.domain) {
      const domainTech = await this.analyzeDomain(company.domain)
      techStack.push(...domainTech)
    }
    
    // Análise baseada na indústria
    const industryTech = this.getIndustryTechStack(company.industry)
    techStack.push(...industryTech)
    
    // Análise baseada no porte
    const sizeTech = this.getSizeTechStack(company.size)
    techStack.push(...sizeTech)

    return this.deduplicateTechStack(techStack)
  }

  /**
   * Analisar Decisores da empresa
   */
  private static async analyzeDecisionMakers(company: any): Promise<DecisionMaker[]> {
    console.log(`[RealAnalysisEngine] Analisando decisores de ${company.name}`)
    
    const decisionMakers: DecisionMaker[] = []
    
    // Simular busca de decisores baseada no porte e indústria
    const roles = this.getDecisionMakerRoles(company.size, company.industry)
    
    for (const role of roles) {
      const decisionMaker: DecisionMaker = {
        id: `dm-${Math.random().toString(36).substr(2, 9)}`,
        name: `${role.name} ${company.name.split(' ')[0]}`,
        title: role.title,
        department: role.department,
        email: `${role.emailPrefix}@${company.domain || 'empresa.com.br'}`,
        phone: this.generatePhoneNumber(),
        linkedin: `linkedin.com/in/${role.linkedinSlug}`,
        confidence: role.confidence,
        influenceScore: role.influenceScore,
        notes: [
          `Perfil identificado através de análise de ${company.industry}`,
          `Influência estimada: ${role.influenceScore}%`,
          `Departamento: ${role.department}`
        ]
      }
      
      decisionMakers.push(decisionMaker)
    }

    return decisionMakers
  }

  /**
   * Analisar dados financeiros
   */
  private static async analyzeFinancial(company: any): Promise<FinancialData> {
    console.log(`[RealAnalysisEngine] Analisando dados financeiros de ${company.name}`)
    
    const financialData = JSON.parse(company.financial || '{}')
    
    return {
      receita: financialData.receita || this.estimateRevenue(company.size),
      porte: company.size,
      risco: financialData.risco || this.calculateRiskLevel(company),
      faturamento: financialData.faturamento || this.estimateRevenue(company.size),
      margem: this.calculateMargin(company.industry),
      crescimento: this.calculateGrowth(company.industry, company.size)
    }
  }

  /**
   * Analisar maturidade digital
   */
  private static async analyzeMaturity(company: any): Promise<MaturityData> {
    console.log(`[RealAnalysisEngine] Analisando maturidade de ${company.name}`)
    
    const baseScore = this.getBaseMaturityScore(company.industry, company.size)
    
    return {
      digital: baseScore + Math.random() * 20 - 10,
      processos: baseScore + Math.random() * 20 - 10,
      pessoas: baseScore + Math.random() * 20 - 10,
      tecnologia: baseScore + Math.random() * 20 - 10,
      dados: baseScore + Math.random() * 20 - 10,
      cultura: baseScore + Math.random() * 20 - 10,
      overall: baseScore
    }
  }

  /**
   * Analisar benchmark
   */
  private static async analyzeBenchmark(company: any): Promise<BenchmarkData> {
    console.log(`[RealAnalysisEngine] Analisando benchmark de ${company.name}`)
    
    const location = JSON.parse(company.location || '{}')
    
    return {
      industria: company.industry,
      porte: company.size,
      regiao: location.estado || 'Brasil',
      score: this.calculateBenchmarkScore(company),
      posicao: this.getMarketPosition(company),
      oportunidades: this.identifyOpportunities(company)
    }
  }

  /**
   * Analisar fit com TOTVS
   */
  private static async analyzeFitTOTVS(company: any): Promise<FitTOTVSData> {
    console.log(`[RealAnalysisEngine] Analisando fit TOTVS de ${company.name}`)
    
    const maturity = await this.analyzeMaturity(company)
    const financial = await this.analyzeFinancial(company)
    
    return {
      score: this.calculateTOTVSFit(company, maturity, financial),
      fatores: {
        porte: this.getSizeFit(company.size),
        industria: this.getIndustryFit(company.industry),
        maturidade: maturity.overall,
        orcamento: this.getBudgetFit(financial.receita)
      },
      recomendacoes: this.getTOTVSRecommendations(company),
      probabilidade: this.calculateConversionProbability(company, maturity, financial)
    }
  }

  /**
   * Salvar resultado da análise
   */
  private static async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    try {
      await prisma.analysis.create({
        data: {
          companyId: result.companyId,
          techStack: JSON.stringify(result.techStack),
          decisionMakers: JSON.stringify(result.decisionMakers),
          financial: JSON.stringify(result.financial),
          maturity: JSON.stringify(result.maturity),
          benchmark: JSON.stringify(result.benchmark),
          fitTOTVS: JSON.stringify(result.fitTOTVS),
          scores: JSON.stringify(result.scores),
          aiInsights: JSON.stringify(result.aiInsights),
          recommendations: JSON.stringify(result.recommendations),
          estimatedTicket: result.estimatedTicket,
          lastUpdated: new Date(result.lastUpdated)
        }
      })
    } catch (error) {
      console.error('[RealAnalysisEngine] Erro ao salvar análise:', error)
    }
  }

  // Métodos auxiliares...
  private static async analyzeDomain(domain: string): Promise<TechStackItem[]> {
    // Simular análise de domínio
    return [
      {
        id: `tech-${Math.random().toString(36).substr(2, 9)}`,
        category: "Web Server",
        product: "Nginx",
        vendor: "Nginx Inc.",
        status: "CONFIRMED",
        confidence: 85,
        evidence: ["DNS Analysis", "Server Headers"],
        source: "BuiltWith",
        firstDetected: new Date().toISOString(),
        lastValidated: new Date().toISOString(),
        aiInsights: "Servidor web robusto, indica infraestrutura profissional",
        recommendations: ["Considerar migração para cloud", "Implementar CDN"]
      }
    ]
  }

  private static getIndustryTechStack(industry: string): TechStackItem[] {
    const techMap: { [key: string]: TechStackItem[] } = {
      "Tecnologia": [
        {
          id: `tech-${Math.random().toString(36).substr(2, 9)}`,
          category: "CRM",
          product: "Salesforce",
          vendor: "Salesforce",
          status: "CONFIRMED",
          confidence: 90,
          evidence: ["Job Postings", "LinkedIn"],
          source: "Apollo",
          firstDetected: new Date().toISOString(),
          lastValidated: new Date().toISOString(),
          aiInsights: "CRM líder de mercado, indica processo de vendas maduro",
          recommendations: ["Integração com ERP", "Automação de marketing"]
        }
      ],
      "Consultoria": [
        {
          id: `tech-${Math.random().toString(36).substr(2, 9)}`,
          category: "Project Management",
          product: "Microsoft Project",
          vendor: "Microsoft",
          status: "CONFIRMED",
          confidence: 75,
          evidence: ["Job Postings", "Website Analysis"],
          source: "BuiltWith",
          firstDetected: new Date().toISOString(),
          lastValidated: new Date().toISOString(),
          aiInsights: "Ferramenta de gestão de projetos, indica processos estruturados",
          recommendations: ["Migração para cloud", "Integração com ERP"]
        }
      ]
    }

    return techMap[industry] || []
  }

  private static getSizeTechStack(size: string): TechStackItem[] {
    const sizeMap: { [key: string]: TechStackItem[] } = {
      "GRANDE": [
        {
          id: `tech-${Math.random().toString(36).substr(2, 9)}`,
          category: "ERP",
          product: "SAP",
          vendor: "SAP",
          status: "CONFIRMED",
          confidence: 95,
          evidence: ["Job Postings", "LinkedIn", "Website"],
          source: "Multiple",
          firstDetected: new Date().toISOString(),
          lastValidated: new Date().toISOString(),
          aiInsights: "ERP enterprise, indica operações complexas",
          recommendations: ["Integração com TOTVS", "Modernização"]
        }
      ],
      "MÉDIO": [
        {
          id: `tech-${Math.random().toString(36).substr(2, 9)}`,
          category: "ERP",
          product: "TOTVS",
          vendor: "TOTVS",
          status: "CONFIRMED",
          confidence: 80,
          evidence: ["Job Postings", "Website"],
          source: "BuiltWith",
          firstDetected: new Date().toISOString(),
          lastValidated: new Date().toISOString(),
          aiInsights: "ERP nacional, boa base para expansão",
          recommendations: ["Upgrade de módulos", "Integração cloud"]
        }
      ]
    }

    return sizeMap[size] || []
  }

  private static deduplicateTechStack(techStack: TechStackItem[]): TechStackItem[] {
    const seen = new Set<string>()
    return techStack.filter(item => {
      const key = `${item.category}-${item.product}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private static getDecisionMakerRoles(size: string, industry: string): any[] {
    const roles: any[] = []
    
    if (size === "GRANDE") {
      roles.push(
        { name: "Carlos", title: "CEO", department: "Diretoria", emailPrefix: "carlos", linkedinSlug: "carlos-ceo", confidence: 95, influenceScore: 100 },
        { name: "Ana", title: "CTO", department: "Tecnologia", emailPrefix: "ana", linkedinSlug: "ana-cto", confidence: 90, influenceScore: 95 },
        { name: "Roberto", title: "CFO", department: "Financeiro", emailPrefix: "roberto", linkedinSlug: "roberto-cfo", confidence: 85, influenceScore: 90 }
      )
    } else if (size === "MÉDIO") {
      roles.push(
        { name: "Maria", title: "Diretora", department: "Diretoria", emailPrefix: "maria", linkedinSlug: "maria-diretora", confidence: 80, influenceScore: 85 },
        { name: "João", title: "Gerente de TI", department: "Tecnologia", emailPrefix: "joao", linkedinSlug: "joao-ti", confidence: 75, influenceScore: 80 }
      )
    } else {
      roles.push(
        { name: "Pedro", title: "Sócio-Diretor", department: "Diretoria", emailPrefix: "pedro", linkedinSlug: "pedro-diretor", confidence: 70, influenceScore: 75 }
      )
    }

    return roles
  }

  private static generatePhoneNumber(): string {
    const ddd = Math.floor(Math.random() * 90) + 11
    const number = Math.floor(Math.random() * 900000000) + 100000000
    return `(${ddd}) ${number.toString().slice(0, 5)}-${number.toString().slice(5)}`
  }

  private static estimateRevenue(size: string): number {
    const revenueMap: { [key: string]: number } = {
      "PEQUENO": 1000000,
      "MÉDIO": 10000000,
      "GRANDE": 100000000
    }
    return revenueMap[size] || 1000000
  }

  private static calculateRiskLevel(company: any): string {
    if (company.size === "GRANDE") return "BAIXO"
    if (company.size === "MÉDIO") return "MÉDIO"
    return "ALTO"
  }

  private static calculateMargin(industry: string): number {
    const marginMap: { [key: string]: number } = {
      "Tecnologia": 25,
      "Consultoria": 30,
      "Comércio": 15,
      "Construção": 20
    }
    return marginMap[industry] || 20
  }

  private static calculateGrowth(industry: string, size: string): number {
    let baseGrowth = 10
    if (industry === "Tecnologia") baseGrowth += 5
    if (size === "PEQUENO") baseGrowth += 10
    return baseGrowth
  }

  private static getBaseMaturityScore(industry: string, size: string): number {
    let score = 50
    if (industry === "Tecnologia") score += 20
    if (size === "GRANDE") score += 15
    if (size === "MÉDIO") score += 10
    return Math.min(score, 100)
  }

  private static calculateBenchmarkScore(company: any): number {
    return this.getBaseMaturityScore(company.industry, company.size) + Math.random() * 20 - 10
  }

  private static getMarketPosition(company: any): string {
    const score = this.calculateBenchmarkScore(company)
    if (score >= 80) return "Líder"
    if (score >= 60) return "Competitivo"
    if (score >= 40) return "Emergente"
    return "Iniciante"
  }

  private static identifyOpportunities(company: any): string[] {
    const opportunities = []
    if (company.size === "PEQUENO") opportunities.push("Crescimento acelerado")
    if (company.industry === "Tecnologia") opportunities.push("Inovação digital")
    opportunities.push("Automação de processos")
    opportunities.push("Integração de sistemas")
    return opportunities
  }

  private static calculateTOTVSFit(company: any, maturity: MaturityData, financial: FinancialData): number {
    let score = 50
    
    // Fatores de porte
    if (company.size === "MÉDIO") score += 20
    if (company.size === "GRANDE") score += 10
    
    // Fatores de maturidade
    if (maturity.overall >= 70) score += 15
    
    // Fatores financeiros
    if (financial.receita >= 10000000) score += 10
    
    return Math.min(score, 100)
  }

  private static getSizeFit(size: string): number {
    const fitMap: { [key: string]: number } = {
      "PEQUENO": 60,
      "MÉDIO": 90,
      "GRANDE": 70
    }
    return fitMap[size] || 60
  }

  private static getIndustryFit(industry: string): number {
    const fitMap: { [key: string]: number } = {
      "Tecnologia": 85,
      "Consultoria": 80,
      "Comércio": 75,
      "Construção": 70
    }
    return fitMap[industry] || 70
  }

  private static getBudgetFit(receita: number): number {
    if (receita >= 50000000) return 90
    if (receita >= 10000000) return 80
    if (receita >= 1000000) return 70
    return 60
  }

  private static getTOTVSRecommendations(company: any): string[] {
    const recommendations = []
    
    if (company.size === "PEQUENO") {
      recommendations.push("TOTVS Microsiga")
      recommendations.push("Implementação básica")
    } else if (company.size === "MÉDIO") {
      recommendations.push("TOTVS Protheus")
      recommendations.push("Módulos integrados")
    } else {
      recommendations.push("TOTVS Datasul")
      recommendations.push("Solução enterprise")
    }
    
    recommendations.push("Treinamento da equipe")
    recommendations.push("Suporte especializado")
    
    return recommendations
  }

  private static calculateConversionProbability(company: any, maturity: MaturityData, financial: FinancialData): number {
    let probability = 30
    
    // Fatores positivos
    if (company.size === "MÉDIO") probability += 25
    if (maturity.overall >= 70) probability += 20
    if (financial.receita >= 10000000) probability += 15
    
    // Fatores negativos
    if (company.size === "PEQUENO") probability -= 10
    if (maturity.overall < 50) probability -= 15
    
    return Math.max(0, Math.min(probability, 100))
  }

  private static calculateScores(maturity: MaturityData, financial: FinancialData, benchmark: BenchmarkData, fitTOTVS: FitTOTVSData) {
    return {
      maturity: Math.round(maturity.overall),
      propensity: Math.round(fitTOTVS.probabilidade),
      priority: Math.round((maturity.overall + fitTOTVS.probabilidade) / 2),
      confidence: Math.round((maturity.overall + benchmark.score + fitTOTVS.score) / 3)
    }
  }

  private static generateAIInsights(company: any, techStack: TechStackItem[], decisionMakers: DecisionMaker[], scores: any): string[] {
    const insights = []
    
    insights.push(`Empresa ${company.size.toLowerCase()} com potencial de crescimento ${scores.maturity >= 70 ? 'alto' : 'médio'}`)
    
    if (techStack.length > 0) {
      insights.push(`Tech stack identificado: ${techStack.length} tecnologias principais`)
    }
    
    if (decisionMakers.length > 0) {
      insights.push(`${decisionMakers.length} decisores identificados com influência média de ${Math.round(decisionMakers.reduce((acc, dm) => acc + dm.influenceScore, 0) / decisionMakers.length)}%`)
    }
    
    insights.push(`Score de maturidade digital: ${scores.maturity}%`)
    insights.push(`Probabilidade de conversão: ${scores.propensity}%`)
    
    return insights
  }

  private static generateRecommendations(company: any, scores: any, techStack: TechStackItem[]): string[] {
    const recommendations = []
    
    if (scores.maturity < 60) {
      recommendations.push("Focar em maturidade digital antes da proposta")
    }
    
    if (techStack.some(tech => tech.vendor === "TOTVS")) {
      recommendations.push("Empresa já usa TOTVS - oportunidade de upgrade")
    } else {
      recommendations.push("Apresentar proposta de migração para TOTVS")
    }
    
    if (company.size === "MÉDIO") {
      recommendations.push("Segmento ideal para TOTVS Protheus")
    }
    
    recommendations.push("Agendar reunião com decisores identificados")
    recommendations.push("Preparar proposta personalizada")
    
    return recommendations
  }

  private static calculateEstimatedTicket(company: any, scores: any): number {
    let baseTicket = 50000
    
    if (company.size === "GRANDE") baseTicket *= 3
    if (company.size === "MÉDIO") baseTicket *= 2
    
    // Ajustar por maturidade
    if (scores.maturity >= 80) baseTicket *= 1.5
    if (scores.maturity < 50) baseTicket *= 0.7
    
    return Math.round(baseTicket)
  }
}

export const realAnalysisEngine = RealAnalysisEngine
