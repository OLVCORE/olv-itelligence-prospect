import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * GET /api/companies/last-analysis?companyId=<id>
 * Retorna a última análise de uma empresa específica
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const companyId = url.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Parâmetro companyId é obrigatório',
        },
        { status: 400 }
      )
    }

    console.log('[API /last-analysis] 🔍 Buscando análise para empresa:', companyId)

    // Buscar última análise
    const { data: analysis, error } = await supabaseAdmin
      .from('Analysis')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /last-analysis] ❌ Erro ao buscar:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: `Erro ao buscar análise: ${error.message}`,
        },
        { status: 500 }
      )
    }

    if (!analysis) {
      console.log('[API /last-analysis] ⚠️ Nenhuma análise encontrada')
      return NextResponse.json({
        status: 'empty',
        message: 'Nenhuma análise encontrada para esta empresa',
      })
    }

    console.log('[API /last-analysis] ✅ Análise encontrada:', analysis.id)

    // Parse JSON fields
    const parsedInsights = typeof analysis.insights === 'string' 
      ? JSON.parse(analysis.insights) 
      : analysis.insights

    const parsedRedFlags = analysis.redFlags 
      ? (typeof analysis.redFlags === 'string' 
          ? JSON.parse(analysis.redFlags) 
          : analysis.redFlags)
      : []

    // Tentar parsear campos novos do scoring híbrido (se existirem)
    let breakdown = null
    let scoreIA = null
    let scoreRegras = null
    let classificacao = null
    let justification = null

    // Verificar se insights contém dados de breakdown (novo formato)
    if (parsedInsights && typeof parsedInsights === 'object' && parsedInsights.breakdown) {
      breakdown = parsedInsights.breakdown
      scoreIA = parsedInsights.scoreIA
      scoreRegras = parsedInsights.scoreRegras
      classificacao = parsedInsights.classificacao
      justification = parsedInsights.justification
    }

    return NextResponse.json({
      status: 'success',
      analysis: {
        id: analysis.id,
        score: analysis.score,
        scoreIA,
        scoreRegras,
        breakdown,
        classificacao,
        justification,
        insights: Array.isArray(parsedInsights) ? parsedInsights : parsedInsights?.insights || [],
        redFlags: parsedRedFlags,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('[API /last-analysis] ❌ Erro:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro interno ao buscar análise',
      },
      { status: 500 }
    )
  }
}

