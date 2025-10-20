import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { computeMaturity } from '@/lib/maturity/tech-maturity'
import { suggestFit } from '@/lib/maturity/vendor-fit'

export async function POST(req: Request) {
  try {
    const { projectId, companyId, vendor, detectedStack, sources } = await req.json()

    if (!companyId || !vendor) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_PARAMS', message: 'companyId e vendor são obrigatórios' }
      }, { status: 400 })
    }

    console.log('[Maturity Calculate] 📊 Calculando para:', companyId, vendor)

    // Calcular scores baseado em stack detectado
    const scores = computeMaturity({
      detectedStack: detectedStack || {},
      signals: sources || {}
    })

    // Sugerir fit de vendor
    const fit = suggestFit({
      vendor: vendor as 'TOTVS' | 'OLV' | 'CUSTOM',
      detectedStack: detectedStack || {},
      scores
    })

    // Persistir no banco (UPSERT)
    const maturityData = {
      companyId,
      vendor,
      sources: JSON.stringify(sources || {}),
      scores: JSON.stringify(scores),
      detectedStack: JSON.stringify(detectedStack || {}),
      fitRecommendations: JSON.stringify(fit),
      updatedAt: new Date().toISOString()
    }

    const { data: saved, error: saveError } = await supabaseAdmin
      .from('CompanyTechMaturity')
      .upsert(maturityData, {
        onConflict: 'companyId,vendor'
      })
      .select()
      .single()

    if (saveError) {
      console.error('[Maturity Calculate] Erro ao salvar:', saveError)
      // Não falha - retorna dados mesmo se não salvar
    } else {
      console.log('[Maturity Calculate] ✅ Salvo no banco')
    }

    return NextResponse.json({
      ok: true,
      scores,
      fit,
      saved: !!saved
    })
  } catch (error: any) {
    console.error('[Maturity Calculate] Erro:', error.message)
    
    return NextResponse.json({
      ok: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: error.message
      }
    }, { status: 500 })
  }
}

