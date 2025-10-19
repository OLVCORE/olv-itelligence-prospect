/**
 * Serviço Avançado de Detecção de Presença Digital
 * Encontra: Website, Redes Sociais, Marketplaces, Portais
 * MÓDULO 9: Com validação ASSERTIVA por CNPJ/sócios/domínio
 */

import { SEARCH_ASSERTIVE } from '@/lib/config/feature-flags'
import { validateLink, validateJusbrasil as validateJusbr, validateMarketplaceB2B } from '@/lib/search/validators/link-validation'

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

/**
 * MÓDULO 9: Valida se um resultado está realmente vinculado à empresa
 * Usa validação ASSERTIVA se flag SEARCH_ASSERTIVE=true
 */
function validateCompanyLink(
  itemUrl: string,
  title: string,
  snippet: string,
  companyName: string,
  cnpj: string,
  fantasia?: string,
  domain?: string
): { isValid: boolean; confidence: number; reason: string } {
  // Se flag SEARCH_ASSERTIVE ativa, usar validação do Módulo 9
  if (SEARCH_ASSERTIVE) {
    const result = validateLink({
      candidateUrl: itemUrl,
      candidateTitle: title,
      candidateSnippet: snippet,
      company: {
        cnpj,
        razao: companyName,
        fantasia,
        domain,
      },
    })

    return {
      isValid: result.linked,
      confidence: result.score,
      reason: result.reasons.join('; '),
    }
  }

  // Fallback: validação original (menos rigorosa)
  {
  const text = `${title} ${snippet}`.toLowerCase()
  const url = itemUrl.toLowerCase()
  
  // 1. VALIDAÇÃO POR CNPJ (MAIS CONFIÁVEL)
  const cnpjClean = cnpj.replace(/\D/g, '')
  const cnpjInText = text.includes(cnpjClean) || url.includes(cnpjClean)
  
  if (cnpjInText) {
    return { isValid: true, confidence: 100, reason: 'CNPJ encontrado no conteúdo' }
  }
  
  // 2. VALIDAÇÃO POR NOME EXATO DA EMPRESA
  const companyWords = companyName.toLowerCase().split(' ').filter(w => w.length > 2)
  const fantasiaWords = fantasia ? fantasia.toLowerCase().split(' ').filter(w => w.length > 2) : []
  const allWords = [...companyWords, ...fantasiaWords]
  
  const exactMatches = allWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(text) || regex.test(url)
  })
  
  // 3. VALIDAÇÃO POR DOMÍNIO ESPECÍFICO
  const domainMatches = allWords.some(word => {
    const domainPattern = new RegExp(`[./]${word}[./]`, 'i')
    return domainPattern.test(url)
  })
  
  // 4. VALIDAÇÃO POR PALAVRAS-CHAVE ESPECÍFICAS
  const specificKeywords = ['olv', 'internacional', 'comercio', 'importacao', 'exportacao']
  const keywordMatches = specificKeywords.filter(keyword => 
    text.includes(keyword) || url.includes(keyword)
  )
  
  // 5. CALCULAR CONFIANÇA
  let confidence = 0
  let reason = ''
  
  if (exactMatches.length >= Math.min(3, allWords.length)) {
    confidence = 90
    reason = `Nome da empresa encontrado (${exactMatches.length}/${allWords.length} palavras)`
  } else if (exactMatches.length >= 2) {
    confidence = 70
    reason = `Nome parcial da empresa encontrado (${exactMatches.length}/${allWords.length} palavras)`
  } else if (domainMatches) {
    confidence = 80
    reason = 'Domínio contém nome da empresa'
  } else if (keywordMatches.length >= 2) {
    confidence = 60
    reason = `Palavras-chave específicas encontradas (${keywordMatches.join(', ')})`
  } else if (exactMatches.length >= 1) {
    confidence = 40
    reason = `Apenas 1 palavra da empresa encontrada`
  } else {
    confidence = 0
    reason = 'Nenhuma correlação encontrada'
  }
  
  // 6. FILTROS DE EXCLUSÃO
  const exclusionPatterns = [
    /pdf/i, // PDFs genéricos
    /documento/i,
    /arquivo/i,
    /download/i,
    /\.pdf$/i,
    /barueri/i, // Cidade específica sem relação
    /j\.a\.\s*oliveira/i, // Empresa diferente
    /olvglobal/i, // Perfil diferente
  ]
  
  const hasExclusion = exclusionPatterns.some(pattern => 
    pattern.test(text) || pattern.test(url)
  )
  
  if (hasExclusion) {
    confidence = Math.max(0, confidence - 50)
    reason += ' (filtro de exclusão aplicado)'
  }
  
  return {
    isValid: confidence >= 50,
    confidence,
    reason
  }
  } // fim do fallback
}

export async function fetchDigitalPresence(
  companyName: string,
  cnpj: string,
  fantasia?: string,
  website?: string
): Promise<DigitalPresence> {
  // Extrair domínio do website para validação (se fornecido)
  let domain: string | undefined = undefined
  if (website) {
    try {
      domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace('www.', '')
      console.log('[DigitalPresence] 🌐 Domínio oficial fornecido:', domain)
    } catch (e) {
      console.warn('[DigitalPresence] ⚠️ Erro ao extrair domínio:', e)
    }
  }
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
    const maxTime = 15000 // 15 segundos máximo (Vercel limite é 10s, mas vamos tentar)

    // 1. Website oficial (PRIORIDADE - busca rápida)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 🏠 Buscando website...')
      results.website = await findOfficialWebsite(companyName, cnpj, fantasia)
      
      // ATUALIZAR DOMÍNIO após encontrar website (para validações subsequentes)
      if (results.website && !domain) {
        try {
          domain = new URL(results.website.url).hostname.replace('www.', '')
          console.log('[DigitalPresence] 🌐 Domínio detectado:', domain)
        } catch (e) {
          console.warn('[DigitalPresence] ⚠️ Erro ao extrair domínio do website:', e)
        }
      }
    }

    // 2. Redes sociais (busca limitada)
    if (Date.now() - startTime < maxTime) {
      console.log('[DigitalPresence] 📱 Buscando redes sociais...')
      results.redesSociais = await findSocialMedia(companyName, cnpj, fantasia, domain)
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

  // ESTRATÉGIAS COMPLETAS DE BUSCA PROFUNDA (10 estratégias)
  const searchStrategies = [
    // Estratégia 1: Nome exato + CNPJ (MAIS EFICAZ)
    `"${companyName}" CNPJ ${cnpj}`,
    
    // Estratégia 2: Fantasia + CNPJ (SEGUNDA OPÇÃO)
    fantasia ? `"${fantasia}" CNPJ ${cnpj}` : null,
    
    // Estratégia 3: Nome + site oficial
    `"${companyName}" site oficial`,
    
    // Estratégia 4: Fantasia + site oficial
    fantasia ? `"${fantasia}" site oficial` : null,
    
    // Estratégia 5: Nome + .com.br
    `"${companyName}" .com.br`,
    
    // Estratégia 6: Fantasia + .com.br
    fantasia ? `"${fantasia}" .com.br` : null,
    
    // Estratégia 7: Nome + website
    `"${companyName}" website`,
    
    // Estratégia 8: Fantasia + website
    fantasia ? `"${fantasia}" website` : null,
    
    // Estratégia 9: Nome + homepage
    `"${companyName}" homepage`,
    
    // Estratégia 10: Busca ampla (fallback)
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

        // VALIDAÇÃO ASSERTIVA - verificar se realmente pertence à empresa
        const validation = validateCompanyLink(itemUrl, title, snippet, companyName, cnpj, fantasia, domain)
        
        if (validation.isValid) {
          console.log(`[DigitalPresence] ✅ Website VÁLIDO encontrado: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
          
          // Testar se está ativo
          const status = await checkWebsiteStatus(itemUrl)
          
          return {
            url: itemUrl,
            title: title.replace(/\s*[-|].*$/, '').trim(),
            status,
          }
        } else {
          console.log(`[DigitalPresence] ❌ Website REJEITADO: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
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
  fantasia?: string,
  domain?: string
): Promise<DigitalPresence['redesSociais']> {
  const apiKey = process.env.GOOGLE_API_KEY!
  const cseId = process.env.GOOGLE_CSE_ID!

  const redesSociais: DigitalPresence['redesSociais'] = {}

  // ESTRATÉGIAS COMPLETAS PARA CADA PLATAFORMA (6 estratégias cada)
  const platforms = [
    { 
      name: 'instagram', 
      domain: 'instagram.com', 
      strategies: [
        `site:instagram.com "${fantasia || companyName}"`,
        `site:instagram.com ${fantasia || companyName}`,
        `"${fantasia || companyName}" instagram`,
        `${fantasia || companyName} instagram`,
        `instagram.com/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
        `instagram.com/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
      ]
    },
    { 
      name: 'linkedin', 
      domain: 'linkedin.com', 
      strategies: [
        `site:linkedin.com/company "${companyName}"`,
        `site:linkedin.com/company ${companyName}`,
        `"${companyName}" linkedin company`,
        `${companyName} linkedin company`,
        `site:linkedin.com "${fantasia || companyName}"`,
        `"${fantasia || companyName}" linkedin`,
      ]
    },
    { 
      name: 'facebook', 
      domain: 'facebook.com', 
      strategies: [
        `site:facebook.com "${fantasia || companyName}"`,
        `site:facebook.com ${fantasia || companyName}`,
        `"${fantasia || companyName}" facebook`,
        `${fantasia || companyName} facebook`,
        `facebook.com/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
      ]
    },
    { 
      name: 'twitter', 
      domain: 'twitter.com OR x.com', 
      strategies: [
        `(site:twitter.com OR site:x.com) "${fantasia || companyName}"`,
        `(site:twitter.com OR site:x.com) ${fantasia || companyName}`,
        `"${fantasia || companyName}" twitter`,
        `"${fantasia || companyName}" x.com`,
        `twitter.com/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
        `x.com/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
      ]
    },
    { 
      name: 'youtube', 
      domain: 'youtube.com', 
      strategies: [
        `site:youtube.com "${fantasia || companyName}"`,
        `site:youtube.com ${fantasia || companyName}`,
        `"${fantasia || companyName}" youtube`,
        `${fantasia || companyName} youtube`,
        `youtube.com/c/${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
        `youtube.com/@${(fantasia || companyName).toLowerCase().replace(/\s+/g, '')}`,
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

          // VALIDAÇÃO ASSERTIVA - verificar se realmente pertence à empresa
          const validation = validateCompanyLink(itemUrl, title, snippet, companyName, cnpj, fantasia)
          
          if (validation.isValid) {
            console.log(`[DigitalPresence] ✅ ${platform.name} VÁLIDO encontrado: ${itemUrl}`)
            console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
            
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

  // PORTAL B2B COMPLETOS + MARKETPLACES TRADICIONAIS (20 plataformas)
  const platforms = [
    // Portais B2B Específicos (PRIORIDADE!)
    { name: 'B2Brazil', domains: ['b2brazil.com.br', 'b2brazil.com'] },
    { name: 'GlobSupplies', domains: ['globsupplies.com', 'globsupplies.com/marketplace'] },
    { name: 'Alibaba', domains: ['alibaba.com', 'alibaba.com.br'] },
    { name: 'TradeFord', domains: ['tradeford.com'] },
    { name: 'ExportHub', domains: ['exporthub.com'] },
    { name: 'TradeKey', domains: ['tradekey.com'] },
    { name: 'EC21', domains: ['ec21.com'] },
    { name: 'Global Sources', domains: ['globalsources.com'] },
    { name: 'Export Portal', domains: ['exportportal.com'] },
    { name: 'World Trade', domains: ['worldtrade.com'] },
    { name: 'Tridge', domains: ['tridge.com'] },
    { name: 'ExportersIndia', domains: ['exportersindia.com'] },
    { name: 'Go4WorldBusiness', domains: ['go4worldbusiness.com'] },
    { name: 'Africa B2B', domains: ['africa-b2b.com'] },
    { name: 'Foreign Trade Online', domains: ['foreigntradeonline.com'] },
    
    // Marketplaces Tradicionais
    { name: 'Mercado Livre', domains: ['mercadolivre.com.br', 'mercadolibre.com'] },
    { name: 'Amazon', domains: ['amazon.com.br'] },
    { name: 'Magazine Luiza', domains: ['magazineluiza.com.br'] },
    { name: 'Americanas', domains: ['americanas.com.br', 'shoptime.com.br', 'submarino.com.br'] },
    { name: 'Shopee', domains: ['shopee.com.br'] },
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

            // VALIDAÇÃO ASSERTIVA - verificar se realmente pertence à empresa
            const validation = validateCompanyLink(itemUrl, title, snippet, companyName, cnpj, fantasia)
            
            if (validation.isValid) {
              console.log(`[DigitalPresence] ✅ ${platform.name} VÁLIDO encontrado: ${itemUrl}`)
              console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
              
              marketplaces.push({
                plataforma: platform.name,
                url: itemUrl,
                loja: title.replace(/\s*[-|].*$/, '').trim(),
              })
              
              break // Apenas o primeiro resultado válido por plataforma
            } else {
              console.log(`[DigitalPresence] ❌ ${platform.name} REJEITADO: ${itemUrl}`)
              console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
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

  // ESTRATÉGIAS COMPLETAS PARA JUSBRASIL (6 estratégias)
  const strategies = [
    // Estratégia 1: Nome + site:jusbrasil.com.br (MAIS EFICAZ)
    `site:jusbrasil.com.br "${companyName}"`,
    
    // Estratégia 2: Fantasia + site:jusbrasil.com.br
    fantasia ? `site:jusbrasil.com.br "${fantasia}"` : null,
    
    // Estratégia 3: Nome + CNPJ + jusbrasil
    `"${companyName}" CNPJ ${cnpj} jusbrasil`,
    
    // Estratégia 4: Fantasia + CNPJ + jusbrasil
    fantasia ? `"${fantasia}" CNPJ ${cnpj} jusbrasil` : null,
    
    // Estratégia 5: Nome + processos
    `"${companyName}" processos jusbrasil`,
    
    // Estratégia 6: Fantasia + processos
    fantasia ? `"${fantasia}" processos jusbrasil` : null,
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

        // VALIDAÇÃO ASSERTIVA - verificar se realmente pertence à empresa
        const validation = validateCompanyLink(itemUrl, title, snippet, companyName, cnpj, fantasia, domain)
        
        if (validation.isValid) {
          console.log(`[DigitalPresence] ✅ Jusbrasil VÁLIDO encontrado: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
          
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
        } else {
          console.log(`[DigitalPresence] ❌ Jusbrasil REJEITADO: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
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

  // ESTRATÉGIAS COMPLETAS PARA OUTROS LINKS (6 estratégias)
  const strategies = [
    // Busca específica por catálogos
    `"${companyName}" (catálogo OR catalogo OR produtos OR portfólio OR portfolio)`,
    
    // Busca por portais B2B genéricos
    `"${companyName}" (b2b OR fornecedor OR atacado OR distribuidor)`,
    
    // Busca por notícias e imprensa
    `"${companyName}" (notícia OR noticia OR imprensa OR news)`,
    
    // Busca por certificações e registros
    `"${companyName}" (certificação OR certificacao OR registro OR licença)`,
    
    // Busca ampla com CNPJ
    `"${companyName}" CNPJ ${cnpj}`,
    
    // Busca por associações
    `"${companyName}" (associação OR associacao OR sindicato OR federação)`,
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

        // VALIDAÇÃO ASSERTIVA - verificar se realmente pertence à empresa
        const validation = validateCompanyLink(itemUrl, title, snippet, companyName, cnpj, fantasia, domain)
        
        if (validation.isValid) {
          console.log(`[DigitalPresence] ✅ Outro link VÁLIDO encontrado: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
          
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
        } else {
          console.log(`[DigitalPresence] ❌ Outro link REJEITADO: ${itemUrl}`)
          console.log(`[DigitalPresence] 📊 Confiança: ${validation.confidence}% - ${validation.reason}`)
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

