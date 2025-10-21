import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 5 // Query simples: 5s

const schema = z.object({
  jobId: z.string().min(1, "jobId é obrigatório")
})

/**
 * GET /api/bulk/status?jobId=xxx
 * Retorna status do processamento em massa
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'jobId é obrigatório'
        }
      }, { status: 422 })
    }

    const sb = supabaseAdmin()

    console.log('[BulkStatus] 📊 Consultando job:', jobId)

    // Buscar job
    const { data: job, error: jobError } = await sb
      .from('BulkJobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job não encontrado'
        }
      }, { status: 404 })
    }

    // Buscar itens
    const { data: items, error: itemsError } = await sb
      .from('BulkItems')
      .select('*')
      .eq('jobId', jobId)
      .order('index', { ascending: true })

    if (itemsError) {
      console.error('[BulkStatus] ❌ Erro ao buscar itens:', itemsError)
    }

    // Calcular progresso
    const progress = {
      total: job.total,
      processed: job.processed,
      succeeded: job.succeeded,
      failed: job.failed,
      percentage: job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0,
      status: job.status
    }

    // Estimativa de conclusão (se em progresso)
    let estimatedCompletion = null
    if (job.status === 'processing' && job.processed > 0) {
      const elapsed = Date.now() - new Date(job.createdAt).getTime()
      const avgTimePerItem = elapsed / job.processed
      const remaining = job.total - job.processed
      estimatedCompletion = Math.round((remaining * avgTimePerItem) / 1000) // segundos
    }

    const latency = Date.now() - startTime
    console.log(`[BulkStatus] ✅ Status consultado em ${latency}ms - ${progress.percentage}%`)

    return NextResponse.json({
      ok: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          completedAt: job.completedAt
        },
        progress,
        estimatedCompletion,
        items: items || [],
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[BulkStatus] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

