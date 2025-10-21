import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { apolloPeopleSearch } from '@/lib/integrations/apollo'
import { hunterVerify } from '@/lib/integrations/hunter'

export const runtime = 'nodejs'
export const maxDuration = 15 // Apollo + Hunter: 15s

const schema = z.object({
  companyId: z.string().min(1, "companyId é obrigatório")
})

/**
 * POST /api/intelligence/decision-makers
 * Busca decisores via Apollo e verifica e-mails com Hunter
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { companyId } = validation.data
    const sb = supabaseAdmin()

    console.log('[DecisionMakers] 👥 Buscando decisores:', companyId)

    // Buscar dados da empresa
    const { data: company, error: companyError } = await sb
      .from('Company')
      .select('domain, name, tradeName')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'COMPANY_NOT_FOUND',
          message: 'Empresa não encontrada'
        }
      }, { status: 404 })
    }

    if (!company.domain) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'NO_DOMAIN',
          message: 'Empresa sem domínio cadastrado. Execute a busca completa primeiro.'
        }
      }, { status: 422 })
    }

    const people: any[] = []

    // 1️⃣ Buscar pessoas no Apollo
    try {
      console.log('[DecisionMakers] 🔍 Buscando no Apollo:', company.domain)
      
      const apolloResults = await apolloPeopleSearch({
        q_organization_domains: [company.domain.replace(/^https?:\/\//, '')],
        page: 1
      })

      const contacts = apolloResults?.people || apolloResults?.contacts || []
      console.log('[DecisionMakers] ✅ Contatos encontrados:', contacts.length)

      for (const person of contacts) {
        const name = person.name || [person.first_name, person.last_name].filter(Boolean).join(' ')
        const email = person.email ?? (person.email_status === 'verified' ? person.email : null)
        
        people.push({
          name,
          role: person.title || null,
          department: person.department || null,
          email,
          linkedinUrl: person.linkedin_url || null,
          verified: false
        })
      }

    } catch (apolloError: any) {
      console.error('[DecisionMakers] ⚠️ Apollo falhou:', apolloError.message)
      // Continuar sem Apollo
    }

    // 2️⃣ Verificar e-mails com Hunter (opcional)
    const verifiedCount = 0
    // Desabilitado por enquanto para economizar quota
    // for (const person of people) {
    //   if (person.email) {
    //     try {
    //       const hunterResult = await hunterVerify(person.email)
    //       if (hunterResult?.data?.result === 'deliverable') {
    //         person.verified = true
    //         verifiedCount++
    //       }
    //     } catch (e) {
    //       // Ignorar erros do Hunter
    //     }
    //   }
    // }

    // 3️⃣ Salvar no banco
    const now = new Date().toISOString()
    let savedCount = 0
    
    for (const person of people) {
      try {
        const personId = `person_${companyId}_${person.name.replace(/\s+/g, '_').toLowerCase()}`
        
        await sb.from('Person').upsert({
          id: personId,
          companyId,
          name: person.name,
          role: person.role,
          department: person.department,
          email: person.email,
          linkedinUrl: person.linkedinUrl,
          updatedAt: now
        }, { onConflict: 'id' })

        savedCount++
      } catch (insertError: any) {
        console.error('[DecisionMakers] ⚠️ Erro ao salvar pessoa:', insertError.message)
      }
    }

    const latency = Date.now() - startTime
    console.log(`[DecisionMakers] ✅ Análise completa em ${latency}ms - ${savedCount} pessoas salvas`)

    return NextResponse.json({
      ok: true,
      data: {
        people,
        summary: {
          found: people.length,
          saved: savedCount,
          verified: verifiedCount
        },
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[DecisionMakers] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

