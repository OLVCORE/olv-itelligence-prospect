/**
 * Serviço de integração com Google Custom Search Engine
 * Busca específica e relevante para empresas
 * 
 * NOTA: Agora usa sistema multi-API com fallback automático!
 * Se Google falhar (429), tenta Bing e Serper automaticamente.
 * 
 * Ver: lib/services/search/multi-search.ts
 */

import { searchCompanyWebsite, searchCompanyNews } from '../search/orchestrator'

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
  try {
    console.log('[GoogleCSE] 🔍 Buscando empresa via Multi-Search:', companyName, cnpj ? `(CNPJ: ${cnpj})` : '')

    // Usar sistema multi-API com fallback automático
    const [website, news] = await Promise.all([
      searchCompanyWebsite(companyName, cnpj),
      searchCompanyNews(companyName, cnpj, 5)
    ])

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
