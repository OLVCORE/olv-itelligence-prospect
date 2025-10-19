/**
 * Serviço de integração com Google Custom Search Engine
 * Busca específica e relevante para empresas
 */

interface GoogleCSEResult {
  website: { url: string; title: string } | null
  news: Array<{
    title: string
    snippet: string
    link: string
    date?: string
  }>
}

export async function fetchGoogleCSE(companyName: string, cnpj?: string): Promise<GoogleCSEResult> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    console.warn('[GoogleCSE] ⚠️ Credenciais não configuradas, retornando vazio')
    return { website: null, news: [] }
  }

  try {
    console.log('[GoogleCSE] 🔍 Buscando empresa:', companyName, cnpj ? `(CNPJ: ${cnpj})` : '')

    // Busca 1: Site oficial - muito mais específica
    const siteQuery = cnpj 
      ? `"${companyName}" CNPJ ${cnpj} (site oficial OR sobre OR empresa)`
      : `"${companyName}" (site oficial OR sobre OR empresa OR contato)`
    
    const siteUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(siteQuery)}&num=3`
    const siteResponse = await fetch(siteUrl, { next: { revalidate: 3600 } })
    
    if (!siteResponse.ok) {
      console.error('[GoogleCSE] ❌ Erro na busca de site:', siteResponse.status)
      return { website: null, news: [] }
    }
    
    const siteData = await siteResponse.json()
    
    // Filtrar apenas resultados que mencionam a empresa
    let website = null
    for (const item of siteData.items || []) {
      const text = `${item.title} ${item.snippet}`.toLowerCase()
      const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
      
      // Verificar se o resultado realmente é sobre a empresa
      const relevantMatches = companyWords.filter(word => text.includes(word))
      if (relevantMatches.length >= Math.min(2, companyWords.length)) {
        website = { url: item.link, title: item.title }
        break
      }
    }

    // Busca 2: Notícias recentes - MUITO mais específica
    const newsQuery = cnpj
      ? `"${companyName}" CNPJ ${cnpj} (anuncia OR lança OR investimento OR expansão OR contrato)`
      : `"${companyName}" (anuncia OR lança OR investimento OR expansão OR contrato OR novidade)`
    
    const newsUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(newsQuery)}&num=5&dateRestrict=y1` // Apenas último ano
    const newsResponse = await fetch(newsUrl, { next: { revalidate: 1800 } })
    
    if (!newsResponse.ok) {
      console.error('[GoogleCSE] ❌ Erro na busca de notícias:', newsResponse.status)
      return { website, news: [] }
    }
    
    const newsData = await newsResponse.json()

    // Filtrar notícias relevantes
    const news = (newsData.items || [])
      .filter((item: any) => {
        const text = `${item.title} ${item.snippet}`.toLowerCase()
        const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
        
        // Verificar relevância
        const relevantMatches = companyWords.filter(word => text.includes(word))
        
        // Excluir resultados muito genéricos
        const excludeTerms = [
          'bilionário', 'criptomoeda', 'bitcoin', 'defesa civil',
          'aggregation report', 'mapa em tempo real', 'como agir'
        ]
        const hasExcludedTerm = excludeTerms.some(term => text.includes(term))
        
        // Aceitar apenas se:
        // - Tem pelo menos 2 palavras-chave da empresa
        // - OU tem CNPJ mencionado
        // - E não tem termos excluídos
        const hasCnpj = cnpj && text.includes(cnpj.replace(/\D/g, ''))
        return (relevantMatches.length >= 2 || hasCnpj) && !hasExcludedTerm
      })
      .slice(0, 3)
      .map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        date: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
              item.pagemap?.metatags?.[0]?.['og:updated_time'] ||
              null,
      }))

    console.log('[GoogleCSE] ✅ Website:', website?.url || 'não encontrado')
    console.log('[GoogleCSE] ✅ Notícias relevantes:', news.length)

    return { website, news }
  } catch (error: any) {
    console.error('[GoogleCSE] ❌ Erro:', error.message)
    return { website: null, news: [] }
  }
}

export async function resolveCnpjFromWebsite(domain: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    return null
  }

  try {
    console.log('[GoogleCSE] 🔍 Resolvendo CNPJ do domínio:', domain)

    // Buscar páginas com CNPJ do domínio
    const queries = [
      `site:${domain} CNPJ`,
      `site:${domain} "CNPJ:" OR "CNPJ "`,
      `"${domain}" CNPJ -site:${domain}`,
    ]

    for (const query of queries) {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5`
      const response = await fetch(url, { next: { revalidate: 3600 } })
      const data = await response.json()

      // Procurar CNPJ nos snippets
      for (const item of data.items || []) {
        const text = `${item.title} ${item.snippet}`.toUpperCase()
        const cnpjMatch = text.match(/CNPJ[:\s]*(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/i)
        
        if (cnpjMatch) {
          const cnpj = cnpjMatch[1].replace(/\D/g, '')
          console.log('[GoogleCSE] ✅ CNPJ encontrado:', cnpj)
          return cnpj
        }
      }
    }

    console.log('[GoogleCSE] ⚠️ CNPJ não encontrado para domínio:', domain)
    return null
  } catch (error: any) {
    console.error('[GoogleCSE] ❌ Erro ao resolver CNPJ:', error.message)
    return null
  }
}
