import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { salesNavigatorScraper } from '@/lib/services/sales-navigator-scraper'
import { contactEnrichment } from '@/lib/services/contact-enrichment'
import { vendorMatching } from '@/lib/services/vendor-matching'

export const runtime = 'nodejs'
export const maxDuration = 60 // Sales Navigator scraping + enrichment: 60s

/**
 * POST /api/company/intelligence
 * Company Intelligence B2B - Sales Navigator + Contact Enrichment
 * 
 * Pipeline:
 * 1. Search company no Sales Navigator
 * 2. Extract company profile + tech stack
 * 3. Find decision makers (filtrado por cargo)
 * 4. Enrich contacts (email, phone, whatsapp)
 * 5. Detect buying signals (vagas, expansão)
 * 6. Calculate vendor fit (TOTVS/OLV)
 * 7. Persist tudo no Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const { companyId, companyName, domain, cnpj } = await req.json()

    if (!companyId && !companyName) {
      return NextResponse.json(
        { error: 'companyId ou companyName é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`[Company Intelligence] 🏢 Iniciando análise B2B para: ${companyName}`)

    // 1. Search company no Sales Navigator
    console.log('[Company Intelligence] 🔍 Buscando no Sales Navigator...')
    const companies = await salesNavigatorScraper.searchCompany(companyName || '')
    
    if (companies.length === 0) {
      return NextResponse.json(
        { error: 'Empresa não encontrada no Sales Navigator' },
        { status: 404 }
      )
    }

    const companyProfile = companies[0]

    // 2. Extract perfil completo da empresa
    console.log('[Company Intelligence] 📊 Extraindo perfil completo...')
    const fullProfile = await salesNavigatorScraper.extractCompanyProfile(companyProfile.salesNavUrl)

    // 3. Find decision makers
    console.log('[Company Intelligence] 👥 Buscando decisores...')
    const decisionMakers = await salesNavigatorScraper.findDecisionMakers(
      companyProfile.salesNavUrl,
      {
        seniorities: ['C-Level', 'VP', 'Director'],
        departments: ['TI', 'Financeiro', 'Operações'],
        roles: ['CEO', 'CFO', 'CTO', 'Diretor de TI', 'COO']
      }
    )

    console.log(`[Company Intelligence] ✅ ${decisionMakers.length} decisores encontrados`)

    // 4. Enrich contacts
    console.log('[Company Intelligence] 📧 Enriquecendo contatos...')
    const enrichedDecisionMakers = []

    for (const dm of decisionMakers) {
      const contactInfo = await contactEnrichment.enrichContact({
        name: dm.name,
        company: companyName || fullProfile.name,
        domain: domain || fullProfile.website,
        linkedinUrl: dm.linkedinUrl
      })

      enrichedDecisionMakers.push({
        ...dm,
        email: contactInfo.email,
        phone: contactInfo.phone,
        whatsapp: contactInfo.whatsapp || contactInfo.mobilePhone,
        emailConfidence: contactInfo.emailConfidence,
        phoneConfidence: contactInfo.phoneConfidence
      })
    }

    // 5. Detect buying signals
    console.log('[Company Intelligence] 🎯 Detectando sinais de compra...')
    const buyingSignals = await salesNavigatorScraper.detectBuyingSignals(companyProfile.salesNavUrl)

    // 6. Calculate vendor fit
    console.log('[Company Intelligence] 🎯 Calculando vendor fit...')
    const totvsfit = vendorMatching.calculateTotvsfit({
      industry: fullProfile.industry,
      size: fullProfile.size,
      employeeCount: fullProfile.employeeCount,
      specialties: fullProfile.specialties,
      currentTechStack: fullProfile.techStack ? { erp: fullProfile.techStack[0] } : undefined,
      yearFounded: fullProfile.yearFounded
    })

    const olvFit = vendorMatching.calculateOlvFit({
      industry: fullProfile.industry,
      size: fullProfile.size,
      employeeCount: fullProfile.employeeCount,
      specialties: fullProfile.specialties,
      currentTechStack: fullProfile.techStack ? { erp: fullProfile.techStack[0] } : undefined,
      yearFounded: fullProfile.yearFounded
    })

    // 7. Persist no Supabase
    console.log('[Company Intelligence] 💾 Salvando no banco...')

    // Atualizar Company
    const { data: company, error: companyErr } = await supabaseAdmin
      .from('Company')
      .upsert({
        id: companyId,
        name: fullProfile.name,
        domain: fullProfile.website,
        cnpj,
        industry: fullProfile.industry,
        size: fullProfile.size,
        salesNavUrl: fullProfile.salesNavUrl,
        linkedinUrl: fullProfile.linkedinUrl,
        employeeCount: fullProfile.employeeCount,
        specialties: fullProfile.specialties,
        description: fullProfile.description,
        yearFounded: fullProfile.yearFounded,
        currentTechStack: JSON.stringify(fullProfile.techStack),
        buyingSignals: JSON.stringify(buyingSignals),
        lastEnrichment: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (companyErr) {
      console.error('[Company Intelligence] ❌ Erro ao salvar empresa:', companyErr)
    }

    // Salvar decisores
    const savedDecisionMakers = []
    for (const dm of enrichedDecisionMakers) {
      const { data: person, error: personErr } = await supabaseAdmin
        .from('Person')
        .upsert({
          companyId,
          name: dm.name,
          role: dm.role,
          seniority: dm.seniority,
          department: dm.department,
          email: dm.email,
          phone: dm.phone,
          whatsapp: dm.whatsapp,
          linkedinUrl: dm.linkedinUrl,
          salesNavUrl: dm.salesNavUrl,
          tenure: dm.tenure,
          skills: dm.skills,
          background: dm.background,
          lastJobChange: dm.lastJobChange,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'linkedinUrl'
        })
        .select()
        .single()

      if (!personErr && person) {
        savedDecisionMakers.push(person)
      }
    }

    // Salvar buying signals
    for (const signal of buyingSignals) {
      await supabaseAdmin
        .from('BuyingSignal')
        .insert({
          companyId,
          type: signal.type,
          description: signal.description,
          strength: signal.strength,
          source: signal.source,
          detectedAt: signal.detectedAt.toISOString(),
          metadata: JSON.stringify(signal.metadata)
        })
    }

    console.log('[Company Intelligence] ✅ Análise B2B completa!')

    return NextResponse.json({
      success: true,
      company: fullProfile,
      decisionMakers: enrichedDecisionMakers,
      buyingSignals,
      vendorFit: {
        totvs: totvsfit,
        olv: olvFit
      },
      stats: {
        decisionMakersFound: decisionMakers.length,
        contactsEnriched: enrichedDecisionMakers.filter(dm => dm.email).length,
        buyingSignalsDetected: buyingSignals.length
      }
    })

  } catch (error) {
    console.error('[Company Intelligence] ❌ Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

