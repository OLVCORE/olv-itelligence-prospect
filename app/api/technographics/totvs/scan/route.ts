/**
 * TOTVS Technographics Scan Endpoint
 * GET /api/technographics/totvs/scan?companyId=...
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { detectTotvsLite } from '@/lib/services/technographics/totvs-lite'

export async function GET(request: NextRequest) {
  console.log('[TOTVS-Scan] 🔍 Iniciando scan TOTVS...')
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { status: 'error', message: 'companyId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados da empresa via Admin Client
    const supabase = supabaseAdmin
    const { data: company, error: companyError } = await supabase
      .from('Company')
      .select('id, name, tradeName, domain')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[TOTVS-Scan] ❌ Empresa não encontrada:', companyError?.message || 'Erro desconhecido')
      return NextResponse.json(
        { status: 'error', message: 'Empresa não encontrada', details: process.env.NODE_ENV === 'development' ? companyError?.message : undefined },
        { status: 404 }
      )
    }

    console.log('[TOTVS-Scan] 📊 Empresa encontrada:', {
      id: company.id,
      name: company.name,
      tradeName: company.tradeName,
      domain: company.domain
    })

    // Executar detecção TOTVS Lite
    const result = await detectTotvsLite({
      website: company.domain || undefined,
      name: company.tradeName || company.name
    })

    const response = {
      status: 'success',
      companyId: company.id,
      result,
      metadata: {
        scanned_at: new Date().toISOString(),
        elapsed_ms: Date.now() - startTime,
        company_name: company.name
      }
    }

    console.log('[TOTVS-Scan] ✅ Scan concluído:', {
      totvs_detected: result.totvs_detected,
      produtos: result.produtos,
      confidence_score: result.confidence_score,
      elapsed_ms: Date.now() - startTime
    })

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    console.error('[TOTVS-Scan] ❌ Erro no scan:', error.message)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}