import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { detectTotvsLite } from '@/lib/services/technographics/totvs-lite'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/technographics/totvs/scan?companyId=<id>
 * Escaneia a empresa para detectar produtos TOTVS
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ status: 'error', message: 'Não autenticado' }, { status: 401 })
    }

    // 2. Obter companyId da query
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { status: 'error', message: 'companyId é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[API /technographics/totvs/scan] Iniciando scan para companyId:', companyId)

    // 3. Buscar dados da empresa
    const supabase = createAdminClient()

    const { data: company, error: companyError } = await supabase
      .from('Company')
      .select('id, cnpj, razao_social, nome_fantasia, website, enrichment')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[API /technographics/totvs/scan] Empresa não encontrada:', companyError)
      return NextResponse.json(
        { status: 'error', message: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // 4. Detectar TOTVS
    const result = await detectTotvsLite({
      website: company.website || undefined,
      name: company.nome_fantasia || company.razao_social || undefined,
    })

    console.log('[API /technographics/totvs/scan] ✅ Scan concluído:', {
      companyId,
      totvs_detected: result.totvs_detected,
      produtos: result.produtos,
      confidence_score: result.confidence_score,
    })

    // 5. Retornar resultado (sem persistir)
    return NextResponse.json({
      status: 'success',
      companyId,
      result,
    })
  } catch (error: any) {
    console.error('[API /technographics/totvs/scan] Erro:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao escanear empresa',
      },
      { status: 500 }
    )
  }
}

