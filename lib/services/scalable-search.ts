/**
 * Serviço de Busca Escalável para Presença Digital
 * Suporta processamento em massa e bulk upload
 */

import { SearchFields, BulkSearchRequest, SearchResult, BulkSearchResponse } from '@/lib/types/search-fields'
import { fetchDigitalPresence } from './digital-presence'

export class ScalableSearchService {
  private maxConcurrent: number
  private timeout: number
  private retryAttempts: number

  constructor(options: {
    maxConcurrent?: number
    timeout?: number
    retryAttempts?: number
  } = {}) {
    this.maxConcurrent = options.maxConcurrent || 5
    this.timeout = options.timeout || 10000
    this.retryAttempts = options.retryAttempts || 2
  }

  /**
   * Busca individual com campos específicos
   */
  async searchSingle(company: SearchFields): Promise<SearchResult> {
    const startTime = Date.now()
    console.log(`[ScalableSearch] 🔍 Buscando empresa: ${company.razaoSocial} (${company.cnpj})`)

    try {
      // Converter SearchFields para parâmetros da função existente
      const digitalPresence = await fetchDigitalPresence(
        company.razaoSocial,
        company.cnpj,
        company.nomeFantasia,
        company.website,
        company.socios
      )

      const searchTime = Date.now() - startTime

      // Construir resultado estruturado
      const result: SearchResult = {
        companyId: company.cnpj, // Usar CNPJ como ID único
        cnpj: company.cnpj,
        razaoSocial: company.razaoSocial,
        
        website: digitalPresence.website ? {
          url: digitalPresence.website.url,
          title: digitalPresence.website.title,
          status: digitalPresence.website.status,
          confidence: 85 // Baseado na validação
        } : undefined,
        
        redesSociais: {
          instagram: digitalPresence.redesSociais.instagram ? {
            url: digitalPresence.redesSociais.instagram.url,
            followers: digitalPresence.redesSociais.instagram.followers,
            confidence: 80
          } : undefined,
          linkedin: digitalPresence.redesSociais.linkedin ? {
            url: digitalPresence.redesSociais.linkedin.url,
            type: digitalPresence.redesSociais.linkedin.type,
            confidence: 85
          } : undefined,
          facebook: digitalPresence.redesSociais.facebook ? {
            url: digitalPresence.redesSociais.facebook.url,
            followers: digitalPresence.redesSociais.facebook.followers,
            confidence: 80
          } : undefined,
          twitter: digitalPresence.redesSociais.twitter ? {
            url: digitalPresence.redesSociais.twitter.url,
            followers: digitalPresence.redesSociais.twitter.followers,
            confidence: 80
          } : undefined,
          youtube: digitalPresence.redesSociais.youtube ? {
            url: digitalPresence.redesSociais.youtube.url,
            subscribers: digitalPresence.redesSociais.youtube.subscribers,
            confidence: 80
          } : undefined,
        },
        
        marketplaces: digitalPresence.marketplaces.map(mp => ({
          plataforma: mp.plataforma,
          url: mp.url,
          loja: mp.loja,
          confidence: 75
        })),
        
        jusbrasil: digitalPresence.jusbrasil ? {
          url: digitalPresence.jusbrasil.url,
          processos: 0, // TODO: Implementar contagem de processos
          confidence: 90
        } : undefined,
        
        searchMetadata: {
          searchTime,
          strategiesUsed: ['multi-dimensional', 'cross-validation'],
          totalResults: Object.keys(digitalPresence.redesSociais).length + 
                       digitalPresence.marketplaces.length + 
                       (digitalPresence.jusbrasil ? 1 : 0),
          confidence: this.calculateOverallConfidence(digitalPresence),
          lastSearched: new Date().toISOString()
        }
      }

      console.log(`[ScalableSearch] ✅ Empresa processada em ${searchTime}ms`)
      return result

    } catch (error: any) {
      console.error(`[ScalableSearch] ❌ Erro ao processar ${company.razaoSocial}:`, error.message)
      throw error
    }
  }

  /**
   * Busca em massa com controle de concorrência
   */
  async searchBulk(request: BulkSearchRequest): Promise<BulkSearchResponse> {
    const startTime = Date.now()
    console.log(`[ScalableSearch] 🚀 Iniciando busca em massa para ${request.companies.length} empresas`)

    const results: SearchResult[] = []
    const errors: Array<{ companyId: string; cnpj: string; error: string }> = []
    
    const options = {
      parallel: request.options?.parallel ?? true,
      maxConcurrent: request.options?.maxConcurrent ?? this.maxConcurrent,
      timeout: request.options?.timeout ?? this.timeout,
      retryAttempts: request.options?.retryAttempts ?? this.retryAttempts
    }

    if (options.parallel) {
      // Processamento em paralelo com controle de concorrência
      const chunks = this.chunkArray(request.companies, options.maxConcurrent)
      
      for (const chunk of chunks) {
        const promises = chunk.map(async (company) => {
          try {
            return await this.searchSingleWithRetry(company, options.retryAttempts)
          } catch (error: any) {
            errors.push({
              companyId: company.cnpj,
              cnpj: company.cnpj,
              error: error.message
            })
            return null
          }
        })

        const chunkResults = await Promise.all(promises)
        results.push(...chunkResults.filter(result => result !== null))
        
        console.log(`[ScalableSearch] 📊 Chunk processado: ${chunkResults.filter(r => r !== null).length}/${chunk.length} sucessos`)
      }
    } else {
      // Processamento sequencial
      for (const company of request.companies) {
        try {
          const result = await this.searchSingleWithRetry(company, options.retryAttempts)
          results.push(result)
        } catch (error: any) {
          errors.push({
            companyId: company.cnpj,
            cnpj: company.cnpj,
            error: error.message
          })
        }
      }
    }

    const totalTime = Date.now() - startTime
    const averageTime = results.length > 0 ? totalTime / results.length : 0

    const response: BulkSearchResponse = {
      results,
      summary: {
        total: request.companies.length,
        successful: results.length,
        failed: errors.length,
        averageTime: Math.round(averageTime),
        totalTime: Math.round(totalTime)
      },
      errors: errors.length > 0 ? errors : undefined
    }

    console.log(`[ScalableSearch] ✅ Busca em massa concluída: ${results.length}/${request.companies.length} sucessos em ${totalTime}ms`)
    return response
  }

  /**
   * Busca com retry automático
   */
  private async searchSingleWithRetry(company: SearchFields, attempts: number): Promise<SearchResult> {
    let lastError: Error | null = null
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await this.searchSingle(company)
      } catch (error: any) {
        lastError = error
        if (i < attempts - 1) {
          console.log(`[ScalableSearch] 🔄 Tentativa ${i + 1}/${attempts} falhou para ${company.razaoSocial}, tentando novamente...`)
          await this.delay(1000 * (i + 1)) // Delay progressivo
        }
      }
    }
    
    throw lastError || new Error('Todas as tentativas falharam')
  }

  /**
   * Calcular confiança geral baseada nos resultados
   */
  private calculateOverallConfidence(digitalPresence: any): number {
    let totalConfidence = 0
    let count = 0

    if (digitalPresence.website) {
      totalConfidence += 85
      count++
    }

    Object.values(digitalPresence.redesSociais).forEach((social: any) => {
      if (social) {
        totalConfidence += 80
        count++
      }
    })

    digitalPresence.marketplaces.forEach(() => {
      totalConfidence += 75
      count++
    })

    if (digitalPresence.jusbrasil) {
      totalConfidence += 90
      count++
    }

    return count > 0 ? Math.round(totalConfidence / count) : 0
  }

  /**
   * Dividir array em chunks para processamento paralelo
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Delay utilitário
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Instância singleton para uso global
export const scalableSearchService = new ScalableSearchService({
  maxConcurrent: 5,
  timeout: 10000,
  retryAttempts: 2
})
