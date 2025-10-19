/**
 * MÓDULO A - Insights Generator (IA Explicável)
 * Conforme Prompt Master: insights objetivos sempre com evidências
 */

import { Evidence } from '@/lib/types/evidence'
import OpenAI from 'openai'

export interface AIInsight {
  id: string
  text: string
  evidence_ids: string[]
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Gerar insights executivos com IA explicável
 */
export async function generateExecutiveInsights(params: {
  company: {
    name: string
    cnpj: string
    porte?: string
    capital?: number
  }
  evidences: Evidence[]
  noticias?: Array<{ title: string, snippet: string, date?: string }>
  presencaDigital?: any
  totvsDetected?: boolean
  maxInsights?: number
}): Promise<AIInsight[]> {
  const { company, evidences, noticias, presencaDigital, totvsDetected, maxInsights = 5 } = params

  console.log('[InsightsGenerator] 🧠 Gerando insights para:', company.name)

  // Se não tiver OpenAI configurada, gerar insights baseados em regras
  if (!process.env.OPENAI_API_KEY) {
    console.log('[InsightsGenerator] ⚠️ OpenAI não configurada, usando insights baseados em regras')
    return generateRuleBasedInsights(params)
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Preparar contexto com evidências
    const context = prepareContext(params)

    // Prompt explicável
    const prompt = `Você é um analista de prospecção B2B. Analise as evidências fornecidas e gere ${maxInsights} insights executivos objetivos sobre a empresa "${company.name}".

REGRAS CRÍTICAS:
- Cada insight DEVE citar explicitamente a evidência usada
- NÃO invente dados que não estão nas evidências
- Se não houver evidência, não infira além do razoável
- Seja objetivo e acionável (útil para decisão C-level)

EVIDÊNCIAS DISPONÍVEIS:
${context}

Retorne um JSON array com formato:
[
  {
    "text": "Insight objetivo baseado em evidência X",
    "evidence_reference": "Nome da evidência citada",
    "confidence": "high" | "medium" | "low"
  },
  ...
]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de prospecção B2B especializado em empresas brasileiras. Responda sempre em português brasileiro, seja objetivo e cite evidências.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Baixa temperatura para respostas mais determinísticas
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia da OpenAI')
    }

    const result = JSON.parse(content)
    const insights: AIInsight[] = (result.insights || result).slice(0, maxInsights).map((item: any, index: number) => ({
      id: `ai-insight-${index + 1}`,
      text: item.text,
      evidence_ids: findMatchingEvidences(item.evidence_reference || item.text, evidences),
      confidence: item.confidence || 'medium',
    }))

    console.log('[InsightsGenerator] ✅ Insights gerados:', insights.length)
    return insights

  } catch (error: any) {
    console.error('[InsightsGenerator] ❌ Erro na IA:', error.message)
    // Fallback para insights baseados em regras
    return generateRuleBasedInsights(params)
  }
}

/**
 * Preparar contexto com evidências para IA
 */
function prepareContext(params: {
  company: any
  evidences: Evidence[]
  noticias?: any[]
  presencaDigital?: any
  totvsDetected?: boolean
}): string {
  const lines: string[] = []

  // Dados cadastrais
  lines.push(`EMPRESA: ${params.company.name}`)
  lines.push(`CNPJ: ${params.company.cnpj}`)
  if (params.company.porte) lines.push(`PORTE: ${params.company.porte}`)
  if (params.company.capital) lines.push(`CAPITAL SOCIAL: R$ ${params.company.capital.toLocaleString('pt-BR')}`)

  // Presença Digital
  if (params.presencaDigital?.website) {
    lines.push(`WEBSITE: ${params.presencaDigital.website.url} (validado)`)
  }
  const redesCount = Object.keys(params.presencaDigital?.redesSociais || {}).length
  if (redesCount > 0) {
    lines.push(`REDES SOCIAIS: ${redesCount} plataforma(s) ativas`)
  }

  // Notícias
  if (params.noticias && params.noticias.length > 0) {
    lines.push(`\nNOTÍCIAS RECENTES:`)
    params.noticias.slice(0, 3).forEach((n, i) => {
      lines.push(`${i + 1}. "${n.title}" - ${n.date || 'sem data'}`)
      if (n.snippet) lines.push(`   ${n.snippet.substring(0, 100)}...`)
    })
  }

  // TOTVS
  if (params.totvsDetected) {
    lines.push(`\nTOTVS DETECTADO: Sim (oportunidade de upgrade/expansão)`)
  } else {
    lines.push(`\nTOTVS DETECTADO: Não (oportunidade greenfield)`)
  }

  return lines.join('\n')
}

/**
 * Encontrar evidências que correspondem ao texto
 */
function findMatchingEvidences(text: string, evidences: Evidence[]): string[] {
  // Buscar evidências que tenham snippet relacionado ao texto do insight
  const textLower = text.toLowerCase()
  const matching = evidences.filter(e => {
    if (!e.snippet) return false
    return textLower.includes(e.snippet.toLowerCase().substring(0, 30)) ||
           e.snippet.toLowerCase().includes(textLower.substring(0, 30))
  })

  return matching.slice(0, 2).map(e => e.id) // Máximo 2 evidências por insight
}

/**
 * Gerar insights baseados em regras (fallback sem IA)
 */
function generateRuleBasedInsights(params: {
  company: any
  evidences: Evidence[]
  noticias?: any[]
  presencaDigital?: any
  totvsDetected?: boolean
}): AIInsight[] {
  const insights: AIInsight[] = []

  // Insight 1: Presença Digital
  const websiteValidated = params.presencaDigital?.website?.url
  const redesCount = Object.keys(params.presencaDigital?.redesSociais || {}).length

  if (websiteValidated && redesCount >= 2) {
    insights.push({
      id: 'rule-1',
      text: `Empresa possui presença digital estabelecida com website validado e ${redesCount} redes sociais ativas, indicando maturidade digital.`,
      evidence_ids: [],
      confidence: 'high',
    })
  } else if (!websiteValidated) {
    insights.push({
      id: 'rule-1',
      text: 'Presença digital limitada - website não validado oficialmente. Requer qualificação adicional.',
      evidence_ids: [],
      confidence: 'medium',
    })
  }

  // Insight 2: Notícias e Atividade
  if (params.noticias && params.noticias.length > 0) {
    const positiveNews = params.noticias.filter(n => 
      /crescimento|expansão|investimento|contrato|lança/.test((n.title + n.snippet).toLowerCase())
    )
    if (positiveNews.length > 0) {
      insights.push({
        id: 'rule-2',
        text: `Empresa demonstra atividade comercial com ${params.noticias.length} notícia(s) recente(s), incluindo sinais de crescimento/expansão.`,
        evidence_ids: [],
        confidence: 'high',
      })
    } else {
      insights.push({
        id: 'rule-2',
        text: `${params.noticias.length} notícia(s) encontrada(s), porém sem sinais claros de expansão ou investimento recente.`,
        evidence_ids: [],
        confidence: 'medium',
      })
    }
  } else {
    insights.push({
      id: 'rule-2',
      text: 'Sem notícias recentes (últimos 12 meses) - empresa pode estar com baixa visibilidade ou atividade limitada.',
      evidence_ids: [],
      confidence: 'low',
    })
  }

  // Insight 3: TOTVS e Tecnografia
  if (params.totvsDetected) {
    insights.push({
      id: 'rule-3',
      text: 'TOTVS detectado na empresa - excelente oportunidade para abordagem de upgrade, módulos adicionais ou renovação de licenças.',
      evidence_ids: [],
      confidence: 'high',
    })
  } else {
    insights.push({
      id: 'rule-3',
      text: 'TOTVS não detectado - oportunidade greenfield para apresentação de soluções e ganho de market share.',
      evidence_ids: [],
      confidence: 'medium',
    })
  }

  // Insight 4: Porte e Capacidade
  if (params.company.capital && params.company.capital >= 500000) {
    insights.push({
      id: 'rule-4',
      text: `Capital social de R$ ${params.company.capital.toLocaleString('pt-BR')} indica capacidade de investimento em tecnologia e projetos de maior porte.`,
      evidence_ids: [],
      confidence: 'high',
    })
  } else if (params.company.capital && params.company.capital < 50000) {
    insights.push({
      id: 'rule-4',
      text: 'Capital social modesto - focar em soluções de menor ticket ou modelos SaaS com mensalidades acessíveis.',
      evidence_ids: [],
      confidence: 'medium',
    })
  }

  return insights.slice(0, params.maxInsights || 5)
}

