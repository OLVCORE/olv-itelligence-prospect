/**
 * MÓDULO A - Recommendation Engine (Go/No-Go)
 * Conforme Prompt Master: decisão baseada em score + evidências + pontos de atenção
 */

import { Evidence } from '@/lib/types/evidence'

export type DecisionType = 'GO' | 'NO-GO' | 'QUALIFICAR'

export interface AttentionPoint {
  id: string
  text: string
  severity: 'alta' | 'media' | 'baixa'
  action: string
  evidence_ids: string[]
}

export interface Recommendation {
  decision: DecisionType
  justification: string
  evidence_ids: string[]
  confidence: 'high' | 'medium' | 'low'
  attentionPoints: AttentionPoint[]
}

/**
 * Identificar pontos de atenção
 */
export function identifyAttentionPoints(params: {
  websiteValidated: boolean
  websiteScore?: number
  redesSociaisCount: number
  noticiasCount: number
  noticiasRecentes: number // Últimos 6 meses
  jusbrasil?: { url: string, processos?: number } | null
  capital?: number
  porte?: string
  situacao?: string
  totvsDetected?: boolean
}): AttentionPoint[] {
  const points: AttentionPoint[] = []

  // Website não validado
  if (!params.websiteValidated || (params.websiteScore && params.websiteScore < 40)) {
    points.push({
      id: 'website-not-validated',
      text: 'Website não validado oficialmente',
      severity: 'media',
      action: 'Solicitar confirmação manual do domínio ao cliente ou executar nova validação',
      evidence_ids: [],
    })
  }

  // Jusbrasil sem CNPJ oficial
  if (params.jusbrasil?.url && !params.jusbrasil.processos) {
    points.push({
      id: 'jusbrasil-incomplete',
      text: 'Dados do Jusbrasil incompletos ou sem validação oficial',
      severity: 'baixa',
      action: 'Verificar manualmente se empresa está listada corretamente no Jusbrasil',
      evidence_ids: [],
    })
  }

  // Muitos processos
  if (params.jusbrasil?.processos && params.jusbrasil.processos > 10) {
    points.push({
      id: 'many-lawsuits',
      text: `${params.jusbrasil.processos} processos identificados no Jusbrasil`,
      severity: 'alta',
      action: 'Revisar natureza dos processos antes de prosseguir com prospecção',
      evidence_ids: [],
    })
  }

  // Poucas redes sociais
  if (params.redesSociaisCount < 2) {
    points.push({
      id: 'few-social-media',
      text: params.redesSociaisCount === 0 
        ? 'Nenhuma rede social validada' 
        : 'Apenas 1 rede social validada',
      severity: 'baixa',
      action: 'Executar desambiguação social ou confirmar ausência de presença digital',
      evidence_ids: [],
    })
  }

  // Sem notícias recentes
  if (params.noticiasRecentes === 0 && params.noticiasCount === 0) {
    points.push({
      id: 'no-recent-news',
      text: 'Sem notícias recentes (> 12 meses)',
      severity: 'media',
      action: 'Verificar atividade real da empresa antes de abordagem',
      evidence_ids: [],
    })
  }

  // Capital social muito baixo
  if (params.capital && params.capital < 10000 && params.porte !== 'MICRO') {
    points.push({
      id: 'low-capital',
      text: `Capital social baixo (${params.capital.toLocaleString('pt-BR')}) para o porte`,
      severity: 'media',
      action: 'Avaliar capacidade real de investimento em tecnologia',
      evidence_ids: [],
    })
  }

  // Situação irregular
  if (params.situacao && params.situacao !== 'ATIVA' && params.situacao !== 'Ativo') {
    points.push({
      id: 'irregular-status',
      text: `Situação cadastral irregular: ${params.situacao}`,
      severity: 'alta',
      action: 'BLOQUEADOR: Não prosseguir até regularização',
      evidence_ids: [],
    })
  }

  return points
}

/**
 * Gerar recomendação Go/No-Go
 */
export function generateRecommendation(params: {
  score: number
  websiteValidated: boolean
  websiteScore?: number
  noticiasRecentes: number
  attentionPoints: AttentionPoint[]
  totvsDetected?: boolean
  situacao?: string
}): Recommendation {
  const alertasCriticos = params.attentionPoints.filter(p => p.severity === 'alta')
  const alertasMedias = params.attentionPoints.filter(p => p.severity === 'media')

  // Lógica de decisão
  let decision: DecisionType
  let justification: string
  let confidence: Recommendation['confidence']

  // NO-GO (bloqueadores)
  if (alertasCriticos.length > 0) {
    decision = 'NO-GO'
    justification = `Empresa possui ${alertasCriticos.length} alerta(s) crítico(s) que bloqueiam a prospecção: ${alertasCriticos.map(a => a.text).join(', ')}.`
    confidence = 'high'
  }
  // NO-GO (score muito baixo)
  else if (params.score < 40) {
    decision = 'NO-GO'
    justification = `Score de propensão muito baixo (${params.score}/100). Empresa não apresenta sinais fortes de fit comercial ou capacidade de investimento no momento.`
    confidence = 'high'
  }
  // QUALIFICAR (score médio ou alertas médios)
  else if (params.score < 70 || alertasMedias.length >= 2) {
    decision = 'QUALIFICAR'
    justification = `Empresa apresenta potencial moderado (score ${params.score}/100), mas requer qualificação adicional. ${
      alertasMedias.length > 0 
        ? `${alertasMedias.length} ponto(s) de atenção identificado(s).` 
        : 'Executar validações adicionais antes de abordagem.'
    }`
    confidence = alertasMedias.length === 0 ? 'high' : 'medium'
  }
  // GO (score alto, poucas restrições)
  else {
    decision = 'GO'
    justification = `Empresa com excelente fit comercial (score ${params.score}/100). ${
      params.websiteValidated ? 'Presença digital validada.' : ''
    } ${
      params.noticiasRecentes > 0 ? `${params.noticiasRecentes} notícia(s) recente(s).` : ''
    } ${
      params.totvsDetected ? 'TOTVS detectado (oportunidade de upgrade/expansão).' : 'Oportunidade greenfield.'
    } Recomendação: prosseguir com abordagem comercial.`
    confidence = 'high'
  }

  console.log('[Recommendation] ✅ Decisão:', decision)
  console.log('[Recommendation] 📝 Justificativa:', justification)

  return {
    decision,
    justification,
    evidence_ids: [], // TODO: Linkar evidências específicas
    confidence,
    attentionPoints: params.attentionPoints,
  }
}

/**
 * Gerar ações sugeridas baseado na recomendação
 */
export function generateSuggestedActions(params: {
  decision: DecisionType
  leadTemperature?: 'frio' | 'morno' | 'quente'
  totvsDetected?: boolean
  decisor?: { name: string, role: string }
  attentionPoints: AttentionPoint[]
}): Array<{
  id: string
  text: string
  priority: 'alta' | 'media' | 'baixa'
  actionable: boolean
  handler?: string
}> {
  const actions: ReturnType<typeof generateSuggestedActions> = []

  // GO + TOTVS Detectado
  if (params.decision === 'GO' && params.totvsDetected) {
    actions.push({
      id: 'contact-decisor',
      text: params.decisor 
        ? `Contatar ${params.decisor.name} (${params.decisor.role}) via LinkedIn/Email`
        : 'Identificar e contatar decisor principal',
      priority: 'alta',
      actionable: true,
      handler: 'OPEN_LINKEDIN',
    })
    actions.push({
      id: 'propose-upgrade',
      text: 'Apresentar proposta de upgrade/expansão de produtos TOTVS',
      priority: 'alta',
      actionable: true,
    })
    actions.push({
      id: 'schedule-demo',
      text: 'Agendar demo focada em ROI e benefícios específicos do setor',
      priority: 'alta',
      actionable: false,
    })
  }
  // GO sem TOTVS
  else if (params.decision === 'GO' && !params.totvsDetected) {
    actions.push({
      id: 'contact-decisor',
      text: params.decisor 
        ? `Contatar ${params.decisor.name} (${params.decisor.role}) para mapeamento de necessidades`
        : 'Identificar decisor de TI/Operações',
      priority: 'alta',
      actionable: true,
    })
    actions.push({
      id: 'diagnostic',
      text: 'Executar diagnóstico completo de processos e sistemas atuais',
      priority: 'alta',
      actionable: false,
    })
    actions.push({
      id: 'present-cases',
      text: 'Apresentar cases de sucesso do setor',
      priority: 'media',
      actionable: false,
    })
  }
  // QUALIFICAR
  else if (params.decision === 'QUALIFICAR') {
    // Ações baseadas nos pontos de atenção
    const acoesPorAtencao = params.attentionPoints.map(point => ({
      id: point.id,
      text: point.action,
      priority: point.severity === 'alta' ? 'alta' as const : point.severity === 'media' ? 'media' as const : 'baixa' as const,
      actionable: true,
    }))

    actions.push(...acoesPorAtencao.slice(0, 3))

    // Ação genérica se não houver pontos de atenção
    if (actions.length === 0) {
      actions.push({
        id: 'validate-presence',
        text: 'Validar presença digital (redes sociais e website)',
        priority: 'media',
        actionable: true,
        handler: 'EXECUTE_DISAMBIGUATION',
      })
      actions.push({
        id: 'find-news',
        text: 'Buscar notícias mais recentes (últimos 6 meses)',
        priority: 'media',
        actionable: true,
        handler: 'EXECUTE_DEEP_SCAN',
      })
      actions.push({
        id: 'totvs-scan',
        text: 'Executar scan TOTVS lite para identificar tecnografia',
        priority: 'baixa',
        actionable: true,
        handler: 'EXECUTE_TOTVS_SCAN',
      })
    }
  }
  // NO-GO
  else {
    actions.push({
      id: 'wait-signals',
      text: 'Aguardar sinais mais fortes (notícias positivas, eventos, expansão)',
      priority: 'baixa',
      actionable: false,
    })
    actions.push({
      id: 'monitor-quarterly',
      text: 'Monitorar empresa trimestralmente para mudanças',
      priority: 'baixa',
      actionable: true,
      handler: 'CREATE_ALERT',
    })
    actions.push({
      id: 'verify-status',
      text: 'Verificar regularização da situação cadastral',
      priority: params.attentionPoints.some(p => p.id === 'irregular-status') ? 'alta' : 'baixa',
      actionable: false,
    })
  }

  return actions.slice(0, 3) // Máximo 3 ações
}

