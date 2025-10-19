/**
 * Orquestrador Multi-API de Busca
 * 
 * GERENCIA as chamadas para múltiplas APIs de forma inteligente:
 * 1. Tenta Google CSE primeiro
 * 2. Se erro 429 (quota), usa Serper
 * 3. Se Serper falhar, usa Bing
 * 4. Consolida resultados de qualquer fonte
 * 5. APLICA VALIDAÇÃO ASSERTIVA em todos os resultados
 * 
 * OBJETIVO: Eliminar banner de quota e garantir busca sempre funcional
 */

import { validateLink, validateJusbrasil, validateMarketplaceB2B } from './validators/link-validation'

interface SearchResult {
  url: string
  title: string
  snippet: string
  date?: string
  source: 'google' | 'bing' | 'serper'
}

interface OrchestratorResponse {
  results: SearchResult[]
  provider: string
  fallbackUsed: boolean
  stats: {
    google: number
    bing: number
    serper: number
    total: number
  }
}

/**
 * Orquestrador principal - gerencia chamadas multi-API
 */
export async function multiApiSearch(
  query: string,
  maxResults: number = 10
): Promise<OrchestratorResponse> {
  console.log('[Orchestrator] 🎯 Iniciando busca orquestrada:', query)
  const startTime = Date.now()

  // 1. TENTAR GOOGLE CSE PRIMEIRO
  try {
    console.log('[Orchestrator] 🔵 Tentando Google CSE...')
    const googleResults = await searchGoogle(query, maxResults)
    
    if (googleResults.length > 0) {
      const elapsed = Date.now() - startTime
      console.log(`[Orchestrator] ✅ Google CSE funcionou! ${googleResults.length} resultados em ${elapsed}ms`)
      
      return {
        results: googleResults,
        provider: 'google',
        fallbackUsed: false,
        stats: {
          google: googleResults.length,
          bing: 0,
          serper: 0,
          total: googleResults.length
        }
      }
    }
  } catch (error: any) {
    console.warn('[Orchestrator] ⚠️ Google CSE falhou:', error.message)
    
    // Se é erro 429 (quota), usar fallback
    if (error.message?.includes('429') || error.message?.includes('QUOTA_EXCEEDED')) {
      console.log('[Orchestrator] 🚫 Google quota excedida - usando fallback')
    }
  }

  // 2. FALLBACK: TENTAR SERPER
  try {
    console.log('[Orchestrator] 🟪 Tentando Serper como fallback...')
    const serperResults = await searchSerper(query, maxResults)
    
    if (serperResults.length > 0) {
      const elapsed = Date.now() - startTime
      console.log(`[Orchestrator] ✅ Serper funcionou! ${serperResults.length} resultados em ${elapsed}ms`)
      
      return {
        results: serperResults,
        provider: 'serper',
        fallbackUsed: true,
        stats: {
          google: 0,
          bing: 0,
          serper: serperResults.length,
          total: serperResults.length
        }
      }
    }
  } catch (error: any) {
    console.warn('[Orchestrator] ⚠️ Serper falhou:', error.message)
  }

  // 3. ÚLTIMO FALLBACK: TENTAR BING
  try {
    console.log('[Orchestrator] 🟦 Tentando Bing como último recurso...')
    const bingResults = await searchBing(query, maxResults)
    
    if (bingResults.length > 0) {
      const elapsed = Date.now() - startTime
      console.log(`[Orchestrator] ✅ Bing funcionou! ${bingResults.length} resultados em ${elapsed}ms`)
      
      return {
        results: bingResults,
        provider: 'bing',
        fallbackUsed: true,
        stats: {
          google: 0,
          bing: bingResults.length,
          serper: 0,
          total: bingResults.length
        }
      }
    }
  } catch (error: any) {
    console.warn('[Orchestrator] ⚠️ Bing falhou:', error.message)
  }

  // 4. TODAS AS APIs FALHARAM
  const elapsed = Date.now() - startTime
  console.error(`[Orchestrator] ❌ TODAS AS APIs FALHARAM em ${elapsed}ms`)
  console.error('[Orchestrator] 💡 Solução: Verificar configuração das APIs')
  
  return {
    results: [],
    provider: 'none',
    fallbackUsed: true,
    stats: {
      google: 0,
      bing: 0,
      serper: 0,
      total: 0
    }
  }
}

/**
 * Buscar no Google Custom Search
 */
async function searchGoogle(query: string, maxResults: number): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    throw new Error('Google CSE não configurado')
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${maxResults}`
  
  const response = await fetch(url, { 
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000)
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
    date: item.pagemap?.metatags?.[0]?.['article:published_time'] || undefined,
    source: 'google' as const,
  }))
}

/**
 * Buscar no Serper.dev
 */
async function searchSerper(query: string, maxResults: number): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    throw new Error('Serper não configurado')
  }

  const url = 'https://google.serper.dev/search'
  
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
    source: 'serper' as const,
  }))
}

/**
 * Buscar no Bing Search API (RapidAPI)
 */
async function searchBing(query: string, maxResults: number): Promise<SearchResult[]> {
  const apiKey = process.env.BING_API_KEY

  if (!apiKey) {
    throw new Error('Bing Search não configurado')
  }

  const url = `https://bing-web-search1.p.rapidapi.com/search?q=${encodeURIComponent(query)}&count=${maxResults}`
  
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'bing-web-search1.p.rapidapi.com',
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
    source: 'bing' as const,
  }))
}

/**
 * Buscar website oficial da empresa (com orquestração + validação assertiva)
 */
export async function searchCompanyWebsite(
  companyName: string,
  cnpj?: string,
  companyData?: { razao?: string; fantasia?: string; socios?: string[]; domain?: string }
): Promise<{ url: string; title: string } | null> {
  const query = cnpj 
    ? `"${companyName}" CNPJ ${cnpj} (site oficial OR sobre OR empresa)`
    : `"${companyName}" (site oficial OR sobre OR empresa OR contato)`

  const response = await multiApiSearch(query, 10) // Buscar mais resultados para validação

  console.log('[Orchestrator] 🌐 Buscando website:', companyName)
  console.log('[Orchestrator] 📊 Stats:', response.stats)

  // Aplicar validação assertiva em TODOS os resultados
  for (const result of response.results) {
    if (!companyData) {
      // Fallback simples se não tiver dados da empresa
      const text = `${result.title} ${result.snippet}`.toLowerCase()
      const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
      
      const relevantMatches = companyWords.filter(word => text.includes(word))
      if (relevantMatches.length >= Math.min(2, companyWords.length)) {
        console.log('[Orchestrator] ✅ Website encontrado (fallback):', result.url, `(via ${result.source})`)
        return { url: result.url, title: result.title }
      }
      continue
    }

    // VALIDAÇÃO ASSERTIVA
    const validation = validateLink({
      candidateUrl: result.url,
      candidateTitle: result.title,
      candidateSnippet: result.snippet,
      company: {
        cnpj,
        razao: companyData.razao,
        fantasia: companyData.fantasia,
        socios: companyData.socios,
        domain: companyData.domain,
      }
    })

    if (validation.linked) {
      console.log('[Orchestrator] ✅ Website VÁLIDO encontrado:', result.url, `(via ${result.source})`)
      console.log('[Orchestrator] 📊 Score:', validation.score, 'Confiança:', validation.confidence)
      console.log('[Orchestrator] 📋 Razões:', validation.reasons.join(', '))
      
      if (validation.warnings) {
        console.log('[Orchestrator] ⚠️ Avisos:', validation.warnings.join(', '))
      }
      
      return { url: result.url, title: result.title }
    } else {
      console.log('[Orchestrator] ❌ Website REJEITADO:', result.url, `Score: ${validation.score}`)
      console.log('[Orchestrator] 📋 Razões:', validation.reasons.join(', '))
    }
  }

  console.log('[Orchestrator] ⚠️ Nenhum website válido encontrado após validação assertiva')
  return null
}

/**
 * Buscar notícias recentes da empresa (com orquestração)
 */
export async function searchCompanyNews(
  companyName: string,
  cnpj?: string,
  maxResults: number = 5
): Promise<Array<{ title: string; snippet: string; link: string; date?: string }>> {
  const query = cnpj
    ? `"${companyName}" CNPJ ${cnpj} (anuncia OR lança OR investimento OR expansão OR contrato)`
    : `"${companyName}" (anuncia OR lança OR investimento OR expansão OR contrato OR novidade)`

  const response = await multiApiSearch(query, maxResults * 2)

  console.log('[Orchestrator] 📰 Buscando notícias:', companyName)
  console.log('[Orchestrator] 📊 Stats:', response.stats)

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

  console.log('[Orchestrator] ✅ Notícias filtradas:', filtered.length, `de ${response.results.length} total`)

  return filtered
}

/**
 * Buscar redes sociais com validação assertiva e desambiguação
 */
export async function searchSocialMedia(
  platform: string,
  companyName: string,
  cnpj?: string,
  companyData?: { razao?: string; fantasia?: string; socios?: string[]; domain?: string }
): Promise<Array<{ url: string; handle: string; score: number; confidence: 'high' | 'medium' | 'low'; reasons: string[] }>> {
  const query = cnpj
    ? `"${companyName}" CNPJ ${cnpj} site:${platform}.com`
    : `"${companyName}" site:${platform}.com`

  const response = await multiApiSearch(query, 10)

  console.log('[Orchestrator] 📱 Buscando redes sociais:', platform, companyName)
  console.log('[Orchestrator] 📊 Stats:', response.stats)

  const candidates: Array<{ url: string; handle: string; score: number; confidence: 'high' | 'medium' | 'low'; reasons: string[] }> = []

  // Aplicar validação assertiva em TODOS os resultados
  for (const result of response.results) {
    if (!companyData) {
      // Fallback simples
      const url = result.url.toLowerCase()
      if (url.includes(platform.toLowerCase())) {
        const handle = extractHandleFromUrl(result.url, platform)
        if (handle) {
          candidates.push({
            url: result.url,
            handle,
            score: 50, // Score médio para fallback
            confidence: 'medium',
            reasons: ['Detectado via busca simples']
          })
        }
      }
      continue
    }

    // VALIDAÇÃO ASSERTIVA
    const validation = validateLink({
      candidateUrl: result.url,
      candidateTitle: result.title,
      candidateSnippet: result.snippet,
      company: {
        cnpj,
        razao: companyData.razao,
        fantasia: companyData.fantasia,
        socios: companyData.socios,
        domain: companyData.domain,
      }
    })

    if (validation.linked && validation.score >= 40) {
      const handle = extractHandleFromUrl(result.url, platform)
      if (handle) {
        console.log('[Orchestrator] ✅ Rede social VÁLIDA:', result.url, `Score: ${validation.score}`)
        
        candidates.push({
          url: result.url,
          handle,
          score: validation.score,
          confidence: validation.confidence,
          reasons: validation.reasons
        })
      }
    } else {
      console.log('[Orchestrator] ❌ Rede social REJEITADA:', result.url, `Score: ${validation.score}`)
    }
  }

  // Ordenar por score (maior primeiro)
  candidates.sort((a, b) => b.score - a.score)

  console.log('[Orchestrator] ✅ Redes sociais válidas encontradas:', candidates.length)
  return candidates
}

/**
 * Extrair handle/username da URL da rede social
 */
function extractHandleFromUrl(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        // instagram.com/username ou instagram.com/p/...
        const instaMatch = pathname.match(/^\/([^\/\?]+)/)
        return instaMatch && !instaMatch[1].startsWith('p/') ? instaMatch[1] : null
        
      case 'linkedin':
        // linkedin.com/company/company-name
        const linkedinMatch = pathname.match(/^\/company\/([^\/\?]+)/)
        return linkedinMatch ? linkedinMatch[1] : null
        
      case 'facebook':
        // facebook.com/company-name
        const fbMatch = pathname.match(/^\/([^\/\?]+)/)
        return fbMatch && !fbMatch[1].startsWith('pages/') && !fbMatch[1].startsWith('groups/') ? fbMatch[1] : null
        
      case 'twitter':
      case 'x':
        // twitter.com/username ou x.com/username
        const twitterMatch = pathname.match(/^\/([^\/\?]+)/)
        return twitterMatch ? twitterMatch[1] : null
        
      default:
        return null
    }
  } catch (e) {
    return null
  }
}

/**
 * Buscar no Jusbrasil com validação assertiva
 */
export async function searchJusbrasil(
  companyName: string,
  cnpj?: string,
  companyData?: { razao?: string; fantasia?: string; socios?: string[] }
): Promise<{ url: string; processos?: number; socios?: number } | null> {
  const query = cnpj
    ? `site:jusbrasil.com.br "${companyName}" CNPJ ${cnpj}`
    : `site:jusbrasil.com.br "${companyName}"`

  const response = await multiApiSearch(query, 5)

  console.log('[Orchestrator] ⚖️ Buscando Jusbrasil:', companyName)
  console.log('[Orchestrator] 📊 Stats:', response.stats)

  for (const result of response.results) {
    if (!companyData) {
      // Fallback simples - aceitar primeiro resultado
      console.log('[Orchestrator] ✅ Jusbrasil encontrado (fallback):', result.url)
      return { url: result.url }
    }

    // VALIDAÇÃO ASSERTIVA para Jusbrasil
    const validation = validateJusbrasil({
      candidateUrl: result.url,
      candidateTitle: result.title,
      candidateSnippet: result.snippet,
      company: {
        cnpj,
        razao: companyData.razao,
        fantasia: companyData.fantasia,
        socios: companyData.socios,
      }
    })

    if (validation.linked) {
      console.log('[Orchestrator] ✅ Jusbrasil VÁLIDO encontrado:', result.url, `Score: ${validation.score}`)
      
      // Extrair informações do snippet
      const snippet = result.snippet.toLowerCase()
      const processos = snippet.match(/(\d+)\s*processos?/)?.[1] ? parseInt(snippet.match(/(\d+)\s*processos?/)?.[1] || '0') : undefined
      const socios = snippet.match(/(\d+)\s*sócios?/)?.[1] ? parseInt(snippet.match(/(\d+)\s*sócios?/)?.[1] || '0') : undefined
      
      return {
        url: result.url,
        processos,
        socios
      }
    } else {
      console.log('[Orchestrator] ❌ Jusbrasil REJEITADO:', result.url, `Score: ${validation.score}`)
    }
  }

  console.log('[Orchestrator] ⚠️ Nenhum Jusbrasil válido encontrado')
  return null
}

/**
 * Buscar marketplaces B2B com validação assertiva
 */
export async function searchMarketplaces(
  companyName: string,
  cnpj?: string,
  companyData?: { razao?: string; fantasia?: string; socios?: string[]; domain?: string }
): Promise<Array<{ plataforma: string; url: string; loja: string }>> {
  const marketplaces = [
    'b2bmarket.com.br',
    'mercadolivre.com.br',
    'olx.com.br',
    'enjoei.com.br',
    'marketplace.amazon.com.br',
    'shopee.com.br'
  ]

  const results: Array<{ plataforma: string; url: string; loja: string }> = []

  for (const marketplace of marketplaces) {
    const query = cnpj
      ? `site:${marketplace} "${companyName}" CNPJ ${cnpj}`
      : `site:${marketplace} "${companyName}"`

    const response = await multiApiSearch(query, 3)

    console.log('[Orchestrator] 🛒 Buscando marketplace:', marketplace, companyName)

    for (const result of response.results) {
      if (!companyData) {
        // Fallback simples
        results.push({
          plataforma: marketplace,
          url: result.url,
          loja: extractStoreName(result.url, marketplace)
        })
        continue
      }

      // VALIDAÇÃO ASSERTIVA para Marketplaces
      const validation = validateMarketplaceB2B({
        candidateUrl: result.url,
        candidateTitle: result.title,
        candidateSnippet: result.snippet,
        company: {
          cnpj,
          razao: companyData.razao,
          fantasia: companyData.fantasia,
          socios: companyData.socios,
          domain: companyData.domain,
        }
      })

      if (validation.linked) {
        console.log('[Orchestrator] ✅ Marketplace VÁLIDO:', result.url, `Score: ${validation.score}`)
        
        results.push({
          plataforma: marketplace,
          url: result.url,
          loja: extractStoreName(result.url, marketplace)
        })
      } else {
        console.log('[Orchestrator] ❌ Marketplace REJEITADO:', result.url, `Score: ${validation.score}`)
      }
    }
  }

  console.log('[Orchestrator] ✅ Marketplaces válidos encontrados:', results.length)
  return results
}

/**
 * Extrair nome da loja da URL do marketplace
 */
function extractStoreName(url: string, marketplace: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    switch (marketplace) {
      case 'mercadolivre.com.br':
        const mlMatch = pathname.match(/\/MLB-(\d+)/)
        return mlMatch ? `MLB-${mlMatch[1]}` : 'Loja MercadoLivre'
        
      case 'olx.com.br':
        const olxMatch = pathname.match(/\/perfil\/([^\/\?]+)/)
        return olxMatch ? olxMatch[1] : 'Perfil OLX'
        
      case 'shopee.com.br':
        const shopeeMatch = pathname.match(/\/shop\/(\d+)/)
        return shopeeMatch ? `Shop ${shopeeMatch[1]}` : 'Loja Shopee'
        
      default:
        return 'Loja Online'
    }
  } catch (e) {
    return 'Loja Online'
  }
}
