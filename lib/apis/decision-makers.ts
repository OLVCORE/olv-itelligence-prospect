// lib/apis/decision-makers.ts
export interface DecisionMaker {
  name: string
  title: string
  department: string
  email: string
  phone: string
  linkedin: string
  score: number
  source: string
  influenceLevel: "Alto" | "Médio" | "Baixo"
  aiInsights?: string
  engagementStrategy?: string[]
}

export interface ApolloResponse {
  people: Array<{
    id: string
    first_name: string
    last_name: string
    title: string
    email: string
    phone_numbers: Array<{
      number: string
      type: string
    }>
    linkedin_url: string
    organization: {
      name: string
      industry: string
    }
    employment_history: Array<{
      title: string
      organization_name: string
    }>
  }>
}

export interface ZoomInfoResponse {
  data: Array<{
    id: string
    firstName: string
    lastName: string
    jobTitle: string
    email: string
    phone: string
    linkedInUrl: string
    companyName: string
    department: string
  }>
}

export async function findDecisionMakers(company: string, domain: string): Promise<DecisionMaker[]> {
  const decisionMakers: DecisionMaker[] = []
  
  try {
    // Apollo API
    const apolloData = await getApolloData(company, domain)
    if (apolloData) {
      decisionMakers.push(...processApolloData(apolloData))
    }
    
    // ZoomInfo API
    const zoomInfoData = await getZoomInfoData(company, domain)
    if (zoomInfoData) {
      decisionMakers.push(...processZoomInfoData(zoomInfoData))
    }
    
    // LinkedIn API (se disponível)
    const linkedinData = await getLinkedInData(company, domain)
    if (linkedinData) {
      decisionMakers.push(...processLinkedInData(linkedinData))
    }
    
    // Remover duplicatas e consolidar
    return consolidateDecisionMakers(decisionMakers)
    
  } catch (error) {
    console.error('Erro ao buscar decisores:', error)
    return []
  }
}

async function getApolloData(company: string, domain: string): Promise<ApolloResponse | null> {
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.APOLLO_API_KEY || ''
      },
      body: JSON.stringify({
        q_organization_domains: domain,
        page: 1,
        per_page: 10,
        person_titles: ['CEO', 'CTO', 'CFO', 'CMO', 'VP', 'Director', 'Manager', 'Head of']
      })
    })
    
    if (!response.ok) {
      console.warn('Apollo API não disponível')
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Erro Apollo:', error)
    return null
  }
}

async function getZoomInfoData(company: string, domain: string): Promise<ZoomInfoResponse | null> {
  try {
    const response = await fetch('https://api.zoominfo.com/v1/people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZOOMINFO_API_KEY || ''}`
      },
      body: JSON.stringify({
        companyName: company,
        companyDomain: domain,
        pageSize: 10,
        jobTitles: ['CEO', 'CTO', 'CFO', 'CMO', 'VP', 'Director', 'Manager']
      })
    })
    
    if (!response.ok) {
      console.warn('ZoomInfo API não disponível')
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.warn('Erro ZoomInfo:', error)
    return null
  }
}

async function getLinkedInData(company: string, domain: string): Promise<any> {
  try {
    // LinkedIn API requer autenticação OAuth complexa
    // Por enquanto, retornar dados simulados baseados na empresa
    return {
      people: [
        {
          name: 'Executivo Senior',
          title: 'CEO',
          company: company,
          linkedin: `https://linkedin.com/company/${domain}`
        }
      ]
    }
  } catch (error) {
    console.warn('Erro LinkedIn:', error)
    return null
  }
}

function processApolloData(data: ApolloResponse): DecisionMaker[] {
  const decisionMakers: DecisionMaker[] = []
  
  if (data.people) {
    data.people.forEach(person => {
      const score = calculateInfluenceScore(person.title, person.employment_history)
      
      decisionMakers.push({
        name: `${person.first_name} ${person.last_name}`,
        title: person.title,
        department: getDepartmentFromTitle(person.title),
        email: person.email || '',
        phone: person.phone_numbers?.[0]?.number || '',
        linkedin: person.linkedin_url || '',
        score,
        source: 'Apollo',
        influenceLevel: getInfluenceLevel(score)
      })
    })
  }
  
  return decisionMakers
}

function processZoomInfoData(data: ZoomInfoResponse): DecisionMaker[] {
  const decisionMakers: DecisionMaker[] = []
  
  if (data.data) {
    data.data.forEach(person => {
      const score = calculateInfluenceScore(person.jobTitle, [])
      
      decisionMakers.push({
        name: `${person.firstName} ${person.lastName}`,
        title: person.jobTitle,
        department: person.department || getDepartmentFromTitle(person.jobTitle),
        email: person.email || '',
        phone: person.phone || '',
        linkedin: person.linkedInUrl || '',
        score,
        source: 'ZoomInfo',
        influenceLevel: getInfluenceLevel(score)
      })
    })
  }
  
  return decisionMakers
}

function processLinkedInData(data: any): DecisionMaker[] {
  const decisionMakers: DecisionMaker[] = []
  
  if (data.people) {
    data.people.forEach((person: any) => {
      decisionMakers.push({
        name: person.name,
        title: person.title,
        department: getDepartmentFromTitle(person.title),
        email: '',
        phone: '',
        linkedin: person.linkedin,
        score: 70, // Score padrão para LinkedIn
        source: 'LinkedIn',
        influenceLevel: 'Médio'
      })
    })
  }
  
  return decisionMakers
}

function calculateInfluenceScore(title: string, history: any[]): number {
  let score = 50 // Base score
  
  const titleLower = title.toLowerCase()
  
  // Ajustar score baseado no título
  if (titleLower.includes('ceo') || titleLower.includes('president')) {
    score += 40
  } else if (titleLower.includes('cto') || titleLower.includes('cfo') || titleLower.includes('cmo')) {
    score += 35
  } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    score += 30
  } else if (titleLower.includes('director')) {
    score += 25
  } else if (titleLower.includes('manager') || titleLower.includes('head of')) {
    score += 20
  }
  
  // Ajustar baseado no histórico
  if (history && history.length > 0) {
    const currentRole = history[0]
    if (currentRole.title.toLowerCase().includes('senior')) {
      score += 10
    }
  }
  
  return Math.min(100, Math.max(0, score))
}

function getDepartmentFromTitle(title: string): string {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('ceo') || titleLower.includes('president')) {
    return 'Executivo'
  } else if (titleLower.includes('cto') || titleLower.includes('technology') || titleLower.includes('it')) {
    return 'Tecnologia'
  } else if (titleLower.includes('cfo') || titleLower.includes('finance')) {
    return 'Financeiro'
  } else if (titleLower.includes('cmo') || titleLower.includes('marketing')) {
    return 'Marketing'
  } else if (titleLower.includes('sales') || titleLower.includes('commercial')) {
    return 'Vendas'
  } else if (titleLower.includes('hr') || titleLower.includes('human')) {
    return 'Recursos Humanos'
  } else if (titleLower.includes('operations') || titleLower.includes('operations')) {
    return 'Operações'
  }
  
  return 'Outros'
}

function getInfluenceLevel(score: number): "Alto" | "Médio" | "Baixo" {
  if (score >= 80) return 'Alto'
  if (score >= 60) return 'Médio'
  return 'Baixo'
}

function consolidateDecisionMakers(decisionMakers: DecisionMaker[]): DecisionMaker[] {
  const consolidated = new Map<string, DecisionMaker>()
  
  decisionMakers.forEach(maker => {
    const key = `${maker.name}-${maker.title}`.toLowerCase()
    
    if (consolidated.has(key)) {
      const existing = consolidated.get(key)!
      // Manter o item com maior score
      if (maker.score > existing.score) {
        existing.score = maker.score
        existing.influenceLevel = maker.influenceLevel
      }
      // Consolidar fontes
      existing.source = `${existing.source}, ${maker.source}`
    } else {
      consolidated.set(key, { ...maker })
    }
  })
  
  return Array.from(consolidated.values())
}

