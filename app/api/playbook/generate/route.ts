import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * POST /api/playbook/generate
 * Gera playbook personalizado baseado em persona + vendor
 * 
 * Estrutura do Playbook:
 * 1. Opening (abertura curta, máx 280 chars)
 * 2. Value Prop (proposta de valor baseada em dores)
 * 3. Case Link (case relevante ao setor)
 * 4. CTA (call to action claro)
 * 5. Products TOTVS (fit automático)
 * 6. Packages OLV (consultoria)
 */
export async function POST(req: NextRequest) {
  try {
    const { personId, vendor = 'TOTVS' } = await req.json()

    if (!personId) {
      return NextResponse.json(
        { error: 'personId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`[Playbook Generate] 💬 Gerando playbook para pessoa ${personId} (vendor: ${vendor})`)

    // 1. Carregar pessoa + persona
    const { data: person, error: personErr } = await supabaseAdmin
      .from('Person')
      .select('*, personaFeatures:PersonaFeatures(*)')
      .eq('id', personId)
      .single()

    if (personErr || !person) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      )
    }

    const persona = person.personaFeatures

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona não encontrado. Execute /api/persona/analyze primeiro.' },
        { status: 400 }
      )
    }

    console.log(`[Playbook Generate] 📊 Persona carregado:`, {
      topics: persona.topics,
      dores: persona.dores,
      tone: persona.tone
    })

    // 2. Gerar playbook baseado em vendor
    const playbook = this.generatePlaybook(person, persona, vendor)

    // 3. Salvar no banco
    const { data: savedPlaybook, error: playbookErr } = await supabaseAdmin
      .from('Playbook')
      .upsert({
        personId,
        vendor,
        opening: playbook.opening,
        valueProp: playbook.valueProp,
        caseLink: playbook.caseLink,
        cta: playbook.cta,
        productsTotvs: playbook.productsTotvs,
        packagesOlv: playbook.packagesOlv,
        lastRefreshedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'personId,vendor'
      })
      .select()
      .single()

    if (playbookErr) {
      console.error('[Playbook Generate] ❌ Erro ao salvar playbook:', playbookErr)
      return NextResponse.json(
        { error: 'Falha ao salvar playbook' },
        { status: 500 }
      )
    }

    console.log(`[Playbook Generate] ✅ Playbook gerado e salvo`)

    return NextResponse.json({
      success: true,
      playbook: savedPlaybook
    })

  } catch (error) {
    console.error('[Playbook Generate] ❌ Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }

  /**
   * Gerar playbook personalizado
   */
  private generatePlaybook(person: any, persona: any, vendor: string): any {
    const name = person.name.split(' ')[0] // Primeiro nome
    const topics = persona.topics || []
    const dores = persona.dores || []
    const gatilhos = persona.gatilhos || []
    const tone = persona.tone || 'balanceado'

    // Opening personalizado
    let opening = ''
    if (topics.includes('ERP')) {
      opening = `${name}, vi que você tem interesse em ERP e transformação digital. `
    } else if (topics.includes('Supply Chain')) {
      opening = `${name}, notei seu foco em otimização de supply chain. `
    } else {
      opening = `${name}, identificamos oportunidades de otimização na sua operação. `
    }

    // Value Prop baseado em dores
    let valueProp = ''
    if (dores.includes('manual') || dores.includes('repetitivo')) {
      valueProp = 'Reduzimos processos manuais em até 70% com automação inteligente.'
    } else if (dores.includes('integração')) {
      valueProp = 'Integramos sistemas legados em dias, não meses.'
    } else {
      valueProp = 'Aumentamos produtividade em 40% com soluções comprovadas.'
    }

    // CTA baseado em tom
    let cta = ''
    if (tone === 'otimista') {
      cta = 'Vale 15 minutos para eu te mostrar cases de sucesso?'
    } else if (tone === 'crítico') {
      cta = 'Posso te enviar um diagnóstico gratuito da sua operação?'
    } else {
      cta = 'Que tal uma demo personalizada sem compromisso?'
    }

    // FIT TOTVS automático
    let productsTotvs: string[] = []
    if (vendor === 'TOTVS') {
      if (topics.includes('ERP')) {
        productsTotvs.push('TOTVS Protheus (Backoffice)')
      }
      if (topics.includes('Manufatura')) {
        productsTotvs.push('TOTVS MES (Manufacturing)')
      }
      if (topics.includes('Supply Chain')) {
        productsTotvs.push('TOTVS WMS (Warehouse)')
      }
      if (topics.includes('RH')) {
        productsTotvs.push('TOTVS RH (Recursos Humanos)')
      }
      if (productsTotvs.length === 0) {
        productsTotvs.push('TOTVS Backoffice (Gestão Integrada)')
      }
    }

    // Pacotes OLV
    const packagesOlv: string[] = []
    if (vendor === 'OLV' || vendor === 'TOTVS') {
      packagesOlv.push('Diagnóstico 360° + Roadmap de Implantação')
      
      if (dores.includes('integração')) {
        packagesOlv.push('Consultoria de Integração Express')
      }
      if (topics.includes('Cloud')) {
        packagesOlv.push('Migração Cloud Assistida')
      }
    }

    return {
      opening,
      valueProp,
      caseLink: 'https://olv.com.br/cases', // TODO: Link dinâmico por setor
      cta,
      productsTotvs,
      packagesOlv
    }
  }
}

