import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/preview/status?jobId=<id>
 * MICRO-SPRINT 2: Verificar status do deep-scan
 * Retorna o resultado completo quando disponível
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { status: 'error', message: 'jobId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`[API /status] 🔍 Verificando status - JobId: ${jobId}`)

    // Buscar no cache
    const supabase = createAdminClient()

    try {
      const { data, error } = await supabase
        .from('preview_cache')
        .select('*')
        .eq('job_id', jobId)
        .single()

      if (error) {
        console.log(`[API /status] ⏳ Deep-scan ainda em andamento - JobId: ${jobId}`)
        return NextResponse.json({
          status: 'pending',
          jobId,
          message: 'Deep-scan em andamento...',
        })
      }

      if (data) {
        console.log(`[API /status] ✅ Deep-scan concluído - JobId: ${jobId}`)
        return NextResponse.json({
          status: 'completed',
          jobId,
          data: data.data,
          completedAt: data.created_at,
        })
      }
    } catch (error) {
      console.warn('[API /status] ⚠️ Tabela preview_cache não existe ainda:', error)
      // Retornar pending se tabela não existe
      return NextResponse.json({
        status: 'pending',
        jobId,
        message: 'Deep-scan em andamento (cache não disponível)...',
      })
    }

    return NextResponse.json({
      status: 'pending',
      jobId,
      message: 'Deep-scan em andamento...',
    })
  } catch (error: any) {
    console.error('[API /status] ❌ Erro:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao verificar status',
      },
      { status: 500 }
    )
  }
}

