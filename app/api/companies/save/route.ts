import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * POST /api/companies/save
 * Salva análise de empresa + consome quota
 * 
 * Fluxo:
 * 1. Chama /api/billing/guard internamente
 * 2. Se exhausted → bloqueia e retorna erro
 * 3. Se grace_free → salva sem consumir quota
 * 4. Se chargeable → salva + registra uso + incrementa quota
 */
export async function POST(req: NextRequest) {
  try {
    const { projectId, cnpj, payload } = await req.json()
    
    if (!projectId || !cnpj || !payload) {
      return NextResponse.json(
        { error: 'projectId, cnpj e payload são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Verificar quota (billing guard)
    const guardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/billing/guard`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, cnpj })
      }
    )

    const guardData = await guardResponse.json()

    // Se quota esgotada, bloquear
    if (guardData.status === 'exhausted') {
      console.log(`[Companies Save] ❌ BLOQUEADO: Quota esgotada para projeto ${projectId}`)
      return NextResponse.json(guardData, { status: 402 })
    }

    // 2. Salvar análise na tabela Company
    const { data: company, error: saveErr } = await supabaseAdmin
      .from('Company')
      .upsert({
        cnpj,
        projectId,
        name: payload.razaoSocial || payload.name,
        tradeName: payload.nomeFantasia || payload.tradeName,
        domain: payload.website || payload.domain,
        cnae: payload.cnae,
        status: payload.status,
        openingDate: payload.dataAbertura || payload.openingDate,
        capital: payload.capitalSocial || payload.capital,
        financial: JSON.stringify(payload.financial || {}),
        industry: payload.setor || payload.industry,
        size: payload.porte || payload.size,
        location: JSON.stringify(payload.location || {}),
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'cnpj'
      })
      .select()
      .single()

    if (saveErr) {
      console.error('[Companies Save] Erro ao salvar empresa:', saveErr)
      return NextResponse.json(
        { error: 'Falha ao salvar análise' },
        { status: 500 }
      )
    }

    // 3. Se não é grace_free, consumir quota
    if (guardData.status === 'chargeable') {
      // Registrar uso
      const { error: usageErr } = await supabaseAdmin
        .from('UsageCompanyScan')
        .insert({
          projectId,
          cnpj,
          createdAt: new Date().toISOString()
        })

      if (usageErr) {
        console.error('[Companies Save] Erro ao registrar uso:', usageErr)
      }

      // Incrementar quota usada
      const { error: quotaErr } = await supabaseAdmin
        .from('Project')
        .update({
          cnpjQuotaUsed: guardData.quota.used + 1
        })
        .eq('id', projectId)

      if (quotaErr) {
        console.error('[Companies Save] Erro ao atualizar quota:', quotaErr)
      }

      console.log(`[Companies Save] ✅ Análise salva e quota consumida (${guardData.quota.available - 1} restantes)`)
    } else {
      console.log(`[Companies Save] ✅ Análise salva SEM consumir quota (grace period)`)
    }

    return NextResponse.json({
      success: true,
      company,
      billing: {
        status: guardData.status,
        quota: {
          ...guardData.quota,
          used: guardData.status === 'chargeable' ? guardData.quota.used + 1 : guardData.quota.used,
          available: guardData.status === 'chargeable' ? guardData.quota.available - 1 : guardData.quota.available
        }
      }
    })

  } catch (error) {
    console.error('[Companies Save] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

