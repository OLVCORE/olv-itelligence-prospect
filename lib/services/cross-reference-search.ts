/**
 * Serviço de Busca Cruzada (Cross-Reference)
 * Sistema inteligente que:
 * 1. Encontra empresa em uma plataforma
 * 2. Usa dados encontrados para buscar em TODAS as outras
 * 3. Valida cross-reference entre plataformas
 * 4. Organiza resultados por categoria
 */

import {
  SOCIAL_PLATFORMS,
  MARKETPLACES,
  PORTAIS_ELETRONICOS,
  NEWS_SOURCES,
  LEGAL_SOURCES,
  REPUTATION_SOURCES,
  StructuredDigitalPresence,
  CrossReferenceResult
} from '@/lib/types/digital-presence-categories'

export class CrossReferenceSearchService {
  private apiKey: string
  private cseId: string

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || ''
    this.cseId = process.env.GOOGLE_CSE_ID || ''
  }

  /**
   * BUSCA CRUZADA COMPLETA
   * Pega dados da ReceitaWS e varre TODAS as plataformas
   */
  async searchAll(params: {
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    marca?: string
    website?: string
    socios?: string[]
  }): Promise<StructuredDigitalPresence> {
    console.log('[CrossReference] 🔍 INICIANDO BUSCA CRUZADA COMPLETA')
    console.log('[CrossReference] 📊 Parâmetros:', {
      cnpj: params.cnpj,
      razaoSocial: params.razaoSocial,
      temFantasia: !!params.nomeFantasia,
      temMarca: !!params.marca,
      temWebsite: !!params.website,
      numSocios: params.socios?.length || 0
    })

    // ESTRATÉGIA: Buscar em TODAS as categorias simultaneamente
    const [
      redesSociais,
      marketplaces,
      portaisEletronicos,
      noticiasRecentes,
      juridico,
      reputacao
    ] = await Promise.all([
      this.searchRedesSociais(params),
      this.searchMarketplaces(params),
      this.searchPortaisEletronicos(params),
      this.searchNoticiasRecentes(params),
      this.searchJuridico(params),
      this.searchReputacao(params)
    ])

    // CROSS-VALIDATE: Validar dados entre plataformas
    const crossReferences = this.performCrossValidation({
      redesSociais,
      marketplaces,
      portaisEletronicos,
      params
    })

    console.log('[CrossReference] ✅ Busca concluída')
    console.log('[CrossReference] 📊 Resultados:', {
      redesSociais: Object.keys(redesSociais).length,
      marketplaces: marketplaces.b2b.length + marketplaces.b2c.length,
      portais: Object.keys(portaisEletronicos).length,
      noticias: noticiasRecentes.length,
      juridico: juridico.jusbrasil ? 'Sim' : 'Não',
      crossRefs: crossReferences.length
    })

    return {
      redesSociais,
      marketplaces,
      portaisEletronicos,
      noticiasRecentes,
      juridico,
      reputacao,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalSources: this.countTotalSources({
          redesSociais,
          marketplaces,
          portaisEletronicos,
          noticiasRecentes,
          juridico,
          reputacao
        }),
        confidence: this.calculateOverallConfidence(crossReferences),
        crossReferences
      }
    }
  }

  /**
   * 1. REDES SOCIAIS
   * Busca em ordem de prioridade + cross-reference
   */
  private async searchRedesSociais(params: any): Promise<any> {
    console.log('[CrossReference] 📱 Buscando redes sociais...')
    
    const results: any = {}
    const termosPrincipais = [
      params.razaoSocial,
      params.nomeFantasia,
      params.marca
    ].filter(Boolean)

    // Buscar em cada plataforma
    for (const platform of SOCIAL_PLATFORMS) {
      try {
        const profile = await this.searchSinglePlatform(platform, termosPrincipais, params)
        if (profile) {
          results[platform.id] = profile
          
          // CROSS-REFERENCE: Se encontrou, usar dados para buscar em outras
          if (profile.website || profile.handle) {
            console.log(`[CrossReference] ✅ ${platform.name} encontrado, usando para cross-reference`)
            // TODO: Usar dados encontrados para refinar busca em outras plataformas
          }
        }
      } catch (error: any) {
        console.warn(`[CrossReference] ⚠️ Erro em ${platform.name}:`, error.message)
      }
    }

    return results
  }

  /**
   * 2. MARKETPLACES
   * Diferencia B2B (alta prioridade) de B2C (baixa prioridade)
   */
  private async searchMarketplaces(params: any): Promise<any> {
    console.log('[CrossReference] 🛒 Buscando marketplaces...')
    
    const b2b: any[] = []
    const b2c: any[] = []

    for (const marketplace of MARKETPLACES) {
      try {
        const profile = await this.searchSingleMarketplace(marketplace, params)
        if (profile) {
          if (marketplace.type === 'b2b') {
            b2b.push(profile)
          } else {
            b2c.push(profile)
          }
        }
      } catch (error: any) {
        console.warn(`[CrossReference] ⚠️ Erro em ${marketplace.name}:`, error.message)
      }
    }

    return { b2b, b2c }
  }

  /**
   * 3. PORTAIS ELETRÔNICOS
   * Google Meu Negócio, Reclame Aqui, Glassdoor
   */
  private async searchPortaisEletronicos(params: any): Promise<any> {
    console.log('[CrossReference] 🌐 Buscando portais eletrônicos...')
    
    const results: any = {}

    for (const portal of PORTAIS_ELETRONICOS) {
      try {
        const profile = await this.searchSinglePortal(portal, params)
        if (profile) {
          results[portal.id] = profile
        }
      } catch (error: any) {
        console.warn(`[CrossReference] ⚠️ Erro em ${portal.name}:`, error.message)
      }
    }

    return results
  }

  /**
   * 4. NOTÍCIAS RECENTES
   * Últimos 12 meses, fontes confiáveis
   */
  private async searchNoticiasRecentes(params: any): Promise<any[]> {
    console.log('[CrossReference] 📰 Buscando notícias recentes...')
    
    const articles: any[] = []
    const dateLimit = new Date()
    dateLimit.setMonth(dateLimit.getMonth() - 12)
    const afterDate = dateLimit.toISOString().split('T')[0]

    // TODO: Implementar busca de notícias com filtro de data
    console.log(`[CrossReference] 📅 Buscando notícias após ${afterDate}`)

    return articles
  }

  /**
   * 5. JURÍDICO
   * Jusbrasil, processos, protestos
   */
  private async searchJuridico(params: any): Promise<any> {
    console.log('[CrossReference] ⚖️ Buscando dados jurídicos...')
    
    const juridico: any = {}

    // Buscar por CNPJ, Razão Social e Sócios
    const queries = [
      `site:jusbrasil.com.br "${params.cnpj}"`,
      `site:jusbrasil.com.br "${params.razaoSocial}"`
    ]

    if (params.socios && params.socios.length > 0) {
      params.socios.slice(0, 2).forEach((socio: string) => {
        queries.push(`site:jusbrasil.com.br "${socio}"`)
      })
    }

    // TODO: Implementar busca Jusbrasil real
    console.log('[CrossReference] 📋 Queries jurídico:', queries.length)

    return juridico
  }

  /**
   * 6. REPUTAÇÃO
   * Reclame Aqui, Trustpilot, Consumidor.gov
   */
  private async searchReputacao(params: any): Promise<any> {
    console.log('[CrossReference] ⭐ Buscando reputação...')
    
    const reputacao: any = {
      score: 0,
      sources: [],
      alerts: []
    }

    // TODO: Implementar busca de reputação

    return reputacao
  }

  /**
   * VALIDAÇÃO CRUZADA
   * Compara dados entre plataformas para confirmar autenticidade
   */
  private performCrossValidation(data: any): CrossReferenceResult[] {
    console.log('[CrossReference] 🔗 Realizando validação cruzada...')
    
    const crossReferences: CrossReferenceResult[] = []

    // Extrair websites de todas as fontes
    const websites = new Set<string>()
    
    Object.values(data.redesSociais || {}).forEach((profile: any) => {
      if (profile?.website) {
        websites.add(profile.website)
      }
    })

    Object.values(data.portaisEletronicos || {}).forEach((portal: any) => {
      if (portal?.website) {
        websites.add(portal.website)
      }
    })

    // Se múltiplas fontes apontam para o mesmo website → alta confiança
    if (websites.size === 1) {
      console.log('[CrossReference] ✅ Website consistente em todas as fontes')
    } else if (websites.size > 1) {
      console.log('[CrossReference] ⚠️ Websites divergentes encontrados:', websites)
    }

    return crossReferences
  }

  /**
   * HELPERS
   */
  private async searchSinglePlatform(platform: any, termos: string[], params: any): Promise<any> {
    // Mock simplificado - implementar busca real
    return null
  }

  private async searchSingleMarketplace(marketplace: any, params: any): Promise<any> {
    // Mock simplificado - implementar busca real
    return null
  }

  private async searchSinglePortal(portal: any, params: any): Promise<any> {
    // Mock simplificado - implementar busca real
    return null
  }

  private countTotalSources(data: any): number {
    let count = 0
    
    if (data.redesSociais) count += Object.keys(data.redesSociais).length
    if (data.marketplaces) count += data.marketplaces.b2b.length + data.marketplaces.b2c.length
    if (data.portaisEletronicos) count += Object.keys(data.portaisEletronicos).length
    if (data.noticiasRecentes) count += data.noticiasRecentes.length
    if (data.juridico?.jusbrasil) count += 1
    if (data.reputacao?.sources) count += data.reputacao.sources.length
    
    return count
  }

  private calculateOverallConfidence(crossRefs: CrossReferenceResult[]): number {
    if (crossRefs.length === 0) return 50 // Confiança base
    
    const avgConfidence = crossRefs.reduce((sum, ref) => sum + ref.overallConfidence, 0) / crossRefs.length
    return Math.round(avgConfidence)
  }
}

// Instância singleton
export const crossReferenceSearch = new CrossReferenceSearchService()
