import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { fetchReceitaWS } from '@/lib/services/receita-ws'
import { fetchGoogleCSE, resolveCnpjFromWebsite } from '@/lib/services/google-cse'
import { analyzeWithOpenAI } from '@/lib/services/openai-analysis'

export async function POST(req: Request) {
  try {
    // Extrair parâmetros do body ou query string
    const body = await req.json().catch(() => ({}))
    const url = new URL(req.url)
    const params = Object.fromEntries(url.searchParams)
    
    const { cnpj: rawCnpj, website: rawWebsite } = { ...params, ...body }

    console.log('[API /companies/search] 📥 Request:', { cnpj: rawCnpj, website: rawWebsite })

    let resolvedCnpj = normalizeCnpj(rawCnpj)

    // Se não tem CNPJ mas tem website, tentar resolver
    if (!resolvedCnpj && rawWebsite) {
      const domain = normalizeDomain(rawWebsite)
      console.log('[API] 🔍 Tentando resolver CNPJ do domínio:', domain)
      
      resolvedCnpj = await resolveCnpjFromWebsite(domain) || ''
      
      if (!resolvedCnpj) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Não foi possível identificar o CNPJ a partir do website fornecido',
            hint: 'Tente fornecer o CNPJ diretamente (14 dígitos)'
          },
          { status: 400 }
        )
      }
    }

    // Validar CNPJ
    if (!isValidCnpj(resolvedCnpj)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'CNPJ inválido. Forneça um CNPJ com 14 dígitos ou um website válido.',
          code: 'INVALID_CNPJ'
        },
        { status: 422 }
      )
    }

    console.log('[API] ✅ CNPJ validado:', resolvedCnpj)

    // Pipeline de enriquecimento
    console.log('[API] 📊 Iniciando pipeline de enriquecimento...')

    // 1. ReceitaWS
    const receitaData = await fetchReceitaWS(resolvedCnpj)

    // 2. Google CSE (site + notícias)
    const googleData = await fetchGoogleCSE(receitaData.nome || receitaData.fantasia || resolvedCnpj)

    // 3. OpenAI (análise)
    const aiAnalysis = await analyzeWithOpenAI({
      company: receitaData,
      website: googleData.website,
      news: googleData.news
    })

    console.log('[API] 🧠 Análise concluída. Score:', aiAnalysis.score)

    // 4. Gravação no Supabase
    console.log('[API] 💾 Gravando no Supabase...')

    // Parse capital (string → number) com fallback 0
    const capitalNum = Number(
      (receitaData.capital_social || '0')
        .toString()
        .replace(/[^\d,.-]/g, '')
        .replace('.', '')
        .replace(',', '.')
    )
    const nowIso = new Date().toISOString()

    // Upsert Company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .upsert({
        id: crypto.randomUUID(), // Gerar ID explícito
        projectId: 'default-project', // ID padrão para projeto
        cnpj: resolvedCnpj,
        name: receitaData.nome || 'Empresa sem razão social',
        tradeName: receitaData.fantasia ?? null,
        status: receitaData.situacao ?? null,
        openingDate: receitaData.abertura ? new Date(receitaData.abertura.split('/').reverse().join('-')).toISOString() : null,
        capital: Number.isFinite(capitalNum) ? capitalNum : 0,
        // PATCH: garantir que o banco receba valores e não quebre com NOT NULL
        createdAt: nowIso,
        updatedAt: nowIso,
      }, {
        onConflict: 'cnpj'
      })
      .select()
      .single()

    if (companyError) {
      console.error('[API] ❌ Erro ao gravar Company:', companyError)
      throw new Error(`Falha ao gravar empresa: ${companyError.message}`)
    }

    console.log('[API] ✅ Company gravada:', company.id)

    // Insert Analysis
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('Analysis')
      .insert({
        companyId: company.id,
        score: aiAnalysis.score,
        insights: aiAnalysis.insights,
        redFlags: aiAnalysis.redFlags,
      })
      .select()
      .single()

    if (analysisError) {
      console.error('[API] ❌ Erro ao gravar Analysis:', analysisError)
      // Continuar mesmo se falhar a análise
    } else {
      console.log('[API] ✅ Analysis gravada:', analysis?.id)
    }

    // Resposta final
    return NextResponse.json({
      status: 'success',
      message: 'Empresa analisada e gravada com sucesso',
      data: {
        company,
        analysis,
        enrichment: {
          website: googleData.website,
          news: googleData.news,
          justification: aiAnalysis.justification,
        }
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[API /companies/search] ❌ Erro:', error.message)

    const status = error.message?.includes('ReceitaWS') ? 502 :
                   error.message?.includes('não encontrado') ? 404 :
                   error.message?.includes('inválido') ? 422 :
                   500

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro inesperado ao processar empresa',
        code: error.code || 'INTERNAL_ERROR'
      },
      { status }
    )
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cnpj = url.searchParams.get('cnpj')
  const website = url.searchParams.get('website')

  if (!cnpj && !website) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Forneça um parâmetro "cnpj" ou "website"',
        example: '/api/companies/search?cnpj=00000000000191'
      },
      { status: 400 }
    )
  }

  // Redirecionar para POST
  return POST(req)
}
