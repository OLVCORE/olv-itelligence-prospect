/**
 * Motor de Matching Comercial
 * 
 * Analisa fit entre empresa investigada e produtos disponíveis
 */

import { ALL_PRODUCTS, Product } from '@/lib/vendors/catalog'

interface CompanyData {
  cnpj: string
  name: string
  tradeName?: string
  size?: string // MICRO, PEQUENO, MEDIO, GRANDE
  capital?: number
  mainActivity?: string // CNAE principal
  secondaryActivities?: string[] // CNAEs secundários
  qsa?: Array<{ nome: string; qual: string }>
  digitalPresence?: {
    website?: { url: string; title: string } | null
    socialMedia?: Record<string, any>
    marketplaces?: any[]
    jusbrasil?: any
  }
  news?: Array<{ title: string; snippet: string; link: string }>
}

interface ProductMatch {
  product: Product
  fitScore: number // 0-100
  reasoning: string[]
  evidence: string[]
  pitch: string
  estimatedBudget: number
  priority: 'ALTA' | 'MEDIA' | 'BAIXA'
}

interface VendorMatchResult {
  companyName: string
  cnpj: string
  overallScore: number // Score geral de propensão
  buyingMoment: 'IDEAL' | 'BOM' | 'REGULAR' | 'BAIXO'
  matches: ProductMatch[]
  topRecommendation: ProductMatch | null
  nextSteps: string[]
  decisionMaker?: {
    name: string
    role: string
    approach: string
  }
}

/**
 * Normalizar porte da empresa
 */
function normalizeSize(size?: string, capital?: number): 'MICRO' | 'PEQUENO' | 'MEDIO' | 'GRANDE' {
  if (size) {
    const s = size.toUpperCase()
    if (s.includes('MICRO') || s === 'ME' || s === 'MEI') return 'MICRO'
    if (s.includes('PEQUENO') || s === 'EPP') return 'PEQUENO'
    if (s.includes('MEDIO') || s.includes('MÉDIO')) return 'MEDIO'
    if (s.includes('GRANDE')) return 'GRANDE'
  }
  
  // Fallback por capital social
  if (capital) {
    if (capital <= 81000) return 'MICRO'
    if (capital <= 360000) return 'PEQUENO'
    if (capital <= 4800000) return 'MEDIO'
    return 'GRANDE'
  }
  
  return 'PEQUENO' // Default
}

/**
 * Calcular fit score de um produto para a empresa
 */
function calculateFitScore(product: Product, company: CompanyData): {
  score: number
  reasoning: string[]
  evidence: string[]
} {
  let score = 50 // Base
  const reasoning: string[] = []
  const evidence: string[] = []

  // 1. Porte da empresa (peso 25)
  const companySize = normalizeSize(company.size, company.capital)
  if (product.targetCompanySize.includes(companySize)) {
    score += 25
    reasoning.push(`Porte ${companySize} alinhado com público-alvo do produto`)
  } else {
    score -= 15
    reasoning.push(`Porte ${companySize} fora do público-alvo ideal`)
  }

  // 2. CNAE match (peso 30)
  if (product.targetCNAEs && product.targetCNAEs.length > 0) {
    const mainCNAE = company.mainActivity?.substring(0, 2) || ''
    const secondaryCNAEs = (company.secondaryActivities || []).map(c => c.substring(0, 2))
    const allCNAEs = [mainCNAE, ...secondaryCNAEs]
    
    const hasMatch = allCNAEs.some(cnae => 
      product.targetCNAEs!.some(target => cnae.startsWith(target))
    )
    
    if (hasMatch) {
      score += 30
      reasoning.push(`Segmento (CNAE) perfeitamente alinhado com o produto`)
      evidence.push(`CNAE principal: ${company.mainActivity}`)
    } else {
      score -= 10
      reasoning.push(`Segmento (CNAE) não é foco principal do produto`)
    }
  }

  // 3. Presença digital / keywords (peso 20)
  if (company.digitalPresence) {
    const websiteText = company.digitalPresence.website?.title?.toLowerCase() || ''
    const newsText = (company.news || []).map(n => `${n.title} ${n.snippet}`).join(' ').toLowerCase()
    const combinedText = `${websiteText} ${newsText}`
    
    const matchedKeywords = product.keywords.filter(kw => 
      combinedText.includes(kw.toLowerCase())
    )
    
    if (matchedKeywords.length > 0) {
      const keywordScore = Math.min(matchedKeywords.length * 5, 20)
      score += keywordScore
      reasoning.push(`Encontradas ${matchedKeywords.length} menções relevantes: ${matchedKeywords.slice(0, 3).join(', ')}`)
      evidence.push(`Keywords detectadas: ${matchedKeywords.join(', ')}`)
    }
  }

  // 4. Sinais de expansão/crescimento (peso 15)
  const newsText = (company.news || []).map(n => `${n.title} ${n.snippet}`).join(' ').toLowerCase()
  const growthKeywords = ['expansão', 'crescimento', 'investimento', 'nova filial', 'lança', 'anuncia', 'contrato']
  const hasGrowthSignals = growthKeywords.some(kw => newsText.includes(kw))
  
  if (hasGrowthSignals) {
    score += 15
    reasoning.push('Empresa em fase de crescimento/expansão (momento ideal)')
    evidence.push('Sinais de crescimento detectados em notícias')
  }

  // 5. Complexidade operacional (peso 10)
  const hasMultipleLocations = (company.qsa?.length || 0) > 3
  const hasSecondaryCNAEs = (company.secondaryActivities?.length || 0) > 2
  
  if (hasMultipleLocations || hasSecondaryCNAEs) {
    score += 10
    reasoning.push('Operação complexa que se beneficia de sistemas robustos')
    if (hasMultipleLocations) evidence.push(`${company.qsa?.length} pessoas no QSA`)
    if (hasSecondaryCNAEs) evidence.push(`${company.secondaryActivities?.length} atividades secundárias`)
  }

  // Limitar entre 0-100
  score = Math.max(0, Math.min(100, score))

  return { score, reasoning, evidence }
}

/**
 * Gerar pitch personalizado
 */
function generatePitch(product: Product, company: CompanyData, fit: { score: number; reasoning: string[]; evidence: string[] }): string {
  const companyName = company.tradeName || company.name
  
  // Templates baseados no tipo de produto
  const templates: Record<string, (c: string) => string> = {
    'ERP': (c) => `${c} pode unificar gestão de todas as áreas (financeiro, estoque, vendas) em uma única plataforma, eliminando planilhas e retrabalho.`,
    'Logística': (c) => `Com ${product.name}, ${c} pode otimizar rotas, reduzir custos de frete em até 25% e ter visibilidade total da operação.`,
    'Business Intelligence': (c) => `${c} pode tomar decisões baseadas em dados reais, com dashboards personalizados e análise preditiva.`,
    'CRM & Vendas': (c) => `${c} pode aumentar conversão em 40% com prospecção inteligente e automação de follow-up.`,
    'Recursos Humanos': (c) => `${c} pode automatizar folha, ponto e benefícios, reduzindo 70% do trabalho manual do RH.`,
  }
  
  const template = templates[product.category] || ((c) => `${c} pode se beneficiar de ${product.name} para ${product.description.toLowerCase()}.`)
  
  return template(companyName)
}

/**
 * Analisar momento de compra
 */
function analyzeBuyingMoment(company: CompanyData): {
  moment: 'IDEAL' | 'BOM' | 'REGULAR' | 'BAIXO'
  reasoning: string[]
} {
  const reasoning: string[] = []
  let score = 50
  
  // Análise de notícias recentes
  if (company.news && company.news.length > 0) {
    score += 10
    reasoning.push(`${company.news.length} notícias recentes encontradas`)
    
    const growthNews = company.news.filter(n => 
      /expansão|crescimento|investimento|contrato|lança/.test(`${n.title} ${n.snippet}`.toLowerCase())
    )
    
    if (growthNews.length > 0) {
      score += 20
      reasoning.push(`Sinais de crescimento: "${growthNews[0].title}"`)
    }
  } else {
    score -= 10
    reasoning.push('Sem notícias recentes (pode indicar baixa atividade)')
  }
  
  // Presença digital
  if (company.digitalPresence?.website) {
    score += 10
    reasoning.push('Presença digital estabelecida')
  }
  
  if (company.digitalPresence?.marketplaces && company.digitalPresence.marketplaces.length > 0) {
    score += 15
    reasoning.push('Ativa em marketplaces (busca inovação)')
  }
  
  // Capital social
  if (company.capital && company.capital > 100000) {
    score += 10
    reasoning.push('Capital social adequado para investimento')
  }
  
  // Determinar momento
  let moment: 'IDEAL' | 'BOM' | 'REGULAR' | 'BAIXO'
  if (score >= 80) moment = 'IDEAL'
  else if (score >= 65) moment = 'BOM'
  else if (score >= 50) moment = 'REGULAR'
  else moment = 'BAIXO'
  
  return { moment, reasoning }
}

/**
 * Identificar decisor e abordagem
 */
function identifyDecisionMaker(company: CompanyData): {
  name: string
  role: string
  approach: string
} | undefined {
  if (!company.qsa || company.qsa.length === 0) return undefined
  
  // Priorizar sócios-administradores
  const admin = company.qsa.find(p => 
    p.qual.toLowerCase().includes('administrador') || 
    p.qual === '49-Sócio-Administrador'
  )
  
  if (admin) {
    return {
      name: admin.nome,
      role: admin.qual,
      approach: `Contato direto com ${admin.nome} (decisor final). Agendar reunião executiva focada em ROI e resultados.`
    }
  }
  
  // Fallback: primeiro sócio
  const socio = company.qsa[0]
  return {
    name: socio.nome,
    role: socio.qual,
    approach: `Contato com ${socio.nome}. Enviar material técnico e solicitar reunião.`
  }
}

/**
 * FUNÇÃO PRINCIPAL: Analisar vendor match
 */
export async function analyzeVendorMatch(company: CompanyData): Promise<VendorMatchResult> {
  console.log('[VendorMatch] 🎯 Analisando fit para:', company.name)
  
  // Calcular fit de cada produto
  const matches: ProductMatch[] = []
  
  for (const product of ALL_PRODUCTS) {
    const fit = calculateFitScore(product, company)
    
    // Só incluir se fit > 40 (relevante)
    if (fit.score >= 40) {
      const pitch = generatePitch(product, company, fit)
      
      matches.push({
        product,
        fitScore: fit.score,
        reasoning: fit.reasoning,
        evidence: fit.evidence,
        pitch,
        estimatedBudget: product.averageTicket,
        priority: fit.score >= 80 ? 'ALTA' : fit.score >= 65 ? 'MEDIA' : 'BAIXA'
      })
    }
  }
  
  // Ordenar por fit score
  matches.sort((a, b) => b.fitScore - a.fitScore)
  
  // Score geral (média ponderada dos top 3)
  const top3 = matches.slice(0, 3)
  const overallScore = top3.length > 0
    ? Math.round(top3.reduce((sum, m) => sum + m.fitScore, 0) / top3.length)
    : 0
  
  // Momento de compra
  const { moment: buyingMoment, reasoning: momentReasoning } = analyzeBuyingMoment(company)
  
  // Decisor
  const decisionMaker = identifyDecisionMaker(company)
  
  // Próximos passos
  const nextSteps: string[] = []
  if (matches.length > 0) {
    nextSteps.push(`1. Contatar ${decisionMaker?.name || 'decisor'} via LinkedIn/Email`)
    nextSteps.push(`2. Apresentar ${matches[0].product.name} (fit ${matches[0].fitScore}%)`)
    nextSteps.push(`3. Agendar demo focada em: ${matches[0].reasoning[0]}`)
    if (buyingMoment === 'IDEAL') {
      nextSteps.push(`4. ⚡ URGENTE: Momento ideal para abordagem!`)
    }
  }
  
  console.log('[VendorMatch] ✅ Análise concluída:',{
    overallScore,
    buyingMoment,
    matchesFound: matches.length
  })
  
  return {
    companyName: company.name,
    cnpj: company.cnpj,
    overallScore,
    buyingMoment,
    matches,
    topRecommendation: matches[0] || null,
    nextSteps,
    decisionMaker
  }
}

