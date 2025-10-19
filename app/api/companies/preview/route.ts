import { NextResponse } from 'next/server'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'
import { fetchDigitalPresence } from '@/lib/services/digital-presence'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'

/**
 * POST /api/companies/preview
 * Gera pré-relatório SEM persistir no banco
 * Retorna dados da ReceitaWS + Google CSE + OpenAI (opcional)
 */
export async function POST(req: Request) {
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

    // 1. Buscar dados da ReceitaWS
    console.log('[API /preview] 📊 Buscando ReceitaWS...')
    const receitaData = await fetchReceitaWS(resolvedCnpj)

    // 2. Buscar presença digital completa (website + redes sociais + marketplaces)
    console.log('[API /preview] 🔍 Buscando presença digital completa...')
    const digitalPresence = await fetchDigitalPresence(
      receitaData.nome || '',
      resolvedCnpj,
      receitaData.fantasia
    )

    // 2b. Buscar notícias (mantém busca separada para controle)
    console.log('[API /preview] 📰 Buscando notícias...')
    const googleData = await fetchGoogleCSE(
      receitaData.nome || receitaData.fantasia || resolvedCnpj,
      resolvedCnpj
    )

    // 3. Análise OpenAI (opcional)
    let aiAnalysis = null
    if (useAI) {
      console.log('[API /preview] 🧠 Gerando análise preliminar...')
      aiAnalysis = await analyzeWithOpenAI({
        company: receitaData,
        website: googleData.website?.url || null,
        news: googleData.news,
      })
    }

    console.log('[API /preview] ✅ Preview gerado com sucesso')

    // Normalizar dados da Receita
    const preview = {
      mode: 'preview',
      receita: {
        // Identificação
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
        // Endereço
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
        // Situação
        situacao: {
          status: receitaData.situacao,
          data: receitaData.data_situacao,
          motivo: receitaData.motivo_situacao,
        },
        // Capital
        capital: {
          valor: receitaData.capital_social,
        },
        // Atividades
        atividades: {
          principal: receitaData.atividade_principal,
          secundarias: receitaData.atividades_secundarias,
        },
        // Quadro societário
        qsa: receitaData.qsa || [],
        // Simples/MEI
        simples: {
          optante: receitaData.simples?.optante,
          dataOpcao: receitaData.simples?.data_opcao,
          dataExclusao: receitaData.simples?.data_exclusao,
        },
        mei: {
          optante: receitaData.simples?.ultimo_evento === 'Mei',
        },
      },
      // Website e notícias
      // Presença Digital Completa (NOVO!)
      presencaDigital: {
        website: digitalPresence.website,
        redesSociais: digitalPresence.redesSociais,
        marketplaces: digitalPresence.marketplaces,
        outrosLinks: digitalPresence.outrosLinks,
        noticias: googleData.news.slice(0, 3),
      },
      // Mantém enrichment para compatibilidade
      enrichment: {
        website: digitalPresence.website || googleData.website,
        news: googleData.news.slice(0, 3),
      },
      // IA (opcional)
      ai: aiAnalysis ? {
        score: aiAnalysis.score,
        summary: aiAnalysis.insights.slice(0, 2).join(' '), // 2 frases de resumo
        insights: aiAnalysis.insights,
        redFlags: aiAnalysis.redFlags,
      } : null,
    }

    return NextResponse.json({
      status: 'success',
      data: preview,
    })
  } catch (error: any) {
    console.error('[API /preview] ❌ Erro:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro interno ao gerar preview',
      },
      { status: 500 }
    )
  }
}

