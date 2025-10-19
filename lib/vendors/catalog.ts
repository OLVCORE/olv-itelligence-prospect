/**
 * Catálogo de Produtos OLV, TOTVS e Custom
 * 
 * Define produtos disponíveis para análise de fit comercial
 */

export interface Product {
  id: string
  name: string
  vendor: 'OLV' | 'TOTVS' | 'CUSTOM'
  category: string
  description: string
  targetCompanySize: ('MICRO' | 'PEQUENO' | 'MEDIO' | 'GRANDE')[]
  targetCNAEs?: string[] // CNAEs específicos (opcional)
  keywords: string[] // Para detecção em notícias/website
  averageTicket: number // Em reais
  features: string[]
}

/**
 * Produtos OLV Internacional
 */
export const OLV_PRODUCTS: Product[] = [
  {
    id: 'olv-bi-analytics',
    name: 'OLV BI & Analytics',
    vendor: 'OLV',
    category: 'Business Intelligence',
    description: 'Plataforma de BI e análise de dados em tempo real',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    keywords: ['dashboard', 'relatórios', 'análise', 'dados', 'kpi', 'indicadores'],
    averageTicket: 30000,
    features: [
      'Dashboards personalizados',
      'Análise preditiva',
      'Integração com ERPs',
      'Relatórios automatizados',
      'Mobile BI'
    ]
  },
  {
    id: 'olv-crm-intelligence',
    name: 'OLV CRM Intelligence',
    vendor: 'OLV',
    category: 'CRM & Vendas',
    description: 'CRM inteligente com IA para prospecção e gestão de vendas',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    keywords: ['crm', 'vendas', 'clientes', 'prospecção', 'pipeline'],
    averageTicket: 25000,
    features: [
      'Prospecção inteligente com IA',
      'Score de propensão',
      'Automação de follow-up',
      'Previsão de vendas',
      'Integração WhatsApp/Email'
    ]
  },
  {
    id: 'olv-data-integration',
    name: 'OLV Data Integration',
    vendor: 'OLV',
    category: 'Integração de Dados',
    description: 'Integração e ETL para unificar dados de múltiplas fontes',
    targetCompanySize: ['MEDIO', 'GRANDE'],
    keywords: ['integração', 'etl', 'api', 'dados', 'unificação'],
    averageTicket: 40000,
    features: [
      'Conectores para 100+ sistemas',
      'ETL automatizado',
      'Data lake unificado',
      'Sincronização em tempo real',
      'Governança de dados'
    ]
  }
]

/**
 * Produtos TOTVS
 */
export const TOTVS_PRODUCTS: Product[] = [
  {
    id: 'totvs-protheus',
    name: 'TOTVS Protheus',
    vendor: 'TOTVS',
    category: 'ERP',
    description: 'ERP completo para gestão empresarial integrada',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    keywords: ['erp', 'gestão', 'financeiro', 'estoque', 'compras', 'vendas'],
    averageTicket: 80000,
    features: [
      'Gestão Financeira',
      'Controle de Estoque',
      'Compras e Vendas',
      'Fiscal e Contábil',
      'Multi-empresa/Multi-filial'
    ]
  },
  {
    id: 'totvs-rm',
    name: 'TOTVS RM',
    vendor: 'TOTVS',
    category: 'ERP',
    description: 'ERP especializado para educação e serviços',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    targetCNAEs: ['85', '86', '87'], // Educação, saúde, serviços sociais
    keywords: ['educação', 'escola', 'universidade', 'alunos', 'rh'],
    averageTicket: 60000,
    features: [
      'Gestão Educacional',
      'Portal do Aluno',
      'RH e Folha',
      'Financeiro',
      'Biblioteca'
    ]
  },
  {
    id: 'totvs-datasul',
    name: 'TOTVS Datasul',
    vendor: 'TOTVS',
    category: 'ERP',
    description: 'ERP para indústria e manufatura',
    targetCompanySize: ['MEDIO', 'GRANDE'],
    targetCNAEs: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'], // Indústrias
    keywords: ['indústria', 'manufatura', 'produção', 'pcp', 'chão de fábrica'],
    averageTicket: 120000,
    features: [
      'Planejamento e Controle de Produção (PCP)',
      'Gestão de Custos Industriais',
      'Manutenção de Ativos',
      'Qualidade (QMS)',
      'Supply Chain Management'
    ]
  },
  {
    id: 'totvs-tms',
    name: 'TOTVS Gestão de Transportes (TMS)',
    vendor: 'TOTVS',
    category: 'Logística',
    description: 'Sistema de gestão de transportes e logística',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    targetCNAEs: ['49', '52'], // Transporte e armazenagem
    keywords: ['transporte', 'logística', 'frete', 'rota', 'entrega', 'caminhão'],
    averageTicket: 50000,
    features: [
      'Otimização de rotas',
      'Gestão de frota',
      'Tracking em tempo real',
      'Gestão de CTe',
      'Controle de entregas'
    ]
  },
  {
    id: 'totvs-wms',
    name: 'TOTVS WMS',
    vendor: 'TOTVS',
    category: 'Logística',
    description: 'Sistema de gerenciamento de armazéns',
    targetCompanySize: ['MEDIO', 'GRANDE'],
    targetCNAEs: ['52'], // Armazenagem
    keywords: ['armazém', 'estoque', 'wms', 'picking', 'inventário'],
    averageTicket: 70000,
    features: [
      'Gestão de endereçamento',
      'Picking e packing',
      'Inventário rotativo',
      'Rastreabilidade',
      'Integração com ERPs'
    ]
  },
  {
    id: 'totvs-techfin',
    name: 'TOTVS Techfin',
    vendor: 'TOTVS',
    category: 'Financeiro',
    description: 'Soluções financeiras e banking',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    keywords: ['crédito', 'cobrança', 'financiamento', 'banking'],
    averageTicket: 40000,
    features: [
      'Gestão de crédito e cobrança',
      'Antecipação de recebíveis',
      'Banking integrado',
      'Conciliação bancária',
      'Compliance financeiro'
    ]
  },
  {
    id: 'totvs-rh',
    name: 'TOTVS RH',
    vendor: 'TOTVS',
    category: 'Recursos Humanos',
    description: 'Gestão completa de recursos humanos',
    targetCompanySize: ['PEQUENO', 'MEDIO', 'GRANDE'],
    keywords: ['rh', 'folha', 'ponto', 'benefícios', 'recrutamento'],
    averageTicket: 35000,
    features: [
      'Folha de pagamento',
      'Gestão de ponto',
      'Recrutamento e seleção',
      'Avaliação de desempenho',
      'Portal do colaborador'
    ]
  }
]

/**
 * Produtos Custom (configuráveis pelo usuário)
 */
export const CUSTOM_PRODUCTS: Product[] = [
  // Usuário pode adicionar seus próprios produtos
  // via interface administrativa
]

/**
 * Catálogo completo
 */
export const ALL_PRODUCTS = [
  ...OLV_PRODUCTS,
  ...TOTVS_PRODUCTS,
  ...CUSTOM_PRODUCTS
]

/**
 * Buscar produto por ID
 */
export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id)
}

/**
 * Filtrar produtos por vendor
 */
export function getProductsByVendor(vendor: 'OLV' | 'TOTVS' | 'CUSTOM'): Product[] {
  return ALL_PRODUCTS.filter(p => p.vendor === vendor)
}

/**
 * Buscar produtos por categoria
 */
export function getProductsByCategory(category: string): Product[] {
  return ALL_PRODUCTS.filter(p => p.category === category)
}

