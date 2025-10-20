/**
 * CONTACT ENRICHMENT SERVICE
 * Enriquece contatos com email, telefone, WhatsApp
 * 
 * FONTES:
 * - Hunter.io (email finder) - $49-$399/mês
 * - Snov.io (email + phone) - $39-$189/mês
 * - RocketReach (email + phone + social) - $49-$249/mês
 * - Apollo.io (all-in-one B2B) - $49-$149/mês
 * - Clearbit (enrichment) - $99-$999/mês
 * 
 * RECOMENDAÇÃO: Apollo.io (melhor custo-benefício)
 */

interface ContactEnrichmentResult {
  email?: string
  emailConfidence?: number // 0-100%
  phone?: string
  phoneConfidence?: number
  whatsapp?: string
  mobilePhone?: string
  directPhone?: string
  source: string
  verifiedAt: Date
}

export class ContactEnrichmentService {
  private apolloApiKey?: string
  private hunterApiKey?: string
  private rocketReachApiKey?: string

  constructor() {
    this.apolloApiKey = process.env.APOLLO_API_KEY
    this.hunterApiKey = process.env.HUNTER_API_KEY
    this.rocketReachApiKey = process.env.ROCKETREACH_API_KEY
  }

  /**
   * Enriquecer contato com email + telefone
   */
  async enrichContact(person: {
    name: string
    company: string
    domain?: string
    linkedinUrl?: string
  }): Promise<ContactEnrichmentResult> {
    console.log(`[Contact Enrichment] 📧 Enriquecendo: ${person.name} @ ${person.company}`)

    // Tentar múltiplas fontes em cascata
    let result: ContactEnrichmentResult | null = null

    // 1. Tentar Apollo.io (recomendado)
    if (this.apolloApiKey) {
      result = await this.enrichViaApollo(person)
      if (result) return result
    }

    // 2. Tentar Hunter.io (email only)
    if (this.hunterApiKey) {
      result = await this.enrichViaHunter(person)
      if (result) return result
    }

    // 3. Tentar RocketReach
    if (this.rocketReachApiKey) {
      result = await this.enrichViaRocketReach(person)
      if (result) return result
    }

    // 4. Fallback: heurísticas de email
    console.log('[Contact Enrichment] ⚠️ Nenhuma API configurada, usando heurísticas')
    return this.enrichViaHeuristics(person)
  }

  /**
   * Apollo.io API (ALL-IN-ONE - Recomendado)
   */
  private async enrichViaApollo(person: any): Promise<ContactEnrichmentResult | null> {
    console.log('[Apollo.io] 🚀 Buscando contato...')

    try {
      const response = await fetch('https://api.apollo.io/v1/people/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apolloApiKey!
        },
        body: JSON.stringify({
          first_name: person.name.split(' ')[0],
          last_name: person.name.split(' ').slice(-1)[0],
          organization_name: person.company,
          domain: person.domain
        })
      })

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.person) {
        return {
          email: data.person.email,
          emailConfidence: data.person.email_confidence || 0,
          phone: data.person.phone_numbers?.[0]?.number,
          phoneConfidence: 70,
          mobilePhone: data.person.mobile_phone,
          directPhone: data.person.corporate_phone,
          source: 'apollo.io',
          verifiedAt: new Date()
        }
      }

      return null
    } catch (error) {
      console.error('[Apollo.io] ❌ Erro:', error)
      return null
    }
  }

  /**
   * Hunter.io API (EMAIL ONLY)
   */
  private async enrichViaHunter(person: any): Promise<ContactEnrichmentResult | null> {
    console.log('[Hunter.io] 🎯 Buscando email...')

    if (!person.domain) {
      console.log('[Hunter.io] ⚠️ Domain não fornecido, pulando')
      return null
    }

    try {
      const firstName = person.name.split(' ')[0]
      const lastName = person.name.split(' ').slice(-1)[0]

      const response = await fetch(
        `https://api.hunter.io/v2/email-finder?domain=${person.domain}&first_name=${firstName}&last_name=${lastName}&api_key=${this.hunterApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Hunter API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.data?.email) {
        return {
          email: data.data.email,
          emailConfidence: data.data.score || 0,
          source: 'hunter.io',
          verifiedAt: new Date()
        }
      }

      return null
    } catch (error) {
      console.error('[Hunter.io] ❌ Erro:', error)
      return null
    }
  }

  /**
   * RocketReach API (EMAIL + PHONE)
   */
  private async enrichViaRocketReach(person: any): Promise<ContactEnrichmentResult | null> {
    console.log('[RocketReach] 🚀 Buscando contato...')

    try {
      // TODO: Implementar RocketReach API
      // https://rocketreach.co/api
      return null
    } catch (error) {
      console.error('[RocketReach] ❌ Erro:', error)
      return null
    }
  }

  /**
   * Heurísticas de email (fallback, baixa confiança)
   */
  private enrichViaHeuristics(person: any): ContactEnrichmentResult {
    console.log('[Heuristics] 🔮 Gerando emails prováveis...')

    if (!person.domain) {
      return {
        source: 'heuristics',
        verifiedAt: new Date()
      }
    }

    const firstName = person.name.split(' ')[0].toLowerCase()
    const lastName = person.name.split(' ').slice(-1)[0].toLowerCase()
    const domain = person.domain.replace('www.', '')

    // Padrões comuns de email no Brasil
    const emailPatterns = [
      `${firstName}.${lastName}@${domain}`,
      `${firstName}@${domain}`,
      `${firstName[0]}${lastName}@${domain}`,
      `${firstName}_${lastName}@${domain}`
    ]

    return {
      email: emailPatterns[0], // Mais comum
      emailConfidence: 30, // Baixa (não verificado)
      source: 'heuristics',
      verifiedAt: new Date()
    }
  }

  /**
   * Validar email (verificar se existe)
   */
  async verifyEmail(email: string): Promise<boolean> {
    // TODO: Usar serviço de verificação (ZeroBounce, NeverBounce)
    // Por ora, apenas regex básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export const contactEnrichment = new ContactEnrichmentService()

