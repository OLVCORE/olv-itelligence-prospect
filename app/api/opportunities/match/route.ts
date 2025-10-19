import { NextResponse } from 'next/server'
import { analyzeVendorMatch } from '@/lib/services/vendor-match'

/**
 * POST /api/opportunities/match
 * 
 * Analisa fit comercial entre empresa e produtos OLV/TOTVS/CUSTOM
 * 
 * Body:
 * {
 *   company: { cnpj, name, ... },
 *   options?: { includeAll?: boolean }
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { company, options = {} } = body

    if (!company || !company.cnpj) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Dados da empresa são obrigatórios (cnpj, name)',
        },
        { status: 400 }
      )
    }

    console.log('[API /opportunities/match] 🎯 Analisando fit para:', company.name)

    // Executar análise de vendor match
    const matchResult = await analyzeVendorMatch(company)

    console.log('[API /opportunities/match] ✅ Análise concluída:', {
      overallScore: matchResult.overallScore,
      buyingMoment: matchResult.buyingMoment,
      matches: matchResult.matches.length,
    })

    return NextResponse.json({
      status: 'success',
      data: matchResult,
    })
  } catch (error: any) {
    console.error('[API /opportunities/match] ❌ Erro:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao analisar oportunidades',
      },
      { status: 500 }
    )
  }
}

export const maxDuration = 10 // 10 segundos

