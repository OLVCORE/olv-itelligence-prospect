import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Janela de reuso (dias) para considerar o mesmo CNPJ "grátis" (grace period)
const GRACE_DAYS = 30

/**
 * POST /api/billing/guard
 * Verifica quota do Project antes de permitir gravação/consumo
 * 
 * Regras:
 * - Preview NÃO consome quota
 * - Salvar consome 1 unidade POR CNPJ, EXCETO se o mesmo CNPJ já foi salvo
 *   no período de grace (30 dias) — nesse caso, custo 0 (grace_free)
 * - Retorna status da quota + motivo (ok, exhausted, grace_free, chargeable)
 */
export async function POST(req: NextRequest) {
  try {
    const { projectId, cnpj } = await req.json()
    
    if (!projectId || !cnpj) {
      return NextResponse.json(
        { error: 'projectId e cnpj são obrigatórios' },
        { status: 400 }
      )
    }

    // Carrega projeto
    const { data: project, error: projErr } = await supabaseAdmin
      .from('Project')
      .select('id, cnpjQuota, cnpjQuotaUsed')
      .eq('id', projectId)
      .single()

    if (projErr || !project) {
      console.error('[Billing Guard] Erro ao carregar projeto:', projErr)
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verifica GRACE: mesmo CNPJ salvo nos últimos GRACE_DAYS
    const graceDate = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentUsage, error: usageErr } = await supabaseAdmin
      .from('UsageCompanyScan')
      .select('id, createdAt')
      .eq('projectId', projectId)
      .eq('cnpj', cnpj)
      .gte('createdAt', graceDate)
      .limit(1)

    if (usageErr) {
      console.error('[Billing Guard] Erro ao verificar uso recente:', usageErr)
      return NextResponse.json(
        { error: 'Falha ao verificar uso recente' },
        { status: 500 }
      )
    }

    // Se há uso recente, aplicar GRACE (não consome quota)
    if (recentUsage && recentUsage.length > 0) {
      console.log(`[Billing Guard] ✅ GRACE PERIOD para CNPJ ${cnpj} (usado em ${recentUsage[0].createdAt})`)
      return NextResponse.json({
        status: 'grace_free',
        message: 'CNPJ já analisado recentemente (grace period)',
        quota: {
          total: project.cnpjQuota,
          used: project.cnpjQuotaUsed,
          available: project.cnpjQuota - project.cnpjQuotaUsed
        },
        gracePeriodDays: GRACE_DAYS
      })
    }

    // Verificar se há saldo disponível
    const available = project.cnpjQuota - project.cnpjQuotaUsed

    if (available <= 0) {
      console.log(`[Billing Guard] ❌ QUOTA ESGOTADA para projeto ${projectId}`)
      return NextResponse.json(
        {
          status: 'exhausted',
          message: 'Quota de análises esgotada',
          quota: {
            total: project.cnpjQuota,
            used: project.cnpjQuotaUsed,
            available: 0
          },
          upgrade_required: true
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // Tudo OK para consumir quota
    console.log(`[Billing Guard] ✅ OK para consumir quota (${available} restantes)`)
    return NextResponse.json({
      status: 'chargeable',
      message: 'Quota disponível',
      quota: {
        total: project.cnpjQuota,
        used: project.cnpjQuotaUsed,
        available: available
      }
    })

  } catch (error) {
    console.error('[Billing Guard] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

