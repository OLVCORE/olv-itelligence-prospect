/**
 * Data Enrichment Pipeline
 * Integrates with external APIs to collect company data
 * Following ToS and LGPD compliance
 */

export interface Evidence {
  source: string
  url?: string
  snippet?: string
  date: Date
  confidence: number
}

export interface EnrichmentResult {
  success: boolean
  data?: any
  evidences?: Evidence[]
  error?: string
}

// Cadastral & Fiscal Data
export async function enrichCadastral(cnpj: string): Promise<EnrichmentResult> {
  try {
    // ReceitaWS integration (example)
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj.replace(/\D/g, '')}`)
    
    if (!response.ok) {
      return { success: false, error: 'Failed to fetch cadastral data' }
    }

    const data = await response.json()
    
    return {
      success: true,
      data: {
        razaoSocial: data.nome,
        nomeFantasia: data.fantasia,
        cnae: data.atividade_principal?.[0]?.code,
        situacao: data.situacao,
        porte: data.porte,
        endereco: {
          logradouro: data.logradouro,
          numero: data.numero,
          municipio: data.municipio,
          uf: data.uf,
          cep: data.cep
        }
      },
      evidences: [{
        source: 'ReceitaWS',
        url: `https://receitaws.com.br/v1/cnpj/${cnpj}`,
        date: new Date(),
        confidence: 95
      }]
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Domain Enrichment
export async function enrichDomain(domain: string): Promise<EnrichmentResult> {
  // Clearbit integration (would require API key)
  // For MVP, return mock structure
  
  return {
    success: true,
    data: {
      category: 'Software',
      employees: 50,
      metrics: {
        estimatedRevenue: 5000000
      }
    },
    evidences: [{
      source: 'Clearbit',
      url: `https://clearbit.com/companies/${domain}`,
      date: new Date(),
      confidence: 80
    }]
  }
}

// Tech Stack Detection
export async function enrichTechStack(domain: string): Promise<EnrichmentResult> {
  // BuiltWith/SimilarTech integration
  // For MVP, detect basic web technologies
  
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      redirect: 'follow'
    })

    const headers = Object.fromEntries(response.headers.entries())
    const technologies: any[] = []

    // Detect server
    if (headers['server']) {
      technologies.push({
        category: 'Cloud',
        product: headers['server'],
        vendor: 'Unknown',
        status: 'Confirmado',
        confidence: 70,
        evidence: {
          type: 'HTTP Header',
          value: headers['server'],
          source: 'Server Header'
        }
      })
    }

    // Detect X-Powered-By
    if (headers['x-powered-by']) {
      technologies.push({
        category: 'Framework',
        product: headers['x-powered-by'],
        vendor: 'Unknown',
        status: 'Confirmado',
        confidence: 75,
        evidence: {
          type: 'HTTP Header',
          value: headers['x-powered-by'],
          source: 'X-Powered-By Header'
        }
      })
    }

    return {
      success: true,
      data: technologies,
      evidences: [{
        source: 'HTTP Headers',
        url: `https://${domain}`,
        snippet: JSON.stringify(headers, null, 2),
        date: new Date(),
        confidence: 70
      }]
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// DNS/Email Provider Detection
export async function enrichDNS(domain: string): Promise<EnrichmentResult> {
  // Would use DNS lookup libraries in production
  // For MVP, return structure
  
  return {
    success: true,
    data: {
      mxRecords: ['aspmx.l.google.com'],
      emailProvider: 'Google Workspace',
      spf: 'v=spf1 include:_spf.google.com ~all',
      dmarc: 'v=DMARC1; p=quarantine'
    },
    evidences: [{
      source: 'DNS Query',
      snippet: 'MX records point to Google Workspace',
      date: new Date(),
      confidence: 90
    }]
  }
}

// Contact Enrichment (Apollo, ZoomInfo, Lusha, Hunter)
export async function enrichContacts(domain: string, titles?: string[]): Promise<EnrichmentResult> {
  // Integration with Apollo.io, ZoomInfo, etc.
  // Requires API keys and compliance with ToS
  
  // For MVP, return structure
  return {
    success: true,
    data: [
      {
        name: 'João Silva',
        title: 'CTO',
        department: 'Technology',
        email: `joao.silva@${domain}`,
        linkedin: 'linkedin.com/in/joaosilva',
        seniority: 'C-Level',
        score: 5,
        confidence: 85
      }
    ],
    evidences: [{
      source: 'Apollo.io',
      snippet: 'CTO profile found with verified email',
      date: new Date(),
      confidence: 85
    }]
  }
}

// Calculate confidence score based on evidences
export function calculateConfidence(evidences: Evidence[]): number {
  if (evidences.length === 0) return 0
  
  let base = 50
  
  // +25 if has recent detection (< 6 months)
  const recent = evidences.some(e => {
    const monthsOld = (Date.now() - e.date.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsOld < 6
  })
  if (recent) base += 25
  
  // +25 if has multiple independent sources
  const uniqueSources = new Set(evidences.map(e => e.source))
  if (uniqueSources.size >= 2) base += 25
  
  // -20 if oldest evidence > 12 months
  const oldest = evidences.reduce((min, e) => {
    return e.date < min ? e.date : min
  }, new Date())
  const monthsOld = (Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (monthsOld > 12) base -= 20
  
  return Math.min(100, Math.max(0, base))
}

// Maturity Score (0-100)
export function calculateMaturityScore(stacks: any[]): number {
  const weights = {
    ERP: 0.25,
    Cloud: 0.20,
    CRM: 0.15,
    BI: 0.15,
    Fiscal: 0.10,
    Middleware: 0.15
  }
  
  let score = 0
  
  // Check each pillar
  Object.entries(weights).forEach(([category, weight]) => {
    const hasCategory = stacks.some(s => s.category === category && s.status === 'Confirmado')
    if (hasCategory) {
      // Modern stack bonus
      const modern = stacks.find(s => 
        s.category === category && 
        s.confidence >= 70 &&
        s.validatedAt && 
        (Date.now() - new Date(s.validatedAt).getTime()) < 180 * 24 * 60 * 60 * 1000 // 6 months
      )
      score += weight * (modern ? 100 : 70)
    }
  })
  
  return Math.round(score)
}

// Propensity Score (0-100) - Simple regression
export function calculatePropensity(company: any): number {
  let score = 50 // Base
  
  // Maturity factor
  if (company.maturityScore) {
    score += (company.maturityScore - 50) * 0.3
  }
  
  // Size factor
  if (company.size === 'Grande') score += 15
  else if (company.size === 'Médio') score += 10
  else if (company.size === 'Pequeno') score += 5
  
  // Decision makers factor
  const decisionMakers = company.contacts?.filter((c: any) => c.score >= 4).length || 0
  score += Math.min(decisionMakers * 5, 20)
  
  // Tech stack completeness
  const confirmedStacks = company.stacks?.filter((s: any) => s.status === 'Confirmado').length || 0
  score += Math.min(confirmedStacks * 2, 15)
  
  return Math.min(100, Math.max(0, Math.round(score)))
}

// Priority Score for attack sequencing
export function calculatePriority(company: any): number {
  const propensity = calculatePropensity(company)
  const ticket = company.financial?.estimatedRevenue || 0
  const ticketScore = Math.min((ticket / 10000000) * 100, 100) // Normalize to 10M
  
  // Urgency based on gaps
  const gaps = company.maturityScore ? (100 - company.maturityScore) : 50
  const urgency = gaps
  
  const priority = 0.5 * propensity + 0.3 * ticketScore + 0.2 * urgency
  
  return Math.round(priority)
}


