/**
 * Serviço de integração com Google Custom Search Engine
 */

interface GoogleCSEResult {
  website: string | null
  news: Array<{
    title: string
    snippet: string
    link: string
    date?: string
  }>
}

export async function fetchGoogleCSE(query: string): Promise<GoogleCSEResult> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    console.warn('[GoogleCSE] ⚠️ Credenciais não configuradas, retornando vazio')
    return { website: null, news: [] }
  }

  try {
    console.log('[GoogleCSE] 🔍 Buscando:', query)

    // Busca 1: Site oficial
    const siteUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query + ' site oficial')}&num=3`
    const siteResponse = await fetch(siteUrl, { next: { revalidate: 3600 } })
    const siteData = await siteResponse.json()
    
    const website = siteData.items?.[0]?.link || null

    // Busca 2: Notícias recentes
    const newsUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query + ' notícias')}&num=3&sort=date`
    const newsResponse = await fetch(newsUrl, { next: { revalidate: 1800 } })
    const newsData = await newsResponse.json()

    const news = (newsData.items || []).slice(0, 3).map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      date: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
    }))

    console.log('[GoogleCSE] ✅ Website:', website || 'não encontrado')
    console.log('[GoogleCSE] ✅ Notícias:', news.length)

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

