/**
 * Categorias de Presença Digital com Cross-Reference
 * Sistema de busca cruzada e validação inteligente
 */

export interface CrossReferenceConfig {
  // CATEGORIAS PRINCIPAIS
  categories: {
    redesSociais: SocialPlatform[]
    marketplaces: MarketplaceCategory[]
    portaisEletronicos: PortalCategory[]
    noticiasRecentes: NewsSource[]
    juridico: LegalSource[]
    reputacao: ReputationSource[]
  }
}

// ============================================
// REDES SOCIAIS
// ============================================
export interface SocialPlatform {
  id: string
  name: string
  domain: string
  priority: number // 1-10 (10 = mais importante)
  searchStrategies: string[]
  validationRules: ValidationRule[]
  crossRefFields: string[] // Campos para cross-reference
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    priority: 10, // Mais importante (B2B)
    searchStrategies: [
      'site:linkedin.com/company "{nome}"',
      'site:linkedin.com/in "{socio}"',
      '"{nome}" LinkedIn empresa',
      'LinkedIn "{marca}"'
    ],
    validationRules: [
      { field: 'companyName', weight: 50 },
      { field: 'website', weight: 40 },
      { field: 'location', weight: 10 }
    ],
    crossRefFields: ['companyName', 'website', 'employees', 'industry']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    domain: 'instagram.com',
    priority: 8,
    searchStrategies: [
      'site:instagram.com "{nome}"',
      'Instagram @{handle}',
      '"{marca}" Instagram oficial'
    ],
    validationRules: [
      { field: 'bio', weight: 40 },
      { field: 'website', weight: 50 },
      { field: 'followers', weight: 10 }
    ],
    crossRefFields: ['bio', 'website', 'profileName']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    domain: 'facebook.com',
    priority: 7,
    searchStrategies: [
      'site:facebook.com "{nome}"',
      'Facebook "{marca}" página',
      '"{nome}" Facebook oficial'
    ],
    validationRules: [
      { field: 'pageName', weight: 40 },
      { field: 'website', weight: 40 },
      { field: 'about', weight: 20 }
    ],
    crossRefFields: ['pageName', 'website', 'about']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    domain: 'youtube.com',
    priority: 6,
    searchStrategies: [
      'site:youtube.com "{nome}"',
      'YouTube "{marca}" canal',
      '"{nome}" YouTube oficial'
    ],
    validationRules: [
      { field: 'channelName', weight: 40 },
      { field: 'description', weight: 40 },
      { field: 'customUrl', weight: 20 }
    ],
    crossRefFields: ['channelName', 'description', 'website']
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    domain: 'twitter.com OR x.com',
    priority: 6,
    searchStrategies: [
      '(site:twitter.com OR site:x.com) "{nome}"',
      'Twitter @{handle}',
      '"{marca}" Twitter oficial'
    ],
    validationRules: [
      { field: 'bio', weight: 40 },
      { field: 'website', weight: 50 },
      { field: 'location', weight: 10 }
    ],
    crossRefFields: ['bio', 'website', 'displayName']
  }
]

// ============================================
// MARKETPLACES E PORTAIS ELETRÔNICOS
// ============================================
export interface MarketplaceCategory {
  id: string
  name: string
  type: 'b2b' | 'b2c' | 'mixed'
  domains: string[]
  priority: number
  searchStrategies: string[]
  validationRules: ValidationRule[]
}

export const MARKETPLACES: MarketplaceCategory[] = [
  // B2B Prioritários
  {
    id: 'mercado_livre_empresas',
    name: 'Mercado Livre (Loja Oficial)',
    type: 'b2b',
    domains: ['mercadolivre.com.br', 'mercadolibre.com'],
    priority: 7,
    searchStrategies: [
      'site:mercadolivre.com.br "{nome}" loja oficial',
      '"{marca}" Mercado Livre vendedor'
    ],
    validationRules: [
      { field: 'storeName', weight: 40 },
      { field: 'reputation', weight: 30 },
      { field: 'cnpj', weight: 30 }
    ]
  },
  {
    id: 'amazon_business',
    name: 'Amazon Business',
    type: 'b2b',
    domains: ['amazon.com.br'],
    priority: 6,
    searchStrategies: [
      'site:amazon.com.br "{nome}" vendedor',
      '"{marca}" Amazon loja'
    ],
    validationRules: [
      { field: 'storeName', weight: 50 },
      { field: 'cnpj', weight: 50 }
    ]
  },
  {
    id: 'b2w',
    name: 'B2W Marketplace (Americanas/Submarino)',
    type: 'b2c',
    domains: ['americanas.com.br', 'submarino.com.br'],
    priority: 5,
    searchStrategies: [
      '(site:americanas.com.br OR site:submarino.com.br) "{nome}" loja'
    ],
    validationRules: [
      { field: 'storeName', weight: 60 },
      { field: 'cnpj', weight: 40 }
    ]
  }
]

export const PORTAIS_ELETRONICOS: MarketplaceCategory[] = [
  {
    id: 'google_meu_negocio',
    name: 'Google Meu Negócio',
    type: 'b2b',
    domains: ['google.com/maps', 'maps.google.com'],
    priority: 9,
    searchStrategies: [
      'site:google.com/maps "{nome}" {cidade}',
      'Google Maps "{marca}"'
    ],
    validationRules: [
      { field: 'name', weight: 40 },
      { field: 'address', weight: 30 },
      { field: 'phone', weight: 30 }
    ]
  },
  {
    id: 'reclame_aqui',
    name: 'Reclame Aqui',
    type: 'mixed',
    domains: ['reclameaqui.com.br'],
    priority: 8,
    searchStrategies: [
      'site:reclameaqui.com.br "{nome}"',
      'Reclame Aqui "{marca}"'
    ],
    validationRules: [
      { field: 'companyName', weight: 50 },
      { field: 'cnpj', weight: 50 }
    ]
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    type: 'b2b',
    domains: ['glassdoor.com.br'],
    priority: 6,
    searchStrategies: [
      'site:glassdoor.com.br "{nome}"',
      'Glassdoor "{marca}" avaliações'
    ],
    validationRules: [
      { field: 'companyName', weight: 60 },
      { field: 'location', weight: 40 }
    ]
  }
]

// ============================================
// NOTÍCIAS RECENTES
// ============================================
export interface NewsSource {
  id: string
  name: string
  domains: string[]
  priority: number
  timeWindow: number // meses
  searchStrategies: string[]
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'google_news',
    name: 'Google Notícias',
    domains: ['news.google.com'],
    priority: 10,
    timeWindow: 12, // últimos 12 meses
    searchStrategies: [
      '"{nome}" após:YYYY-MM-DD',
      '"{marca}" notícia após:YYYY-MM-DD'
    ]
  },
  {
    id: 'valor_economico',
    name: 'Valor Econômico',
    domains: ['valor.globo.com'],
    priority: 9,
    timeWindow: 12,
    searchStrategies: [
      'site:valor.globo.com "{nome}"',
      'Valor Econômico "{marca}"'
    ]
  },
  {
    id: 'exame',
    name: 'Exame',
    domains: ['exame.com'],
    priority: 8,
    timeWindow: 12,
    searchStrategies: [
      'site:exame.com "{nome}"',
      'Exame "{marca}"'
    ]
  }
]

// ============================================
// JURÍDICO E REPUTAÇÃO
// ============================================
export interface LegalSource {
  id: string
  name: string
  domains: string[]
  priority: number
  type: 'processos' | 'protestos' | 'dividas' | 'falencias'
  searchStrategies: string[]
}

export const LEGAL_SOURCES: LegalSource[] = [
  {
    id: 'jusbrasil',
    name: 'Jusbrasil',
    domains: ['jusbrasil.com.br'],
    priority: 10,
    type: 'processos',
    searchStrategies: [
      'site:jusbrasil.com.br "{cnpj}"',
      'site:jusbrasil.com.br "{razaoSocial}"',
      'site:jusbrasil.com.br "{socio}"'
    ]
  },
  {
    id: 'consulta_processos',
    name: 'Consulta Processos',
    domains: ['consultaprocessos.com'],
    priority: 8,
    type: 'processos',
    searchStrategies: [
      'site:consultaprocessos.com "{cnpj}"'
    ]
  },
  {
    id: 'serasa',
    name: 'Serasa Experian (público)',
    domains: ['serasa.com.br'],
    priority: 9,
    type: 'dividas',
    searchStrategies: [
      'site:serasa.com.br "{cnpj}" dívida',
      'Serasa "{razaoSocial}" protestos'
    ]
  }
]

export interface ReputationSource {
  id: string
  name: string
  domains: string[]
  priority: number
  type: 'positivo' | 'negativo' | 'neutro'
  searchStrategies: string[]
}

export const REPUTATION_SOURCES: ReputationSource[] = [
  {
    id: 'reclame_aqui_rep',
    name: 'Reclame Aqui (Reputação)',
    domains: ['reclameaqui.com.br'],
    priority: 9,
    type: 'negativo',
    searchStrategies: [
      'site:reclameaqui.com.br "{nome}" reclamação',
      'Reclame Aqui "{marca}" não resolvido'
    ]
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    domains: ['br.trustpilot.com'],
    priority: 7,
    type: 'neutro',
    searchStrategies: [
      'site:trustpilot.com "{nome}"',
      'Trustpilot "{marca}"'
    ]
  },
  {
    id: 'consumidor_gov',
    name: 'Consumidor.gov.br',
    domains: ['consumidor.gov.br'],
    priority: 8,
    type: 'negativo',
    searchStrategies: [
      'site:consumidor.gov.br "{nome}"',
      'Consumidor.gov "{marca}"'
    ]
  }
]

// ============================================
// VALIDAÇÃO CRUZADA
// ============================================
export interface ValidationRule {
  field: string
  weight: number // 0-100
}

export interface CrossReferenceResult {
  source: string // Onde foi encontrado primeiro
  matches: Array<{
    category: string
    platform: string
    url: string
    confidence: number
    matchedFields: Array<{
      field: string
      value: string
      source: string
    }>
  }>
  overallConfidence: number
  validated: boolean
}

// ============================================
// RESULTADO FINAL ESTRUTURADO
// ============================================
export interface StructuredDigitalPresence {
  // REDES SOCIAIS
  redesSociais: {
    linkedin?: SocialMediaProfile
    instagram?: SocialMediaProfile
    facebook?: SocialMediaProfile
    youtube?: SocialMediaProfile
    twitter?: SocialMediaProfile
  }
  
  // MARKETPLACES
  marketplaces: {
    b2b: MarketplaceProfile[]
    b2c: MarketplaceProfile[]
  }
  
  // PORTAIS ELETRÔNICOS
  portaisEletronicos: {
    googleMeuNegocio?: PortalProfile
    reclameAqui?: PortalProfile
    glassdoor?: PortalProfile
  }
  
  // NOTÍCIAS RECENTES
  noticiasRecentes: NewsArticle[]
  
  // JURÍDICO
  juridico: {
    jusbrasil?: LegalProfile
    processos?: ProcessRecord[]
    protestos?: ProtestRecord[]
  }
  
  // REPUTAÇÃO
  reputacao: {
    score: number // 0-100
    sources: ReputationProfile[]
    alerts: ReputationAlert[]
  }
  
  // METADADOS
  metadata: {
    lastUpdated: string
    totalSources: number
    confidence: number
    crossReferences: CrossReferenceResult[]
  }
}

export interface SocialMediaProfile {
  platform: string
  url: string
  handle?: string
  verified: boolean
  followers?: string
  bio?: string
  website?: string
  confidence: number
  crossValidated: boolean
}

export interface MarketplaceProfile {
  marketplace: string
  url: string
  storeName: string
  reputation?: string
  cnpj?: string
  confidence: number
}

export interface PortalProfile {
  portal: string
  url: string
  rating?: number
  reviews?: number
  confidence: number
}

export interface NewsArticle {
  title: string
  url: string
  source: string
  date: string
  snippet: string
  relevance: number
}

export interface LegalProfile {
  url: string
  totalProcesses: number
  activeProcesses: number
  confidence: number
}

export interface ProcessRecord {
  number: string
  type: string
  status: string
  court: string
  url: string
}

export interface ProtestRecord {
  date: string
  value: number
  status: string
  source: string
}

export interface ReputationProfile {
  source: string
  score: number
  totalReviews: number
  url: string
}

export interface ReputationAlert {
  type: 'warning' | 'critical' | 'info'
  message: string
  source: string
  url: string
}
