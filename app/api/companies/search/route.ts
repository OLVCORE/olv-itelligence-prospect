import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseBRLToNumber, normalizeCnpj } from '@/lib/utils/format'

export const runtime = 'nodejs'
export const maxDuration = 15

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE)

const RECEITA_TOKEN = process.env.RECEITAWS_API_TOKEN
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
const SERPER_API_KEY = process.env.SERPER_API_KEY

async function fetchReceita(cnpj: string) {
  if (!RECEITA_TOKEN) {
    console.warn('[CompanySearch] RECEITAWS_API_TOKEN não configurado')
    return null
  }

  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${RECEITA_TOKEN}` },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  })
  
  if (!res.ok) throw new Error(`ReceitaWS HTTP ${res.status}`)
  
  const data = await res.json()
  if (data.status === 'ERROR') throw new Error(data.message || 'CNPJ não encontrado')
  
  return data
}

async function fetchGoogle(companyName: string, cnpj?: string) {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.warn('[CompanySearch] GOOGLE_API_KEY ou GOOGLE_CSE_ID não configurados')
    
    // Fallback: Serper
    if (SERPER_API_KEY) {
      return fetchSerper(companyName, cnpj)
    }
    
    return { items: [] }
  }

  const q = encodeURIComponent(`${companyName} ${cnpj ?? ''}`.trim())
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&num=8&q=${q}`
  
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' })
  if (!res.ok) return { items: [] }
  
  return res.json()
}

async function fetchSerper(companyName: string, cnpj?: string) {
  if (!SERPER_API_KEY) return { items: [] }

  const q = `${companyName} ${cnpj ?? ''}`.trim()
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q, num: 8 }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return { items: [] }
  
  const data = await res.json()
  
  // Converter formato Serper para formato Google CSE
  const items = (data.organic || []).map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }))

  return { items }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const raw = (body?.cnpj || body?.website || '').trim()
    
    if (!raw) {
      return NextResponse.json({
        ok: false,
        error: { message: 'Informe CNPJ ou Website' }
      }, { status: 422 })
    }

    const byCnpj = !!body?.cnpj
    const cnpj = byCnpj ? normalizeCnpj(body.cnpj) : null

    console.log('[CompanySearch] Buscando:', cnpj ? `CNPJ ${cnpj}` : `Website ${body.website}`)

    // Buscar ReceitaWS
    let receita = null
    if (cnpj) {
      try {
        receita = await fetchReceita(cnpj)
        console.log('[CompanySearch] ✅ ReceitaWS:', receita?.nome)
      } catch (e: any) {
        console.error('[CompanySearch] ❌ ReceitaWS falhou:', e.message)
      }
    }

    // Buscar Google CSE/Serper
    const google = await fetchGoogle(
      receita?.nome || body?.website || raw,
      cnpj || undefined
    )
    console.log('[CompanySearch] ✅ Presença digital:', google?.items?.length || 0, 'resultados')

    // Montar dados da empresa
    const companyInsert = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      cnpj: cnpj,
      name: receita?.nome ?? null,
      tradeName: receita?.fantasia ?? null,
      capital: parseBRLToNumber(receita?.capital_social),
      size: receita?.porte ?? null,
      status: receita?.situacao ?? 'DESCONHECIDO',
      domain: google?.items?.[0]?.link ?? body?.website ?? null,
      projectId: 'default-project-id',
      location: receita ? {
        cidade: receita.municipio,
        estado: receita.uf,
        endereco: receita.logradouro,
        numero: receita.numero,
        bairro: receita.bairro,
        cep: receita.cep,
      } : null,
      financial: receita ? {
        situacao: receita.situacao,
        abertura: receita.abertura,
        natureza: receita.natureza_juridica,
        capitalSocial: receita.capital_social,
      } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Upsert no Supabase
    const { data: upserted, error } = await supabaseAdmin
      .from('Company')
      .upsert(companyInsert, { onConflict: 'cnpj' })
      .select()
      .maybeSingle()

    if (error) {
      console.error('[CompanySearch] ❌ Erro ao salvar:', error)
      throw error
    }

    const savedId = upserted?.id ?? companyInsert.id

    // Salvar análise inicial
    try {
      await supabaseAdmin.from('Analysis').insert({
        companyId: savedId,
        projectId: 'default-project-id',
        insights: {
          website: google?.items?.[0]?.link ?? null,
          news: google?.items?.slice(0, 5) ?? [],
          scoreRegras: 0,
          scoreIA: 0,
          justificativa: 'Coleta inicial (ReceitaWS + Google CSE/Serper)',
        },
      })
    } catch (e) {
      console.warn('[CompanySearch] ⚠️ Erro ao salvar análise:', e)
    }

    console.log('[CompanySearch] ✅ Empresa salva:', savedId)

    return NextResponse.json({
      ok: true,
      data: {
        company: { ...(upserted ?? companyInsert) },
        google,
        receita,
      },
    })
  } catch (e: any) {
    console.error('[CompanySearch] ❌ Erro:', e.message)
    return NextResponse.json({
      ok: false,
      error: { message: e.message }
    }, { status: 500 })
  }
}
