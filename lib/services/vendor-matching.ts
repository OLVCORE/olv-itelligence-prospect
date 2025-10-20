/**
 * VENDOR MATCHING ENGINE
 * Calcula fit automático TOTVS/OLV baseado em perfil da empresa
 * 
 * INPUTS:
 * - Company profile (setor, tamanho, tech stack)
 * - Decision makers (cargos, skills)
 * - Buying signals (vagas, expansão)
 * 
 * OUTPUTS:
 * - Fit score TOTVS (0-100)
 * - Produtos TOTVS recomendados
 * - Fit score OLV (0-100)
 * - Serviços OLV recomendados
 * - Competitor migration path
 * - Estimated deal size
 */

interface CompanyProfile {
  industry?: string
  size?: string
  employeeCount?: number
  specialties?: string[]
  currentTechStack?: any
  competitorStack?: any
  yearFounded?: number
  revenue?: number
}

interface VendorFit {
  vendor: 'TOTVS' | 'OLV'
  fitScore: number // 0-100
  confidence: number // 0-100
  recommendedProducts: string[]
  recommendedServices: string[]
  competitorMigration?: {
    from: string // "SAP ERP"
    to: string // "TOTVS Protheus"
    migrationPath: string[]
    estimatedTime: string
    complexity: 'low' | 'medium' | 'high'
  }
  estimatedDealSize: {
    min: number
    max: number
    currency: 'BRL'
    basis: string // "Company size + products"
  }
  decisionPath: {
    primaryDecisionMaker: string // "Diretor de TI"
    budgetApprover: string // "CFO"
    influencers: string[] // ["CTO", "Gerente de Produção"]
    estimatedCycle: string // "3-6 meses"
  }
}

export class VendorMatchingEngine {
  /**
   * Calcular fit TOTVS
   */
  calculateTotvsfit(company: CompanyProfile): VendorFit {
    let fitScore = 0
    const products: string[] = []

    // 1. Setor (peso 30%)
    const sectorFit = this.calculateSectorFit(company.industry)
    fitScore += sectorFit * 0.3

    // 2. Tamanho (peso 25%)
    const sizeFit = this.calculateSizeFit(company.employeeCount)
    fitScore += sizeFit * 0.25

    // 3. Tech Stack atual (peso 25%)
    const techFit = this.calculateTechStackFit(company.currentTechStack)
    fitScore += techFit * 0.25

    // 4. Especialidades (peso 20%)
    const specialtyFit = this.calculateSpecialtyFit(company.specialties)
    fitScore += specialtyFit * 0.2

    // Produtos recomendados baseado em setor
    if (company.industry?.includes('Manufatura') || company.specialties?.includes('Manufatura')) {
      products.push('TOTVS Protheus (Backoffice)')
      products.push('TOTVS MES (Manufacturing Execution)')
      products.push('TOTVS APS (Advanced Planning)')
    }

    if (company.industry?.includes('Distribuição') || company.specialties?.includes('Supply Chain')) {
      products.push('TOTVS WMS (Warehouse Management)')
      products.push('TOTVS TMS (Transportation)')
    }

    if (company.employeeCount && company.employeeCount > 100) {
      products.push('TOTVS Fluig (Workflow & BPM)')
      products.push('TOTVS RH (Recursos Humanos)')
    }

    // Competitor migration
    let migration = undefined
    if (company.competitorStack?.erp === 'SAP') {
      migration = {
        from: 'SAP ERP',
        to: 'TOTVS Protheus',
        migrationPath: ['Diagnóstico', 'Mapeamento', 'Migração', 'Go-Live'],
        estimatedTime: '6-9 meses',
        complexity: 'high' as const
      }
      fitScore += 15 // Boost para migração de SAP
    }

    // Deal size estimation
    const dealSize = this.estimateDealSize(company, products.length)

    return {
      vendor: 'TOTVS',
      fitScore: Math.min(fitScore, 100),
      confidence: fitScore > 60 ? 85 : 60,
      recommendedProducts: products,
      recommendedServices: [],
      competitorMigration: migration,
      estimatedDealSize: dealSize,
      decisionPath: this.mapDecisionPath(company)
    }
  }

  /**
   * Calcular fit OLV Consultoria
   */
  calculateOlvFit(company: CompanyProfile): VendorFit {
    let fitScore = 50 // Base score

    const services: string[] = []

    // OLV é complementar a TOTVS
    // Fit alto quando:
    // 1. Empresa já tem TOTVS (upsell consultoria)
    if (company.currentTechStack?.erp?.includes('TOTVS')) {
      fitScore += 30
      services.push('Otimização TOTVS')
      services.push('Treinamento Avançado')
    }

    // 2. Empresa está migrando (precisa consultoria)
    if (company.competitorStack?.erp === 'SAP' || company.competitorStack?.erp === 'Oracle') {
      fitScore += 20
      services.push('Diagnóstico 360° + Roadmap')
      services.push('Consultoria de Migração Express')
    }

    // 3. Empresa está crescendo (precisa processos)
    if (company.employeeCount && company.employeeCount > 50 && company.yearFounded && company.yearFounded > 2015) {
      fitScore += 15
      services.push('Estruturação de Processos')
      services.push('Governança de TI')
    }

    // 4. Tech stack fragmentado (precisa integração)
    if (company.currentTechStack && Object.keys(company.currentTechStack).length > 3) {
      fitScore += 15
      services.push('Integração de Sistemas')
      services.push('Arquitetura de Soluções')
    }

    // Default services
    if (services.length === 0) {
      services.push('Diagnóstico 360°')
      services.push('Consultoria Estratégica')
    }

    const dealSize = this.estimateOlvDealSize(company, services.length)

    return {
      vendor: 'OLV',
      fitScore: Math.min(fitScore, 100),
      confidence: 75,
      recommendedProducts: [],
      recommendedServices: services,
      estimatedDealSize: dealSize,
      decisionPath: this.mapDecisionPath(company)
    }
  }

  /**
   * Calcular fit por setor
   */
  private calculateSectorFit(industry?: string): number {
    if (!industry) return 40

    const highFitSectors = ['Manufatura', 'Indústria', 'Distribuição', 'Varejo', 'Serviços']
    const mediumFitSectors = ['Tecnologia', 'Saúde', 'Educação']

    const industryLower = industry.toLowerCase()

    if (highFitSectors.some(s => industryLower.includes(s.toLowerCase()))) {
      return 90
    }

    if (mediumFitSectors.some(s => industryLower.includes(s.toLowerCase()))) {
      return 70
    }

    return 50
  }

  /**
   * Calcular fit por tamanho
   */
  private calculateSizeFit(employeeCount?: number): number {
    if (!employeeCount) return 50

    // TOTVS ideal: 50-1000 funcionários
    if (employeeCount >= 50 && employeeCount <= 1000) return 100
    if (employeeCount >= 20 && employeeCount < 50) return 80
    if (employeeCount > 1000) return 70
    if (employeeCount < 20) return 40

    return 50
  }

  /**
   * Calcular fit por tech stack atual
   */
  private calculateTechStackFit(techStack?: any): number {
    if (!techStack) return 60

    let fit = 60

    // Usando competitor? Oportunidade de migração!
    if (techStack.erp === 'SAP' || techStack.erp === 'Oracle') {
      fit = 85
    }

    // Usando sistema legado/próprio? ALTA oportunidade!
    if (techStack.erp?.includes('legado') || techStack.erp?.includes('próprio')) {
      fit = 95
    }

    // Já usa TOTVS? Upsell!
    if (techStack.erp?.includes('TOTVS')) {
      fit = 75 // Menor fit para venda de ERP, maior para consultoria
    }

    return fit
  }

  /**
   * Calcular fit por especialidades
   */
  private calculateSpecialtyFit(specialties?: string[]): number {
    if (!specialties || specialties.length === 0) return 50

    const totvsSpecialties = ['ERP', 'Manufatura', 'Supply Chain', 'WMS', 'Fiscal']
    const matches = specialties.filter(s => 
      totvsSpecialties.some(ts => s.toLowerCase().includes(ts.toLowerCase()))
    )

    return 50 + (matches.length * 10)
  }

  /**
   * Estimar tamanho do deal TOTVS
   */
  private estimateDealSize(company: CompanyProfile, productCount: number): VendorFit['estimatedDealSize'] {
    let baseValue = 50000 // R$ 50k base

    // Multiplicadores por tamanho
    if (company.employeeCount) {
      if (company.employeeCount > 500) baseValue *= 5
      else if (company.employeeCount > 200) baseValue *= 3
      else if (company.employeeCount > 100) baseValue *= 2
    }

    // Multiplicador por número de produtos
    const productMultiplier = 1 + (productCount * 0.3)

    return {
      min: baseValue * productMultiplier,
      max: baseValue * productMultiplier * 1.8,
      currency: 'BRL',
      basis: `${company.employeeCount || 'N/A'} employees + ${productCount} products`
    }
  }

  /**
   * Estimar tamanho do deal OLV
   */
  private estimateOlvDealSize(company: CompanyProfile, serviceCount: number): VendorFit['estimatedDealSize'] {
    let baseValue = 15000 // R$ 15k base consultoria

    if (company.employeeCount) {
      if (company.employeeCount > 500) baseValue *= 4
      else if (company.employeeCount > 200) baseValue *= 2.5
      else if (company.employeeCount > 100) baseValue *= 1.5
    }

    return {
      min: baseValue * serviceCount,
      max: baseValue * serviceCount * 2,
      currency: 'BRL',
      basis: `Consultoria + ${serviceCount} services`
    }
  }

  /**
   * Mapear decision path (quem aprova)
   */
  private mapDecisionPath(company: CompanyProfile): VendorFit['decisionPath'] {
    const employeeCount = company.employeeCount || 0

    if (employeeCount > 500) {
      // Grande empresa: processo mais formal
      return {
        primaryDecisionMaker: 'Diretor de TI / CTO',
        budgetApprover: 'CFO / CEO',
        influencers: ['Gerente de TI', 'Diretor de Operações', 'Controller'],
        estimatedCycle: '6-12 meses'
      }
    } else if (employeeCount > 100) {
      // Média empresa
      return {
        primaryDecisionMaker: 'Diretor de TI',
        budgetApprover: 'CFO',
        influencers: ['Gerente de TI', 'Contador'],
        estimatedCycle: '3-6 meses'
      }
    } else {
      // Pequena empresa: decisão mais rápida
      return {
        primaryDecisionMaker: 'Sócio / CEO',
        budgetApprover: 'Sócio / CEO',
        influencers: ['Contador', 'Gerente Geral'],
        estimatedCycle: '1-3 meses'
      }
    }
  }
}

export const vendorMatching = new VendorMatchingEngine()

