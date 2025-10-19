/**
 * Sistema Multi-API de Busca com Fallback Automático
 * 
 * Prioridade:
 * 1. Google CSE (100 queries/dia grátis) - Já configurado
 * 2. Bing Search API (10.000 queries/mês grátis) - Fallback
 * 3. Serper.dev (2.500 queries/mês grátis) - Fallback secundário
 * 
 * Benefícios:
 * - Maximiza quotas gratuitas (13.100 queries/mês total)
 * - Resiliente: se uma API cair, usa outra
 * - Sem alteração no código existente
 */

interface SearchResult {
  url: string
  title: string
  snippet: string
  date?: string
}

interface MultiSearchOptions {
  query: string
  maxResults?: number
  dateRestrict?: string // ex: 'y1' para último ano
}

interface MultiSearchResponse {
  results: SearchResult[]
  provider: 'google' | 'bing' | 'serper' | 'cache'
  cached: boolean
}

/**
 * Buscar no Google Custom Search
 */
async function searchGoogle(
  query: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    throw new Error('Google CSE não configurado')
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${maxResults}`
  
  console.log('[MultiSearch] 🔵 Tentando Google CSE...')
  const response = await fetch(url, { 
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000) // 10s timeout
  })

  if (!response.ok) {
    const status = response.status
    if (status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    } else if (status === 403) {
      throw new Error('API_KEY_INVALID')
    } else {
      throw new Error(`HTTP ${status}`)
    }
  }

  const data = await response.json()

  return (data.items || []).map((item: any) => ({
    url: item.link,
    title: item.title,
    snippet: item.snippet,
    date: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
          item.pagemap?.metatags?.[0]?.['og:updated_time'] || 
          undefined,
  }))
}

/**
 * Buscar no Bing Search API
 * 
 * Setup:
 * 1. Vá em: https://portal.azure.com
 * 2. Crie "Bing Search v7"
 * 3. Copie a chave
 * 4. Adicione BING_SEARCH_API_KEY no Vercel
 */
async function searchBing(
  query: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.BING_SEARCH_API_KEY

  if (!apiKey) {
    throw new Error('Bing Search não configurado')
  }

  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}`
  
  console.log('[MultiSearch] 🟦 Tentando Bing Search API...')
  const response = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    const status = response.status
    if (status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    } else if (status === 401 || status === 403) {
      throw new Error('API_KEY_INVALID')
    } else {
      throw new Error(`HTTP ${status}`)
    }
  }

  const data = await response.json()

  return (data.webPages?.value || []).map((item: any) => ({
    url: item.url,
    title: item.name,
    snippet: item.snippet,
    date: item.dateLastCrawled || undefined,
  }))
}

/**
 * Buscar no Serper.dev
 * 
 * Setup:
 * 1. Vá em: https://serper.dev
 * 2. Crie conta (2.500 queries grátis)
 * 3. Copie a API key
 * 4. Adicione SERPER_API_KEY no Vercel
 */
async function searchSerper(
  query: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    throw new Error('Serper não configurado')
  }

  const url = 'https://google.serper.dev/search'
  
  console.log('[MultiSearch] 🟪 Tentando Serper.dev...')
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: maxResults,
    }),
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    const status = response.status
    if (status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    } else if (status === 401 || status === 403) {
      throw new Error('API_KEY_INVALID')
    } else {
      throw new Error(`HTTP ${status}`)
    }
  }

  const data = await response.json()

  return (data.organic || []).map((item: any) => ({
    url: item.link,
    title: item.title,
    snippet: item.snippet,
    date: item.date || undefined,
  }))
}

/**
 * Busca Multi-API com Fallback Automático
 * 
 * Tenta na ordem:
 * 1. Google (100/dia grátis)
 * 2. Bing (10.000/mês grátis) 
 * 3. Serper (2.500/mês grátis)
 */
export async function multiSearch(
  options: MultiSearchOptions
): Promise<MultiSearchResponse> {
  const { query, maxResults = 10 } = options
  
  console.log('[MultiSearch] 🔍 Iniciando busca multi-API:', query)

  // Tentar Google primeiro (melhor para empresas BR)
  try {
    const results = await searchGoogle(query, maxResults)
    console.log('[MultiSearch] ✅ Google CSE: sucesso!', results.length, 'resultados')
    return {
      results,
      provider: 'google',
      cached: false,
    }
  } catch (error: any) {
    console.warn('[MultiSearch] ⚠️ Google CSE falhou:', error.message)
    
    // Se não é quota, retornar erro
    if (!error.message.includes('QUOTA') && !error.message.includes('429')) {
      console.error('[MultiSearch] ❌ Erro fatal no Google:', error.message)
      // Continuar para fallback mesmo assim
    }
  }

  // Tentar Bing (fallback primário - 10k/mês grátis!)
  try {
    const results = await searchBing(query, maxResults)
    console.log('[MultiSearch] ✅ Bing Search: sucesso!', results.length, 'resultados')
    return {
      results,
      provider: 'bing',
      cached: false,
    }
  } catch (error: any) {
    console.warn('[MultiSearch] ⚠️ Bing Search falhou:', error.message)
    
    // Se Bing não está configurado, é esperado
    if (error.message.includes('não configurado')) {
      console.log('[MultiSearch] 💡 Bing não configurado. Configure para 10k queries grátis/mês!')
    }
  }

  // Tentar Serper (fallback secundário - 2.5k/mês grátis)
  try {
    const results = await searchSerper(query, maxResults)
    console.log('[MultiSearch] ✅ Serper: sucesso!', results.length, 'resultados')
    return {
      results,
      provider: 'serper',
      cached: false,
    }
  } catch (error: any) {
    console.warn('[MultiSearch] ⚠️ Serper falhou:', error.message)
    
    if (error.message.includes('não configurado')) {
      console.log('[MultiSearch] 💡 Serper não configurado. Configure para 2.5k queries grátis/mês!')
    }
  }

  // Todas as APIs falharam
  console.error('[MultiSearch] ❌ TODAS AS APIs FALHARAM!')
  console.error('[MultiSearch] 💡 Configurar APIs alternativas resolve isso:')
  console.error('[MultiSearch] - Bing: https://portal.azure.com (10k grátis/mês)')
  console.error('[MultiSearch] - Serper: https://serper.dev (2.5k grátis/mês)')

  // Retornar vazio ao invés de erro (dados parciais)
  return {
    results: [],
    provider: 'google', // Mantém google como provider original
    cached: false,
  }
}

/**
 * Buscar website oficial da empresa
 */
export async function searchCompanyWebsite(
  companyName: string,
  cnpj?: string
): Promise<{ url: string; title: string } | null> {
  const query = cnpj 
    ? `"${companyName}" CNPJ ${cnpj} (site oficial OR sobre OR empresa)`
    : `"${companyName}" (site oficial OR sobre OR empresa OR contato)`

  const response = await multiSearch({ query, maxResults: 3 })

  // Filtrar apenas resultados relevantes
  for (const result of response.results) {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
    
    const relevantMatches = companyWords.filter(word => text.includes(word))
    if (relevantMatches.length >= Math.min(2, companyWords.length)) {
      console.log('[MultiSearch] 🌐 Website encontrado:', result.url, `(via ${response.provider})`)
      return { url: result.url, title: result.title }
    }
  }

  console.log('[MultiSearch] ⚠️ Website não encontrado')
  return null
}

/**
 * Buscar notícias recentes da empresa
 */
export async function searchCompanyNews(
  companyName: string,
  cnpj?: string,
  maxResults: number = 5
): Promise<Array<{ title: string; snippet: string; link: string; date?: string }>> {
  const query = cnpj
    ? `"${companyName}" CNPJ ${cnpj} (anuncia OR lança OR investimento OR expansão OR contrato)`
    : `"${companyName}" (anuncia OR lança OR investimento OR expansão OR contrato OR novidade)`

  const response = await multiSearch({ query, maxResults, dateRestrict: 'y1' })

  // Filtrar notícias relevantes
  const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
  const excludeTerms = [
    'bilionário', 'criptomoeda', 'bitcoin', 'defesa civil',
    'aggregation report', 'mapa em tempo real', 'como agir'
  ]

  return response.results
    .filter(result => {
      const text = `${result.title} ${result.snippet}`.toLowerCase()
      const relevantMatches = companyWords.filter(word => text.includes(word))
      const hasExcludedTerm = excludeTerms.some(term => text.includes(term))
      const hasCnpj = cnpj && text.includes(cnpj.replace(/\D/g, ''))
      
      return (relevantMatches.length >= 2 || hasCnpj) && !hasExcludedTerm
    })
    .slice(0, maxResults)
    .map(result => ({
      title: result.title,
      snippet: result.snippet,
      link: result.url,
      date: result.date,
    }))
}

