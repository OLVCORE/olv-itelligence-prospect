import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 5 // Cálculos locais: 5s

const schema = z.object({
  companyId: z.string().min(1, "companyId é obrigatório")
})

/**
 * POST /api/intelligence/maturity
 * Calcula score de maturidade digital baseado em dados reais
 * 
 * 6 Pilares OLV:
 * 1. Infraestrutura (25%)
 * 2. Sistemas de Gestão (20%)
 * 3. Processos Digitais (20%)
 * 4. Segurança (15%)
 * 5. Inovação (10%)
 * 6. Presença Digital (10%)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { companyId } = validation.data
    const sb = supabaseAdmin()

    console.log('[Maturity] 📊 Calculando maturidade:', companyId)

    // Buscar dados da empresa
    const { data: company, error: companyError } = await sb
      .from('Company')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'COMPANY_NOT_FOUND',
          message: 'Empresa não encontrada'
        }
      }, { status: 404 })
    }

    // Buscar TechStack
    const { data: techStack } = await sb
      .from('TechStack')
      .select('*')
      .eq('companyId', companyId)

    // Buscar Person (decisores)
    const { data: people } = await sb
      .from('Person')
      .select('*')
      .eq('companyId', companyId)

    // Calcular scores por pilar
    const scores = {
      infra: calculateInfraScore(techStack || []),
      systems: calculateSystemsScore(techStack || []),
      processes: calculateProcessesScore(company, techStack || []),
      security: calculateSecurityScore(techStack || []),
      innovation: calculateInnovationScore(techStack || [], company),
      digital: calculateDigitalScore(company, people || [])
    }

    // Calcular score geral (média ponderada)
    const overall = Math.round(
      scores.infra * 0.25 +
      scores.systems * 0.20 +
      scores.processes * 0.20 +
      scores.security * 0.15 +
      scores.innovation * 0.10 +
      scores.digital * 0.10
    )

    const latency = Date.now() - startTime
    console.log(`[Maturity] ✅ Score calculado em ${latency}ms - Overall: ${overall}`)

    return NextResponse.json({
      ok: true,
      data: {
        overall,
        scores,
        breakdown: {
          infra: { score: scores.infra, weight: 25, description: 'Infraestrutura cloud e on-premise' },
          systems: { score: scores.systems, weight: 20, description: 'Sistemas de gestão (ERP, CRM)' },
          processes: { score: scores.processes, weight: 20, description: 'Automação e integração' },
          security: { score: scores.security, weight: 15, description: 'Segurança da informação' },
          innovation: { score: scores.innovation, weight: 10, description: 'IA, BI e inovação' },
          digital: { score: scores.digital, weight: 10, description: 'Presença digital' }
        },
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[Maturity] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

// Helpers para cálculo de scores

function calculateInfraScore(techStack: any[]): number {
  let score = 30 // Base

  // Cloud providers (+30)
  const hasCloud = techStack.some(t => 
    ['AWS', 'Azure', 'Google Cloud', 'Cloud'].some(keyword => 
      t.category?.includes(keyword) || t.product?.includes(keyword)
    )
  )
  if (hasCloud) score += 30

  // Web server moderno (+20)
  const hasModernServer = techStack.some(t => 
    ['Nginx', 'Apache'].some(keyword => t.product?.includes(keyword))
  )
  if (hasModernServer) score += 20

  // Múltiplas tecnologias (+20)
  if (techStack.length >= 5) score += 20

  return Math.min(score, 100)
}

function calculateSystemsScore(techStack: any[]): number {
  let score = 20 // Base

  // ERP (+40)
  const hasERP = techStack.some(t => 
    t.category?.includes('ERP') || ['SAP', 'Oracle', 'TOTVS', 'Protheus'].includes(t.product)
  )
  if (hasERP) score += 40

  // CRM (+30)
  const hasCRM = techStack.some(t => 
    t.category?.includes('CRM') || ['Salesforce', 'HubSpot'].includes(t.product)
  )
  if (hasCRM) score += 30

  // BI (+20)
  const hasBI = techStack.some(t => 
    t.category?.includes('BI') || ['Power BI', 'Tableau', 'Qlik'].includes(t.product)
  )
  if (hasBI) score += 20

  return Math.min(score, 100)
}

function calculateProcessesScore(company: any, techStack: any[]): number {
  let score = 40 // Base

  // Website ativo (+30)
  if (company.domain) score += 30

  // Integração (múltiplos sistemas) (+20)
  if (techStack.length >= 3) score += 20

  // Automação (presença de ferramentas modernas) (+10)
  const hasAutomation = techStack.some(t => 
    ['API', 'Webhook', 'Automation'].some(keyword => 
      t.product?.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  if (hasAutomation) score += 10

  return Math.min(score, 100)
}

function calculateSecurityScore(techStack: any[]): number {
  let score = 40 // Base

  // HTTPS (+20)
  const hasHTTPS = techStack.some(t => 
    t.evidence?.value?.toLowerCase().includes('https')
  )
  if (hasHTTPS) score += 20

  // Firewall/CDN (+20)
  const hasSecurity = techStack.some(t => 
    ['Cloudflare', 'Akamai', 'WAF'].some(keyword => 
      t.product?.includes(keyword)
    )
  )
  if (hasSecurity) score += 20

  // Compliance (+20)
  const hasCompliance = techStack.some(t => 
    ['SSL', 'TLS', 'Certificate'].some(keyword => 
      t.product?.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  if (hasCompliance) score += 20

  return Math.min(score, 100)
}

function calculateInnovationScore(techStack: any[], company: any): number {
  let score = 30 // Base

  // IA/ML (+35)
  const hasAI = techStack.some(t => 
    ['AI', 'Machine Learning', 'GPT', 'ChatGPT', 'OpenAI'].some(keyword => 
      t.product?.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  if (hasAI) score += 35

  // BI/Analytics (+25)
  const hasBI = techStack.some(t => 
    t.category?.includes('BI') || ['Analytics', 'Data'].some(keyword => 
      t.product?.toLowerCase().includes(keyword.toLowerCase())
    )
  )
  if (hasBI) score += 25

  // Empresa grande/consolidada (+10)
  if (company.porte === 'GRANDE' || company.capital > 10000000) {
    score += 10
  }

  return Math.min(score, 100)
}

function calculateDigitalScore(company: any, people: any[]): number {
  let score = 40 // Base

  // Website (+30)
  if (company.domain) score += 30

  // Decisores mapeados (+20)
  if (people.length >= 3) score += 20
  else if (people.length >= 1) score += 10

  // E-mail corporativo (+10)
  if (company.email || people.some(p => p.email)) score += 10

  return Math.min(score, 100)
}

