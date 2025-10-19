import { NextResponse } from 'next/server'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/preview/deep-scan
 * MÓDULO 1: Deep Scan assíncrono completo
 * Executa busca profunda: redes sociais, marketplaces, jusbrasil, notícias, IA
 */
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { cnpj, jobId, companyName, fantasia, website, useAI = false } = body

    if (!jobId || !cnpj) {
      return NextResponse.json(
        { status: 'error', message: 'jobId e cnpj são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`[API /deep-scan] 🚀 Iniciando deep-scan - JobId: ${jobId}`)
    console.log(`[API /deep-scan] 📋 Dados: CNPJ=${cnpj}, Nome=${companyName}, Fantasia=${fantasia}`)
    
    // Verificar variáveis de ambiente
    const hasGoogleKeys = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID)
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    console.log(`[API /deep-scan] 🔑 Google Keys: ${hasGoogleKeys ? '✅' : '❌'}`)
    console.log(`[API /deep-scan] 🔑 OpenAI Key: ${hasOpenAI ? '✅' : '❌'}`)

    // 1. Busca completa de presença digital (redes sociais, marketplaces, jusbrasil)
    console.log(`[API /deep-scan] 🔍 Buscando presença digital completa...`)
    let digitalPresence
    try {
      digitalPresence = await fetchDigitalPresence(
        companyName || '',
        cnpj,
        fantasia,
        website
      )
      console.log(`[API /deep-scan] ✅ Presença digital concluída:`, {
        website: !!digitalPresence.website,
        redesSociais: Object.keys(digitalPresence.redesSociais).length,
        marketplaces: digitalPresence.marketplaces.length,
        jusbrasil: !!digitalPresence.jusbrasil,
        outrosLinks: digitalPresence.outrosLinks.length
      })
    } catch (error: any) {
      console.error(`[API /deep-scan] ❌ Erro na busca de presença digital:`, error.message)
      digitalPresence = { 
        website: null, 
        redesSociais: {}, 
        marketplaces: [], 
        jusbrasil: null, 
        outrosLinks: [] 
      }
    }

    // 2. Buscar notícias
    console.log(`[API /deep-scan] 📰 Buscando notícias...`)
    let googleData
    try {
      googleData = await fetchGoogleCSE(
        companyName || fantasia || cnpj,
        cnpj
      )
      console.log(`[API /deep-scan] ✅ Notícias encontradas: ${googleData.news?.length || 0}`)
    } catch (error: any) {
      console.error(`[API /deep-scan] ❌ Erro ao buscar notícias:`, error.message)
      googleData = { website: null, news: [] }
    }

    // 3. Análise OpenAI (se solicitado)
    let aiAnalysis = null
    if (useAI && hasOpenAI) {
      console.log(`[API /deep-scan] 🧠 Gerando análise preliminar com IA...`)
      try {
        aiAnalysis = await analyzeWithOpenAI({
          company: {
            nome: companyName,
            cnpj,
            fantasia,
          },
          website: digitalPresence.website?.url || website || null,
          news: googleData.news || [],
        })
        console.log(`[API /deep-scan] ✅ Análise de IA gerada: score=${aiAnalysis?.score}`)
      } catch (error: any) {
        console.error('[API /deep-scan] ⚠️ Erro na análise de IA (não bloqueante):', error.message)
      }
    } else if (useAI && !hasOpenAI) {
      console.warn('[API /deep-scan] ⚠️ IA solicitada mas OpenAI key não configurada')
    }

    // 4. Montar resultado completo
    const deepScanResult = {
      presencaDigital: {
        website: digitalPresence.website,
        redesSociais: digitalPresence.redesSociais,
        marketplaces: digitalPresence.marketplaces,
        jusbrasil: digitalPresence.jusbrasil,
        outrosLinks: digitalPresence.outrosLinks,
        noticias: googleData.news?.slice(0, 5) || [], // Top 5 notícias
      },
      enrichment: {
        website: digitalPresence.website || googleData.website,
        news: googleData.news?.slice(0, 5) || [],
      },
      ai: aiAnalysis ? {
        score: aiAnalysis.score,
        summary: aiAnalysis.insights?.slice(0, 2).join(' '), // 2 frases de resumo
        insights: aiAnalysis.insights || [],
        redFlags: aiAnalysis.redFlags || [],
      } : null,
    }

    // 5. Salvar resultado no cache (Supabase)
    const supabase = createAdminClient()

    const cacheData = {
      job_id: jobId,
      cnpj,
      status: 'completed',
      data: deepScanResult,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
    }

    // Tentar salvar no cache (se tabela existir)
    try {
      await supabase.from('preview_cache').upsert(cacheData, {
        onConflict: 'job_id',
      })
      console.log(`[API /deep-scan] ✅ Resultado salvo no cache: ${jobId}`)
    } catch (error: any) {
      console.warn('[API /deep-scan] ⚠️ Erro ao salvar no cache:', error.message)
      // Continuar mesmo sem cache (client vai receber resposta)
    }

    const totalDuration = Date.now() - startTime
    console.log(`[API /deep-scan] ✅ Deep-scan concluído em ${totalDuration}ms - JobId: ${jobId}`)

    return NextResponse.json({
      status: 'completed',
      jobId,
      data: deepScanResult,
      durationMs: totalDuration,
    })
  } catch (error: any) {
    const totalDuration = Date.now() - startTime
    console.error(`[API /deep-scan] ❌ Erro em ${totalDuration}ms:`, error)

    // Salvar erro no cache também (para não ficar em pending infinito)
    try {
      const supabase = createAdminClient()
      await supabase.from('preview_cache').upsert({
        job_id: body.jobId,
        cnpj: body.cnpj,
        status: 'error',
        data: { error: error.message },
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1h TTL para erros
      }, {
        onConflict: 'job_id',
      })
    } catch (cacheError) {
      console.error('[API /deep-scan] ⚠️ Erro ao salvar erro no cache:', cacheError)
    }

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

