import { NextResponse } from 'next/server'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'
import { calculatePropensityScore } from '@/lib/scoring/propensity-calculator'
import { identifyAttentionPoints, generateRecommendation, generateSuggestedActions } from '@/lib/ai/recommendation-engine'
import { generateExecutiveInsights } from '@/lib/ai/insights-generator'
import { detectTotvsLite } from '@/lib/services/technographics/totvs-lite'
import { createReceitaEvidence, createNewsEvidence } from '@/lib/types/evidence'
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

    // 4. Análise de Vendor Match (FIT TOTVS + OLV)
    console.log('[API /preview] 🎯 Analisando fit comercial (OLV + TOTVS)...')
    let vendorMatch = null
    try {
      const { analyzeVendorMatch } = await import('@/lib/services/vendor-match')
      vendorMatch = await analyzeVendorMatch({
        cnpj: resolvedCnpj,
        name: receitaData.nome || '',
        tradeName: receitaData.fantasia,
        size: receitaData.porte,
        capital: receitaData.capital_social,
        mainActivity: receitaData.atividade_principal?.[0]?.text,
        secondaryActivities: receitaData.atividades_secundarias?.map((a: any) => a.text) || [],
        qsa: receitaData.qsa,
        digitalPresence: {
          website: digitalPresence.website,
          socialMedia: digitalPresence.redesSociais,
          marketplaces: digitalPresence.marketplaces,
          jusbrasil: digitalPresence.jusbrasil,
        },
        news: googleData.news,
      })
      console.log('[API /preview] ✅ Vendor match:', {
        overallScore: vendorMatch.overallScore,
        buyingMoment: vendorMatch.buyingMoment,
        topProduct: vendorMatch.topRecommendation?.product.name,
      })
    } catch (error: any) {
      console.error('[API /preview] ⚠️ Erro no vendor match (não bloqueante):', error.message)
    }

    // 4.5 TOTVS Scan Lite (para usar no score de propensão)
    console.log('[API /preview] 🔍 Executando TOTVS Scan Lite...')
    let totvsScan = null
    try {
      totvsScan = await detectTotvsLite({
        website: digitalPresence.website?.url,
        name: receitaData.fantasia || receitaData.nome
      })
      console.log('[API /preview] ✅ TOTVS Scan:', {
        detected: totvsScan.totvs_detected,
        produtos: totvsScan.produtos,
        confidence: totvsScan.confidence_score
      })
    } catch (error: any) {
      console.error('[API /preview] ⚠️ Erro no TOTVS scan (não bloqueante):', error.message)
    }

    // Parse capital social (ReceitaWS retorna string tipo "5000.00")
    const parseCapital = (cap: string | undefined): number => {
      if (!cap) return 0
      const clean = cap.replace(/[^\d,.-]/g, '')
      if (clean.includes(',')) {
        const parts = clean.split(',')
        const int = parts[0].replace(/\./g, '')
        const dec = parts[1] || '00'
        return parseFloat(int + '.' + dec)
      }
      return parseFloat(clean) || 0
    }
    
    const capitalNumerico = parseCapital(receitaData.capital_social)
    console.log('[API /preview] 💰 Capital parseado:', receitaData.capital_social, '→', capitalNumerico)
    
    // 4.6 Score de Propensão (MÓDULO A - Seção 6)
    console.log('[API /preview] 📊 Calculando score de propensão...')
    const propensityScore = calculatePropensityScore({
      receita: {
        capital: { valor: capitalNumerico },
        identificacao: { porte: receitaData.porte },
        funcionarios: undefined, // TODO: Adicionar quando disponível
      },
      presencaDigital: {
        website: digitalPresence.website,
        redesSociais: digitalPresence.redesSociais,
        marketplaces: digitalPresence.marketplaces,
        jusbrasil: digitalPresence.jusbrasil,
      },
      noticias: googleData.news,
      totvsScan: totvsScan,
      jusbrasil: digitalPresence.jusbrasil,
    })
    console.log('[API /preview] ✅ Propensity Score:', propensityScore.overall)

    // 4.7 Pontos de Atenção (MÓDULO A - Seção 8)
    console.log('[API /preview] ⚠️ Identificando pontos de atenção...')
    const attentionPoints = identifyAttentionPoints({
      websiteValidated: !!digitalPresence.website?.url,
      websiteScore: digitalPresence.website?.score,
      redesSociaisCount: Object.keys(digitalPresence.redesSociais || {}).length,
      noticiasCount: googleData.news?.length || 0,
      noticiasRecentes: (googleData.news || []).filter((n: any) => {
        if (!n.date) return false
        const monthsDiff = (Date.now() - new Date(n.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
        return monthsDiff <= 6
      }).length,
      jusbrasil: digitalPresence.jusbrasil,
      capital: receitaData.capital_social,
      porte: receitaData.porte,
      situacao: receitaData.situacao,
      totvsDetected: totvsScan?.totvs_detected,
    })
    console.log('[API /preview] ⚠️ Pontos de atenção:', attentionPoints.length)

    // 4.8 Recomendação Go/No-Go (MÓDULO A - Seção 9)
    console.log('[API /preview] 🎯 Gerando recomendação Go/No-Go...')
    const recommendation = generateRecommendation({
      score: propensityScore.overall,
      websiteValidated: !!digitalPresence.website?.url,
      websiteScore: digitalPresence.website?.score,
      noticiasRecentes: (googleData.news || []).filter((n: any) => {
        if (!n.date) return false
        const monthsDiff = (Date.now() - new Date(n.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
        return monthsDiff <= 6
      }).length,
      attentionPoints,
      totvsDetected: totvsScan?.totvs_detected,
      situacao: receitaData.situacao,
    })
    console.log('[API /preview] ✅ Recomendação:', recommendation.decision)

    // 4.9 Ações Sugeridas (MÓDULO A - Seção 10)
    console.log('[API /preview] 📋 Gerando ações sugeridas...')
    const suggestedActions = generateSuggestedActions({
      decision: recommendation.decision,
      leadTemperature: totvsScan?.lead_temperature,
      totvsDetected: totvsScan?.totvs_detected,
      decisor: vendorMatch?.decisionMaker,
      attentionPoints,
    })
    console.log('[API /preview] ✅ Ações sugeridas:', suggestedActions.length)

    // 5. Análise OpenAI ENRIQUECIDA (se solicitado)
    let aiAnalysis = null
    if (useAI) {
      console.log('[API /preview] 🧠 Gerando análise enriquecida com IA...')
      console.log('[API /preview] 🔑 OPENAI_API_KEY presente?', !!process.env.OPENAI_API_KEY)
      try {
        aiAnalysis = await analyzeWithOpenAI({
          company: receitaData,
          website: digitalPresence.website?.url || null,
          news: googleData.news || [],
          digitalPresence: digitalPresence,
          vendorMatch: vendorMatch, // Passa vendor match para IA
        })
        console.log('[API /preview] ✅ Análise de IA gerada. Score:', aiAnalysis?.score)
      } catch (error: any) {
        console.error('[API /preview] ❌ ERRO na análise de IA:', error.message)
        console.error('[API /preview] ❌ Stack trace:', error.stack)
      }
    } else {
      console.log('[API /preview] ⏭️ Análise de IA não solicitada (useAI=false)')
    }

    // 6. Normalizar dados COMPLETOS (incluindo vendor match)
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
      // Oportunidades comerciais (FIT TOTVS + OLV)
      opportunities: vendorMatch ? {
        overallScore: vendorMatch.overallScore,
        buyingMoment: vendorMatch.buyingMoment,
        topRecommendation: vendorMatch.topRecommendation,
        allMatches: vendorMatch.matches.slice(0, 5), // Top 5
        decisionMaker: vendorMatch.decisionMaker,
        nextSteps: vendorMatch.nextSteps,
      } : null,
      // TOTVS Scan (MÓDULO A - Seção 3)
      totvsScan: totvsScan,
      // Score de Propensão (MÓDULO A - Seção 6)
      propensityScore: propensityScore,
      // Pontos de Atenção (MÓDULO A - Seção 8)
      attentionPoints: attentionPoints,
      // Recomendação Go/No-Go (MÓDULO A - Seção 9)
      recommendation: recommendation,
      // Ações Sugeridas (MÓDULO A - Seção 10)
      suggestedActions: suggestedActions,
      // Evidências Consolidadas
      evidences: {
        receita: createReceitaEvidence(resolvedCnpj, receitaData),
        noticias: (googleData.news || []).slice(0, 5).map((n: any) => 
          createNewsEvidence({
            url: n.link,
            title: n.title,
            snippet: n.snippet,
            date: n.date,
          })
        ),
      },
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

    // Verificar se houve problema de quota
    const hasQuotaIssue = 
      (!digitalPresence.website && !digitalPresence.redesSociais && !digitalPresence.marketplaces.length) ||
      (googleData.news?.length === 0)
    
    return NextResponse.json({
      status: 'success',
      message: 'Preview gerado com sucesso',
      fromCache: false,
      data: preview,
      durationMs: totalTime,
      warnings: hasQuotaIssue ? {
        type: 'quota_exceeded',
        message: 'APIs de busca com quota excedida. Presença digital pode estar incompleta.',
        action: 'Configure Bing ou Serper para obter dados completos'
      } : null
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

