import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { maturityCalculator, vendorFitCalculator } from '@/lib/services/maturity-calculator'

export const runtime = 'nodejs'
export const maxDuration = 15 // Maturity calculation: 15s

interface MaturityRequest {
  projectId: string
  companyId: string
  vendor: string
  detectedStack: any[]
  sources: any
}

export async function POST(req: Request) {
  try {
    const { projectId, companyId, vendor, detectedStack, sources }: MaturityRequest = await req.json()
    
    console.log('[Maturity API] 🔍 Calculando maturidade para companyId:', companyId)

    // Validações obrigatórias
    if (!projectId || !companyId || !vendor) {
      return NextResponse.json({ 
        error: 'projectId, companyId e vendor são obrigatórios' 
      }, { status: 400 })
    }

    if (!detectedStack || !Array.isArray(detectedStack)) {
      return NextResponse.json({ 
        error: 'detectedStack deve ser um array' 
      }, { status: 400 })
    }

    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[Maturity API] ❌ Empresa não encontrada:', companyError)
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    console.log('[Maturity API] ✅ Empresa encontrada:', company.name)

    // Calcular maturidade
    const maturityInput = {
      detectedStack,
      sources: sources || {},
      companyProfile: {
        industry: company.industry,
        size: company.size,
        revenue: company.capital
      }
    }

    const scores = maturityCalculator.computeMaturity(maturityInput)
    console.log('[Maturity API] ✅ Scores calculados:', scores)

    // Calcular vendor fit
    const vendorFit = vendorFitCalculator.suggestFit({
      vendor,
      detectedStack,
      scores
    })
    console.log('[Maturity API] ✅ Vendor fit calculado:', vendorFit.recommendations.length, 'recomendações')

    // Preparar dados para salvamento
    const maturityData = {
      companyId,
      vendor,
      sources: sources || {},
      scores,
      detectedStack,
      fitRecommendations: vendorFit
    }

    // Salvar no Supabase
    const { error: upsertError } = await supabaseAdmin
      .from('CompanyTechMaturity')
      .upsert({
        companyId,
        vendor,
        sources: JSON.stringify(sources || {}),
        scores: JSON.stringify(scores),
        detectedStack: JSON.stringify(detectedStack),
        fitRecommendations: JSON.stringify(vendorFit),
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'companyId,vendor'
      })

    if (upsertError) {
      console.error('[Maturity API] ❌ Erro ao salvar maturidade:', upsertError)
      // Continuar mesmo com erro de salvamento
    } else {
      console.log('[Maturity API] ✅ Maturidade salva no Supabase')
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        cnpj: company.cnpj
      },
      maturity: {
        scores,
        vendorFit,
        summary: {
          overallScore: scores.overall,
          maturityLevel: getMaturityLevel(scores.overall),
          totalRecommendations: vendorFit.recommendations.length,
          estimatedTotalROI: vendorFit.totalROI,
          migrationPath: vendorFit.migrationPath
        }
      }
    })

  } catch (error) {
    console.error('[Maturity API] ❌ Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')
    const vendor = searchParams.get('vendor') || 'TOTVS'
    
    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    console.log('[Maturity API] 📖 Buscando maturidade para companyId:', companyId, 'vendor:', vendor)

    // Buscar maturidade salva no Supabase
    const { data: maturity, error: maturityError } = await supabaseAdmin
      .from('CompanyTechMaturity')
      .select('*')
      .eq('companyId', companyId)
      .eq('vendor', vendor)
      .single()

    if (maturityError || !maturity) {
      console.log('[Maturity API] ⚠️ Maturidade não encontrada para companyId:', companyId)
      return NextResponse.json({ 
        success: true,
        maturity: null,
        message: 'Maturidade não encontrada. Execute o cálculo primeiro.'
      })
    }

    console.log('[Maturity API] ✅ Maturidade encontrada')

    const scores = JSON.parse(maturity.scores || '{}')
    const vendorFit = JSON.parse(maturity.fitRecommendations || '{}')

    return NextResponse.json({
      success: true,
      maturity: {
        scores,
        vendorFit,
        summary: {
          overallScore: scores.overall,
          maturityLevel: getMaturityLevel(scores.overall),
          totalRecommendations: vendorFit.recommendations?.length || 0,
          estimatedTotalROI: vendorFit.totalROI || 0,
          migrationPath: vendorFit.migrationPath || []
        },
        lastAnalyzed: maturity.updatedAt
      }
    })

  } catch (error) {
    console.error('[Maturity API] ❌ Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

function getMaturityLevel(score: number): string {
  if (score >= 90) return 'Excelente'
  if (score >= 80) return 'Muito Bom'
  if (score >= 70) return 'Bom'
  if (score >= 60) return 'Regular'
  if (score >= 50) return 'Baixo'
  return 'Muito Baixo'
}
