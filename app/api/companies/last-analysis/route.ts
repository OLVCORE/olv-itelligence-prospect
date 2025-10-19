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

    return NextResponse.json({
      status: 'success',
      analysis: {
        id: analysis.id,
        score: analysis.score,
        insights: typeof analysis.insights === 'string' 
          ? JSON.parse(analysis.insights) 
          : analysis.insights,
        redFlags: analysis.redFlags 
          ? (typeof analysis.redFlags === 'string' 
              ? JSON.parse(analysis.redFlags) 
              : analysis.redFlags)
          : [],
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

