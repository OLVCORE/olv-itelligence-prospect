import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 5 // Cálculos locais: 5s

const schema = z.object({
  companyId: z.string().min(1, "companyId é obrigatório")
})

/**
 * POST /api/intelligence/fit-totvs
 * Calcula fit da empresa com produtos TOTVS
 * 
 * Baseado em:
 * - CNAE (setor)
 * - Porte
 * - Stack tecnológico atual
 * - Maturidade digital
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

    console.log('[FitTOTVS] 🎯 Analisando fit:', companyId)

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

    // Detectar se já usa TOTVS
    const usesTOTVS = techStack?.some(t => 
      ['TOTVS', 'Protheus', 'RM', 'Fluig', 'Datasul'].some(keyword => 
        t.product?.includes(keyword) || t.vendor?.includes(keyword)
      )
    )

    // Gerar oportunidades baseadas no perfil
    const opportunities = generateOpportunities(company, techStack || [], usesTOTVS)

    const latency = Date.now() - startTime
    console.log(`[FitTOTVS] ✅ Análise completa em ${latency}ms - ${opportunities.length} oportunidades`)

    return NextResponse.json({
      ok: true,
      data: {
        usesTOTVS,
        opportunities,
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[FitTOTVS] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

// Helper para gerar oportunidades
function generateOpportunities(company: any, techStack: any[], usesTOTVS: boolean) {
  const opportunities: any[] = []

  // Se já usa TOTVS - Cross-sell e Upsell
  if (usesTOTVS) {
    opportunities.push({
      product: 'TOTVS Carol (IA)',
      rationale: 'Empresa já usa TOTVS. Oportunidade de upgrade com inteligência artificial.',
      priority: 'Alta',
      type: 'Upsell'
    })

    opportunities.push({
      product: 'TOTVS Fluig (BPM)',
      rationale: 'Complementar ERP com automação de processos e workflows.',
      priority: 'Média',
      type: 'Cross-sell'
    })

    return opportunities
  }

  // Análise por porte
  if (company.porte === 'MICRO' || company.porte === 'PEQUENO') {
    opportunities.push({
      product: 'TOTVS Protheus (Small Business)',
      rationale: `Empresa de porte ${company.porte} - ERP completo para PMEs com bom custo-benefício.`,
      priority: 'Alta',
      type: 'New Business'
    })
  } else if (company.porte === 'MÉDIO' || company.porte === 'GRANDE') {
    opportunities.push({
      product: 'TOTVS Protheus (Enterprise)',
      rationale: `Empresa de porte ${company.porte} - Solução robusta com módulos avançados.`,
      priority: 'Alta',
      type: 'New Business'
    })
  }

  // Análise por CNAE
  const cnae = company.cnae || ''
  
  // Indústria (10-33)
  if (cnae.startsWith('1') || cnae.startsWith('2') || cnae.startsWith('3')) {
    opportunities.push({
      product: 'TOTVS Datasul',
      rationale: 'Setor industrial - ERP especializado em manufatura e controle de produção.',
      priority: 'Alta',
      type: 'New Business'
    })
  }

  // Comércio (46-47)
  if (cnae.startsWith('46') || cnae.startsWith('47')) {
    opportunities.push({
      product: 'TOTVS Varejo',
      rationale: 'Setor de comércio - Solução focada em gestão de vendas e estoque.',
      priority: 'Alta',
      type: 'New Business'
    })
  }

  // Serviços (49-96)
  if (parseInt(cnae.substring(0, 2)) >= 49 && parseInt(cnae.substring(0, 2)) <= 96) {
    opportunities.push({
      product: 'TOTVS Gestão de Serviços',
      rationale: 'Setor de serviços - Controle de projetos, ordens de serviço e faturamento.',
      priority: 'Média',
      type: 'New Business'
    })
  }

  // Análise por stack atual
  const hasERP = techStack.some(t => t.category?.includes('ERP'))
  const hasCRM = techStack.some(t => t.category?.includes('CRM'))
  const hasBI = techStack.some(t => t.category?.includes('BI'))

  if (!hasERP) {
    opportunities.push({
      product: 'TOTVS Protheus',
      rationale: 'Empresa sem ERP identificado - Oportunidade de implementação completa.',
      priority: 'Alta',
      type: 'New Business'
    })
  }

  if (!hasCRM) {
    opportunities.push({
      product: 'TOTVS CRM',
      rationale: 'Sem CRM identificado - Automatizar gestão de clientes e vendas.',
      priority: 'Média',
      type: 'New Business'
    })
  }

  if (!hasBI) {
    opportunities.push({
      product: 'TOTVS BI (Analytics)',
      rationale: 'Sem ferramenta de BI - Implementar dashboards e análises avançadas.',
      priority: 'Média',
      type: 'New Business'
    })
  }

  // Cloud
  const hasCloud = techStack.some(t => 
    ['AWS', 'Azure', 'Google Cloud', 'Cloud'].some(keyword => 
      t.category?.includes(keyword) || t.product?.includes(keyword)
    )
  )

  if (hasCloud) {
    opportunities.push({
      product: 'TOTVS Cloud',
      rationale: 'Empresa já usa cloud - Migração para TOTVS Cloud é natural.',
      priority: 'Média',
      type: 'New Business'
    })
  }

  // Ordenar por prioridade
  const priorityOrder = { 'Alta': 1, 'Média': 2, 'Baixa': 3 }
  return opportunities.sort((a, b) => 
    priorityOrder[a.priority as keyof typeof priorityOrder] - 
    priorityOrder[b.priority as keyof typeof priorityOrder]
  )
}

