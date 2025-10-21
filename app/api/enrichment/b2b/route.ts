import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 15

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APOLLO = process.env.APOLLO_API_KEY
const HUNTER = process.env.HUNTER_API_KEY

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()
    
    const { data: c } = await supabase
      .from('Company')
      .select('id,name,tradeName,cnpj,domain')
      .eq('id', companyId)
      .single()

    if (!c) {
      return NextResponse.json({
        ok: false,
        error: { message: 'Empresa não encontrada' }
      }, { status: 404 })
    }

    let decisionMakers: any[] = []

    // Apollo integration (se configurado)
    if (APOLLO && c.domain) {
      try {
        console.log('[B2B] Chamando Apollo API...')
        // TODO: Implementar chamada real ao Apollo quando tiver plano ativo
        // const apolloRes = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        //   body: JSON.stringify({
        //     api_key: APOLLO,
        //     q_organization_domains: [c.domain.replace(/^https?:\/\//, '')],
        //     page: 1
        //   })
        // })
        // const apolloData = await apolloRes.json()
        // decisionMakers = apolloData.people || []
      } catch (e: any) {
        console.error('[B2B] Apollo falhou:', e.message)
      }
    }

    // Hunter integration (se configurado)
    if (HUNTER && decisionMakers.length > 0) {
      try {
        console.log('[B2B] Verificando emails com Hunter...')
        // TODO: Implementar verificação de emails quando necessário
      } catch (e: any) {
        console.error('[B2B] Hunter falhou:', e.message)
      }
    }

    // Salvar decisores no banco (se houver)
    if (decisionMakers.length > 0) {
      const rows = decisionMakers.map(dm => ({
        companyId,
        name: dm.name,
        role: dm.title,
        email: dm.email ?? null,
        linkedinUrl: dm.linkedin_url ?? null,
        department: dm.department ?? null,
        seniority: dm.seniority ?? null,
        verified_email: false,
        raw_data: dm,
      }))

      await supabase.from('Person').insert(rows)
    }

    return NextResponse.json({
      ok: true,
      stats: {
        decisionMakersFound: decisionMakers.length,
        contactsEnriched: decisionMakers.filter(d => !!d.email).length,
        buyingSignalsDetected: 0,
      },
      decisionMakers,
      buyingSignals: [],
    })
  } catch (e: any) {
    console.error('[B2B] Erro:', e.message)
    return NextResponse.json({
      ok: false,
      error: { message: e.message },
      decisionMakers: [],
      buyingSignals: []
    }, { status: 500 })
  }
}

