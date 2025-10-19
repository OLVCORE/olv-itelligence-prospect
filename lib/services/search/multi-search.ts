/**
 * Sistema Multi-API de Busca com Busca SIMULTÂNEA
 * 
 * MODO: BUSCA PARALELA em 3 APIs
 * 1. Google CSE (100 queries/dia grátis)
 * 2. Bing Search API (10.000 queries/mês grátis)
 * 3. Serper.dev (2.500 queries/mês grátis)
 * 
 * Combina TODOS os resultados das 3 APIs para máxima cobertura!
 * 
 * Benefícios:
 * - Maximiza resultados (cada API tem índices diferentes)
 * - Encontra mais redes sociais/marketplaces
 * - Mais notícias e fontes
 * - Validação cruzada de dados
 * - Deduplicação inteligente por domínio
 */

interface SearchResult {
  url: string
  title: string
  snippet: string
  date?: string
  source?: 'google' | 'bing' | 'serper' // Rastrear de qual API veio
}

interface MultiSearchOptions {
  query: string
  maxResults?: number
  dateRestrict?: string // ex: 'y1' para último ano
}

interface MultiSearchResponse {
  results: SearchResult[]
  provider: string // APIs usadas (ex: "google+bing+serper")
  cached: boolean
  stats?: {
    google: number
    bing: number
    serper: number
    total: number
    deduplicated: number
  }
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
  
  console.log('[MultiSearch] 🔵 Buscando no Google CSE...')
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
    source: 'google',
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
  
  console.log('[MultiSearch] 🟦 Buscando no Bing Search...')
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
    source: 'bing',
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
  
  console.log('[MultiSearch] 🟪 Buscando no Serper.dev...')
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
    source: 'serper',
  }))
}

/**
 * Busca SIMULTÂNEA em Múltiplas APIs + Deduplicação Inteligente
 * 
 * Busca PARALELAMENTE em todas as APIs disponíveis:
 * 1. Google CSE
 * 2. Bing Search
 * 3. Serper.dev
 * 
 * Combina TODOS os resultados e deduplica por domínio!
 */
export async function multiSearch(
  options: MultiSearchOptions
): Promise<MultiSearchResponse> {
  const { query, maxResults = 10 } = options
  
  console.log('[MultiSearch] 🔍 Iniciando busca SIMULTÂNEA em 3 APIs:', query)
  const startTime = Date.now()

  // Buscar em PARALELO nas 3 APIs
  const [googleResults, bingResults, serperResults] = await Promise.allSettled([
    searchGoogle(query, maxResults),
    searchBing(query, maxResults),
    searchSerper(query, maxResults),
  ])

  // Coletar resultados de cada API
  const allResults: SearchResult[] = []
  const providers: string[] = []
  const stats = { google: 0, bing: 0, serper: 0, total: 0, deduplicated: 0 }

  // Google
  if (googleResults.status === 'fulfilled') {
    const count = googleResults.value.length
    stats.google = count
    console.log('[MultiSearch] ✅ Google CSE:', count, 'resultados')
    allResults.push(...googleResults.value)
    providers.push('google')
  } else {
    console.warn('[MultiSearch] ⚠️ Google CSE falhou:', googleResults.reason.message)
    if (googleResults.reason.message?.includes('QUOTA')) {
      console.warn('[MultiSearch] 🚫 Google quota excedida (esperado após 100/dia)')
    }
  }

  // Bing
  if (bingResults.status === 'fulfilled') {
    const count = bingResults.value.length
    stats.bing = count
    console.log('[MultiSearch] ✅ Bing Search:', count, 'resultados')
    allResults.push(...bingResults.value)
    providers.push('bing')
  } else {
    console.warn('[MultiSearch] ⚠️ Bing Search falhou:', bingResults.reason.message)
    if (bingResults.reason.message?.includes('não configurado')) {
      console.log('[MultiSearch] 💡 Configure Bing para 1k queries grátis/mês!')
    }
  }

  // Serper
  if (serperResults.status === 'fulfilled') {
    const count = serperResults.value.length
    stats.serper = count
    console.log('[MultiSearch] ✅ Serper.dev:', count, 'resultados')
    allResults.push(...serperResults.value)
    providers.push('serper')
  } else {
    console.warn('[MultiSearch] ⚠️ Serper.dev falhou:', serperResults.reason.message)
    if (serperResults.reason.message?.includes('não configurado')) {
      console.log('[MultiSearch] 💡 Configure Serper para 2.5k queries grátis/mês!')
    }
  }

  stats.total = allResults.length

  // DEDUPLICATE por domínio (manter primeiro de cada domínio)
  const seen = new Set<string>()
  const deduplicated: SearchResult[] = []
  
  for (const result of allResults) {
    try {
      const domain = new URL(result.url).hostname.replace('www.', '')
      if (!seen.has(domain)) {
        seen.add(domain)
        deduplicated.push(result)
      } else {
        console.log('[MultiSearch] 🔄 Deduplicado:', domain, `(já tinha de ${result.source})`)
      }
    } catch (e) {
      // URL inválida, manter mesmo assim
      deduplicated.push(result)
    }
  }

  stats.deduplicated = deduplicated.length

  // Limitar ao máximo solicitado
  const finalResults = deduplicated.slice(0, maxResults * 2) // Dobro do limite para melhor cobertura

  const elapsed = Date.now() - startTime

  console.log('[MultiSearch] 🎯 RESULTADO FINAL:')
  console.log(`[MultiSearch] ⏱️ Tempo: ${elapsed}ms`)
  console.log(`[MultiSearch] 📊 Google: ${stats.google} | Bing: ${stats.bing} | Serper: ${stats.serper}`)
  console.log(`[MultiSearch] - Total bruto: ${stats.total} resultados`)
  console.log(`[MultiSearch] - Após dedup: ${stats.deduplicated} únicos`)
  console.log(`[MultiSearch] - Retornando: ${finalResults.length}`)
  console.log(`[MultiSearch] - APIs usadas: ${providers.join('+') || 'nenhuma'}`)

  // Se nenhuma API funcionou
  if (providers.length === 0) {
    console.error('[MultiSearch] ❌ TODAS AS APIs FALHARAM!')
    console.error('[MultiSearch] 💡 Solução:')
    console.error('[MultiSearch] 1. Aguarde reset da quota Google (00:00 UTC)')
    console.error('[MultiSearch] 2. Configure Bing: https://portal.azure.com')
    console.error('[MultiSearch] 3. Configure Serper: https://serper.dev')
  }

  return {
    results: finalResults,
    provider: providers.join('+') || 'none',
    cached: false,
    stats,
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

  const response = await multiSearch({ query, maxResults: 5 })

  console.log('[MultiSearch] 🌐 Buscando website:', companyName)
  console.log('[MultiSearch] 📊 Stats:', response.stats)

  // Filtrar apenas resultados relevantes
  for (const result of response.results) {
    const text = `${result.title} ${result.snippet}`.toLowerCase()
    const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
    
    const relevantMatches = companyWords.filter(word => text.includes(word))
    if (relevantMatches.length >= Math.min(2, companyWords.length)) {
      console.log('[MultiSearch] ✅ Website encontrado:', result.url, `(via ${result.source})`)
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

  const response = await multiSearch({ query, maxResults: maxResults * 2, dateRestrict: 'y1' })

  console.log('[MultiSearch] 📰 Buscando notícias:', companyName)
  console.log('[MultiSearch] 📊 Stats:', response.stats)

  // Filtrar notícias relevantes
  const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
  const excludeTerms = [
    'bilionário', 'criptomoeda', 'bitcoin', 'defesa civil',
    'aggregation report', 'mapa em tempo real', 'como agir'
  ]

  const filtered = response.results
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

  console.log('[MultiSearch] ✅ Notícias filtradas:', filtered.length, `de ${response.results.length} total`)

  return filtered
}
