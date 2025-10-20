/**
 * Campos específicos para busca escalável de presença digital
 * Permite processamento em massa e bulk upload
 */

export interface SearchFields {
  // DADOS OBRIGATÓRIOS (da ReceitaWS)
  cnpj: string
  razaoSocial: string
  
  // DADOS ESPECÍFICOS PARA BUSCA
  website?: string
  nomeFantasia?: string
  marca?: string
  
  // DADOS DE SÓCIOS (para busca jurídica)
  socios: string[]
  
  // INFORMAÇÕES ADICIONAIS (para buscas customizadas)
  additionalInfo?: {
    aliases?: string[]           // Nomes alternativos
    domains?: string[]          // Domínios conhecidos
    socialHandles?: {          // Handles específicos de redes sociais
      instagram?: string
      facebook?: string
      linkedin?: string
      twitter?: string
      youtube?: string
    }
    industry?: string           // Setor/ramo
    location?: string           // Localização específica
    keywords?: string[]         // Palavras-chave adicionais
  }
  
  // METADADOS PARA CONTROLE
  metadata?: {
    source?: string             // Fonte dos dados (ReceitaWS, manual, bulk)
    lastUpdated?: string        // Última atualização
    confidence?: number         // Confiança nos dados (0-100)
    notes?: string              // Observações do hunter
  }
}

export interface BulkSearchRequest {
  companies: SearchFields[]
  options?: {
    parallel?: boolean          // Processar em paralelo
    maxConcurrent?: number      // Máximo de buscas simultâneas
    timeout?: number           // Timeout por empresa (ms)
    retryAttempts?: number     // Tentativas de retry
  }
}

export interface SearchResult {
  companyId: string
  cnpj: string
  razaoSocial: string
  
  // RESULTADOS DA BUSCA
  website?: {
    url: string
    title: string
    status: 'ativo' | 'inativo' | 'não encontrado'
    confidence: number
  }
  
  redesSociais: {
    instagram?: { url: string; followers?: string; confidence: number }
    linkedin?: { url: string; type?: string; confidence: number }
    facebook?: { url: string; followers?: string; confidence: number }
    twitter?: { url: string; followers?: string; confidence: number }
    youtube?: { url: string; subscribers?: string; confidence: number }
  }
  
  marketplaces: Array<{
    plataforma: string
    url: string
    loja: string
    confidence: number
  }>
  
  jusbrasil?: {
    url: string
    processos: number
    confidence: number
  }
  
  // METADADOS DO RESULTADO
  searchMetadata: {
    searchTime: number          // Tempo de busca (ms)
    strategiesUsed: string[]    // Estratégias utilizadas
    totalResults: number        // Total de resultados encontrados
    confidence: number          // Confiança geral (0-100)
    lastSearched: string        // Data/hora da busca
  }
}

export interface BulkSearchResponse {
  results: SearchResult[]
  summary: {
    total: number
    successful: number
    failed: number
    averageTime: number
    totalTime: number
  }
  errors?: Array<{
    companyId: string
    cnpj: string
    error: string
  }>
}
