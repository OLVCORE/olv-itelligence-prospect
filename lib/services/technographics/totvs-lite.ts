/**
 * TOTVS Technographics Detection (Lite MVP)
 * Detecta presença de produtos TOTVS na empresa sem persistir
 */

export interface TotvsDetectionResult {
  totvs_detected: boolean
  produtos: string[] // ['Protheus', 'Fluig', 'RM', 'Datasul', 'Logix', 'Microsiga']
  confidence_score: number // 0-100 (A: +50, B: +25, C: +10 — cap 100)
  evidences: Array<{
    source: 'website' | 'cse'
    url: string
    snippet?: string
    strength: 'A' | 'B' | 'C'
  }>
  last_scanned_at: string
}

// Produtos TOTVS conhecidos
const TOTVS_PRODUCTS = {
  Protheus: ['protheus', 'advpl', 'totvs protheus'],
  Fluig: ['fluig', 'totvs fluig', 'ecm fluig'],
  RM: ['totvs rm', 'rm totvs', 'linha rm'],
  Datasul: ['datasul', 'totvs datasul', 'progress datasul'],
  Logix: ['logix', 'totvs logix'],
  Microsiga: ['microsiga', 'totvs microsiga'],
} as const

// Termos chave para detecção
const TOTVS_KEYWORDS = [
  'totvs',
  'protheus',
  'fluig',
  'datasul',
  'logix',
  'microsiga',
  'advpl',
  'totvs.com.br',
  'erp totvs',
]

/**
 * Detecta TOTVS no website da empresa
 */
async function scanWebsite(website: string): Promise<TotvsDetectionResult['evidences']> {
  const evidences: TotvsDetectionResult['evidences'] = []

  try {
    // Páginas para escanear
    const urlsToScan = [
      website,
      `${website}/sobre`,
      `${website}/empresa`,
      `${website}/contato`,
      `${website}/politica-privacidade`,
      `${website}/politica-de-privacidade`,
    ]

    for (const url of urlsToScan) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) continue

        const html = await response.text()
        const textContent = html.toLowerCase()

        // Verificar presença de keywords TOTVS
        for (const keyword of TOTVS_KEYWORDS) {
          if (textContent.includes(keyword)) {
            // Força A se encontrar no próprio site
            evidences.push({
              source: 'website',
              url,
              snippet: extractSnippet(html, keyword),
              strength: 'A',
            })
            break // Apenas uma evidência por URL
          }
        }
      } catch (error) {
        // Timeout ou erro de rede, ignorar
        continue
      }
    }
  } catch (error) {
    console.error('[TOTVS Lite] Erro ao escanear website:', error)
  }

  return evidences
}

/**
 * Detecta TOTVS via Google Custom Search
 */
async function scanGoogleCSE(
  companyName: string,
  website?: string
): Promise<TotvsDetectionResult['evidences']> {
  const evidences: TotvsDetectionResult['evidences'] = []

  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    console.warn('[TOTVS Lite] Google CSE não configurado')
    return evidences
  }

  try {
    // Estratégias de busca
    const queries = [
      `"${companyName}" TOTVS`,
      `"${companyName}" Protheus`,
      `"${companyName}" ADVPL`,
      `"${companyName}" Fluig`,
      `"${companyName}" Datasul`,
      website ? `site:${website} (TOTVS OR Protheus OR Fluig)` : null,
    ].filter(Boolean)

    for (const query of queries) {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
          query!
        )}&num=5`

        const response = await fetch(url, { next: { revalidate: 3600 } })

        if (!response.ok) continue

        const data = await response.json()
        const items = data.items || []

        for (const item of items) {
          const itemUrl = item.link || ''
          const snippet = item.snippet || ''

          // Verificar se snippet contém keywords TOTVS
          const hasKeyword = TOTVS_KEYWORDS.some((keyword) =>
            snippet.toLowerCase().includes(keyword)
          )

          if (hasKeyword) {
            // Força B para CSE
            evidences.push({
              source: 'cse',
              url: itemUrl,
              snippet: snippet.substring(0, 200),
              strength: 'B',
            })
          }
        }
      } catch (error) {
        console.error('[TOTVS Lite] Erro em query CSE:', error)
        continue
      }
    }
  } catch (error) {
    console.error('[TOTVS Lite] Erro geral CSE:', error)
  }

  return evidences
}

/**
 * Extrai snippet de contexto ao redor da keyword
 */
function extractSnippet(html: string, keyword: string): string {
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
  const index = textContent.toLowerCase().indexOf(keyword.toLowerCase())

  if (index === -1) return ''

  const start = Math.max(0, index - 50)
  const end = Math.min(textContent.length, index + keyword.length + 50)

  return textContent.substring(start, end).trim() + '...'
}

/**
 * Deriva produtos detectados a partir das evidências
 */
function deriveProducts(evidences: TotvsDetectionResult['evidences']): string[] {
  const products = new Set<string>()

  for (const evidence of evidences) {
    const text = `${evidence.url} ${evidence.snippet || ''}`.toLowerCase()

    // Verificar cada produto
    for (const [product, keywords] of Object.entries(TOTVS_PRODUCTS)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        products.add(product)
      }
    }
  }

  return Array.from(products)
}

/**
 * Calcula score de confiança baseado nas evidências
 */
function calculateConfidence(evidences: TotvsDetectionResult['evidences']): number {
  let score = 0

  for (const evidence of evidences) {
    if (evidence.strength === 'A') score += 50
    else if (evidence.strength === 'B') score += 25
    else if (evidence.strength === 'C') score += 10
  }

  return Math.min(score, 100) // Cap em 100
}

/**
 * Detecta presença de TOTVS na empresa (MVP Lite)
 */
export async function detectTotvsLite({
  website,
  name,
}: {
  website?: string
  name?: string
}): Promise<TotvsDetectionResult> {
  console.log('[TOTVS Lite] Iniciando detecção para:', name || website)

  const startTime = Date.now()
  let evidences: TotvsDetectionResult['evidences'] = []

  // 1. Escanear website (se disponível)
  if (website) {
    console.log('[TOTVS Lite] Escaneando website:', website)
    const websiteEvidences = await scanWebsite(website)
    evidences = [...evidences, ...websiteEvidences]
  }

  // 2. Escanear via Google CSE (se nome disponível)
  if (name) {
    console.log('[TOTVS Lite] Escaneando via Google CSE:', name)
    const cseEvidences = await scanGoogleCSE(name, website)
    evidences = [...evidences, ...cseEvidences]
  }

  // 3. Derivar produtos e score
  const produtos = deriveProducts(evidences)
  const confidence_score = calculateConfidence(evidences)
  const totvs_detected = confidence_score > 0

  const totalTime = Date.now() - startTime
  console.log('[TOTVS Lite] Detecção concluída em', totalTime, 'ms:', {
    totvs_detected,
    produtos,
    confidence_score,
    evidences: evidences.length,
  })

  return {
    totvs_detected,
    produtos,
    confidence_score,
    evidences,
    last_scanned_at: new Date().toISOString(),
  }
}

