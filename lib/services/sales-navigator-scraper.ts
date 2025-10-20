/**
 * SALES NAVIGATOR SCRAPER (B2B Focus)
 * 
 * ESTRATÉGIA:
 * - OPÇÃO A: Phantom Buster ($30-300/mês) - Recomendado para MVP
 * - OPÇÃO B: Puppeteer próprio ($100/mês Sales Nav)
 * - OPÇÃO C: Apify (pay-as-you-go)
 * 
 * COMPLIANCE:
 * - Apenas dados públicos profissionais
 * - Respeitar rate limits
 * - LGPD-safe (informações corporativas)
 */

interface CompanySearchResult {
  name: string
  industry: string
  size: string
  headquarters: string
  website: string
  linkedinUrl: string
  salesNavUrl: string
  employeeCount: number
  specialties: string[]
}

interface DecisionMaker {
  name: string
  role: string
  seniority: string // "C-Level", "VP", "Director", "Manager"
  department: string
  linkedinUrl: string
  salesNavUrl: string
  tenure?: string
  email?: string
  phone?: string
  skills?: string[]
  background?: string
  lastJobChange?: Date
}

interface BuyingSignal {
  type: 'job_opening' | 'expansion' | 'funding' | 'tech_hire' | 'competitor_issue'
  description: string
  strength: 'weak' | 'medium' | 'strong' | 'very_strong'
  source: string
  detectedAt: Date
  metadata?: any
}

export class SalesNavigatorScraper {
  private phantomBusterApiKey?: string
  private usePhantomBuster = true // Toggle para usar Phantom ou Puppeteer

  constructor(config?: { phantomBusterApiKey?: string }) {
    this.phantomBusterApiKey = config?.phantomBusterApiKey || process.env.PHANTOM_BUSTER_API_KEY
    
    console.log('[Sales Navigator] 🔑 Phantom Buster configurado:', !!this.phantomBusterApiKey)
  }

  /**
   * Buscar empresa no Sales Navigator
   */
  async searchCompany(query: string): Promise<CompanySearchResult[]> {
    console.log(`[Sales Navigator] 🔍 Buscando empresa: ${query}`)

    if (this.usePhantomBuster && this.phantomBusterApiKey) {
      return await this.searchViaPhantomBuster(query)
    } else {
      return await this.searchViaPuppeteer(query)
    }
  }

  /**
   * Extrair perfil completo da empresa
   */
  async extractCompanyProfile(salesNavUrl: string): Promise<CompanySearchResult & {
    description: string
    yearFounded?: number
    recentNews: string[]
    techStack: string[]
  }> {
    console.log(`[Sales Navigator] 📊 Extraindo perfil da empresa: ${salesNavUrl}`)

    // Por ora, retornar mock realista
    // TODO: Implementar scraping real via Phantom Buster ou Puppeteer
    return this.mockCompanyProfile()
  }

  /**
   * Encontrar decisores da empresa
   */
  async findDecisionMakers(
    companyId: string,
    filters: {
      seniorities?: string[] // ["C-Level", "VP", "Director"]
      departments?: string[] // ["TI", "Financeiro", "Operações"]
      roles?: string[] // ["CEO", "CFO", "CTO", "Diretor de TI"]
    }
  ): Promise<DecisionMaker[]> {
    console.log(`[Sales Navigator] 👥 Buscando decisores para empresa ${companyId}`)

    // Por ora, retornar mock realista
    // TODO: Implementar scraping real de People Search + filtros
    return this.mockDecisionMakers()
  }

  /**
   * Detectar sinais de compra
   */
  async detectBuyingSignals(companyId: string): Promise<BuyingSignal[]> {
    console.log(`[Sales Navigator] 🎯 Detectando sinais de compra para ${companyId}`)

    // Por ora, retornar mock realista
    // TODO: Implementar extração de:
    // - Job postings (vagas abertas)
    // - Recent hires (contratações recentes)
    // - Company news (expansão, funding)
    // - Tech changes (mudança de stack)
    return this.mockBuyingSignals()
  }

  /**
   * Busca via Phantom Buster API
   */
  private async searchViaPhantomBuster(query: string): Promise<CompanySearchResult[]> {
    console.log(`[Phantom Buster] 🤖 Buscando via API...`)

    if (!this.phantomBusterApiKey) {
      console.warn('[Phantom Buster] ⚠️ API key não configurada, usando mock')
      return this.mockCompanySearch()
    }

    try {
      // Phantom Buster API documentation: https://phantombuster.com/api-docs
      const response = await fetch('https://api.phantombuster.com/api/v2/agents/launch', {
        method: 'POST',
        headers: {
          'X-Phantombuster-Key': this.phantomBusterApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'YOUR_AGENT_ID', // TODO: Configurar agent do Sales Navigator
          argument: {
            searches: query,
            numberOfResultsPerSearch: 10
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Phantom Buster error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[Phantom Buster] ✅ Busca iniciada:', data)

      // TODO: Poll for results ou usar webhook
      return this.mockCompanySearch()

    } catch (error) {
      console.error('[Phantom Buster] ❌ Erro:', error)
      return this.mockCompanySearch()
    }
  }

  /**
   * Busca via Puppeteer (próprio)
   */
  private async searchViaPuppeteer(query: string): Promise<CompanySearchResult[]> {
    console.log(`[Puppeteer] 🎭 Buscando via scraping próprio...`)

    // TODO: Implementar Puppeteer scraper
    // Requer: Sales Navigator login, cookies persistence
    return this.mockCompanySearch()
  }

  /**
   * Mock realista de busca de empresa
   */
  private mockCompanySearch(): CompanySearchResult[] {
    return [
      {
        name: 'Tech Corp Indústria LTDA',
        industry: 'Manufatura',
        size: '201-500 employees',
        headquarters: 'São Paulo, Brasil',
        website: 'https://techcorp.com.br',
        linkedinUrl: 'https://linkedin.com/company/techcorp',
        salesNavUrl: 'https://linkedin.com/sales/company/123456',
        employeeCount: 350,
        specialties: ['ERP', 'Manufatura', 'Supply Chain']
      }
    ]
  }

  /**
   * Mock realista de perfil de empresa
   */
  private mockCompanyProfile(): any {
    return {
      name: 'Tech Corp Indústria LTDA',
      industry: 'Manufatura',
      size: '201-500 employees',
      headquarters: 'São Paulo, Brasil',
      website: 'https://techcorp.com.br',
      linkedinUrl: 'https://linkedin.com/company/techcorp',
      salesNavUrl: 'https://linkedin.com/sales/company/123456',
      employeeCount: 350,
      specialties: ['ERP', 'Manufatura', 'Supply Chain'],
      description: 'Indústria metalúrgica com foco em autopeças',
      yearFounded: 1998,
      recentNews: [
        'Expansão para região Sul (Mar/2025)',
        'Investimento de R$ 10M em nova planta (Jan/2025)'
      ],
      techStack: ['SAP ERP (legado)', 'Excel (planilhas)', 'Sistema próprio WMS']
    }
  }

  /**
   * Mock realista de decisores
   */
  private mockDecisionMakers(): DecisionMaker[] {
    return [
      {
        name: 'Carlos Eduardo Silva',
        role: 'Diretor de TI',
        seniority: 'Director',
        department: 'TI',
        linkedinUrl: 'https://linkedin.com/in/carloseduardosilva',
        salesNavUrl: 'https://linkedin.com/sales/people/123',
        tenure: '2 anos e 3 meses',
        skills: ['ERP', 'SAP', 'Transformação Digital'],
        background: 'MBA em TI, 15 anos em manufatura',
        lastJobChange: new Date('2022-09-01')
      },
      {
        name: 'Maria Fernanda Costa',
        role: 'CFO',
        seniority: 'C-Level',
        department: 'Financeiro',
        linkedinUrl: 'https://linkedin.com/in/mariafernandacosta',
        salesNavUrl: 'https://linkedin.com/sales/people/456',
        tenure: '5 anos e 1 mês',
        skills: ['Finanças', 'ERP', 'Controladoria'],
        background: 'CPA, ex-PwC',
        lastJobChange: new Date('2020-01-15')
      }
    ]
  }

  /**
   * Mock realista de sinais de compra
   */
  private mockBuyingSignals(): BuyingSignal[] {
    return [
      {
        type: 'job_opening',
        description: 'Vaga aberta: Analista de ERP Sênior',
        strength: 'very_strong',
        source: 'linkedin_jobs',
        detectedAt: new Date(),
        metadata: {
          jobTitle: 'Analista de ERP Sênior',
          department: 'TI',
          posted: '3 dias atrás'
        }
      },
      {
        type: 'tech_hire',
        description: 'Contratou Diretor de Transformação Digital',
        strength: 'strong',
        source: 'sales_nav',
        detectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        metadata: {
          hireName: 'João Pedro Alves',
          role: 'Diretor de Transformação Digital',
          startDate: '2025-10-01'
        }
      },
      {
        type: 'expansion',
        description: 'Anunciou expansão para região Sul',
        strength: 'strong',
        source: 'news',
        detectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        metadata: {
          newsUrl: 'https://news.com/techcorp-expansion',
          investment: 'R$ 10M'
        }
      }
    ]
  }
}

export const salesNavigatorScraper = new SalesNavigatorScraper()

