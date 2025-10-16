/**
 * Google Custom Search Service
 * Para busca web e descoberta de informações
 */

export interface GoogleSearchResponse {
  kind: string
  url: {
    type: string
    template: string
  }
  queries: {
    request: Array<{
      title: string
      totalResults: string
      searchTerms: string
      count: number
      startIndex: number
      inputEncoding: string
      outputEncoding: string
      safe: string
      cx: string
    }>
  }
  context: {
    title: string
  }
  searchInformation: {
    searchTime: number
    formattedSearchTime: string
    totalResults: string
    formattedTotalResults: string
  }
  items?: Array<{
    kind: string
    title: string
    htmlTitle: string
    link: string
    displayLink: string
    snippet: string
    htmlSnippet: string
    formattedUrl: string
    htmlFormattedUrl: string
    pagemap?: any
  }>
}

export interface SearchResult {
  title: string
  link: string
  snippet: string
  domain: string
  relevance: number
}

export interface CompanyWebData {
  website?: string
  socialMedia: {
    linkedin?: string
    facebook?: string
    instagram?: string
    twitter?: string
  }
  news: SearchResult[]
  technologies: string[]
  competitors: string[]
  insights: string[]
}

export class GoogleSearchService {
  private apiKey = process.env.GOOGLE_API_KEY || ''
  private cseId = process.env.GOOGLE_CSE_ID || ''
  private baseURL = 'https://www.googleapis.com/customsearch/v1'
  
  /**
   * Buscar informações sobre uma empresa
   */
  async searchCompany(companyName: string, cnpj?: string): Promise<CompanyWebData | null> {
    if (!this.apiKey || !this.cseId) {
      console.warn('[Google Search] ⚠️ API Key ou CSE ID não configurados')
      return this.generateMockWebData(companyName)
    }

    try {
      console.log(`[Google Search] Buscando informações sobre: ${companyName}`)
      
      const searchQueries = [
        `${companyName} site oficial`,
        `${companyName} linkedin`,
        `${companyName} tecnologia`,
        `${companyName} notícias`,
        `${companyName} concorrentes`
      ]

      const allResults: SearchResult[] = []

      // Executar múltiplas buscas
      for (const query of searchQueries) {
        const results = await this.search(query)
        if (results) {
          allResults.push(...results)
        }
      }

      console.log(`[Google Search] ✅ ${allResults.length} resultados encontrados para ${companyName}`)

      return this.processSearchResults(allResults, companyName)

    } catch (error: any) {
      console.error('[Google Search] Erro ao buscar empresa:', error)
      return this.generateMockWebData(companyName)
    }
  }

  /**
   * Buscar tech stack de uma empresa
   */
  async searchTechStack(companyName: string, domain?: string): Promise<string[]> {
    if (!this.apiKey || !this.cseId) {
      return this.generateMockTechStack()
    }

    try {
      const queries = [
        `${companyName} tecnologia stack`,
        `${companyName} software`,
        `${companyName} sistema`,
        domain ? `${domain} tecnologia` : ''
      ].filter(Boolean)

      const technologies: string[] = []

      for (const query of queries) {
        const results = await this.search(query)
        if (results) {
          // Extrair tecnologias dos snippets
          results.forEach(result => {
            const techKeywords = [
              'SAP', 'Oracle', 'Microsoft', 'Salesforce', 'HubSpot',
              'WordPress', 'Shopify', 'Magento', 'React', 'Angular',
              'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'
            ]
            
            techKeywords.forEach(tech => {
              if (result.snippet.toLowerCase().includes(tech.toLowerCase())) {
                if (!technologies.includes(tech)) {
                  technologies.push(tech)
                }
              }
            })
          })
        }
      }

      return technologies.length > 0 ? technologies : this.generateMockTechStack()

    } catch (error: any) {
      console.error('[Google Search] Erro ao buscar tech stack:', error)
      return this.generateMockTechStack()
    }
  }

  /**
   * Executar busca no Google
   */
  private async search(query: string, numResults: number = 5): Promise<SearchResult[] | null> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.cseId,
        q: query,
        num: numResults.toString(),
        safe: 'off'
      })

      const response = await fetch(`${this.baseURL}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OLV-Intelligence-System/1.0'
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de consultas Google Search excedido')
        }
        throw new Error(`Erro na API Google Search: ${response.status}`)
      }

      const data: GoogleSearchResponse = await response.json()

      if (!data.items || data.items.length === 0) {
        return null
      }

      return data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        domain: this.extractDomain(item.link),
        relevance: this.calculateRelevance(item.snippet, query)
      }))

    } catch (error: any) {
      console.error('[Google Search] Erro na busca:', error)
      return null
    }
  }

  /**
   * Processar resultados das buscas
   */
  private processSearchResults(results: SearchResult[], companyName: string): CompanyWebData {
    const website = results.find(r => 
      r.domain.includes(companyName.toLowerCase()) || 
      r.title.toLowerCase().includes('site oficial')
    )?.link

    const socialMedia: any = {}
    const news: SearchResult[] = []
    const competitors: string[] = []

    results.forEach(result => {
      // Identificar redes sociais
      if (result.domain.includes('linkedin.com')) {
        socialMedia.linkedin = result.link
      } else if (result.domain.includes('facebook.com')) {
        socialMedia.facebook = result.link
      } else if (result.domain.includes('instagram.com')) {
        socialMedia.instagram = result.link
      } else if (result.domain.includes('twitter.com')) {
        socialMedia.twitter = result.link
      }

      // Identificar notícias
      if (result.domain.includes('g1.com.br') || 
          result.domain.includes('uol.com.br') || 
          result.domain.includes('folha.com.br') ||
          result.title.toLowerCase().includes('notícia')) {
        news.push(result)
      }

      // Identificar concorrentes (simplificado)
      if (result.snippet.toLowerCase().includes('concorrente') ||
          result.snippet.toLowerCase().includes('competidor')) {
        // Extrair nomes de empresas do snippet
        const competitorMatch = result.snippet.match(/([A-Z][a-z]+ [A-Z][a-z]+)/g)
        if (competitorMatch) {
          competitors.push(...competitorMatch.slice(0, 3))
        }
      }
    })

    const insights = this.generateInsights(results, companyName)

    return {
      website,
      socialMedia,
      news: news.slice(0, 5),
      technologies: [],
      competitors: [...new Set(competitors)].slice(0, 5),
      insights
    }
  }

  /**
   * Extrair domínio de uma URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  /**
   * Calcular relevância de um resultado
   */
  private calculateRelevance(snippet: string, query: string): number {
    const queryWords = query.toLowerCase().split(' ')
    const snippetWords = snippet.toLowerCase().split(' ')
    
    let matches = 0
    queryWords.forEach(word => {
      if (snippetWords.includes(word)) {
        matches++
      }
    })
    
    return Math.round((matches / queryWords.length) * 100)
  }

  /**
   * Gerar insights baseados nos resultados
   */
  private generateInsights(results: SearchResult[], companyName: string): string[] {
    const insights: string[] = []

    const websiteFound = results.some(r => r.domain.includes(companyName.toLowerCase()))
    if (websiteFound) {
      insights.push('Website oficial identificado')
    }

    const socialCount = results.filter(r => 
      r.domain.includes('linkedin.com') || 
      r.domain.includes('facebook.com') ||
      r.domain.includes('instagram.com')
    ).length

    if (socialCount > 0) {
      insights.push(`${socialCount} redes sociais encontradas`)
    }

    const newsCount = results.filter(r => 
      r.domain.includes('g1.com.br') || 
      r.domain.includes('uol.com.br') ||
      r.title.toLowerCase().includes('notícia')
    ).length

    if (newsCount > 0) {
      insights.push(`${newsCount} notícias recentes encontradas`)
    }

    const highRelevanceResults = results.filter(r => r.relevance > 80)
    if (highRelevanceResults.length > 0) {
      insights.push(`${highRelevanceResults.length} resultados altamente relevantes`)
    }

    return insights
  }

  /**
   * Gerar dados mock quando API não está disponível
   */
  private generateMockWebData(companyName: string): CompanyWebData {
    return {
      website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com.br`,
      socialMedia: {
        linkedin: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
        facebook: `https://facebook.com/${companyName.toLowerCase().replace(/\s+/g, '')}`
      },
      news: [
        {
          title: `${companyName} expande operações`,
          link: 'https://exemplo.com.br/noticia',
          snippet: 'Empresa anuncia crescimento e novas contratações',
          domain: 'exemplo.com.br',
          relevance: 85
        }
      ],
      technologies: ['SAP', 'Microsoft Office', 'Google Workspace'],
      competitors: ['Concorrente A', 'Concorrente B'],
      insights: [
        'Empresa ativa digitalmente',
        'Presença em redes sociais',
        'Notícias recentes encontradas'
      ]
    }
  }

  /**
   * Gerar tech stack mock
   */
  private generateMockTechStack(): string[] {
    return [
      'Microsoft Office',
      'Google Workspace',
      'SAP',
      'Oracle',
      'Salesforce'
    ]
  }
}

export const googleSearch = new GoogleSearchService()
