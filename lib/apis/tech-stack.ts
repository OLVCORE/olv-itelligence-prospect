// lib/apis/tech-stack.ts
export interface TechStackItem {
  category: string
  product: string
  vendor: string
  status: "Confirmado" | "Indeterminado" | "Em Avaliação"
  confidence: number
  evidence: string[]
  source: string
  aiInsights?: string
  recommendations?: string[]
}

export interface BuiltWithResponse {
  Results: Array<{
    Result: {
      Paths: Array<{
        Technologies: Array<{
          Name: string
          Description: string
          Category: string
        }>
      }>
    }
  }>
}

export interface WappalyzerResponse {
  applications: Array<{
    name: string
    confidence: number
    categories: Array<{
      name: string
    }>
  }>
}

export async function analyzeTechStack(domain: string): Promise<TechStackItem[]> {
  const techStack: TechStackItem[] = []
  
  try {
    // BuiltWith API (gratuita com limitações)
    const builtWithData = await getBuiltWithData(domain)
    if (builtWithData) {
      techStack.push(...processBuiltWithData(builtWithData))
    }
    
    // Wappalyzer API (gratuita com limitações)
    const wappalyzerData = await getWappalyzerData(domain)
    if (wappalyzerData) {
      techStack.push(...processWappalyzerData(wappalyzerData))
    }
    
    // Análise adicional com headers HTTP
    const headerData = await analyzeHTTPHeaders(domain)
    if (headerData) {
      techStack.push(...processHeaderData(headerData))
    }
    
    // Remover duplicatas e consolidar
    return consolidateTechStack(techStack)
    
  } catch (error) {
    console.error('Erro ao analisar tech stack:', error)
    return []
  }
}

async function getBuiltWithData(domain: string): Promise<BuiltWithResponse | null> {
  try {
    // Usando API gratuita do BuiltWith (com limitações)
    const response = await fetch(`https://api.builtwith.com/v20/api.json?KEY=${process.env.BUILTWITH_API_KEY || 'free'}&LOOKUP=${domain}`)
    
    if (!response.ok) {
      console.warn('BuiltWith API não disponível')
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Erro BuiltWith:', error)
    return null
  }
}

async function getWappalyzerData(domain: string): Promise<WappalyzerResponse | null> {
  try {
    // Usando API gratuita do Wappalyzer (com limitações)
    const response = await fetch(`https://api.wappalyzer.com/v2/lookup?urls=${domain}`)
    
    if (!response.ok) {
      console.warn('Wappalyzer API não disponível')
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Erro Wappalyzer:', error)
    return null
  }
}

async function analyzeHTTPHeaders(domain: string): Promise<any> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OLV-Prospecting/1.0)'
      }
    })
    
    return {
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
      server: response.headers.get('server'),
      poweredBy: response.headers.get('x-powered-by'),
      framework: response.headers.get('x-framework')
    }
  } catch (error) {
    console.warn('Erro ao analisar headers:', error)
    return null
  }
}

function processBuiltWithData(data: BuiltWithResponse): TechStackItem[] {
  const items: TechStackItem[] = []
  
  if (data.Results && data.Results.length > 0) {
    const result = data.Results[0].Result
    
    if (result.Paths) {
      result.Paths.forEach(path => {
        if (path.Technologies) {
          path.Technologies.forEach(tech => {
            items.push({
              category: tech.Category || 'Unknown',
              product: tech.Name,
              vendor: tech.Name.split(' ')[0], // Assumir primeiro palavra como vendor
              status: 'Confirmado',
              confidence: 85, // BuiltWith é confiável
              evidence: ['BuiltWith API'],
              source: 'BuiltWith'
            })
          })
        }
      })
    }
  }
  
  return items
}

function processWappalyzerData(data: WappalyzerResponse): TechStackItem[] {
  const items: TechStackItem[] = []
  
  if (data.applications) {
    data.applications.forEach(app => {
      items.push({
        category: app.categories[0]?.name || 'Unknown',
        product: app.name,
        vendor: app.name.split(' ')[0],
        status: app.confidence > 80 ? 'Confirmado' : 'Em Avaliação',
        confidence: app.confidence,
        evidence: ['Wappalyzer API'],
        source: 'Wappalyzer'
      })
    })
  }
  
  return items
}

function processHeaderData(data: any): TechStackItem[] {
  const items: TechStackItem[] = []
  
  // Analisar headers para identificar tecnologias
  if (data.server) {
    items.push({
      category: 'Web Server',
      product: data.server,
      vendor: data.server.split('/')[0],
      status: 'Confirmado',
      confidence: 95,
      evidence: ['HTTP Headers'],
      source: 'HTTP Analysis'
    })
  }
  
  if (data.poweredBy) {
    items.push({
      category: 'Framework',
      product: data.poweredBy,
      vendor: data.poweredBy.split(' ')[0],
      status: 'Confirmado',
      confidence: 90,
      evidence: ['HTTP Headers'],
      source: 'HTTP Analysis'
    })
  }
  
  if (data.framework) {
    items.push({
      category: 'Framework',
      product: data.framework,
      vendor: data.framework.split(' ')[0],
      status: 'Confirmado',
      confidence: 90,
      evidence: ['HTTP Headers'],
      source: 'HTTP Analysis'
    })
  }
  
  return items
}

function consolidateTechStack(items: TechStackItem[]): TechStackItem[] {
  const consolidated = new Map<string, TechStackItem>()
  
  items.forEach(item => {
    const key = `${item.product}-${item.vendor}`.toLowerCase()
    
    if (consolidated.has(key)) {
      const existing = consolidated.get(key)!
      // Manter o item com maior confiança
      if (item.confidence > existing.confidence) {
        existing.confidence = item.confidence
        existing.status = item.status
      }
      // Consolidar evidências
      existing.evidence = [...new Set([...existing.evidence, ...item.evidence])]
      existing.source = `${existing.source}, ${item.source}`
    } else {
      consolidated.set(key, { ...item })
    }
  })
  
  return Array.from(consolidated.values())
}

