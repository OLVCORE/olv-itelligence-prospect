/**
 * Serper.dev Integration - Google Search API
 * Docs: https://serper.dev/docs
 */

interface SerperSearchParams {
  q: string
  num?: number
  gl?: string  // country
  hl?: string  // language
}

interface SerperResponse {
  organic: Array<{
    title: string
    link: string
    snippet: string
    position: number
  }>
  answerBox?: {
    title: string
    answer: string
  }
  relatedSearches?: Array<{
    query: string
  }>
}

export async function serperSearch(params: SerperSearchParams): Promise<SerperResponse> {
  const apiKey = process.env.SERPER_API_KEY
  
  if (!apiKey) {
    throw new Error('SERPER_API_KEY não configurado')
  }

  console.log('[Serper] 🔍 Buscando:', params.q)

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: params.q,
        num: params.num || 10,
        gl: params.gl || 'br',
        hl: params.hl || 'pt-br'
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Serper HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[Serper] ✅ Retornou', data.organic?.length || 0, 'resultados')
    
    return data
  } catch (error: any) {
    console.error('[Serper] ❌ Erro:', error.message)
    throw error
  }
}

