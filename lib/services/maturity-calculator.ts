interface TechStackItem {
  id: string
  category: string
  product: string
  vendor: string
  status: "Confirmado" | "Indeterminado" | "Em Avaliação"
  confidence: number
  evidence: string[]
  source: string
  firstDetected: string
  lastValidated: string
}

interface MaturityScores {
  infrastructure: number
  systems: number
  data: number
  security: number
  automation: number
  culture: number
  overall: number
}

interface VendorFitRecommendation {
  product: string
  rationale: string
  confidence: number
  estimatedROI: number
  migrationComplexity: 'Low' | 'Medium' | 'High'
  timeline: string
}

interface VendorFit {
  recommendations: VendorFitRecommendation[]
  totalROI: number
  migrationPath: string[]
  competitiveAdvantage: string[]
}

interface MaturityInput {
  detectedStack: TechStackItem[]
  sources: {
    builtwith?: any
    similartech?: any
    dns?: any
    jobs?: any
    google?: any
  }
  companyProfile?: {
    industry?: string
    size?: string
    revenue?: number
  }
}

export class MaturityCalculator {
  private readonly weights = {
    infrastructure: 0.20,
    systems: 0.25,
    data: 0.15,
    security: 0.15,
    automation: 0.15,
    culture: 0.10
  }

  computeMaturity(input: MaturityInput): MaturityScores {
    console.log('[Maturity Calculator] 🔍 Calculando maturidade para', input.detectedStack.length, 'tecnologias')
    
    const scores = {
      infrastructure: this.scoreInfrastructure(input),
      systems: this.scoreSystems(input),
      data: this.scoreData(input),
      security: this.scoreSecurity(input),
      automation: this.scoreAutomation(input),
      culture: this.scoreCulture(input),
      overall: 0
    }

    // Calcular overall como média ponderada
    scores.overall = Math.round(
      scores.infrastructure * this.weights.infrastructure +
      scores.systems * this.weights.systems +
      scores.data * this.weights.data +
      scores.security * this.weights.security +
      scores.automation * this.weights.automation +
      scores.culture * this.weights.culture
    )

    console.log('[Maturity Calculator] ✅ Scores calculados:', scores)
    return scores
  }

  private scoreInfrastructure(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // Cloud presence (40% do score)
    const cloudTechs = stack.filter(t => 
      t.category === 'Cloud' && 
      ['AWS', 'Azure', 'Google Cloud', 'TOTVS Cloud'].includes(t.vendor)
    )
    score += Math.min(40, cloudTechs.length * 15)

    // CDN and Performance (20% do score)
    const cdnTechs = stack.filter(t => 
      t.product.toLowerCase().includes('cdn') ||
      t.product.toLowerCase().includes('cloudflare') ||
      t.product.toLowerCase().includes('akamai')
    )
    score += Math.min(20, cdnTechs.length * 10)

    // Modern Infrastructure (20% do score)
    const modernTechs = stack.filter(t => 
      t.product.toLowerCase().includes('docker') ||
      t.product.toLowerCase().includes('kubernetes') ||
      t.product.toLowerCase().includes('microservices')
    )
    score += Math.min(20, modernTechs.length * 10)

    // Monitoring and DevOps (20% do score)
    const monitoringTechs = stack.filter(t => 
      t.category === 'Monitoring' ||
      t.product.toLowerCase().includes('jenkins') ||
      t.product.toLowerCase().includes('gitlab')
    )
    score += Math.min(20, monitoringTechs.length * 10)

    return Math.min(100, Math.max(0, score))
  }

  private scoreSystems(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // ERP Presence (30% do score)
    const erpTechs = stack.filter(t => t.category === 'ERP')
    if (erpTechs.length > 0) {
      score += 30
      // Bonus for modern ERPs
      if (erpTechs.some(t => ['TOTVS', 'SAP', 'Oracle'].includes(t.vendor))) {
        score += 10
      }
    }

    // CRM Presence (25% do score)
    const crmTechs = stack.filter(t => t.category === 'CRM')
    if (crmTechs.length > 0) {
      score += 25
      // Bonus for integrated CRM
      if (crmTechs.some(t => ['Salesforce', 'HubSpot', 'TOTVS'].includes(t.vendor))) {
        score += 5
      }
    }

    // BI/Analytics (20% do score)
    const biTechs = stack.filter(t => t.category === 'BI')
    if (biTechs.length > 0) {
      score += 20
    }

    // Integration Capabilities (25% do score)
    const integrationTechs = stack.filter(t => 
      t.product.toLowerCase().includes('api') ||
      t.product.toLowerCase().includes('integration') ||
      t.product.toLowerCase().includes('middleware')
    )
    score += Math.min(25, integrationTechs.length * 8)

    return Math.min(100, Math.max(0, score))
  }

  private scoreData(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // Database Technologies (40% do score)
    const dbTechs = stack.filter(t => t.category === 'Database')
    if (dbTechs.length > 0) {
      score += 40
      // Bonus for modern databases
      if (dbTechs.some(t => ['PostgreSQL', 'MongoDB', 'Redis'].includes(t.product))) {
        score += 10
      }
    }

    // Data Analytics Tools (30% do score)
    const analyticsTechs = stack.filter(t => 
      t.category === 'BI' ||
      t.product.toLowerCase().includes('analytics') ||
      t.product.toLowerCase().includes('data')
    )
    score += Math.min(30, analyticsTechs.length * 10)

    // Data Governance (30% do score)
    const governanceTechs = stack.filter(t => 
      t.product.toLowerCase().includes('governance') ||
      t.product.toLowerCase().includes('compliance') ||
      t.product.toLowerCase().includes('audit')
    )
    score += Math.min(30, governanceTechs.length * 10)

    return Math.min(100, Math.max(0, score))
  }

  private scoreSecurity(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // Security Tools (50% do score)
    const securityTechs = stack.filter(t => 
      t.category === 'Security' ||
      t.product.toLowerCase().includes('security') ||
      t.product.toLowerCase().includes('firewall') ||
      t.product.toLowerCase().includes('antivirus')
    )
    score += Math.min(50, securityTechs.length * 12)

    // SSL/HTTPS (20% do score)
    const sslTechs = stack.filter(t => 
      t.product.toLowerCase().includes('ssl') ||
      t.product.toLowerCase().includes('https') ||
      t.product.toLowerCase().includes('certificate')
    )
    score += Math.min(20, sslTechs.length * 10)

    // Identity Management (30% do score)
    const identityTechs = stack.filter(t => 
      t.product.toLowerCase().includes('ldap') ||
      t.product.toLowerCase().includes('sso') ||
      t.product.toLowerCase().includes('oauth')
    )
    score += Math.min(30, identityTechs.length * 10)

    return Math.min(100, Math.max(0, score))
  }

  private scoreAutomation(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // Workflow Automation (40% do score)
    const workflowTechs = stack.filter(t => 
      t.product.toLowerCase().includes('workflow') ||
      t.product.toLowerCase().includes('bpm') ||
      t.product.toLowerCase().includes('fluig') ||
      t.product.toLowerCase().includes('power automate')
    )
    score += Math.min(40, workflowTechs.length * 15)

    // RPA Tools (30% do score)
    const rpaTechs = stack.filter(t => 
      t.product.toLowerCase().includes('rpa') ||
      t.product.toLowerCase().includes('automation') ||
      t.product.toLowerCase().includes('bot')
    )
    score += Math.min(30, rpaTechs.length * 10)

    // Integration Platforms (30% do score)
    const integrationTechs = stack.filter(t => 
      t.product.toLowerCase().includes('zapier') ||
      t.product.toLowerCase().includes('mulesoft') ||
      t.product.toLowerCase().includes('boomi')
    )
    score += Math.min(30, integrationTechs.length * 10)

    return Math.min(100, Math.max(0, score))
  }

  private scoreCulture(input: MaturityInput): number {
    let score = 0
    const stack = input.detectedStack

    // Digital Tools Adoption (50% do score)
    const digitalTools = stack.filter(t => 
      t.category === 'Productivity' ||
      t.product.toLowerCase().includes('office') ||
      t.product.toLowerCase().includes('google') ||
      t.product.toLowerCase().includes('slack')
    )
    score += Math.min(50, digitalTools.length * 8)

    // Modern Development Practices (30% do score)
    const devTechs = stack.filter(t => 
      t.category === 'Development' ||
      t.product.toLowerCase().includes('git') ||
      t.product.toLowerCase().includes('ci/cd') ||
      t.product.toLowerCase().includes('agile')
    )
    score += Math.min(30, devTechs.length * 10)

    // Innovation Indicators (20% do score)
    const innovationTechs = stack.filter(t => 
      t.product.toLowerCase().includes('ai') ||
      t.product.toLowerCase().includes('machine learning') ||
      t.product.toLowerCase().includes('blockchain')
    )
    score += Math.min(20, innovationTechs.length * 10)

    return Math.min(100, Math.max(0, score))
  }
}

export class VendorFitCalculator {
  suggestFit(input: { vendor: string, detectedStack: TechStackItem[], scores: MaturityScores }): VendorFit {
    console.log('[Vendor Fit] 🔍 Calculando fit para vendor:', input.vendor)
    
    const recommendations: VendorFitRecommendation[] = []
    const stack = input.detectedStack

    if (input.vendor === 'TOTVS') {
      recommendations.push(...this.generateTotvsRecommendations(stack, input.scores))
    } else if (input.vendor === 'OLV') {
      recommendations.push(...this.generateOlvRecommendations(stack, input.scores))
    } else {
      recommendations.push(...this.generateCustomRecommendations(stack, input.scores))
    }

    const totalROI = recommendations.reduce((sum, rec) => sum + rec.estimatedROI, 0)
    const migrationPath = this.generateMigrationPath(recommendations)
    const competitiveAdvantage = this.generateCompetitiveAdvantages(input.scores)

    console.log('[Vendor Fit] ✅ Recomendações geradas:', recommendations.length)
    return {
      recommendations,
      totalROI,
      migrationPath,
      competitiveAdvantage
    }
  }

  private generateTotvsRecommendations(stack: TechStackItem[], scores: MaturityScores): VendorFitRecommendation[] {
    const recommendations: VendorFitRecommendation[] = []

    // SAP → TOTVS Protheus
    const sapTechs = stack.filter(t => t.vendor === 'SAP' && t.category === 'ERP')
    if (sapTechs.length > 0) {
      recommendations.push({
        product: 'TOTVS Protheus',
        rationale: 'Migração de SAP reduz TCO em até 35% e melhora integração',
        confidence: 95,
        estimatedROI: 150000,
        migrationComplexity: 'High',
        timeline: '12-18 meses'
      })
    }

    // Oracle → TOTVS Protheus
    const oracleTechs = stack.filter(t => t.vendor === 'Oracle' && t.category === 'ERP')
    if (oracleTechs.length > 0) {
      recommendations.push({
        product: 'TOTVS Protheus',
        rationale: 'Substituição de Oracle por solução nacional com melhor suporte',
        confidence: 90,
        estimatedROI: 120000,
        migrationComplexity: 'High',
        timeline: '10-15 meses'
      })
    }

    // Power BI → TOTVS BI
    const powerBiTechs = stack.filter(t => t.product.includes('Power BI'))
    if (powerBiTechs.length > 0) {
      recommendations.push({
        product: 'TOTVS BI',
        rationale: 'Integração nativa com Protheus e dados brasileiros',
        confidence: 85,
        estimatedROI: 80000,
        migrationComplexity: 'Medium',
        timeline: '6-9 meses'
      })
    }

    // Salesforce → TOTVS CRM
    const salesforceTechs = stack.filter(t => t.vendor === 'Salesforce')
    if (salesforceTechs.length > 0) {
      recommendations.push({
        product: 'TOTVS CRM',
        rationale: 'CRM integrado com ERP e custo-benefício superior',
        confidence: 80,
        estimatedROI: 60000,
        migrationComplexity: 'Medium',
        timeline: '4-6 meses'
      })
    }

    // Sem BPM → Fluig
    const bpmTechs = stack.filter(t => 
      t.product.toLowerCase().includes('bpm') ||
      t.product.toLowerCase().includes('workflow')
    )
    if (bpmTechs.length === 0 && scores.automation < 70) {
      recommendations.push({
        product: 'TOTVS Fluig',
        rationale: 'Automação de processos e gestão documental',
        confidence: 75,
        estimatedROI: 40000,
        migrationComplexity: 'Low',
        timeline: '3-4 meses'
      })
    }

    // Manufatura
    const manufacturingTechs = stack.filter(t => 
      t.product.toLowerCase().includes('manufacturing') ||
      t.product.toLowerCase().includes('production')
    )
    if (manufacturingTechs.length > 0) {
      recommendations.push({
        product: 'TOTVS Manufatura',
        rationale: 'Solução específica para indústria com MES integrado',
        confidence: 90,
        estimatedROI: 200000,
        migrationComplexity: 'High',
        timeline: '15-20 meses'
      })
    }

    return recommendations
  }

  private generateOlvRecommendations(stack: TechStackItem[], scores: MaturityScores): VendorFitRecommendation[] {
    const recommendations: VendorFitRecommendation[] = []

    // Diagnóstico 360
    if (scores.overall < 60) {
      recommendations.push({
        product: 'Diagnóstico 360°',
        rationale: 'Avaliação completa da maturidade digital e roadmap de evolução',
        confidence: 95,
        estimatedROI: 50000,
        migrationComplexity: 'Low',
        timeline: '2-3 meses'
      })
    }

    // Smart Import
    const hasLegacySystems = stack.some(t => 
      t.vendor === 'SAP' || t.vendor === 'Oracle' || t.product.includes('Legacy')
    )
    if (hasLegacySystems) {
      recommendations.push({
        product: 'Smart Import',
        rationale: 'Migração inteligente de dados de sistemas legados',
        confidence: 85,
        estimatedROI: 100000,
        migrationComplexity: 'Medium',
        timeline: '6-8 meses'
      })
    }

    // Roadmap de Implantação
    if (scores.systems < 50) {
      recommendations.push({
        product: 'Roadmap de Implantação',
        rationale: 'Planejamento estratégico de implementação de sistemas',
        confidence: 90,
        estimatedROI: 75000,
        migrationComplexity: 'Low',
        timeline: '4-6 meses'
      })
    }

    return recommendations
  }

  private generateCustomRecommendations(stack: TechStackItem[], scores: MaturityScores): VendorFitRecommendation[] {
    const recommendations: VendorFitRecommendation[] = []

    // Recomendações genéricas baseadas em gaps
    if (scores.infrastructure < 50) {
      recommendations.push({
        product: 'Modernização de Infraestrutura',
        rationale: 'Migração para cloud e modernização tecnológica',
        confidence: 80,
        estimatedROI: 120000,
        migrationComplexity: 'High',
        timeline: '12-18 meses'
      })
    }

    if (scores.automation < 40) {
      recommendations.push({
        product: 'Automação de Processos',
        rationale: 'Implementação de RPA e workflow automation',
        confidence: 75,
        estimatedROI: 80000,
        migrationComplexity: 'Medium',
        timeline: '6-9 meses'
      })
    }

    return recommendations
  }

  private generateMigrationPath(recommendations: VendorFitRecommendation[]): string[] {
    // Ordenar por complexidade e ROI
    const sorted = recommendations.sort((a, b) => {
      const complexityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 }
      return complexityOrder[a.migrationComplexity] - complexityOrder[b.migrationComplexity]
    })

    return sorted.map(rec => `${rec.product} (${rec.timeline})`)
  }

  private generateCompetitiveAdvantages(scores: MaturityScores): string[] {
    const advantages = []

    if (scores.overall > 80) {
      advantages.push('Empresa com alta maturidade digital - oportunidade de otimização')
    } else if (scores.overall > 60) {
      advantages.push('Empresa em crescimento digital - oportunidade de expansão')
    } else {
      advantages.push('Empresa com potencial de transformação digital')
    }

    if (scores.automation < 50) {
      advantages.push('Alto potencial de automação de processos')
    }

    if (scores.security < 60) {
      advantages.push('Oportunidade de melhoria em segurança digital')
    }

    return advantages
  }
}

export const maturityCalculator = new MaturityCalculator()
export const vendorFitCalculator = new VendorFitCalculator()
