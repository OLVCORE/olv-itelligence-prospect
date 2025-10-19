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
  jusbrasil: {
    url: string
    processos?: number
    socios?: number
    ultimaAtualizacao?: string
  } | null
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
    return { website: null, redesSociais: {}, marketplaces: [], jusbrasil: null, outrosLinks: [] }
  }

  console.log('[DigitalPresence] 🔍 Buscando presença digital para:', companyName)

  const results: DigitalPresence = {
    website: null,
    redesSociais: {},
    marketplaces: [],
    jusbrasil: null,
    outrosLinks: [],
  }

  try {
    // BUSCA SEQUENCIAL COM TIMEOUT (evita 504)
    const startTime = Date.now()
    const maxTime = 8000 // 8 segundos máximo

    // 1. Website oficial (PRIORIDADE - busca rápida)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 🏠 Buscando website...')
      results.website = await findOfficialWebsite(companyName, cnpj, fantasia)
    }

    // 2. Redes sociais (busca limitada)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 📱 Buscando redes sociais...')
      results.redesSociais = await findSocialMedia(companyName, cnpj, fantasia)
    }

    // 3. Jusbrasil (importante para empresas brasileiras)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] ⚖️ Buscando Jusbrasil...')
      results.jusbrasil = await findJusbrasil(companyName, cnpj, fantasia)
    }

    // 4. Marketplaces (busca limitada)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 🛒 Buscando marketplaces...')
      results.marketplaces = await findMarketplaces(companyName, cnpj, fantasia)
    }

    // 5. Outros links (busca rápida)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 🔗 Buscando outros links...')
      results.outrosLinks = await findOtherLinks(companyName, cnpj)
    }

    const totalTime = Date.now() - startTime
    console.log('[DigitalPresence] ✅ Presença digital mapeada em', totalTime, 'ms:', {
      website: !!results.website,
      redesSociais: Object.keys(results.redesSociais).length,
      marketplaces: results.marketplaces.length,
      jusbrasil: !!results.jusbrasil,
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

  // ESTRATÉGIAS OTIMIZADAS (máximo 5 para evitar timeout)
  const searchStrategies = [
    // Estratégia 1: Nome exato + CNPJ (MAIS EFICAZ)
    `"${companyName}" CNPJ ${cnpj}`,
    
    // Estratégia 2: Fantasia + CNPJ (SEGUNDA OPÇÃO)
    fantasia ? `"${fantasia}" CNPJ ${cnpj}` : null,
    
    // Estratégia 3: Nome + site oficial
    `"${companyName}" site oficial`,
    
    // Estratégia 4: Fantasia + site oficial
    fantasia ? `"${fantasia}" site oficial` : null,
    
    // Estratégia 5: Busca ampla (fallback)
    `${companyName} ${cnpj}`,
  ].filter(Boolean)

  console.log(`[DigitalPresence] 🔍 Executando ${searchStrategies.length} estratégias de busca para website`)

  for (const query of searchStrategies) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query!)}&num=10`
    
    try {
      const response = await fetch(url, { next: { revalidate: 3600 } })
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      console.log(`[DigitalPresence] 📊 Estratégia "${query}" retornou ${items.length} resultados`)

      for (const item of items) {
        const itemUrl = item.link || ''
        const title = item.title || ''
        const snippet = item.snippet || ''
        const text = `${title} ${snippet}`.toLowerCase()

        // FILTROS MAIS PERMISSIVOS - apenas excluir óbvios
        const isObviousExclusion = /wikipedia|youtube\.com\/watch|facebook\.com\/watch|instagram\.com\/p\//i.test(itemUrl)
        
        if (isObviousExclusion) continue

        // Verificar relevância com critérios mais flexíveis
        const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 2)
        const fantasiaWords = fantasia ? fantasia.toLowerCase().split(' ').filter(w => w.length > 2) : []
        const allWords = [...companyWords, ...fantasiaWords]
        
        const matches = allWords.filter(word => text.includes(word))
        const cnpjInText = text.includes(cnpj.replace(/\D/g, ''))
        
        // Critério mais permissivo: pelo menos 1 palavra OU CNPJ
        if (matches.length >= 1 || cnpjInText) {
          console.log(`[DigitalPresence] ✅ Website candidato encontrado: ${itemUrl}`)
          console.log(`[DigitalPresence] 📝 Matches: ${matches.length}, CNPJ: ${cnpjInText}`)
          
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
      console.error(`[DigitalPresence] Erro na estratégia "${query}":`, error)
    }
  }

  console.log('[DigitalPresence] ⚠️ Website oficial não encontrado após todas as estratégias')
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

  // ESTRATÉGIAS OTIMIZADAS (máximo 2 por plataforma)
  const platforms = [
    { 
      name: 'instagram', 
      domain: 'instagram.com', 
      strategies: [
        `site:instagram.com "${fantasia || companyName}"`,
        `"${fantasia || companyName}" instagram`,
      ]
    },
    { 
      name: 'linkedin', 
      domain: 'linkedin.com', 
      strategies: [
        `site:linkedin.com/company "${companyName}"`,
        `"${companyName}" linkedin company`,
      ]
    },
    { 
      name: 'facebook', 
      domain: 'facebook.com', 
      strategies: [
        `site:facebook.com "${fantasia || companyName}"`,
        `"${fantasia || companyName}" facebook`,
      ]
    },
    { 
      name: 'twitter', 
      domain: 'twitter.com OR x.com', 
      strategies: [
        `(site:twitter.com OR site:x.com) "${fantasia || companyName}"`,
        `"${fantasia || companyName}" twitter`,
      ]
    },
    { 
      name: 'youtube', 
      domain: 'youtube.com', 
      strategies: [
        `site:youtube.com "${fantasia || companyName}"`,
        `"${fantasia || companyName}" youtube`,
      ]
    },
  ]

  for (const platform of platforms) {
    console.log(`[DigitalPresence] 🔍 Buscando ${platform.name} com ${platform.strategies.length} estratégias`)
    
    for (const strategy of platform.strategies) {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(strategy)}&num=5`
        const response = await fetch(url, { next: { revalidate: 3600 } })
        
        if (!response.ok) continue

        const data = await response.json()
        const items = data.items || []

        console.log(`[DigitalPresence] 📊 ${platform.name} estratégia "${strategy}" retornou ${items.length} resultados`)

        for (const item of items) {
          const itemUrl = item.link || ''
          const title = item.title || ''
          const snippet = item.snippet || ''
          const text = `${title} ${snippet}`.toLowerCase()

          // Verificar se é realmente o perfil da empresa (critério mais permissivo)
          const companyWords = (fantasia || companyName).toLowerCase().split(' ').filter(w => w.length > 2)
          const matches = companyWords.filter(word => text.includes(word))
          
          // Aceitar se pelo menos 1 palavra da empresa aparecer OU se URL contém nome
          const urlContainsName = companyWords.some(word => itemUrl.toLowerCase().includes(word))
          
          if (matches.length >= 1 || urlContainsName) {
            console.log(`[DigitalPresence] ✅ ${platform.name} encontrado: ${itemUrl}`)
            console.log(`[DigitalPresence] 📝 Matches: ${matches.length}, URL match: ${urlContainsName}`)
            
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
            
            break // Apenas o primeiro resultado válido por plataforma
          }
        }
        
        // Se já encontrou para esta plataforma, pular outras estratégias
        if (redesSociais[platform.name as keyof typeof redesSociais]) {
          break
        }
      } catch (error) {
        console.error(`[DigitalPresence] Erro ao buscar ${platform.name} com estratégia "${strategy}":`, error)
      }
    }
  }

  console.log(`[DigitalPresence] 📱 Redes sociais encontradas: ${Object.keys(redesSociais).join(', ')}`)
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

  // PORTAL B2B PRIORITÁRIOS (máximo 8 para evitar timeout)
  const platforms = [
    // Portais B2B Específicos (PRIORIDADE!)
    { name: 'B2Brazil', domains: ['b2brazil.com.br'] },
    { name: 'GlobSupplies', domains: ['globsupplies.com'] },
    { name: 'Alibaba', domains: ['alibaba.com'] },
    { name: 'TradeFord', domains: ['tradeford.com'] },
    { name: 'ExportHub', domains: ['exporthub.com'] },
    { name: 'TradeKey', domains: ['tradekey.com'] },
    { name: 'EC21', domains: ['ec21.com'] },
    { name: 'Global Sources', domains: ['globalsources.com'] },
  ]

  for (const platform of platforms) {
    console.log(`[DigitalPresence] 🔍 Buscando ${platform.name} com ${platform.domains.length} domínios`)
    
    for (const domain of platform.domains) {
      try {
        // ESTRATÉGIAS MÚLTIPLAS POR PLATAFORMA
        const strategies = [
          `site:${domain} "${fantasia || companyName}"`,
          `site:${domain} ${fantasia || companyName}`,
          `"${fantasia || companyName}" ${domain}`,
          `${fantasia || companyName} ${domain}`,
          `site:${domain} CNPJ ${cnpj}`,
        ]
        
        for (const strategy of strategies) {
          const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(strategy)}&num=3`
          const response = await fetch(url, { next: { revalidate: 3600 } })
          
          if (!response.ok) continue

          const data = await response.json()
          const items = data.items || []

          console.log(`[DigitalPresence] 📊 ${platform.name} estratégia "${strategy}" retornou ${items.length} resultados`)

          if (items.length > 0) {
            const item = items[0]
            const itemUrl = item.link || ''
            const title = item.title || ''
            const snippet = item.snippet || ''
            const text = `${title} ${snippet}`.toLowerCase()

            // Verificar relevância (critério mais permissivo)
            const companyWords = (fantasia || companyName).toLowerCase().split(' ').filter(w => w.length > 2)
            const matches = companyWords.filter(word => text.includes(word))
            const cnpjInText = text.includes(cnpj.replace(/\D/g, ''))
            
            // Aceitar se pelo menos 1 palavra da empresa OU CNPJ
            if (matches.length >= 1 || cnpjInText) {
              console.log(`[DigitalPresence] ✅ ${platform.name} encontrado: ${itemUrl}`)
              console.log(`[DigitalPresence] 📝 Matches: ${matches.length}, CNPJ: ${cnpjInText}`)
              
              marketplaces.push({
                plataforma: platform.name,
                url: itemUrl,
                loja: title.replace(/\s*[-|].*$/, '').trim(),
              })
              
              break // Apenas o primeiro resultado válido por plataforma
            }
          }
        }
        
        // Se já encontrou para esta plataforma, pular outros domínios
        if (marketplaces.some(mp => mp.plataforma === platform.name)) {
          break
        }
      } catch (error) {
        console.error(`[DigitalPresence] Erro ao buscar ${platform.name} no domínio ${domain}:`, error)
      }
    }
  }

  console.log(`[DigitalPresence] 🛒 Marketplaces encontrados: ${marketplaces.map(mp => mp.plataforma).join(', ')}`)
  return marketplaces
}

async function findJusbrasil(
  companyName: string,
  cnpj: string,
  fantasia?: string
): Promise<DigitalPresence['jusbrasil']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  console.log(`[DigitalPresence] ⚖️ Buscando Jusbrasil para: ${companyName}`)

  // ESTRATÉGIAS OTIMIZADAS (máximo 3 para evitar timeout)
  const strategies = [
    // Estratégia 1: Nome + site:jusbrasil.com.br (MAIS EFICAZ)
    `site:jusbrasil.com.br "${companyName}"`,
    
    // Estratégia 2: Fantasia + site:jusbrasil.com.br
    fantasia ? `site:jusbrasil.com.br "${fantasia}"` : null,
    
    // Estratégia 3: Nome + CNPJ + jusbrasil
    `"${companyName}" CNPJ ${cnpj} jusbrasil`,
  ].filter(Boolean)

  for (const strategy of strategies) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(strategy!)}&num=5`
      const response = await fetch(url, { next: { revalidate: 3600 } })
      
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      console.log(`[DigitalPresence] 📊 Jusbrasil estratégia "${strategy}" retornou ${items.length} resultados`)

      for (const item of items) {
        const itemUrl = item.link || ''
        const title = item.title || ''
        const snippet = item.snippet || ''
        const text = `${title} ${snippet}`.toLowerCase()

        // Verificar se é realmente o perfil da empresa no Jusbrasil
        const companyWords = (fantasia || companyName).toLowerCase().split(' ').filter(w => w.length > 2)
        const matches = companyWords.filter(word => text.includes(word))
        const cnpjInText = text.includes(cnpj.replace(/\D/g, ''))
        
        // Aceitar se pelo menos 1 palavra da empresa OU CNPJ
        if (matches.length >= 1 || cnpjInText) {
          console.log(`[DigitalPresence] ✅ Jusbrasil encontrado: ${itemUrl}`)
          console.log(`[DigitalPresence] 📝 Matches: ${matches.length}, CNPJ: ${cnpjInText}`)
          
          // Tentar extrair informações do snippet
          let processos = 0
          let socios = 0
          
          // Buscar números de processos no snippet
          const processosMatch = snippet.match(/(\d+)\s*(?:processos?|ações?|casos?)/i)
          if (processosMatch) {
            processos = parseInt(processosMatch[1])
          }
          
          // Buscar números de sócios no snippet
          const sociosMatch = snippet.match(/(\d+)\s*(?:sócios?|socios?|administradores?)/i)
          if (sociosMatch) {
            socios = parseInt(sociosMatch[1])
          }
          
          return {
            url: itemUrl,
            processos: processos > 0 ? processos : undefined,
            socios: socios > 0 ? socios : undefined,
            ultimaAtualizacao: new Date().toISOString().split('T')[0], // Data atual
          }
        }
      }
    } catch (error) {
      console.error(`[DigitalPresence] Erro na estratégia Jusbrasil "${strategy}":`, error)
    }
  }

  console.log('[DigitalPresence] ⚠️ Jusbrasil não encontrado')
  return null
}

async function findOtherLinks(
  companyName: string,
  cnpj: string
): Promise<DigitalPresence['outrosLinks']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  const outrosLinks: DigitalPresence['outrosLinks'] = []

  // ESTRATÉGIAS OTIMIZADAS (máximo 3 para evitar timeout)
  const strategies = [
    // Busca específica por catálogos
    `"${companyName}" (catálogo OR catalogo OR produtos OR portfólio)`,
    
    // Busca por portais B2B genéricos
    `"${companyName}" (b2b OR fornecedor OR atacado)`,
    
    // Busca ampla com CNPJ
    `"${companyName}" CNPJ ${cnpj}`,
  ]

  console.log(`[DigitalPresence] 🔍 Executando ${strategies.length} estratégias para outros links`)

  for (const strategy of strategies) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(strategy)}&num=5`
      const response = await fetch(url, { next: { revalidate: 3600 } })
      
      if (!response.ok) continue

      const data = await response.json()
      const items = data.items || []

      console.log(`[DigitalPresence] 📊 Estratégia "${strategy}" retornou ${items.length} resultados`)

      for (const item of items) {
        const itemUrl = item.link || ''
        const title = item.title || ''
        const snippet = item.snippet || ''
        const text = `${title} ${snippet}`.toLowerCase()

        // Excluir duplicatas e sites já detectados
        const isAlreadyFound = /instagram\.com|facebook\.com|linkedin\.com|twitter\.com|youtube\.com|mercadolivre|amazon|magazineluiza|americanas|shopee|b2brazil|globsupplies|alibaba|tradeford|exporthub|tradekey|ec21|globalsources|exportportal|worldtrade/i.test(itemUrl)
        
        if (isAlreadyFound) continue

        // Verificar relevância
        const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 2)
        const matches = companyWords.filter(word => text.includes(word))
        const cnpjInText = text.includes(cnpj.replace(/\D/g, ''))
        
        // Aceitar se pelo menos 1 palavra da empresa OU CNPJ
        if (matches.length >= 1 || cnpjInText) {
          // Classificar tipo de link
          let tipo = 'Outro'
          if (/catálogo|catalogo|produtos|portfolio|portfólio/i.test(text)) {
            tipo = 'Catálogo de Produtos'
          } else if (/b2b|fornecedor|atacado|distribuidor/i.test(text)) {
            tipo = 'Portal B2B'
          } else if (/notícia|noticia|news|imprensa/i.test(text)) {
            tipo = 'Notícia'
          } else if (/certificação|certificacao|registro|licença/i.test(text)) {
            tipo = 'Certificação/Registro'
          } else if (/associação|associacao|sindicato|federação/i.test(text)) {
            tipo = 'Associação/Sindicato'
          }

          console.log(`[DigitalPresence] ✅ Outro link encontrado: ${itemUrl} (${tipo})`)

          outrosLinks.push({
            tipo,
            url: itemUrl,
            titulo: title,
          })
        }
      }
    } catch (error) {
      console.error(`[DigitalPresence] Erro na estratégia "${strategy}":`, error)
    }
  }

  // Remover duplicatas por URL
  const uniqueLinks = outrosLinks.filter((link, index, self) => 
    index === self.findIndex(l => l.url === link.url)
  )

  console.log(`[DigitalPresence] 🔗 Outros links encontrados: ${uniqueLinks.length}`)
  return uniqueLinks.slice(0, 8) // Máximo 8 links adicionais
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

