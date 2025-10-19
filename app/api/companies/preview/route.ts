import { NextResponse } from 'next/server'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/companies/preview
 * MÓDULO 1 SIMPLIFICADO: Busca completa otimizada em uma chamada
 * 
 * - ReceitaWS
 * - Presença digital (website, redes sociais, marketplaces, jusbrasil)
 * - Notícias
 * - Análise de IA (opcional)
 * 
 * Usa FAST_MODE para evitar timeout
 */
export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { cnpj: rawCnpj, website: rawWebsite, useAI = false } = body

    console.log('[API /preview] 📥 Request:', { cnpj: rawCnpj, website: rawWebsite, useAI })

    let resolvedCnpj = normalizeCnpj(rawCnpj)

    // Se tem website mas não tem CNPJ, precisa desambiguar primeiro
    if (!resolvedCnpj && rawWebsite) {
      return NextResponse.json(
        {
          status: 'disambiguation',
          message: 'Website fornecido. Use /api/companies/resolve primeiro para escolher o CNPJ.',
          hint: 'Chame POST /api/companies/resolve com {"website":"..."} e escolha um CNPJ',
        },
        { status: 422 }
      )
    }

    // Validar CNPJ
    if (!isValidCnpj(resolvedCnpj)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'CNPJ inválido. Forneça um CNPJ com 14 dígitos.',
          code: 'INVALID_CNPJ',
        },
        { status: 422 }
      )
    }

    console.log('[API /preview] ✅ CNPJ validado:', resolvedCnpj)

    // ====== VERIFICAR CACHE PRIMEIRO (Economia de Quota Google) ======
    
    console.log('[API /preview] 🔍 Verificando cache...')
    try {
      const { data: cachedData, error: cacheError } = await supabaseAdmin
        .from('preview_cache')
        .select('*')
        .eq('cnpj', resolvedCnpj)
        .gte('expires_at', new Date().toISOString()) // Não expirado
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (cachedData && !cacheError) {
        const cacheAge = Math.floor((Date.now() - new Date(cachedData.created_at).getTime()) / 1000 / 60) // minutos
        console.log(`[API /preview] ✅ CACHE HIT! Idade: ${cacheAge} minutos`)
        console.log(`[API /preview] 💾 Reutilizando dados sem consumir quota do Google`)
        
        return NextResponse.json({
          status: 'success',
          message: `Dados do cache (atualizados há ${cacheAge} min)`,
          fromCache: true,
          cacheAge: cacheAge,
          data: cachedData.data,
        })
      } else {
        console.log('[API /preview] ⚠️ Cache miss ou expirado. Buscando dados frescos...')
      }
    } catch (error: any) {
      console.warn('[API /preview] ⚠️ Erro ao verificar cache (continuando):', error.message)
    }

    // ====== BUSCA COMPLETA OTIMIZADA (< 30s) ======

    // 1. Buscar dados da ReceitaWS (geralmente < 2s)
    console.log('[API /preview] 📊 Buscando ReceitaWS...')
    const receitaData = await fetchReceitaWS(resolvedCnpj)
    
    const elapsedAfterReceita = Date.now() - startTime
    console.log(`[API /preview] ⏱️ ReceitaWS concluído em ${elapsedAfterReceita}ms`)

    // 2. Buscar presença digital COMPLETA (otimizada com FAST_MODE)
    console.log('[API /preview] 🔍 Buscando presença digital completa (modo otimizado)...')
    console.log('[API /preview] 🔑 GOOGLE_API_KEY presente?', !!process.env.GOOGLE_API_KEY)
    console.log('[API /preview] 🔑 GOOGLE_CSE_ID presente?', !!process.env.GOOGLE_CSE_ID)
    
    let digitalPresence
    try {
      digitalPresence = await fetchDigitalPresence(
        receitaData.nome || '',
        resolvedCnpj,
        receitaData.fantasia,
        undefined
      )
      
      const elapsedAfterDigital = Date.now() - startTime
      console.log(`[API /preview] ⏱️ Presença digital concluída em ${elapsedAfterDigital}ms`)
      console.log(`[API /preview] 📊 RESULTADO PRESENÇA DIGITAL:`, JSON.stringify({
        website: digitalPresence.website,
        redesSociais: digitalPresence.redesSociais,
        marketplaces: digitalPresence.marketplaces,
        jusbrasil: digitalPresence.jusbrasil,
        outrosLinks: digitalPresence.outrosLinks
      }, null, 2))
    } catch (error: any) {
      console.error('[API /preview] ❌ ERRO na busca de presença digital:', error.message)
      console.error('[API /preview] ❌ Stack trace:', error.stack)
      
      // Verificar se é erro 429 (quota excedida)
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.error('[API /preview] 🚫 QUOTA DO GOOGLE EXCEDIDA! Retornando dados parciais.')
        console.error('[API /preview] 💡 Solução: Cache vai reutilizar dados ou aguardar reset (00:00 UTC)')
      }
      
      digitalPresence = {
        website: null,
        redesSociais: {},
        marketplaces: [],
        jusbrasil: null,
        outrosLinks: []
      }
    }

    // 3. Buscar notícias
    console.log('[API /preview] 📰 Buscando notícias...')
    let googleData
    try {
      googleData = await fetchGoogleCSE(
        receitaData.nome || receitaData.fantasia || resolvedCnpj,
        resolvedCnpj
      )
      
      const elapsedAfterNews = Date.now() - startTime
      console.log(`[API /preview] ⏱️ Notícias concluídas em ${elapsedAfterNews}ms`)
      console.log(`[API /preview] 📰 NOTÍCIAS encontradas:`, googleData.news?.length || 0)
    } catch (error: any) {
      console.error('[API /preview] ❌ ERRO na busca de notícias:', error.message)
      
      // Verificar se é erro 429 (quota excedida)
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.error('[API /preview] 🚫 QUOTA DO GOOGLE EXCEDIDA para notícias!')
      }
      
      googleData = { website: null, news: [] }
    }

    // 4. Análise OpenAI (se solicitado)
    let aiAnalysis = null
    if (useAI) {
      console.log('[API /preview] 🧠 Gerando análise preliminar...')
      console.log('[API /preview] 🔑 OPENAI_API_KEY presente?', !!process.env.OPENAI_API_KEY)
      try {
        aiAnalysis = await analyzeWithOpenAI({
          company: receitaData,
          website: digitalPresence.website?.url || null,
          news: googleData.news || [],
        })
        console.log('[API /preview] ✅ Análise de IA gerada. Score:', aiAnalysis?.score)
      } catch (error: any) {
        console.error('[API /preview] ❌ ERRO na análise de IA:', error.message)
        console.error('[API /preview] ❌ Stack trace:', error.stack)
      }
    } else {
      console.log('[API /preview] ⏭️ Análise de IA não solicitada (useAI=false)')
    }

    // 5. Normalizar dados COMPLETOS
    const preview = {
      mode: 'preview',
      status: 'completed', // Dados completos
      receita: {
        identificacao: {
          cnpj: receitaData.cnpj,
          razaoSocial: receitaData.nome,
          nomeFantasia: receitaData.fantasia,
          tipo: receitaData.tipo,
          porte: receitaData.porte,
          naturezaJuridica: receitaData.natureza_juridica,
          dataAbertura: receitaData.abertura,
          dataAtualizacao: receitaData.ultima_atualizacao,
        },
        endereco: {
          logradouro: receitaData.logradouro,
          numero: receitaData.numero,
          complemento: receitaData.complemento,
          bairro: receitaData.bairro,
          municipio: receitaData.municipio,
          uf: receitaData.uf,
          cep: receitaData.cep,
          email: receitaData.email,
          telefone: receitaData.telefone,
        },
        situacao: {
          status: receitaData.situacao,
          data: receitaData.data_situacao,
          motivo: receitaData.motivo_situacao,
        },
        capital: {
          valor: receitaData.capital_social,
        },
        atividades: {
          principal: receitaData.atividade_principal,
          secundarias: receitaData.atividades_secundarias,
        },
        qsa: receitaData.qsa || [],
        simples: {
          optante: receitaData.simples?.optante,
          dataOpcao: receitaData.simples?.data_opcao,
          dataExclusao: receitaData.simples?.data_exclusao,
        },
        mei: {
          optante: receitaData.simples?.ultimo_evento === 'Mei',
        },
      },
      // Presença Digital COMPLETA
      presencaDigital: {
        website: digitalPresence.website,
        redesSociais: digitalPresence.redesSociais,
        marketplaces: digitalPresence.marketplaces,
        jusbrasil: digitalPresence.jusbrasil,
        outrosLinks: digitalPresence.outrosLinks,
        noticias: googleData.news?.slice(0, 5) || [],
      },
      enrichment: {
        website: digitalPresence.website || googleData.website,
        news: googleData.news?.slice(0, 5) || [],
      },
      ai: aiAnalysis ? {
        score: aiAnalysis.score,
        summary: aiAnalysis.insights?.slice(0, 2).join(' '),
        insights: aiAnalysis.insights || [],
        redFlags: aiAnalysis.redFlags || [],
      } : null,
    }

    const totalTime = Date.now() - startTime
    console.log(`[API /preview] ✅ Preview COMPLETO gerado em ${totalTime}ms`)

    // ====== SALVAR NO CACHE (Reutilizar em buscas futuras) ======
    
    try {
      console.log('[API /preview] 💾 Salvando no cache...')
      await supabaseAdmin.from('preview_cache').upsert({
        job_id: `cnpj-${resolvedCnpj}-${Date.now()}`,
        cnpj: resolvedCnpj,
        status: 'completed',
        data: preview,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias TTL
      })
      console.log('[API /preview] ✅ Dados salvos no cache (TTL: 7 dias)')
    } catch (error: any) {
      console.warn('[API /preview] ⚠️ Erro ao salvar cache (não bloqueante):', error.message)
    }

    return NextResponse.json({
      status: 'success',
      message: 'Preview gerado com sucesso',
      fromCache: false,
      data: preview,
      durationMs: totalTime,
    })

  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`[API /preview] ❌ Erro em ${totalTime}ms:`, error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro interno ao gerar preview',
      },
      { status: 500 }
    )
  }
}

// Configuração para Vercel: permitir execução mais longa
export const maxDuration = 30 // 30 segundos para busca completa

