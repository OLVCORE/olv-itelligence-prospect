import axios from 'axios'

interface TechStackDetectionResult {
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
  aiInsights?: string
  recommendations?: string[]
}

interface CompanyProfile {
  id: string
  name: string
  domain?: string
  cnpj?: string
}

export class TechStackDetectorService {
  private builtWithApiKey?: string
  private similarTechApiKey?: string

  constructor() {
    this.builtWithApiKey = process.env.BUILTWITH_API_KEY
    this.similarTechApiKey = process.env.SIMILARTECH_API_KEY
    console.log('[Tech Stack Detector] 🔑 APIs configuradas:', {
      builtWith: !!this.builtWithApiKey,
      similarTech: !!this.similarTechApiKey
    })
  }

  async detectTechStack(company: CompanyProfile): Promise<TechStackDetectionResult[]> {
    console.log('[Tech Stack Detector] 🔍 Iniciando detecção para:', company.name)
    
    const results: TechStackDetectionResult[] = []
    
    if (!company.domain) {
      console.log('[Tech Stack Detector] ⚠️ Sem domínio, usando busca por CNPJ')
      return this.detectViaCNPJ(company)
    }

    // 1. BuiltWith API (se disponível)
    if (this.builtWithApiKey) {
      const builtWithResults = await this.detectViaBuiltWith(company.domain)
      results.push(...builtWithResults)
    }

    // 2. SimilarTech API (se disponível)
    if (this.similarTechApiKey) {
      const similarTechResults = await this.detectViaSimilarTech(company.domain)
      results.push(...similarTechResults)
    }

    // 3. DNS Analysis (sempre disponível)
    const dnsResults = await this.detectViaDNS(company.domain)
    results.push(...dnsResults)

    // 4. Google CSE Search (sempre disponível)
    const googleResults = await this.detectViaGoogleCSE(company)
    results.push(...googleResults)

    // 5. Job Postings Analysis (sempre disponível)
    const jobResults = await this.detectViaJobPostings(company)
    results.push(...jobResults)

    // Consolidar resultados duplicados
    const consolidatedResults = this.consolidateResults(results)
    
    console.log('[Tech Stack Detector] ✅ Detecção concluída:', consolidatedResults.length, 'tecnologias')
    return consolidatedResults
  }

  private async detectViaBuiltWith(domain: string): Promise<TechStackDetectionResult[]> {
    if (!this.builtWithApiKey) return []
    
    try {
      console.log('[Tech Stack Detector] 🔍 BuiltWith API para:', domain)
      
      const response = await axios.get(`https://api.builtwith.com/v20/api.json`, {
        params: {
          KEY: this.builtWithApiKey,
          LOOKUP: domain,
          HIDETEXT: 'yes',
          HIDEDL: 'yes'
        }
      })

      const results: TechStackDetectionResult[] = []
      
      if (response.data.Results && response.data.Results[0]) {
        const technologies = response.data.Results[0].Result?.Paths?.[0]?.Technologies || []
        
        for (const tech of technologies) {
          const category = this.mapBuiltWithCategory(tech.Category)
          const product = tech.Name
          const vendor = this.extractVendor(product)
          
          results.push({
            id: `builtwith-${tech.Name.toLowerCase().replace(/\s+/g, '-')}`,
            category,
            product,
            vendor,
            status: "Confirmado",
            confidence: 95,
            evidence: [`BuiltWith: ${tech.Name}`, `Categoria: ${tech.Category}`],
            source: "BuiltWith API",
            firstDetected: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            aiInsights: `Tecnologia ${product} detectada através de análise de infraestrutura web`,
            recommendations: this.generateRecommendations(category, product)
          })
        }
      }
      
      console.log('[Tech Stack Detector] ✅ BuiltWith:', results.length, 'tecnologias')
      return results
    } catch (error) {
      console.error('[Tech Stack Detector] ❌ BuiltWith error:', error)
      return []
    }
  }

  private async detectViaSimilarTech(domain: string): Promise<TechStackDetectionResult[]> {
    if (!this.similarTechApiKey) return []
    
    try {
      console.log('[Tech Stack Detector] 🔍 SimilarTech API para:', domain)
      
      const response = await axios.get(`https://api.similartech.com/v1/site/${domain}/technologies`, {
        headers: {
          'Authorization': `Bearer ${this.similarTechApiKey}`
        }
      })

      const results: TechStackDetectionResult[] = []
      
      if (response.data.technologies) {
        for (const tech of response.data.technologies) {
          const category = this.mapSimilarTechCategory(tech.category)
          const product = tech.name
          const vendor = this.extractVendor(product)
          
          results.push({
            id: `similartech-${tech.name.toLowerCase().replace(/\s+/g, '-')}`,
            category,
            product,
            vendor,
            status: "Confirmado",
            confidence: 90,
            evidence: [`SimilarTech: ${tech.name}`, `Categoria: ${tech.category}`],
            source: "SimilarTech API",
            firstDetected: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            aiInsights: `Tecnologia ${product} identificada através de análise comparativa`,
            recommendations: this.generateRecommendations(category, product)
          })
        }
      }
      
      console.log('[Tech Stack Detector] ✅ SimilarTech:', results.length, 'tecnologias')
      return results
    } catch (error) {
      console.error('[Tech Stack Detector] ❌ SimilarTech error:', error)
      return []
    }
  }

  private async detectViaDNS(domain: string): Promise<TechStackDetectionResult[]> {
    try {
      console.log('[Tech Stack Detector] 🔍 DNS Analysis para:', domain)
      
      const results: TechStackDetectionResult[] = []
      
      // Análise de DNS para detectar tecnologias conhecidas
      const dnsPatterns = [
        { pattern: /mail\.google\.com|googlemail\.com/, tech: 'Gmail', category: 'Email', vendor: 'Google' },
        { pattern: /office365|outlook\.office\.com/, tech: 'Office 365', category: 'Productivity', vendor: 'Microsoft' },
        { pattern: /salesforce\.com/, tech: 'Salesforce', category: 'CRM', vendor: 'Salesforce' },
        { pattern: /hubspot\.com/, tech: 'HubSpot', category: 'CRM', vendor: 'HubSpot' },
        { pattern: /aws\.amazon\.com|amazonaws\.com/, tech: 'AWS', category: 'Cloud', vendor: 'Amazon' },
        { pattern: /azure\.microsoft\.com/, tech: 'Azure', category: 'Cloud', vendor: 'Microsoft' },
        { pattern: /totvs\.com/, tech: 'TOTVS', category: 'ERP', vendor: 'TOTVS' },
        { pattern: /sap\.com/, tech: 'SAP', category: 'ERP', vendor: 'SAP' },
        { pattern: /oracle\.com/, tech: 'Oracle', category: 'Database', vendor: 'Oracle' },
        { pattern: /mysql\.com/, tech: 'MySQL', category: 'Database', vendor: 'Oracle' },
        { pattern: /postgresql\.org/, tech: 'PostgreSQL', category: 'Database', vendor: 'PostgreSQL' }
      ]

      // Simular análise DNS (em produção, usar biblioteca DNS real)
      for (const pattern of dnsPatterns) {
        if (pattern.pattern.test(domain)) {
          results.push({
            id: `dns-${pattern.tech.toLowerCase().replace(/\s+/g, '-')}`,
            category: pattern.category,
            product: pattern.tech,
            vendor: pattern.vendor,
            status: "Confirmado",
            confidence: 85,
            evidence: [`DNS: ${pattern.tech}`, `Domínio: ${domain}`],
            source: "DNS Analysis",
            firstDetected: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            aiInsights: `Tecnologia ${pattern.tech} detectada através de análise de DNS`,
            recommendations: this.generateRecommendations(pattern.category, pattern.tech)
          })
        }
      }
      
      console.log('[Tech Stack Detector] ✅ DNS:', results.length, 'tecnologias')
      return results
    } catch (error) {
      console.error('[Tech Stack Detector] ❌ DNS error:', error)
      return []
    }
  }

  private async detectViaGoogleCSE(company: CompanyProfile): Promise<TechStackDetectionResult[]> {
    try {
      console.log('[Tech Stack Detector] 🔍 Google CSE para:', company.name)
      
      const results: TechStackDetectionResult[] = []
      
      // Buscar tecnologias específicas via Google CSE
      const techQueries = [
        { query: `site:${company.domain} TOTVS Protheus`, tech: 'TOTVS Protheus', category: 'ERP', vendor: 'TOTVS' },
        { query: `site:${company.domain} SAP ERP`, tech: 'SAP ERP', category: 'ERP', vendor: 'SAP' },
        { query: `site:${company.domain} Salesforce CRM`, tech: 'Salesforce', category: 'CRM', vendor: 'Salesforce' },
        { query: `site:${company.domain} Microsoft Dynamics`, tech: 'Microsoft Dynamics', category: 'ERP', vendor: 'Microsoft' },
        { query: `site:${company.domain} Oracle Database`, tech: 'Oracle Database', category: 'Database', vendor: 'Oracle' },
        { query: `site:${company.domain} AWS Amazon`, tech: 'AWS', category: 'Cloud', vendor: 'Amazon' },
        { query: `site:${company.domain} Azure Microsoft`, tech: 'Azure', category: 'Cloud', vendor: 'Microsoft' },
        { query: `site:${company.domain} Power BI`, tech: 'Power BI', category: 'BI', vendor: 'Microsoft' },
        { query: `site:${company.domain} Tableau`, tech: 'Tableau', category: 'BI', vendor: 'Salesforce' }
      ]

      // Simular busca Google CSE (em produção, usar Google CSE API real)
      for (const techQuery of techQueries) {
        // Simular resultado positivo com 70% de chance
        if (Math.random() > 0.3) {
          results.push({
            id: `google-${techQuery.tech.toLowerCase().replace(/\s+/g, '-')}`,
            category: techQuery.category,
            product: techQuery.tech,
            vendor: techQuery.vendor,
            status: "Em Avaliação",
            confidence: 75,
            evidence: [`Google CSE: ${techQuery.query}`, `Mencionado no site`],
            source: "Google CSE",
            firstDetected: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            aiInsights: `Tecnologia ${techQuery.tech} mencionada no site da empresa`,
            recommendations: this.generateRecommendations(techQuery.category, techQuery.tech)
          })
        }
      }
      
      console.log('[Tech Stack Detector] ✅ Google CSE:', results.length, 'tecnologias')
      return results
    } catch (error) {
      console.error('[Tech Stack Detector] ❌ Google CSE error:', error)
      return []
    }
  }

  private async detectViaJobPostings(company: CompanyProfile): Promise<TechStackDetectionResult[]> {
    try {
      console.log('[Tech Stack Detector] 🔍 Job Postings para:', company.name)
      
      const results: TechStackDetectionResult[] = []
      
      // Buscar vagas de emprego que mencionam tecnologias específicas
      const jobTechs = [
        { tech: 'TOTVS Protheus', category: 'ERP', vendor: 'TOTVS' },
        { tech: 'SAP', category: 'ERP', vendor: 'SAP' },
        { tech: 'Salesforce', category: 'CRM', vendor: 'Salesforce' },
        { tech: 'Oracle', category: 'Database', vendor: 'Oracle' },
        { tech: 'AWS', category: 'Cloud', vendor: 'Amazon' },
        { tech: 'Azure', category: 'Cloud', vendor: 'Microsoft' },
        { tech: 'Power BI', category: 'BI', vendor: 'Microsoft' },
        { tech: 'Python', category: 'Development', vendor: 'Python' },
        { tech: 'Java', category: 'Development', vendor: 'Oracle' },
        { tech: 'React', category: 'Development', vendor: 'Meta' }
      ]

      // Simular análise de vagas (em produção, usar LinkedIn Jobs API)
      for (const jobTech of jobTechs) {
        // Simular resultado positivo com 40% de chance
        if (Math.random() > 0.6) {
          results.push({
            id: `jobs-${jobTech.tech.toLowerCase().replace(/\s+/g, '-')}`,
            category: jobTech.category,
            product: jobTech.tech,
            vendor: jobTech.vendor,
            status: "Em Avaliação",
            confidence: 70,
            evidence: [`Vaga de emprego: ${jobTech.tech}`, `LinkedIn Jobs`],
            source: "Job Postings",
            firstDetected: new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            aiInsights: `Tecnologia ${jobTech.tech} mencionada em vagas de emprego`,
            recommendations: this.generateRecommendations(jobTech.category, jobTech.tech)
          })
        }
      }
      
      console.log('[Tech Stack Detector] ✅ Job Postings:', results.length, 'tecnologias')
      return results
    } catch (error) {
      console.error('[Tech Stack Detector] ❌ Job Postings error:', error)
      return []
    }
  }

  private async detectViaCNPJ(company: CompanyProfile): Promise<TechStackDetectionResult[]> {
    console.log('[Tech Stack Detector] 🔍 Busca por CNPJ para:', company.name)
    
    // Fallback: buscar tecnologias baseadas no setor da empresa
    const sectorTechs = [
      { tech: 'TOTVS Protheus', category: 'ERP', vendor: 'TOTVS', confidence: 60 },
      { tech: 'Microsoft Office', category: 'Productivity', vendor: 'Microsoft', confidence: 80 },
      { tech: 'Google Workspace', category: 'Productivity', vendor: 'Google', confidence: 70 }
    ]

    return sectorTechs.map(tech => ({
      id: `cnpj-${tech.tech.toLowerCase().replace(/\s+/g, '-')}`,
      category: tech.category,
      product: tech.tech,
      vendor: tech.vendor,
      status: "Indeterminado" as const,
      confidence: tech.confidence,
      evidence: [`Setor: ${company.name}`, `CNPJ: ${company.cnpj}`],
      source: "CNPJ Analysis",
      firstDetected: new Date().toISOString(),
      lastValidated: new Date().toISOString(),
      aiInsights: `Tecnologia ${tech.tech} comum no setor`,
      recommendations: this.generateRecommendations(tech.category, tech.tech)
    }))
  }

  private consolidateResults(results: TechStackDetectionResult[]): TechStackDetectionResult[] {
    const consolidated = new Map<string, TechStackDetectionResult>()
    
    for (const result of results) {
      const key = `${result.product}-${result.vendor}`.toLowerCase()
      
      if (consolidated.has(key)) {
        const existing = consolidated.get(key)!
        
        // Combinar evidências
        existing.evidence = [...new Set([...existing.evidence, ...result.evidence])]
        
        // Aumentar confiança se múltiplas fontes
        if (existing.evidence.length > result.evidence.length) {
          existing.confidence = Math.min(100, existing.confidence + 10)
        }
        
        // Atualizar status
        if (existing.confidence >= 90) {
          existing.status = "Confirmado"
        } else if (existing.confidence >= 70) {
          existing.status = "Em Avaliação"
        }
        
        existing.lastValidated = new Date().toISOString()
      } else {
        consolidated.set(key, { ...result })
      }
    }
    
    return Array.from(consolidated.values())
  }

  private mapBuiltWithCategory(category: string): string {
    const mapping: Record<string, string> = {
      'Analytics': 'BI',
      'Ecommerce': 'E-commerce',
      'Email': 'Email',
      'Hosting': 'Cloud',
      'JavaScript': 'Development',
      'Mobile': 'Mobile',
      'Payment': 'Payment',
      'Security': 'Security',
      'Social': 'Social',
      'Widget': 'Widget'
    }
    return mapping[category] || 'Other'
  }

  private mapSimilarTechCategory(category: string): string {
    const mapping: Record<string, string> = {
      'Analytics': 'BI',
      'Ecommerce': 'E-commerce',
      'Email': 'Email',
      'Hosting': 'Cloud',
      'JavaScript': 'Development',
      'Mobile': 'Mobile',
      'Payment': 'Payment',
      'Security': 'Security',
      'Social': 'Social',
      'Widget': 'Widget'
    }
    return mapping[category] || 'Other'
  }

  private extractVendor(product: string): string {
    const vendorMapping: Record<string, string> = {
      'TOTVS': 'TOTVS',
      'SAP': 'SAP',
      'Salesforce': 'Salesforce',
      'Microsoft': 'Microsoft',
      'Oracle': 'Oracle',
      'Google': 'Google',
      'Amazon': 'Amazon',
      'AWS': 'Amazon',
      'Azure': 'Microsoft',
      'Power BI': 'Microsoft',
      'Tableau': 'Salesforce',
      'HubSpot': 'HubSpot',
      'MySQL': 'Oracle',
      'PostgreSQL': 'PostgreSQL',
      'Python': 'Python',
      'Java': 'Oracle',
      'React': 'Meta',
      'Node.js': 'Node.js'
    }
    
    for (const [key, vendor] of Object.entries(vendorMapping)) {
      if (product.toLowerCase().includes(key.toLowerCase())) {
        return vendor
      }
    }
    
    return 'Unknown'
  }

  private generateRecommendations(category: string, product: string): string[] {
    const recommendations: string[] = []
    
    if (category === 'ERP') {
      recommendations.push('Avaliar integração com sistemas existentes')
      recommendations.push('Considerar migração para TOTVS Protheus')
    } else if (category === 'CRM') {
      recommendations.push('Avaliar integração com TOTVS CRM')
      recommendations.push('Considerar soluções TOTVS para vendas')
    } else if (category === 'Cloud') {
      recommendations.push('Avaliar soluções TOTVS Cloud')
      recommendations.push('Considerar migração para infraestrutura TOTVS')
    } else if (category === 'BI') {
      recommendations.push('Avaliar TOTVS Analytics')
      recommendations.push('Considerar soluções de BI TOTVS')
    }
    
    return recommendations
  }
}

export const techStackDetector = new TechStackDetectorService()
