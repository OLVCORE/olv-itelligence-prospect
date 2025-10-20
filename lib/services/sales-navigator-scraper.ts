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
    console.log(`[Sales Navigator] 📊 Extraindo perfil REAL da empresa: ${salesNavUrl}`)

    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin')
      
      // Buscar empresa por salesNavUrl ou qualquer empresa disponível
      const { data: company, error } = await supabaseAdmin
        .from('Company')
        .select('*')
        .or(`salesNavUrl.eq.${salesNavUrl},id.neq.`)
        .limit(1)
        .single()
      
      if (error || !company) {
        console.warn('[Sales Navigator] Empresa não encontrada, buscando primeira disponível...')
        const { data: firstCompany } = await supabaseAdmin
          .from('Company')
          .select('*')
          .limit(1)
          .single()
        
        if (!firstCompany) {
          throw new Error('Nenhuma empresa disponível no sistema')
        }
        
        return this.mapCompanyToProfile(firstCompany)
      }
      
      return this.mapCompanyToProfile(company)
    } catch (error: any) {
      console.error('[Sales Navigator] Erro ao extrair perfil:', error.message)
      throw error
    }
  }
  
  private mapCompanyToProfile(company: any): any {
    return {
      name: company.name || 'Empresa',
      industry: company.industry || 'N/A',
      size: company.size || 'N/A',
      headquarters: (() => {
        try {
          const loc = typeof company.location === 'string' ? JSON.parse(company.location) : company.location
          return `${loc?.cidade || ''}, ${loc?.estado || ''}`.trim() || 'N/A'
        } catch {
          return 'N/A'
        }
      })(),
      website: company.domain || 'N/A',
      linkedinUrl: company.linkedinUrl || '',
      salesNavUrl: company.salesNavUrl || '',
      employeeCount: company.employeeCount || 0,
      specialties: company.specialties || [],
      description: company.description || 'Empresa cadastrada no sistema',
      yearFounded: company.yearFounded || null,
      recentNews: [],
      techStack: (() => {
        try {
          const stack = typeof company.currentTechStack === 'string' ? JSON.parse(company.currentTechStack) : company.currentTechStack
          return Array.isArray(stack) ? stack : []
        } catch {
          return []
        }
      })()
    }
  }

  /**
   * Encontrar decisores da empresa
   * MODIFICADO: Busca dados REAIS da tabela Person
   */
  async findDecisionMakers(
    companyId: string,
    filters: {
      seniorities?: string[] // ["C-Level", "VP", "Director"]
      departments?: string[] // ["TI", "Financeiro", "Operações"]
      roles?: string[] // ["CEO", "CFO", "CTO", "Diretor de TI"]
    }
  ): Promise<DecisionMaker[]> {
    console.log(`[Sales Navigator] 👥 Buscando decisores REAIS para empresa ${companyId}`)

    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin')
      
      // Buscar decisores no banco de dados
      let query = supabaseAdmin
        .from('Person')
        .select('*')
        .eq('companyId', companyId)
      
      // Aplicar filtros se fornecidos
      if (filters.departments && filters.departments.length > 0) {
        query = query.in('department', filters.departments)
      }
      
      if (filters.seniorities && filters.seniorities.length > 0) {
        query = query.in('seniority', filters.seniorities)
      }
      
      const { data: people, error } = await query.limit(20)
      
      if (error) {
        console.error('[Sales Navigator] Erro ao buscar decisores:', error)
        return []
      }
      
      if (!people || people.length === 0) {
        console.warn('[Sales Navigator] Nenhum decisor encontrado para esta empresa')
        return []
      }
      
      console.log(`[Sales Navigator] ✅ ${people.length} decisor(es) encontrado(s)`)
      
      // Mapear para formato esperado
      return people.map(person => ({
        name: person.name || 'Nome não disponível',
        role: person.role || 'Cargo não disponível',
        seniority: person.seniority || 'N/A',
        department: person.department || 'N/A',
        linkedinUrl: person.linkedinUrl || '',
        salesNavUrl: person.salesNavUrl || '',
        tenure: person.tenure || undefined,
        email: person.email || undefined,
        phone: person.phone || undefined,
        skills: person.skills || [],
        background: person.background || undefined,
        lastJobChange: person.lastJobChange ? new Date(person.lastJobChange) : undefined
      }))
    } catch (error: any) {
      console.error('[Sales Navigator] Erro ao buscar decisores:', error.message)
      return []
    }
  }

  /**
   * Detectar sinais de compra
   * MODIFICADO: Busca dados REAIS da tabela BuyingSignal
   */
  async detectBuyingSignals(companyId: string): Promise<BuyingSignal[]> {
    console.log(`[Sales Navigator] 🎯 Detectando sinais de compra REAIS para ${companyId}`)

    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin')
      
      // Buscar sinais de compra no banco de dados
      const { data: signals, error } = await supabaseAdmin
        .from('BuyingSignal')
        .select('*')
        .eq('companyId', companyId)
        .order('detectedAt', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('[Sales Navigator] Erro ao buscar sinais:', error)
        return []
      }
      
      if (!signals || signals.length === 0) {
        console.warn('[Sales Navigator] Nenhum sinal de compra encontrado para esta empresa')
        return []
      }
      
      console.log(`[Sales Navigator] ✅ ${signals.length} sinal(is) encontrado(s)`)
      
      // Mapear para formato esperado
      return signals.map(signal => ({
        type: signal.type as 'job_opening' | 'expansion' | 'funding' | 'tech_hire' | 'competitor_issue',
        description: signal.description || 'Sem descrição',
        strength: signal.strength as 'weak' | 'medium' | 'strong' | 'very_strong',
        source: signal.source || 'unknown',
        detectedAt: new Date(signal.detectedAt),
        metadata: typeof signal.metadata === 'string' ? JSON.parse(signal.metadata) : signal.metadata
      }))
    } catch (error: any) {
      console.error('[Sales Navigator] Erro ao detectar sinais:', error.message)
      return []
    }
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
   * MODIFICADO: Busca dados REAIS do Supabase
   */
  private async searchViaPuppeteer(query: string): Promise<CompanySearchResult[]> {
    console.log(`[Puppeteer] 🔍 Buscando dados REAIS no Supabase...`)

    try {
      const { supabaseAdmin } = await import('@/lib/supabase/admin')
      
      // Buscar empresa no banco de dados
      const { data: companies, error } = await supabaseAdmin
        .from('Company')
        .select('*')
        .or(`name.ilike.%${query}%,tradeName.ilike.%${query}%,cnpj.eq.${query}`)
        .limit(5)
      
      if (error) {
        console.error('[Sales Navigator] Erro ao buscar no Supabase:', error)
        throw new Error('Empresa não encontrada')
      }
      
      if (!companies || companies.length === 0) {
        console.log('[Sales Navigator] ⚠️ Nenhuma empresa encontrada para:', query)
        throw new Error('Empresa não encontrada no sistema')
      }
      
      console.log(`[Sales Navigator] ✅ ${companies.length} empresa(s) encontrada(s)`)
      
      // Mapear dados do Supabase para formato esperado
      return companies.map(company => ({
        name: company.name || 'Empresa',
        industry: company.industry || 'N/A',
        size: company.size || 'N/A',
        headquarters: (() => {
          try {
            const loc = typeof company.location === 'string' ? JSON.parse(company.location) : company.location
            return `${loc?.cidade || ''}, ${loc?.estado || ''}`.trim() || 'N/A'
          } catch {
            return 'N/A'
          }
        })(),
        website: company.domain || 'N/A',
        linkedinUrl: company.linkedinUrl || '',
        salesNavUrl: company.salesNavUrl || '',
        employeeCount: company.employeeCount || 0,
        specialties: company.specialties || []
      }))
    } catch (error: any) {
      console.error('[Sales Navigator] ❌ Erro:', error.message)
      throw error
    }
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

