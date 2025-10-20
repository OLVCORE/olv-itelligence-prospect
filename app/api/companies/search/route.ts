import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getDefaultProjectId } from '@/lib/projects/get-default-project'
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

    // 2. Google CSE (site + notícias) - passar CNPJ para busca mais específica
    const googleData = await fetchGoogleCSE(
      receitaData.nome || receitaData.fantasia || resolvedCnpj,
      resolvedCnpj
    )

    // 3. OpenAI (análise)
    const aiAnalysis = await analyzeWithOpenAI({
      company: receitaData,
      website: googleData.website?.url || null,
      news: googleData.news
    })

    console.log('[API] 🧠 Análise concluída. Score:', aiAnalysis.score)

    // 4. Gravação no Supabase
    console.log('[API] 💾 Gravando no Supabase...')

    // Obter ou criar projeto padrão (resolve FK obrigatória)
    let projectId: string
    try {
      projectId = await getDefaultProjectId()
      console.log('[API] ✅ ProjectId obtido:', projectId)
    } catch (error: any) {
      console.error('[API] ❌ Erro ao obter ProjectId:', error)
      // Fallback: usar ID fixo para não quebrar o sistema
      projectId = 'default-project-id'
      console.log('[API] ⚠️ Usando ProjectId fallback:', projectId)
    }

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
        projectId, // FK obrigatória - usa projeto padrão
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
      
      // Mensagem de erro específica para FK
      if (companyError.message?.includes('foreign key constraint')) {
        throw new Error(
          `Falha ao gravar empresa: ${companyError.message}. ` +
          `Dica: Defina DEFAULT_PROJECT_ID no .env com um ID de Project existente, ` +
          `ou deixe o sistema criar um automaticamente.`
        )
      }
      
      throw new Error(`Falha ao gravar empresa: ${companyError.message}`)
    }

    console.log('[API] ✅ Company gravada:', company.id)

    // Insert Analysis com breakdown completo
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('Analysis')
      .insert({
        companyId: company.id,
        score: aiAnalysis.score, // Score híbrido
        // Salvar insights como objeto completo com breakdown
        insights: JSON.stringify({
          insights: aiAnalysis.insights,
          scoreIA: aiAnalysis.scoreIA,
          scoreRegras: aiAnalysis.scoreRegras,
          breakdown: aiAnalysis.breakdown,
          classificacao: aiAnalysis.classificacao,
          justification: aiAnalysis.justification,
        }),
        redFlags: JSON.stringify(aiAnalysis.redFlags),
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
