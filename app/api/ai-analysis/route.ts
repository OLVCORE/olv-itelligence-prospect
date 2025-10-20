import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { icpClassifier } from '@/lib/services/icp-classifier'
import { propensityScorer } from '@/lib/services/propensity-scorer'
import { cadenceManager } from '@/lib/services/cadence-manager'

export const runtime = 'nodejs'

interface AIAnalysisRequest {
  companyId: string
  offers?: string[] // ['TOTVS_Protheus', 'TOTVS_Fluig', 'OLV_Consultoria']
  persona?: string // 'CEO', 'CTO', 'CFO'
}

export async function POST(req: Request) {
  try {
    const { companyId, offers = ['TOTVS_Protheus', 'TOTVS_Fluig', 'OLV_Consultoria'], persona = 'CEO' }: AIAnalysisRequest = await req.json()
    
    console.log('[AI Analysis API] 🔍 Analisando empresa:', companyId)

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .select(`
        *,
        stacks:TechStack(*),
        maturity:CompanyTechMaturity(*)
      `)
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[AI Analysis API] ❌ Empresa não encontrada:', companyError)
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    console.log('[AI Analysis API] ✅ Empresa encontrada:', company.name)

    // Preparar features para ICP
    const icpFeatures = {
      porte: company.size || 'Médio',
      capital: company.capital || 0,
      industry: company.industry || '',
      region: company.location ? JSON.parse(company.location).state : 'SP',
      techStack: company.stacks?.map((s: any) => s.product) || [],
      maturityScore: company.maturity?.[0]?.scores?.overall || 50,
      digitalPresence: 60, // Placeholder - calcular baseado em presença digital
      employeeCount: company.employeeCount || 50
    }

    // Calcular ICP Profile
    const icpProfile = icpClassifier.classifyICP(icpFeatures)
    console.log('[AI Analysis API] ✅ ICP calculado:', icpProfile)

    // Preparar features para Propensity
    const propensityFeatures = {
      icpScore: icpProfile.score,
      icpTier: icpProfile.tier,
      vertical: icpProfile.vertical,
      maturityScore: icpFeatures.maturityScore,
      techStackScore: 70, // Placeholder - calcular baseado em tech stack
      digitalPresenceScore: icpFeatures.digitalPresence,
      recentSignals: 2, // Placeholder - buscar sinais recentes
      signalIntensity: 'medium' as const,
      companyAge: 5, // Placeholder - calcular baseado em openingDate
      capitalGrowth: 0.1, // Placeholder - calcular crescimento
      newsSentiment: 'neutral' as const,
      hiringActivity: 1, // Placeholder - buscar vagas recentes
      websiteChanges: 0 // Placeholder - detectar mudanças no site
    }

    // Calcular Propensity para cada oferta
    const propensityResults: Record<string, any> = {}
    for (const offer of offers) {
      try {
        const propensity = propensityScorer.calculatePropensity(propensityFeatures, offer)
        propensityResults[offer] = propensity
        console.log('[AI Analysis API] ✅ Propensity calculado para', offer, ':', propensity.score)
      } catch (error) {
        console.error('[AI Analysis API] ❌ Erro ao calcular propensity para', offer, ':', error)
        propensityResults[offer] = {
          score: 0,
          timeframe: 90,
          confidence: 0,
          rationale: ['Erro no cálculo de propensão'],
          nextActions: ['Verificar dados da empresa']
        }
      }
    }

    // Selecionar melhor cadência
    const bestOffer = Object.entries(propensityResults)
      .sort(([,a], [,b]) => b.score - a.score)[0]?.[0]

    const selectedCadence = bestOffer ? 
      cadenceManager.selectCadence(icpProfile, propensityResults[bestOffer].score, persona) : null

    console.log('[AI Analysis API] ✅ Cadência selecionada:', selectedCadence?.name)

    // Preparar dados para salvamento
    const analysisData = {
      companyId,
      icpProfile,
      propensityResults,
      selectedCadence: selectedCadence ? {
        id: selectedCadence.id,
        name: selectedCadence.name,
        vertical: selectedCadence.vertical,
        persona: selectedCadence.persona,
        expectedDuration: selectedCadence.expectedDuration
      } : null,
      analysisDate: new Date().toISOString()
    }

    // Salvar ICP Profile
    const { error: icpError } = await supabaseAdmin
      .from('ICPProfile')
      .upsert({
        companyId,
        vertical: icpProfile.vertical,
        subVertical: icpProfile.subVertical,
        tier: icpProfile.tier,
        score: icpProfile.score,
        features: JSON.stringify(icpProfile.features),
        lastCalculated: new Date().toISOString()
      }, {
        onConflict: 'companyId'
      })

    if (icpError) {
      console.error('[AI Analysis API] ❌ Erro ao salvar ICP:', icpError)
    }

    // Salvar Propensity Scores
    for (const [offer, propensity] of Object.entries(propensityResults)) {
      const { error: propensityError } = await supabaseAdmin
        .from('PropensityScore')
        .upsert({
          companyId,
          offer,
          score: propensity.score,
          timeframe: propensity.timeframe,
          features: JSON.stringify(propensity.features),
          lastCalculated: new Date().toISOString()
        }, {
          onConflict: 'companyId,offer'
        })

      if (propensityError) {
        console.error('[AI Analysis API] ❌ Erro ao salvar Propensity:', propensityError)
      }
    }

    // Gerar Next Best Action
    const nextBestAction = {
      action: selectedCadence?.steps[0]?.action || 'wait',
      channel: selectedCadence?.steps[0]?.template || 'generic',
      template: selectedCadence?.steps[0]?.template || 'default',
      timing: selectedCadence?.steps[0]?.timing === 0 ? 'immediate' : 'tomorrow',
      rationale: `Baseado no ICP ${icpProfile.tier} e propensão ${bestOffer ? propensityResults[bestOffer].score : 0}%`
    }

    // Salvar Next Best Action
    const { error: nbaError } = await supabaseAdmin
      .from('NextBestAction')
      .insert({
        companyId,
        action: nextBestAction.action,
        channel: nextBestAction.channel,
        template: nextBestAction.template,
        timing: nextBestAction.timing,
        rationale: nextBestAction.rationale
      })

    if (nbaError) {
      console.error('[AI Analysis API] ❌ Erro ao salvar NBA:', nbaError)
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        cnpj: company.cnpj
      },
      analysis: {
        icpProfile,
        propensityResults,
        selectedCadence,
        nextBestAction,
        summary: {
          bestOffer,
          bestScore: bestOffer ? propensityResults[bestOffer].score : 0,
          recommendedAction: nextBestAction.action,
          confidence: bestOffer ? propensityResults[bestOffer].confidence : 0
        }
      }
    })

  } catch (error) {
    console.error('[AI Analysis API] ❌ Erro:', error)
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
    
    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    console.log('[AI Analysis API] 📖 Buscando análise para companyId:', companyId)

    // Buscar ICP Profile
    const { data: icpProfile, error: icpError } = await supabaseAdmin
      .from('ICPProfile')
      .select('*')
      .eq('companyId', companyId)
      .single()

    // Buscar Propensity Scores
    const { data: propensityScores, error: propensityError } = await supabaseAdmin
      .from('PropensityScore')
      .select('*')
      .eq('companyId', companyId)

    // Buscar Next Best Actions
    const { data: nextBestActions, error: nbaError } = await supabaseAdmin
      .from('NextBestAction')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false })
      .limit(5)

    if (icpError && icpError.code !== 'PGRST116') {
      console.error('[AI Analysis API] ❌ Erro ao buscar ICP:', icpError)
    }

    if (propensityError) {
      console.error('[AI Analysis API] ❌ Erro ao buscar Propensity:', propensityError)
    }

    if (nbaError) {
      console.error('[AI Analysis API] ❌ Erro ao buscar NBA:', nbaError)
    }

    return NextResponse.json({
      success: true,
      analysis: {
        icpProfile: icpProfile ? {
          ...icpProfile,
          features: JSON.parse(icpProfile.features || '{}')
        } : null,
        propensityScores: propensityScores?.map(ps => ({
          ...ps,
          features: JSON.parse(ps.features || '{}')
        })) || [],
        nextBestActions: nextBestActions || [],
        hasAnalysis: !!(icpProfile || propensityScores?.length)
      }
    })

  } catch (error) {
    console.error('[AI Analysis API] ❌ Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
