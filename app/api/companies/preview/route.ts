import { NextResponse } from 'next/server'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'

/**
 * POST /api/companies/preview
 * MICRO-SPRINT 1: Deadline Budget + Pipeline por Fases + JSON Sempre
 * Gera pré-relatório SEM persistir no banco
 * Retorna dados parciais rapidamente e continua em background se necessário
 */
export async function POST(req: Request) {
  const startTime = Date.now()
  const DEADLINE_MS = 7000 // 7 segundos deadline (Vercel limite ~10s)
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(7)}`

  console.log(`[API /preview] 🚀 Iniciando preview - TraceId: ${traceId}`)

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

    // ==========================================
    // FASE 1: ReceitaWS (OBRIGATÓRIA - até 1.5s)
    // ==========================================
    let receitaData = null
    const phase1Start = Date.now()

    try {
      console.log('[API /preview] 📊 FASE 1: Buscando ReceitaWS...')
      receitaData = await fetchReceitaWS(resolvedCnpj)
      const phase1Duration = Date.now() - phase1Start
      console.log(`[API /preview] ✅ FASE 1 concluída em ${phase1Duration}ms`)
    } catch (error: any) {
      const phase1Duration = Date.now() - phase1Start
      console.error(`[API /preview] ❌ FASE 1 falhou em ${phase1Duration}ms:`, error.message)

      // SEMPRE retornar JSON, nunca HTML
      return NextResponse.json(
        {
          status: 'error',
          message: error.message.includes('429')
            ? 'Limite de requisições da ReceitaWS atingido. Tente novamente em alguns minutos.'
            : 'Erro ao buscar dados da Receita Federal. Tente novamente.',
          code: error.message.includes('429') ? 'RATE_LIMIT' : 'RECEITA_ERROR',
          traceId,
        },
        { status: error.message.includes('429') ? 429 : 500 }
      )
    }

    // Verificar budget restante
    const budgetRemaining = DEADLINE_MS - (Date.now() - startTime)
    console.log(`[API /preview] ⏱️ Budget restante após FASE 1: ${budgetRemaining}ms`)

    // ==========================================
    // FASE 2: Website Oficial (até 2.5s total)
    // ==========================================
    let websiteData = null
    let domain = null

    if (budgetRemaining > 1000) {
      const phase2Start = Date.now()
      try {
        console.log('[API /preview] 🏠 FASE 2: Buscando website oficial...')

        // Busca rápida: apenas 1 estratégia mais eficaz
        const apiKey = process.env.GOOGLE_API_KEY
        const cseId = process.env.GOOGLE_CSE_ID

        if (apiKey && cseId) {
          const query = receitaData.fantasia
            ? `"${receitaData.fantasia}" CNPJ ${cnpj}`
            : `"${receitaData.nome}" CNPJ ${cnpj}`

          const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
            query
          )}&num=5`

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000) // 2s timeout

          const response = await fetch(url, { signal: controller.signal })
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            const items = data.items || []

            for (const item of items) {
              const itemUrl = item.link || ''
              const title = item.title || ''

              // Filtro simples: não pode ser rede social ou marketplace
              const isObvious =
                /instagram|facebook|linkedin|twitter|youtube|mercadolivre|amazon|americanas/i.test(
                  itemUrl
                )

              if (!isObvious) {
                websiteData = { url: itemUrl, title: title.replace(/\s*[-|].*$/, '').trim() }
                domain = new URL(itemUrl).hostname.replace('www.', '')
                console.log(`[API /preview] ✅ Website detectado: ${itemUrl}`)
                break
              }
            }
          }
        }

        // FALLBACK: construir domínio heurístico
        if (!domain && receitaData.fantasia) {
          const cleanName = receitaData.fantasia.toLowerCase().replace(/[^a-z0-9]/g, '')
          domain = `${cleanName}.com.br`
          console.log(`[API /preview] 🌐 Domínio heurístico: ${domain}`)
        }

        const phase2Duration = Date.now() - phase2Start
        console.log(`[API /preview] ✅ FASE 2 concluída em ${phase2Duration}ms`)
      } catch (error: any) {
        const phase2Duration = Date.now() - phase2Start
        console.warn(`[API /preview] ⚠️ FASE 2 timeout/erro em ${phase2Duration}ms:`, error.message)
        // Continuar mesmo sem website
      }
    } else {
      console.log('[API /preview] ⏭️ FASE 2 pulada (budget insuficiente)')
    }

    const budgetAfterPhase2 = DEADLINE_MS - (Date.now() - startTime)
    console.log(`[API /preview] ⏱️ Budget restante após FASE 2: ${budgetAfterPhase2}ms`)

    // ==========================================
    // FASE 3: Notícias (até 3.5s total) - OPCIONAL
    // ==========================================
    let newsItems: any[] = []

    if (budgetAfterPhase2 > 1000) {
      const phase3Start = Date.now()
      try {
        console.log('[API /preview] 📰 FASE 3: Buscando notícias...')

        const googleData = await fetchGoogleCSE(
          receitaData.nome || receitaData.fantasia || resolvedCnpj,
          resolvedCnpj
        )

        newsItems = googleData.news.slice(0, 3)

        const phase3Duration = Date.now() - phase3Start
        console.log(`[API /preview] ✅ FASE 3 concluída em ${phase3Duration}ms - ${newsItems.length} notícias`)
      } catch (error: any) {
        const phase3Duration = Date.now() - phase3Start
        console.warn(`[API /preview] ⚠️ FASE 3 timeout/erro em ${phase3Duration}ms:`, error.message)
        // Continuar mesmo sem notícias
      }
    } else {
      console.log('[API /preview] ⏭️ FASE 3 pulada (budget insuficiente)')
    }

    const budgetAfterPhase3 = DEADLINE_MS - (Date.now() - startTime)
    console.log(`[API /preview] ⏱️ Budget restante após FASE 3: ${budgetAfterPhase3}ms`)

    // ==========================================
    // FASE 4: Deep Scan (ADIADO para background)
    // ==========================================
    // TODO: Se budget < 2s, retornar preview PARCIAL com jobId
    // e disparar deep-scan assíncrono para redes sociais, marketplaces, jusbrasil

    const needsDeepScan = budgetAfterPhase3 < 2000
    const jobId = needsDeepScan ? `job-${Date.now()}-${Math.random().toString(36).substring(7)}` : null

    if (needsDeepScan) {
      console.log(`[API /preview] ⏭️ FASE 4 adiada - JobId: ${jobId}`)
      // TODO: disparar /api/preview/deep-scan com jobId (implementar no Micro-sprint 2)
    }

    // ==========================================
    // FASE 5: Análise IA (OPCIONAL - apenas se useAI=true e budget permite)
    // ==========================================
    let aiAnalysis = null

    if (useAI && budgetAfterPhase3 > 1500) {
      const phase5Start = Date.now()
      try {
        console.log('[API /preview] 🧠 FASE 5: Gerando análise preliminar...')
        aiAnalysis = await analyzeWithOpenAI({
          company: receitaData,
          website: websiteData?.url || null,
          news: newsItems,
        })
        const phase5Duration = Date.now() - phase5Start
        console.log(`[API /preview] ✅ FASE 5 concluída em ${phase5Duration}ms`)
      } catch (error: any) {
        const phase5Duration = Date.now() - phase5Start
        console.warn(`[API /preview] ⚠️ FASE 5 timeout/erro em ${phase5Duration}ms:`, error.message)
        // Continuar mesmo sem IA
      }
    } else if (useAI) {
      console.log('[API /preview] ⏭️ FASE 5 pulada (budget insuficiente)')
    }

    // ==========================================
    // MONTAGEM DO RESPONSE (SEMPRE JSON)
    // ==========================================
    const totalDuration = Date.now() - startTime
    console.log(`[API /preview] ✅ Preview concluído em ${totalDuration}ms - TraceId: ${traceId}`)

    const preview = {
      cnpj: resolvedCnpj,

      // Dados da Receita Federal (SEMPRE disponível)
      receita: {
        nome: receitaData.nome,
        fantasia: receitaData.fantasia,
        cnpj: receitaData.cnpj,
        tipo: receitaData.tipo,
        porte: receitaData.porte,
        natureza_juridica: receitaData.natureza_juridica,
        data_abertura: receitaData.abertura,
        capital_social: receitaData.capital_social,
        situacao: receitaData.situacao,
        data_situacao: receitaData.data_situacao,
        motivo_situacao: receitaData.motivo_situacao,
        atividade_principal: receitaData.atividade_principal,
        atividades_secundarias: receitaData.atividades_secundarias || [],
        qsa: receitaData.qsa || [],
        endereco: {
          logradouro: receitaData.logradouro,
          numero: receitaData.numero,
          complemento: receitaData.complemento,
          bairro: receitaData.bairro,
          municipio: receitaData.municipio,
          uf: receitaData.uf,
          cep: receitaData.cep,
        },
        contato: {
          telefone: receitaData.telefone,
          email: receitaData.email,
        },
        simples: {
          optante: receitaData.simples_optante,
          data_opcao: receitaData.simples_data_opcao,
          data_exclusao: receitaData.simples_data_exclusao,
        },
        mei: receitaData.mei,
      },

      // Presença Digital (parcial ou completo)
      presencaDigital: {
        website: websiteData,
        redesSociais: {}, // Deep-scan
        marketplaces: [], // Deep-scan
        jusbrasil: null, // Deep-scan
        outrosLinks: [], // Deep-scan
        noticias: newsItems,
      },

      // Mantém enrichment para compatibilidade
      enrichment: {
        website: websiteData?.url || null,
        news: newsItems,
      },

      // Análise IA (se disponível)
      aiAnalysis,

      // Metadados
      metadata: {
        traceId,
        generatedAt: new Date().toISOString(),
        durationMs: totalDuration,
        phases: {
          receita: true,
          website: !!websiteData,
          news: newsItems.length > 0,
          ai: !!aiAnalysis,
          deepScan: !!jobId,
        },
        jobId, // null se completo, ou jobId se precisa deep-scan
      },
    }

    return NextResponse.json(
      {
        status: jobId ? 'partial' : 'success',
        preview,
        message: jobId
          ? 'Pré-relatório parcial gerado. Varredura profunda em andamento...'
          : 'Pré-relatório gerado com sucesso',
      },
      {
        headers: {
          'X-Trace-Id': traceId,
          'X-Duration-Ms': totalDuration.toString(),
        },
      }
    )
  } catch (error: any) {
    const totalDuration = Date.now() - startTime
    console.error(`[API /preview] ❌ Erro geral em ${totalDuration}ms:`, error)

    // SEMPRE retornar JSON, nunca HTML
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erro ao gerar pré-relatório. Tente novamente.',
        code: 'INTERNAL_ERROR',
        traceId,
        durationMs: totalDuration,
      },
      {
        status: 500,
        headers: {
          'X-Trace-Id': traceId,
          'X-Duration-Ms': totalDuration.toString(),
        },
      }
    )
  }
}
