import { NextResponse } from 'next/server'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/preview/deep-scan
 * MICRO-SPRINT 2: Deep Scan assíncrono
 * Executa busca profunda de redes sociais, marketplaces, jusbrasil em background
 */
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { cnpj, jobId, companyName, fantasia, website } = body

    if (!jobId || !cnpj) {
      return NextResponse.json(
        { status: 'error', message: 'jobId e cnpj são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`[API /deep-scan] 🚀 Iniciando deep-scan - JobId: ${jobId}`)

    // Executar busca completa de presença digital
    const digitalPresence = await fetchDigitalPresence(
      companyName || '',
      cnpj,
      fantasia,
      website
    )

    // Salvar resultado no cache (Supabase ou KV)
    const supabase = createAdminClient()

    const cacheData = {
      job_id: jobId,
      cnpj,
      status: 'completed',
      data: digitalPresence,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
    }

    // Tentar salvar no cache (se tabela existir)
    try {
      await supabase.from('preview_cache').upsert(cacheData, {
        onConflict: 'job_id',
      })
      console.log(`[API /deep-scan] ✅ Resultado salvo no cache: ${jobId}`)
    } catch (error) {
      console.warn('[API /deep-scan] ⚠️ Erro ao salvar no cache (tabela pode não existir):', error)
      // Continuar mesmo sem cache
    }

    const totalDuration = Date.now() - startTime
    console.log(`[API /deep-scan] ✅ Deep-scan concluído em ${totalDuration}ms - JobId: ${jobId}`)

    return NextResponse.json({
      status: 'completed',
      jobId,
      data: digitalPresence,
      durationMs: totalDuration,
    })
  } catch (error: any) {
    const totalDuration = Date.now() - startTime
    console.error(`[API /deep-scan] ❌ Erro em ${totalDuration}ms:`, error)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao executar deep-scan',
        durationMs: totalDuration,
      },
      { status: 500 }
    )
  }
}

// Configuração para Vercel: permitir execução mais longa
export const maxDuration = 30 // 30 segundos para deep-scan

