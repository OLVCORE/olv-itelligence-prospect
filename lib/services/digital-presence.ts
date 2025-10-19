/**
 * Serviço Avançado de Detecção de Presença Digital
 * Encontra: Website, Redes Sociais, Marketplaces, Portais
 */

interface DigitalPresence {
  website: {
    url: string
    title: string
    status: 'ativo' | 'inativo' | 'não encontrado'
  } | null
  redesSociais: {
    instagram?: { url: string; followers?: string }
    linkedin?: { url: string; type?: string } // company | person
    facebook?: { url: string; followers?: string }
    twitter?: { url: string; followers?: string }
    youtube?: { url: string; subscribers?: string }
  }
  marketplaces: Array<{
    plataforma: string
    url: string
    loja: string
  }>
  outrosLinks: Array<{
    tipo: string
    url: string
    titulo: string
  }>
}

export async function fetchDigitalPresence(
  companyName: string,
  cnpj: string,
  fantasia?: string
): Promise<DigitalPresence> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    console.warn('[DigitalPresence] ⚠️ Google CSE não configurado')
    return { website: null, redesSociais: {}, marketplaces: [], outrosLinks: [] }
  }

  console.log('[DigitalPresence] 🔍 Buscando presença digital para:', companyName)

  const results: DigitalPresence = {
    website: null,
    redesSociais: {},
    marketplaces: [],
    outrosLinks: [],
  }

  try {
    // 1. Buscar website oficial (específico com CNPJ)
    results.website = await findOfficialWebsite(companyName, cnpj, fantasia)

    // 2. Buscar redes sociais
    results.redesSociais = await findSocialMedia(companyName, cnpj, fantasia)

    // 3. Buscar presença em marketplaces
    results.marketplaces = await findMarketplaces(companyName, cnpj, fantasia)

    // 4. Buscar outros links relevantes (catálogos, portais B2B, etc)
    results.outrosLinks = await findOtherLinks(companyName, cnpj)

    console.log('[DigitalPresence] ✅ Presença digital mapeada:', {
      website: !!results.website,
      redesSociais: Object.keys(results.redesSociais).length,
      marketplaces: results.marketplaces.length,
      outrosLinks: results.outrosLinks.length,
    })

    return results
  } catch (error: any) {
    console.error('[DigitalPresence] ❌ Erro:', error.message)
    return results
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

async function findOfficialWebsite(
  companyName: string,
  cnpj: string,
  fantasia?: string
): Promise<DigitalPresence['website']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  // Buscar por nome + CNPJ + termos específicos
  const searchTerms = [
    `"${companyName}" CNPJ ${cnpj}`,
    fantasia ? `"${fantasia}" CNPJ ${cnpj}` : null,
    `"${companyName}" site oficial`,
  ].filter(Boolean)

  for (const query of searchTerms) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query!)}&num=5`
    
    try {
      const response = await fetch(url, { next: { revalidate: 3600 } })
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      for (const item of items) {
        const itemUrl = item.link || ''
        const title = item.title || ''
        const snippet = item.snippet || ''
        const text = `${title} ${snippet}`.toLowerCase()

        // Filtrar sites próprios (não marketplaces, não redes sociais)
        const isMarketplace = /mercadolivre|mercadolibre|amazon|b2w|magazineluiza|americanas|shopee|aliexpress/i.test(itemUrl)
        const isSocialMedia = /instagram\.com|facebook\.com|linkedin\.com|twitter\.com|youtube\.com/i.test(itemUrl)
        const isDirectory = /guiamais|paginas\-amarelas|empresas\-br/i.test(itemUrl)

        if (isMarketplace || isSocialMedia || isDirectory) continue

        // Verificar relevância
        const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 3)
        const matches = companyWords.filter(word => text.includes(word))

        if (matches.length >= Math.min(2, companyWords.length) || text.includes(cnpj)) {
          console.log('[DigitalPresence] ✅ Website oficial encontrado:', itemUrl)
          
          // Testar se está ativo
          const status = await checkWebsiteStatus(itemUrl)
          
          return {
            url: itemUrl,
            title: title.replace(/\s*[-|].*$/, '').trim(),
            status,
          }
        }
      }
    } catch (error) {
      console.error('[DigitalPresence] Erro ao buscar website:', error)
    }
  }

  console.log('[DigitalPresence] ⚠️ Website oficial não encontrado')
  return null
}

async function findSocialMedia(
  companyName: string,
  cnpj: string,
  fantasia?: string
): Promise<DigitalPresence['redesSociais']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  const redesSociais: DigitalPresence['redesSociais'] = {}

  const platforms = [
    { name: 'instagram', domain: 'instagram.com', query: `site:instagram.com "${fantasia || companyName}"` },
    { name: 'linkedin', domain: 'linkedin.com', query: `site:linkedin.com/company "${companyName}"` },
    { name: 'facebook', domain: 'facebook.com', query: `site:facebook.com "${fantasia || companyName}"` },
    { name: 'twitter', domain: 'twitter.com OR x.com', query: `(site:twitter.com OR site:x.com) "${fantasia || companyName}"` },
    { name: 'youtube', domain: 'youtube.com', query: `site:youtube.com "${fantasia || companyName}"` },
  ]

  for (const platform of platforms) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(platform.query)}&num=3`
      const response = await fetch(url, { next: { revalidate: 3600 } })
      
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      for (const item of items) {
        const itemUrl = item.link || ''
        const title = item.title || ''

        // Validar que é realmente o perfil da empresa
        const companyWords = (fantasia || companyName).toLowerCase().split(' ').filter(w => w.length > 3)
        const matches = companyWords.filter(word => title.toLowerCase().includes(word))

        if (matches.length >= 1) {
          console.log(`[DigitalPresence] ✅ ${platform.name} encontrado:`, itemUrl)
          
          if (platform.name === 'instagram') {
            redesSociais.instagram = { url: itemUrl }
          } else if (platform.name === 'linkedin') {
            redesSociais.linkedin = { url: itemUrl, type: itemUrl.includes('/company/') ? 'company' : 'person' }
          } else if (platform.name === 'facebook') {
            redesSociais.facebook = { url: itemUrl }
          } else if (platform.name === 'twitter') {
            redesSociais.twitter = { url: itemUrl }
          } else if (platform.name === 'youtube') {
            redesSociais.youtube = { url: itemUrl }
          }
          
          break // Apenas o primeiro resultado válido
        }
      }
    } catch (error) {
      console.error(`[DigitalPresence] Erro ao buscar ${platform.name}:`, error)
    }
  }

  return redesSociais
}

async function findMarketplaces(
  companyName: string,
  cnpj: string,
  fantasia?: string
): Promise<DigitalPresence['marketplaces']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  const marketplaces: DigitalPresence['marketplaces'] = []

  const platforms = [
    { name: 'Mercado Livre', domains: ['mercadolivre.com.br', 'mercadolibre.com'] },
    { name: 'Amazon', domains: ['amazon.com.br'] },
    { name: 'Magazine Luiza', domains: ['magazineluiza.com.br'] },
    { name: 'Americanas', domains: ['americanas.com.br', 'shoptime.com.br', 'submarino.com.br'] },
    { name: 'Shopee', domains: ['shopee.com.br'] },
  ]

  for (const platform of platforms) {
    try {
      const domainQuery = platform.domains.map(d => `site:${d}`).join(' OR ')
      const query = `(${domainQuery}) "${fantasia || companyName}"`
      
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=2`
      const response = await fetch(url, { next: { revalidate: 3600 } })
      
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      if (items.length > 0) {
        const item = items[0]
        console.log(`[DigitalPresence] ✅ ${platform.name} encontrado:`, item.link)
        
        marketplaces.push({
          plataforma: platform.name,
          url: item.link,
          loja: item.title.replace(/\s*[-|].*$/, '').trim(),
        })
      }
    } catch (error) {
      console.error(`[DigitalPresence] Erro ao buscar ${platform.name}:`, error)
    }
  }

  return marketplaces
}

async function findOtherLinks(
  companyName: string,
  cnpj: string
): Promise<DigitalPresence['outrosLinks']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  const outrosLinks: DigitalPresence['outrosLinks'] = []

  // Buscar em catálogos, portais B2B, etc
  const query = `"${companyName}" CNPJ ${cnpj} (produtos OR serviços OR catálogo OR portfólio)`
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5`
    const response = await fetch(url, { next: { revalidate: 3600 } })
    
    if (!response.ok) return outrosLinks

    const data = await response.json()
    const items = data.items || []

    for (const item of items) {
      const itemUrl = item.link || ''
      
      // Excluir duplicatas e sites já detectados
      const isAlreadyFound = /instagram\.com|facebook\.com|linkedin\.com|twitter\.com|youtube\.com|mercadolivre|amazon|magazineluiza|americanas|shopee/i.test(itemUrl)
      
      if (isAlreadyFound) continue

      // Classificar tipo de link
      let tipo = 'Outro'
      if (/catálogo|catalogo|produtos|portfolio|portfólio/i.test(item.title + item.snippet)) {
        tipo = 'Catálogo de Produtos'
      } else if (/b2b|fornecedor|atacado/i.test(item.title + item.snippet)) {
        tipo = 'Portal B2B'
      } else if (/notícia|news|imprensa/i.test(item.title + item.snippet)) {
        tipo = 'Notícia'
      }

      outrosLinks.push({
        tipo,
        url: itemUrl,
        titulo: item.title,
      })
    }
  } catch (error) {
    console.error('[DigitalPresence] Erro ao buscar outros links:', error)
  }

  return outrosLinks.slice(0, 5) // Máximo 5 links adicionais
}

async function checkWebsiteStatus(url: string): Promise<'ativo' | 'inativo' | 'não encontrado'> {
  try {
    // Fazer uma requisição HEAD rápida para verificar se o site responde
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24 horas
    })

    clearTimeout(timeoutId)

    if (response.ok || response.status === 301 || response.status === 302) {
      return 'ativo'
    } else if (response.status === 404 || response.status === 410) {
      return 'inativo'
    } else {
      return 'não encontrado'
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('[DigitalPresence] ⏱️ Timeout ao verificar website:', url)
    }
    return 'não encontrado'
  }
}

/**
 * Função helper para extrair nome de usuário/empresa de URLs de redes sociais
 */
export function extractSocialHandle(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname

    if (platform === 'instagram') {
      const match = path.match(/^\/([^\/]+)\/?$/)
      return match ? match[1] : null
    } else if (platform === 'linkedin') {
      const match = path.match(/\/company\/([^\/]+)/)
      return match ? match[1] : null
    } else if (platform === 'facebook') {
      const match = path.match(/^\/([^\/]+)\/?$/)
      return match ? match[1] : null
    } else if (platform === 'twitter' || platform === 'x') {
      const match = path.match(/^\/([^\/]+)\/?$/)
      return match ? match[1] : null
    }

    return null
  } catch {
    return null
  }
}

