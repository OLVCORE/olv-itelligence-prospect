/**
 * Engine de Scoring Robusto - 6 Pilares
 * Baseado nas regras de negócio do OLV Intelligence
 */

export interface ScoringInput {
  // Dados cadastrais
  situacao: string
  abertura: string // Data de abertura (DD/MM/YYYY)
  capitalSocial: number
  porte: string
  
  // Regime tributário
  simplesOptante: boolean
  meiOptante: boolean
  
  // Presença digital
  temWebsite: boolean
  temNoticias: boolean
  noticiasRecentes: number // Últimos 3 meses
  
  // Atividade econômica
  atividadePrincipal: string
  
  // Score da IA (se disponível)
  scoreIA?: number
}

export interface ScoringOutput {
  scoreTotal: number // 0-100
  breakdown: {
    saudeFinanceira: { score: number; peso: number; detalhes: string }
    maturidadeDigital: { score: number; peso: number; detalhes: string }
    tempoMercado: { score: number; peso: number; detalhes: string }
    porteCapacidade: { score: number; peso: number; detalhes: string }
    atividadeRecente: { score: number; peso: number; detalhes: string }
    analiseIA: { score: number; peso: number; detalhes: string }
  }
  classificacao: string // "Excelente" | "Bom" | "Regular" | "Baixo"
  justificativa: string
}

export function calculatePropensityScore(input: ScoringInput): ScoringOutput {
  console.log('[Scoring Engine] 🎯 Calculando score com 6 pilares...')

  // Pilar 1: Saúde Financeira (peso 30%)
  const saudeFinanceira = calculateSaudeFinanceira(input)

  // Pilar 2: Maturidade Digital (peso 25%)
  const maturidadeDigital = calculateMaturidadeDigital(input)

  // Pilar 3: Tempo de Mercado (peso 15%)
  const tempoMercado = calculateTempoMercado(input)

  // Pilar 4: Porte e Capacidade (peso 15%)
  const porteCapacidade = calculatePorteCapacidade(input)

  // Pilar 5: Atividade Recente (peso 10%)
  const atividadeRecente = calculateAtividadeRecente(input)

  // Pilar 6: Análise IA (peso 5% - complementar)
  const analiseIA = calculateAnaliseIA(input)

  // Score total ponderado
  const scoreTotal = Math.round(
    saudeFinanceira.score * saudeFinanceira.peso +
    maturidadeDigital.score * maturidadeDigital.peso +
    tempoMercado.score * tempoMercado.peso +
    porteCapacidade.score * porteCapacidade.peso +
    atividadeRecente.score * atividadeRecente.peso +
    analiseIA.score * analiseIA.peso
  )

  // Classificação
  let classificacao = 'Baixo Potencial'
  if (scoreTotal >= 80) classificacao = 'Alto Potencial'
  else if (scoreTotal >= 60) classificacao = 'Bom Potencial'
  else if (scoreTotal >= 40) classificacao = 'Potencial Moderado'

  // Justificativa
  const justificativa = generateJustification(scoreTotal, {
    saudeFinanceira,
    maturidadeDigital,
    tempoMercado,
    porteCapacidade,
    atividadeRecente,
    analiseIA,
  })

  console.log('[Scoring Engine] ✅ Score calculado:', scoreTotal)

  return {
    scoreTotal,
    breakdown: {
      saudeFinanceira,
      maturidadeDigital,
      tempoMercado,
      porteCapacidade,
      atividadeRecente,
      analiseIA,
    },
    classificacao,
    justificativa,
  }
}

// ==================== PILARES ====================

function calculateSaudeFinanceira(input: ScoringInput) {
  let score = 50 // Base

  // Situação ativa é fundamental
  if (input.situacao === 'ATIVA') {
    score += 30
  } else {
    score = 10 // Penalidade severa
  }

  // Capital social adequado
  if (input.capitalSocial > 500000) score += 15
  else if (input.capitalSocial > 100000) score += 10
  else if (input.capitalSocial > 50000) score += 5
  else if (input.capitalSocial < 5000) score -= 10

  // Regime tributário regular
  if (input.simplesOptante) score += 5 // Regularizado

  score = Math.min(100, Math.max(0, score))

  const detalhes = [
    `Situação: ${input.situacao}`,
    `Capital: R$ ${input.capitalSocial.toLocaleString('pt-BR')}`,
    input.simplesOptante ? 'Optante Simples' : 'Lucro Presumido/Real',
  ].join(' • ')

  return { score, peso: 0.30, detalhes }
}

function calculateMaturidadeDigital(input: ScoringInput) {
  let score = 0

  if (input.temWebsite) score += 50
  if (input.temNoticias) score += 30
  if (input.noticiasRecentes > 0) score += 20

  score = Math.min(100, Math.max(0, score))

  const detalhes = [
    input.temWebsite ? '✓ Website' : '✗ Sem website',
    input.temNoticias ? `✓ ${input.noticiasRecentes} notícia(s)` : '✗ Sem notícias',
  ].join(' • ')

  return { score, peso: 0.25, detalhes }
}

function calculateTempoMercado(input: ScoringInput) {
  let score = 50 // Base

  try {
    const [dia, mes, ano] = input.abertura.split('/').map(Number)
    const dataAbertura = new Date(ano, mes - 1, dia)
    const anosAtividade = (Date.now() - dataAbertura.getTime()) / (1000 * 60 * 60 * 24 * 365)

    if (anosAtividade < 1) score = 30 // Muito nova
    else if (anosAtividade < 2) score = 50
    else if (anosAtividade < 5) score = 70
    else if (anosAtividade < 10) score = 85
    else score = 100 // Consolidada

    const detalhes = `${Math.floor(anosAtividade)} anos de mercado`
    return { score, peso: 0.15, detalhes }
  } catch {
    return { score: 50, peso: 0.15, detalhes: 'Data de abertura inválida' }
  }
}

function calculatePorteCapacidade(input: ScoringInput) {
  let score = 50

  const porteUpper = input.porte?.toUpperCase() || ''

  if (input.meiOptante) score = 40
  else if (porteUpper.includes('MICRO')) score = 50
  else if (porteUpper.includes('PEQUENO') || porteUpper.includes('PEQUENA')) score = 65
  else if (porteUpper.includes('MÉDIO') || porteUpper.includes('MEDIA')) score = 80
  else if (porteUpper.includes('GRANDE')) score = 95
  else score = 60 // Não informado

  const detalhes = input.meiOptante ? 'MEI' : input.porte || 'Não informado'
  
  return { score, peso: 0.15, detalhes }
}

function calculateAtividadeRecente(input: ScoringInput) {
  let score = 0

  if (input.noticiasRecentes >= 3) score = 100
  else if (input.noticiasRecentes >= 2) score = 75
  else if (input.noticiasRecentes >= 1) score = 50
  else if (input.temNoticias) score = 25
  else score = 0

  const detalhes = `${input.noticiasRecentes} notícia(s) recentes`
  
  return { score, peso: 0.10, detalhes }
}

function calculateAnaliseIA(input: ScoringInput) {
  const score = input.scoreIA ?? 50
  const detalhes = input.scoreIA 
    ? `Score IA: ${input.scoreIA}/100` 
    : 'IA não utilizada'
  
  return { score, peso: 0.05, detalhes }
}

// ==================== HELPERS ====================

function generateJustification(
  scoreTotal: number,
  breakdown: Record<string, { score: number; peso: number; detalhes: string }>
): string {
  const topPillars = Object.entries(breakdown)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 2)
    .map(([key, val]) => ({
      name: key,
      score: val.score,
      detalhes: val.detalhes,
    }))

  if (scoreTotal >= 80) {
    return `Empresa de alto potencial (${scoreTotal}/100). Destaque em ${topPillars[0].name} (${topPillars[0].score}) e ${topPillars[1].name} (${topPillars[1].score}).`
  } else if (scoreTotal >= 60) {
    return `Empresa com bom potencial (${scoreTotal}/100). Pontos fortes: ${topPillars[0].name} (${topPillars[0].score}).`
  } else if (scoreTotal >= 40) {
    return `Potencial moderado (${scoreTotal}/100). Requer validação em ${topPillars.map(p => p.name).join(' e ')}.`
  } else {
    return `Baixo potencial identificado (${scoreTotal}/100). Revisar viabilidade comercial.`
  }
}

