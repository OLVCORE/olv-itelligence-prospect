/**
 * TOTVS Lite Detection Service
 * Detecção de tecnografia TOTVS por empresa (preview, sem persistência)
 * Evidências auditáveis, temperatura do lead, recomendações e pitches
 */

import { searchCompanyWebsite } from '@/lib/search/orchestrator'

export interface TotvsLiteResult {
  totvs_detected: boolean
  produtos: string[] // ['Protheus','Fluig','RM','Datasul','Logix','Microsiga']
  confidence_score: number // 0–100 (A:+50, B:+25, C:+10; cap 100)
  evidences: Array<{
    source: 'website' | 'cse'
    url: string
    snippet?: string
    strength: 'A' | 'B' | 'C'
  }>
  last_scanned_at: string
  lead_temperature: 'frio' | 'morno' | 'quente'
  recommendations: string[]
  pitches: {
    frio: string[]
    morno: string[]
    quente: string[]
  }
}

// Mapeamento de termos para produtos TOTVS
const PRODUCT_TERMS = {
  'Protheus': ['protheus', 'protheus12', 'advpl', 'totvs protheus'],
  'Fluig': ['fluig', 'workflow', 'bpm', 'totvs fluig'],
  'RM': ['rm', 'rm fiscal', 'rm gestão', 'totvs rm'],
  'Datasul': ['datasul', 'totvs datasul'],
  'Logix': ['logix', 'logix erp', 'totvs logix'],
  'Microsiga': ['microsiga', 'totvs microsiga']
}

const TOTVS_KEYWORDS = [
  'totvs', 'protheus', 'fluig', 'rm', 'datasul', 'logix', 'microsiga',
  'advpl', 'workflow', 'bpm', 'erp', 'gestão empresarial'
]

export async function detectTotvsLite({
  website,
  name
}: {
  website?: string
  name?: string
}): Promise<TotvsLiteResult> {
  console.log('[TOTVS-Lite] 🔍 Iniciando detecção para:', { website, name })
  const startTime = Date.now()
  
  const evidences: TotvsLiteResult['evidences'] = []
  let confidenceScore = 0
  const detectedProducts = new Set<string>()

  try {
    // 1. Análise do Website (se disponível)
    if (website) {
      console.log('[TOTVS-Lite] 🌐 Analisando website:', website)
      const websiteEvidence = await analyzeWebsiteContent(website)
      evidences.push(...websiteEvidence)
      
      // Calcular score baseado nas evidências do website
      websiteEvidence.forEach(evidence => {
        switch (evidence.strength) {
          case 'A': confidenceScore += 50; break
          case 'B': confidenceScore += 25; break
          case 'C': confidenceScore += 10; break
        }
      })
    }

    // 2. Busca via CSE (orquestrador multi-API)
    if (name || website) {
      console.log('[TOTVS-Lite] 🔍 Buscando via CSE multi-API...')
      const cseEvidence = await searchTotvsViaCSE(name || website!)
      evidences.push(...cseEvidence)
      
      // Calcular score baseado nas evidências do CSE
      cseEvidence.forEach(evidence => {
        switch (evidence.strength) {
          case 'A': confidenceScore += 50; break
          case 'B': confidenceScore += 25; break
          case 'C': confidenceScore += 10; break
        }
      })
    }

    // 3. Detectar produtos baseado nas evidências
    evidences.forEach(evidence => {
      const content = `${evidence.snippet || ''} ${evidence.url}`.toLowerCase()
      
      Object.entries(PRODUCT_TERMS).forEach(([product, terms]) => {
        if (terms.some(term => content.includes(term))) {
          detectedProducts.add(product)
        }
      })
    })

    // 4. Cap confidence score em 100
    confidenceScore = Math.min(confidenceScore, 100)

    // 5. Determinar temperatura do lead
    const leadTemperature = getLeadTemperature(confidenceScore)

    // 6. Gerar recomendações e pitches
    const recommendations = generateRecommendations(Array.from(detectedProducts))
    const pitches = generatePitches(leadTemperature, Array.from(detectedProducts))

    const result: TotvsLiteResult = {
      totvs_detected: confidenceScore >= 40,
      produtos: Array.from(detectedProducts),
      confidence_score: confidenceScore,
      evidences,
      last_scanned_at: new Date().toISOString(),
      lead_temperature: leadTemperature,
      recommendations,
      pitches
    }

    console.log('[TOTVS-Lite] ✅ Detecção concluída:', {
      totvs_detected: result.totvs_detected,
      produtos: result.produtos,
      confidence_score: result.confidence_score,
      evidences_count: evidences.length,
      elapsed_ms: Date.now() - startTime
    })

    return result

  } catch (error: any) {
    console.error('[TOTVS-Lite] ❌ Erro na detecção:', error.message)
    
    // Retornar resultado vazio em caso de erro
    return {
      totvs_detected: false,
      produtos: [],
      confidence_score: 0,
      evidences: [],
      last_scanned_at: new Date().toISOString(),
      lead_temperature: 'frio',
      recommendations: ['Não foi possível analisar a empresa no momento'],
      pitches: {
        frio: ['Entre em contato para uma análise personalizada'],
        morno: ['Entre em contato para uma análise personalizada'],
        quente: ['Entre em contato para uma análise personalizada']
      }
    }
  }
}

async function analyzeWebsiteContent(website: string): Promise<TotvsLiteResult['evidences']> {
  const evidences: TotvsLiteResult['evidences'] = []
  
  try {
    // URLs para analisar no website
    const urlsToCheck = [
      website,
      `${website}/sobre`,
      `${website}/empresa`,
      `${website}/contato`,
      `${website}/politica-privacidade`,
      `${website}/termos`
    ].filter(Boolean)

    for (const url of urlsToCheck.slice(0, 3)) { // Limitar a 3 URLs para performance
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OLV-Bot/1.0)' },
          signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
          const html = await response.text()
          const totvsMentions = findTotvsMentions(html)
          
          if (totvsMentions.length > 0) {
            evidences.push({
              source: 'website',
              url,
              snippet: totvsMentions[0].snippet,
              strength: totvsMentions[0].strength
            })
          }
        }
      } catch (error) {
        console.warn('[TOTVS-Lite] ⚠️ Erro ao analisar URL:', url, error)
      }
    }
  } catch (error) {
    console.warn('[TOTVS-Lite] ⚠️ Erro na análise do website:', error)
  }

  return evidences
}

async function searchTotvsViaCSE(query: string): Promise<TotvsLiteResult['evidences']> {
  const evidences: TotvsLiteResult['evidences'] = []
  
  try {
    // Extrair domínio se for website
    const domain = query.includes('.') ? new URL(query).hostname : null
    
    // Queries para buscar
    const searchQueries = [
      domain ? `site:${domain} totvs` : `${query} totvs`,
      domain ? `site:${domain} protheus` : `${query} protheus`,
      domain ? `site:${domain} fluig` : `${query} fluig`,
      domain ? `site:${domain} rm gestão` : `${query} rm gestão`
    ]

    for (const searchQuery of searchQueries.slice(0, 2)) { // Limitar a 2 queries para performance
      try {
        const results = await searchCompanyWebsite(searchQuery, '', {
          razao: query,
          fantasia: query,
          socios: [],
          domain: domain || undefined
        })

        if (results && results.url) {
          const snippet = `Resultado encontrado para: ${searchQuery}`
          evidences.push({
            source: 'cse',
            url: results.url,
            snippet,
            strength: 'B' // CSE results são geralmente B
          })
        }
      } catch (error) {
        console.warn('[TOTVS-Lite] ⚠️ Erro na busca CSE:', searchQuery, error)
      }
    }
  } catch (error) {
    console.warn('[TOTVS-Lite] ⚠️ Erro na busca CSE:', error)
  }

  return evidences
}

function findTotvsMentions(html: string): Array<{ snippet: string, strength: 'A' | 'B' | 'C' }> {
  const mentions: Array<{ snippet: string, strength: 'A' | 'B' | 'C' }> = []
  const lowerHtml = html.toLowerCase()

  // Buscar menções fortes (A)
  TOTVS_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`([^.]{0,50}${keyword}[^.]{0,50})`, 'gi')
    const matches = html.match(regex)
    
    if (matches) {
      matches.forEach(match => {
        mentions.push({
          snippet: match.trim(),
          strength: 'A'
        })
      })
    }
  })

  // Buscar menções médias (B) - termos relacionados
  const relatedTerms = ['erp', 'gestão', 'sistema', 'software empresarial']
  relatedTerms.forEach(term => {
    if (lowerHtml.includes(term)) {
      const regex = new RegExp(`([^.]{0,30}${term}[^.]{0,30})`, 'gi')
      const matches = html.match(regex)
      
      if (matches) {
        matches.forEach(match => {
          mentions.push({
            snippet: match.trim(),
            strength: 'B'
          })
        })
      }
    }
  })

  return mentions.slice(0, 3) // Limitar a 3 menções
}

function getLeadTemperature(confidenceScore: number): 'frio' | 'morno' | 'quente' {
  if (confidenceScore < 30) return 'frio'
  if (confidenceScore < 60) return 'morno'
  return 'quente'
}

function generateRecommendations(produtos: string[]): string[] {
  if (produtos.length === 0) {
    return [
      'Empresa sem histórico conhecido de TOTVS',
      'Oportunidade para apresentar soluções TOTVS',
      'Focar em diagnóstico de necessidades'
    ]
  }

  const recommendations: string[] = []
  
  if (produtos.includes('Protheus')) {
    recommendations.push('Cliente Protheus - Oportunidade de upgrade ou módulos adicionais')
  }
  if (produtos.includes('Fluig')) {
    recommendations.push('Cliente Fluig - Avaliar necessidade de processos adicionais')
  }
  if (produtos.includes('RM')) {
    recommendations.push('Cliente RM - Verificar compliance fiscal e oportunidades de integração')
  }

  return recommendations.slice(0, 3)
}

function generatePitches(
  temperature: 'frio' | 'morno' | 'quente',
  produtos: string[]
): { frio: string[], morno: string[], quente: string[] } {
  const basePitches = {
    frio: [
      'Realizar diagnóstico completo das necessidades',
      'Apresentar cases de sucesso do segmento',
      'Agendar reunião para mapeamento de processos'
    ],
    morno: [
      'Demonstrar ROI de soluções TOTVS',
      'Apresentar roadmap de implementação',
      'Agendar demo personalizada'
    ],
    quente: [
      'Preparar proposta comercial detalhada',
      'Agendar reunião com decisores',
      'Definir cronograma de implementação'
    ]
  }

  if (produtos.length > 0) {
    basePitches.quente[0] = `Preparar proposta para ${produtos.join(', ')}`
    basePitches.morno[1] = `Demonstrar integração entre ${produtos.join(', ')}`
  }

  return basePitches
}