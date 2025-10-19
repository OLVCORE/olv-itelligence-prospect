import { NextResponse } from 'next/server'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'
import { randomUUID } from 'crypto'

/**
 * POST /api/companies/preview
 * MÓDULO 1: Resposta rápida parcial (< 7s) + deep-scan assíncrono
 * 
 * FASE 1 (Síncrona, < 7s):
 * - ReceitaWS
 * - Busca básica de website oficial (Google CSE - 1 estratégia)
 * - Retorna jobId para polling
 * 
 * FASE 2 (Assíncrona, background):
 * - Dispara /api/preview/deep-scan para busca profunda
 */
export async function POST(req: Request) {
  const startTime = Date.now()
  const DEADLINE_MS = 7000 // 7 segundos deadline budget

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

    // ====== FASE 1: BUSCA RÁPIDA (< 7s) ======

    // 1. Buscar dados da ReceitaWS (geralmente < 2s)
    console.log('[API /preview] 📊 Buscando ReceitaWS...')
    const receitaData = await fetchReceitaWS(resolvedCnpj)
    
    const elapsedAfterReceita = Date.now() - startTime
    console.log(`[API /preview] ⏱️ ReceitaWS concluído em ${elapsedAfterReceita}ms`)

    // 2. Busca BÁSICA de website oficial (apenas 1 estratégia rápida)
    let quickWebsite = null
    if (Date.now() - startTime < DEADLINE_MS - 2000) {
      console.log('[API /preview] 🏠 Busca rápida de website...')
      quickWebsite = await findQuickWebsite(
        receitaData.fantasia || receitaData.nome,
        resolvedCnpj,
        DEADLINE_MS - (Date.now() - startTime) - 1000 // Reservar 1s de margem
      )
    }

    const elapsedAfterQuickSearch = Date.now() - startTime
    console.log(`[API /preview] ⏱️ Busca rápida concluída em ${elapsedAfterQuickSearch}ms`)

    // 3. Gerar jobId para deep-scan
    const jobId = randomUUID()

    // 4. Normalizar dados parciais
    const partialPreview = {
      mode: 'preview',
      jobId,
      status: 'partial', // Indica que deep-scan está em andamento
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
      // Presença Digital PARCIAL (apenas website básico)
      presencaDigital: {
        website: quickWebsite,
        redesSociais: {}, // Será preenchido pelo deep-scan
        marketplaces: [], // Será preenchido pelo deep-scan
        jusbrasil: null, // Será preenchido pelo deep-scan
        outrosLinks: [], // Será preenchido pelo deep-scan
        noticias: [], // Será preenchido pelo deep-scan
      },
      enrichment: {
        website: quickWebsite,
        news: [],
      },
      ai: null, // IA será gerada no deep-scan se useAI=true
    }

    const totalSyncTime = Date.now() - startTime
    console.log(`[API /preview] ✅ Resposta parcial gerada em ${totalSyncTime}ms`)

    // ====== FASE 2: DISPARAR DEEP-SCAN ASSÍNCRONO (NÃO AGUARDAR) ======
    
    // Disparar deep-scan em background (fire-and-forget)
    const deployUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    
    const deepScanUrl = `${deployUrl}/api/preview/deep-scan`
    
    console.log(`[API /preview] 🚀 Disparando deep-scan assíncrono - JobId: ${jobId}`)
    
    // Fire-and-forget: NÃO usar await
    fetch(deepScanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        cnpj: resolvedCnpj,
        companyName: receitaData.nome,
        fantasia: receitaData.fantasia,
        website: quickWebsite?.url,
        useAI,
      }),
    }).catch(err => {
      console.error('[API /preview] ⚠️ Erro ao disparar deep-scan (não bloqueante):', err.message)
    })

    return NextResponse.json({
      status: 'partial',
      message: 'Dados parciais carregados. Deep-scan em andamento.',
      jobId,
      data: partialPreview,
      syncDurationMs: totalSyncTime,
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

/**
 * Busca RÁPIDA de website oficial (apenas 1 estratégia)
 * Timeout configurável para respeitar deadline budget
 */
async function findQuickWebsite(
  companyName: string,
  cnpj: string,
  timeoutMs: number
): Promise<{ url: string; title: string; status: string } | null> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cseId) {
    console.warn('[findQuickWebsite] ⚠️ Google CSE não configurado')
    return null
  }

  try {
    // Estratégia única mais eficaz: nome + "site oficial"
    const query = `"${companyName}" site oficial`
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=3`

    // AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, { 
      signal: controller.signal,
      next: { revalidate: 3600 }
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn('[findQuickWebsite] ⚠️ Erro na busca:', response.status)
      return null
    }

    const data = await response.json()
    const items = data.items || []

    console.log(`[findQuickWebsite] 📊 Encontrados ${items.length} resultados`)

    // Retornar o primeiro resultado que não seja óbvio exclusão
    for (const item of items) {
      const itemUrl = item.link || ''
      const isExcluded = /wikipedia|youtube\.com\/watch|facebook\.com\/watch|instagram\.com\/p\//i.test(itemUrl)
      
      if (!isExcluded) {
        console.log(`[findQuickWebsite] ✅ Website encontrado: ${itemUrl}`)
        return {
          url: itemUrl,
          title: item.title?.replace(/\s*[-|].*$/, '').trim() || companyName,
          status: 'ativo'
        }
      }
    }

    return null
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('[findQuickWebsite] ⏱️ Timeout na busca')
    } else {
      console.error('[findQuickWebsite] ❌ Erro:', error.message)
    }
    return null
  }
}

// Configuração para Vercel: permitir execução mais longa (mas responde antes!)
export const maxDuration = 10 // 10 segundos max, mas responde em ~7s

