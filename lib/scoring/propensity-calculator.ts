/**
 * MÓDULO A - Score de Propensão (Explicável)
 * Conforme Prompt Master: ponderação multi-critério com evidências
 */

import { Evidence } from '@/lib/types/evidence'

export interface PropensityBreakdown {
  peso: number       // 0-1 (ex: 0.25 = 25%)
  valor: number      // 0-100
  contribuicao: number // peso × valor
}

export interface PropensityScore {
  overall: number // 0-100 (soma das contribuições)
  breakdown: {
    receita_porte: PropensityBreakdown
    presenca_digital: PropensityBreakdown
    noticias: PropensityBreakdown
    stack_totvs: PropensityBreakdown
    regulatorios: PropensityBreakdown
    setor_benchmark: PropensityBreakdown
  }
  sinais: {
    positivos: string[]
    negativos: string[]
  }
  evidences: Evidence[]
}

/**
 * Calcular score de Receita/Porte
 */
function calculateReceitaPorteScore(params: {
  capital?: number
  porte?: string
  funcionarios?: number
}): { valor: number, sinais: string[] } {
  let valor = 50 // Base
  const sinais: string[] = []

  // Capital social
  if (params.capital) {
    if (params.capital >= 1000000) {
      valor += 30
      sinais.push(`Capital social elevado (${params.capital.toLocaleString('pt-BR')})`)
    } else if (params.capital >= 100000) {
      valor += 15
      sinais.push(`Capital social adequado (${params.capital.toLocaleString('pt-BR')})`)
    } else {
      valor += 5
      sinais.push(`Capital social modesto (${params.capital.toLocaleString('pt-BR')})`)
    }
  }

  // Porte
  if (params.porte) {
    const porteUpper = params.porte.toUpperCase()
    if (porteUpper.includes('GRANDE')) {
      valor += 20
      sinais.push('Grande porte (maior capacidade de investimento)')
    } else if (porteUpper.includes('MEDIO') || porteUpper.includes('MÉDIO')) {
      valor += 15
      sinais.push('Médio porte')
    } else if (porteUpper.includes('PEQUENO') || porteUpper.includes('EPP')) {
      valor += 10
      sinais.push('Pequeno porte')
    }
  }

  // Funcionários
  if (params.funcionarios) {
    if (params.funcionarios >= 500) {
      sinais.push(`${params.funcionarios}+ funcionários (estrutura robusta)`)
    } else if (params.funcionarios >= 50) {
      sinais.push(`${params.funcionarios} funcionários`)
    }
  }

  return { valor: Math.min(100, valor), sinais }
}

/**
 * Calcular score de Presença Digital
 */
function calculatePresencaDigitalScore(params: {
  website?: { url: string, score?: number } | null
  redesSociais?: Record<string, any>
  marketplaces?: any[]
  jusbrasil?: any
}): { valor: number, sinais: string[] } {
  let valor = 0
  const sinais: string[] = []

  // Website validado
  if (params.website?.url) {
    const websiteScore = params.website.score || 50
    if (websiteScore >= 60) {
      valor += 40
      sinais.push('Website oficial validado (alta confiança)')
    } else if (websiteScore >= 40) {
      valor += 25
      sinais.push('Website identificado (média confiança)')
    } else {
      valor += 10
      sinais.push('Website não validado oficialmente')
    }
  } else {
    sinais.push('⚠️ Website não encontrado')
  }

  // Redes sociais
  const redesCount = Object.keys(params.redesSociais || {}).length
  if (redesCount >= 3) {
    valor += 30
    sinais.push(`${redesCount} redes sociais ativas`)
  } else if (redesCount >= 1) {
    valor += 15
    sinais.push(`${redesCount} rede(s) social(is)`)
  } else {
    sinais.push('⚠️ Sem redes sociais validadas')
  }

  // Marketplaces B2B
  if (params.marketplaces && params.marketplaces.length > 0) {
    valor += 15
    sinais.push(`Presente em ${params.marketplaces.length} marketplace(s) B2B`)
  }

  // Jusbrasil
  if (params.jusbrasil?.url) {
    valor += 15
    sinais.push('Dados regulatórios disponíveis (Jusbrasil)')
  }

  return { valor: Math.min(100, valor), sinais }
}

/**
 * Calcular score de Notícias
 */
function calculateNoticiasScore(noticias: any[]): { valor: number, sinais: string[] } {
  let valor = 0
  const sinais: string[] = []

  if (!noticias || noticias.length === 0) {
    sinais.push('⚠️ Sem notícias recentes (> 12 meses)')
    return { valor: 0, sinais }
  }

  // Quantidade
  if (noticias.length >= 3) {
    valor += 40
    sinais.push(`${noticias.length} notícias recentes encontradas`)
  } else if (noticias.length >= 1) {
    valor += 25
    sinais.push(`${noticias.length} notícia(s) recente(s)`)
  }

  // Recência (verificar datas)
  const now = new Date()
  const recentNews = noticias.filter(n => {
    if (!n.date) return false
    const newsDate = new Date(n.date)
    const monthsDiff = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsDiff <= 6 // Últimos 6 meses
  })

  if (recentNews.length > 0) {
    valor += 30
    sinais.push(`${recentNews.length} notícia(s) nos últimos 6 meses`)
  }

  // Sentimento (se disponível)
  const positiveNews = noticias.filter(n => 
    n.sentiment === 'positive' || 
    /crescimento|expansão|investimento|contrato|lança/.test((n.title || '') + (n.snippet || ''))
  )

  if (positiveNews.length > 0) {
    valor += 30
    sinais.push(`${positiveNews.length} notícia(s) positiva(s) (crescimento/expansão)`)
  }

  return { valor: Math.min(100, valor), sinais }
}

/**
 * Calcular score de Stack/TOTVS
 */
function calculateStackTotvsScore(params: {
  totvs_detected?: boolean
  confidence_score?: number
  produtos?: string[]
}): { valor: number, sinais: string[] } {
  let valor = 0
  const sinais: string[] = []

  if (!params.totvs_detected) {
    sinais.push('⚠️ TOTVS não detectado (oportunidade greenfield)')
    return { valor: 30, sinais } // Score moderado (oportunidade de venda)
  }

  // TOTVS detectado
  const confidence = params.confidence_score || 0
  valor = confidence // Usar confidence_score diretamente

  if (confidence >= 70) {
    sinais.push(`TOTVS detectado (${confidence}% confiança)`)
  } else if (confidence >= 40) {
    sinais.push(`Possível TOTVS (${confidence}% confiança)`)
  }

  // Produtos
  if (params.produtos && params.produtos.length > 0) {
    sinais.push(`Produtos detectados: ${params.produtos.join(', ')}`)
    if (params.produtos.length >= 2) {
      valor += 10 // Múltiplos produtos = maior envolvimento
    }
  }

  return { valor: Math.min(100, valor), sinais }
}

/**
 * Calcular score de Regulatórios
 */
function calculateRegulatoriosScore(params: {
  jusbrasil?: { url: string, processos?: number } | null
  situacao?: string
}): { valor: number, sinais: string[] } {
  let valor = 50 // Base (neutro)
  const sinais: string[] = []

  // Situação cadastral
  if (params.situacao) {
    if (params.situacao === 'ATIVA' || params.situacao === 'Ativo') {
      valor += 30
      sinais.push('Situação cadastral: ATIVA')
    } else {
      valor -= 30
      sinais.push(`⚠️ Situação: ${params.situacao}`)
    }
  }

  // Jusbrasil (processos)
  if (params.jusbrasil) {
    const processos = params.jusbrasil.processos || 0
    if (processos === 0) {
      valor += 20
      sinais.push('Sem processos conhecidos (Jusbrasil)')
    } else if (processos <= 5) {
      valor += 5
      sinais.push(`${processos} processo(s) - baixo risco`)
    } else {
      valor -= 20
      sinais.push(`⚠️ ${processos} processos identificados`)
    }
  }

  return { valor: Math.max(0, Math.min(100, valor)), sinais }
}

/**
 * FUNÇÃO PRINCIPAL: Calcular score de propensão
 */
export function calculatePropensityScore(params: {
  receita: any
  presencaDigital?: any
  noticias?: any[]
  totvsScan?: any
  jusbrasil?: any
}): PropensityScore {
  console.log('[PropensityScore] 🎯 Calculando score de propensão...')

  // Pesos (ajustáveis por feature flag futuramente)
  const PESOS = {
    receita_porte: 0.25,
    presenca_digital: 0.20,
    noticias: 0.15,
    stack_totvs: 0.20,
    regulatorios: 0.10,
    setor_benchmark: 0.10, // Placeholder nesta fase
  }

  // Calcular cada critério
  const receita = calculateReceitaPorteScore({
    capital: params.receita?.capital?.valor,
    porte: params.receita?.identificacao?.porte,
    funcionarios: params.receita?.funcionarios,
  })

  const presenca = calculatePresencaDigitalScore({
    website: params.presencaDigital?.website,
    redesSociais: params.presencaDigital?.redesSociais,
    marketplaces: params.presencaDigital?.marketplaces,
    jusbrasil: params.presencaDigital?.jusbrasil,
  })

  const noticias = calculateNoticiasScore(params.noticias || [])

  const stack = calculateStackTotvsScore({
    totvs_detected: params.totvsScan?.totvs_detected,
    confidence_score: params.totvsScan?.confidence_score,
    produtos: params.totvsScan?.produtos,
  })

  const regulatorios = calculateRegulatoriosScore({
    jusbrasil: params.presencaDigital?.jusbrasil,
    situacao: params.receita?.situacao?.status,
  })

  const setor = { valor: 50, sinais: ['Benchmark de setor (em desenvolvimento)'] } // Placeholder

  // Calcular contribuições
  const breakdown = {
    receita_porte: {
      peso: PESOS.receita_porte,
      valor: receita.valor,
      contribuicao: PESOS.receita_porte * receita.valor,
    },
    presenca_digital: {
      peso: PESOS.presenca_digital,
      valor: presenca.valor,
      contribuicao: PESOS.presenca_digital * presenca.valor,
    },
    noticias: {
      peso: PESOS.noticias,
      valor: noticias.valor,
      contribuicao: PESOS.noticias * noticias.valor,
    },
    stack_totvs: {
      peso: PESOS.stack_totvs,
      valor: stack.valor,
      contribuicao: PESOS.stack_totvs * stack.valor,
    },
    regulatorios: {
      peso: PESOS.regulatorios,
      valor: regulatorios.valor,
      contribuicao: PESOS.regulatorios * regulatorios.valor,
    },
    setor_benchmark: {
      peso: PESOS.setor_benchmark,
      valor: setor.valor,
      contribuicao: PESOS.setor_benchmark * setor.valor,
    },
  }

  // Score geral (soma das contribuições)
  const overall = Math.round(
    Object.values(breakdown).reduce((sum, item) => sum + item.contribuicao, 0)
  )

  // Consolidar sinais
  const todosOsSinais = [
    ...receita.sinais,
    ...presenca.sinais,
    ...noticias.sinais,
    ...stack.sinais,
    ...regulatorios.sinais,
    ...setor.sinais,
  ]

  const positivos = todosOsSinais.filter(s => !s.startsWith('⚠️'))
  const negativos = todosOsSinais.filter(s => s.startsWith('⚠️')).map(s => s.replace('⚠️ ', ''))

  console.log('[PropensityScore] ✅ Score calculado:', overall)
  console.log('[PropensityScore] 📊 Breakdown:', breakdown)
  console.log('[PropensityScore] ✅ Positivos:', positivos.length)
  console.log('[PropensityScore] ⚠️ Negativos:', negativos.length)

  return {
    overall,
    breakdown,
    sinais: {
      positivos,
      negativos,
    },
    evidences: [], // TODO: Adicionar evidências específicas de cada critério
  }
}

/**
 * Determinar faixa do score
 */
export function getPropensityLevel(score: number): {
  level: 'alto' | 'medio' | 'baixo'
  color: string
  label: string
} {
  if (score >= 70) {
    return {
      level: 'alto',
      color: 'text-green-600 bg-green-50 border-green-200',
      label: 'Alto Potencial',
    }
  } else if (score >= 40) {
    return {
      level: 'medio',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      label: 'Potencial Moderado',
    }
  } else {
    return {
      level: 'baixo',
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'Baixo Potencial',
    }
  }
}

