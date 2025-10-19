/**
 * ESTRUTURA PADRÃO DE EVIDÊNCIAS
 * 
 * Garante rastreabilidade e auditabilidade de TODOS os dados
 * Conforme Prompt Master: fonte, URL, data de coleta e snippet
 */

export type EvidenceType = 
  | 'receita_ws'      // ReceitaWS API
  | 'google_cse'      // Google Custom Search
  | 'website'         // Website oficial
  | 'social_media'    // Redes sociais
  | 'news'            // Notícias
  | 'jusbrasil'       // Jusbrasil
  | 'marketplace'     // Marketplaces B2B
  | 'totvs_scan'      // Scan de tecnografia TOTVS
  | 'vendor_match'    // Análise de vendor match
  | 'ai_analysis'     // Análise de IA (OpenAI)
  | 'manual'          // Entrada manual

export type EvidenceConfidence = 'high' | 'medium' | 'low' | 'none'

export interface Evidence {
  id: string
  type: EvidenceType
  source: string // Nome legível da fonte (ex: "ReceitaWS", "Google CSE", "Instagram")
  url: string    // URL da fonte (para auditoria)
  snippet?: string // Trecho relevante encontrado
  collected_at: string // ISO timestamp de quando foi coletado
  confidence: EvidenceConfidence
  validated: boolean // Se passou por validação assertiva
  validation_score?: number // Score de validação (0-100)
  validation_reasons?: string[] // Razões da validação
  metadata?: Record<string, any> // Metadados adicionais (ex: score, network, handle)
}

/**
 * Evidências por seção do relatório
 */
export interface SectionEvidences {
  section: string // Nome da seção (ex: "Identificação", "Presença Digital")
  evidences: Evidence[]
}

/**
 * Criar evidência padrão
 */
export function createEvidence(params: {
  type: EvidenceType
  source: string
  url: string
  snippet?: string
  confidence?: EvidenceConfidence
  validated?: boolean
  validation_score?: number
  validation_reasons?: string[]
  metadata?: Record<string, any>
}): Evidence {
  return {
    id: `${params.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: params.type,
    source: params.source,
    url: params.url,
    snippet: params.snippet,
    collected_at: new Date().toISOString(),
    confidence: params.confidence || 'medium',
    validated: params.validated || false,
    validation_score: params.validation_score,
    validation_reasons: params.validation_reasons,
    metadata: params.metadata,
  }
}

/**
 * Criar evidência da ReceitaWS
 */
export function createReceitaEvidence(cnpj: string, data: any): Evidence {
  return createEvidence({
    type: 'receita_ws',
    source: 'ReceitaWS API',
    url: `https://receitaws.com.br/v1/cnpj/${cnpj.replace(/\D/g, '')}`,
    snippet: `Dados oficiais da Receita Federal para CNPJ ${cnpj}`,
    confidence: 'high',
    validated: true,
    validation_score: 100,
    metadata: {
      cnpj,
      razao_social: data.nome,
      situacao: data.situacao,
    }
  })
}

/**
 * Criar evidência de busca (Google CSE, Serper, Bing)
 */
export function createSearchEvidence(params: {
  query: string
  provider: 'google' | 'serper' | 'bing'
  result: {
    url: string
    title: string
    snippet: string
  }
  validation?: {
    linked: boolean
    score: number
    confidence: EvidenceConfidence
    reasons: string[]
  }
}): Evidence {
  const providerNames = {
    google: 'Google Custom Search',
    serper: 'Serper.dev',
    bing: 'Bing Search API'
  }

  return createEvidence({
    type: 'google_cse',
    source: providerNames[params.provider],
    url: params.result.url,
    snippet: params.result.snippet,
    confidence: params.validation?.confidence || 'medium',
    validated: params.validation?.linked || false,
    validation_score: params.validation?.score,
    validation_reasons: params.validation?.reasons,
    metadata: {
      query: params.query,
      provider: params.provider,
      title: params.result.title,
    }
  })
}

/**
 * Criar evidência de website
 */
export function createWebsiteEvidence(params: {
  url: string
  title: string
  validation: {
    linked: boolean
    score: number
    confidence: EvidenceConfidence
    reasons: string[]
  }
}): Evidence {
  return createEvidence({
    type: 'website',
    source: 'Website Oficial',
    url: params.url,
    snippet: params.title,
    confidence: params.validation.confidence,
    validated: params.validation.linked,
    validation_score: params.validation.score,
    validation_reasons: params.validation.reasons,
  })
}

/**
 * Criar evidência de rede social
 */
export function createSocialMediaEvidence(params: {
  network: string
  url: string
  handle: string
  validation: {
    linked: boolean
    score: number
    confidence: EvidenceConfidence
    reasons: string[]
  }
}): Evidence {
  return createEvidence({
    type: 'social_media',
    source: params.network,
    url: params.url,
    snippet: `Perfil @${params.handle} no ${params.network}`,
    confidence: params.validation.confidence,
    validated: params.validation.linked,
    validation_score: params.validation.score,
    validation_reasons: params.validation.reasons,
    metadata: {
      network: params.network,
      handle: params.handle,
    }
  })
}

/**
 * Criar evidência de notícia
 */
export function createNewsEvidence(params: {
  url: string
  title: string
  snippet: string
  date?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
}): Evidence {
  return createEvidence({
    type: 'news',
    source: 'Notícia Online',
    url: params.url,
    snippet: params.snippet,
    confidence: params.date ? 'high' : 'medium',
    validated: true,
    metadata: {
      title: params.title,
      date: params.date,
      sentiment: params.sentiment,
    }
  })
}

/**
 * Criar evidência de TOTVS scan
 */
export function createTotvsScanEvidence(params: {
  url: string
  snippet: string
  strength: 'A' | 'B' | 'C'
  source: 'website' | 'cse'
}): Evidence {
  const strengthToScore = { A: 90, B: 70, C: 50 }
  const strengthToConfidence: Record<string, EvidenceConfidence> = {
    A: 'high',
    B: 'medium',
    C: 'low'
  }

  return createEvidence({
    type: 'totvs_scan',
    source: params.source === 'website' ? 'Website Oficial' : 'Google Custom Search',
    url: params.url,
    snippet: params.snippet,
    confidence: strengthToConfidence[params.strength],
    validated: true,
    validation_score: strengthToScore[params.strength],
    metadata: {
      strength: params.strength,
      scan_type: params.source,
    }
  })
}

/**
 * Agrupar evidências por confiança
 */
export function groupEvidencesByConfidence(evidences: Evidence[]): {
  high: Evidence[]
  medium: Evidence[]
  low: Evidence[]
  none: Evidence[]
} {
  return {
    high: evidences.filter(e => e.confidence === 'high'),
    medium: evidences.filter(e => e.confidence === 'medium'),
    low: evidences.filter(e => e.confidence === 'low'),
    none: evidences.filter(e => e.confidence === 'none'),
  }
}

/**
 * Calcular score agregado de evidências
 */
export function calculateEvidenceScore(evidences: Evidence[]): number {
  if (evidences.length === 0) return 0

  const weights = {
    high: 1.0,
    medium: 0.7,
    low: 0.4,
    none: 0.0,
  }

  const totalWeight = evidences.reduce((sum, e) => sum + weights[e.confidence], 0)
  const validatedCount = evidences.filter(e => e.validated).length
  
  // Score baseado em: peso da confiança + taxa de validação
  const confidenceScore = (totalWeight / evidences.length) * 100
  const validationBonus = (validatedCount / evidences.length) * 20
  
  return Math.min(100, Math.round(confidenceScore + validationBonus))
}

/**
 * Formatar data de coleta (relativa)
 */
export function formatCollectedAt(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Há ${diffMins} min`
  if (diffHours < 24) return `Há ${diffHours}h`
  if (diffDays < 7) return `Há ${diffDays} dias`
  
  return date.toLocaleDateString('pt-BR')
}

