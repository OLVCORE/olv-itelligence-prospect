/**
 * Hunter.io Service
 * Para busca de emails e contatos de empresas
 */

export interface HunterResponse {
  data: {
    domain: string
    disposable: boolean
    webmail: boolean
    pattern: string
    organization: string
    country: string
    emails: Array<{
      value: string
      type: string
      confidence: number
      sources: Array<{
        domain: string
        uri: string
        extracted_on: string
        last_seen_on: string
        still_on_page: boolean
      }>
    }>
    linkedin: string | null
    twitter: string | null
    facebook: string | null
    instagram: string | null
    youtube: string | null
    github: string | null
  }
  meta: {
    results: number
    limit: number
    offset: number
    params: {
      domain: string
      company: string
      type: string
    }
  }
}

export interface HunterFormattedData {
  domain: string
  organization: string
  country: string
  emails: Array<{
    email: string
    type: string
    confidence: number
    sources: number
  }>
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
    github?: string
  }
  totalEmails: number
  confidence: number
}

export class HunterService {
  private baseURL = 'https://api.hunter.io/v2'
  private apiKey = process.env.HUNTER_API_KEY || ''
  
  /**
   * Buscar emails de um domínio
   */
  async searchEmails(domain: string, company?: string): Promise<HunterFormattedData | null> {
    if (!this.apiKey) {
      console.warn('[Hunter.io] ⚠️ API Key não configurada')
      return null
    }

    try {
      console.log(`[Hunter.io] Buscando emails para: ${domain}`)
      
      const params = new URLSearchParams({
        domain,
        api_key: this.apiKey,
        limit: '50'
      })

      if (company) {
        params.append('company', company)
      }

      const response = await fetch(`${this.baseURL}/domain-search?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OLV-Intelligence-System/1.0'
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de consultas Hunter.io excedido. Aguarde.')
        }
        const errorData = await response.json()
        throw new Error(errorData.message || `Erro na API Hunter.io: ${response.status}`)
      }

      const data: HunterResponse = await response.json()

      if (!data.data || data.data.emails.length === 0) {
        console.log(`[Hunter.io] Nenhum email encontrado para ${domain}`)
        return null
      }

      console.log(`[Hunter.io] ✅ ${data.data.emails.length} emails encontrados para ${domain}`)

      return this.converterParaFormatoInterno(data)

    } catch (error: any) {
      console.error('[Hunter.io] Erro ao buscar emails:', error)
      throw error
    }
  }

  /**
   * Verificar se um email é válido
   */
  async verifyEmail(email: string): Promise<{
    email: string
    result: string
    score: number
    sources: number
  } | null> {
    if (!this.apiKey) {
      console.warn('[Hunter.io] ⚠️ API Key não configurada')
      return null
    }

    try {
      console.log(`[Hunter.io] Verificando email: ${email}`)
      
      const params = new URLSearchParams({
        email,
        api_key: this.apiKey
      })

      const response = await fetch(`${this.baseURL}/email-verifier?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OLV-Intelligence-System/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro na verificação Hunter.io: ${response.status}`)
      }

      const data = await response.json()

      return {
        email: data.data.email,
        result: data.data.result,
        score: data.data.score,
        sources: data.data.sources.length
      }

    } catch (error: any) {
      console.error('[Hunter.io] Erro ao verificar email:', error)
      return null
    }
  }

  /**
   * Converte dados do Hunter.io para formato interno
   */
  private converterParaFormatoInterno(data: HunterResponse): HunterFormattedData {
    const emails = data.data.emails.map(email => ({
      email: email.value,
      type: email.type,
      confidence: email.confidence,
      sources: email.sources.length
    }))

    const socialMedia: any = {}
    if (data.data.linkedin) socialMedia.linkedin = data.data.linkedin
    if (data.data.twitter) socialMedia.twitter = data.data.twitter
    if (data.data.facebook) socialMedia.facebook = data.data.facebook
    if (data.data.instagram) socialMedia.instagram = data.data.instagram
    if (data.data.youtube) socialMedia.youtube = data.data.youtube
    if (data.data.github) socialMedia.github = data.data.github

    // Calcular confiança média
    const avgConfidence = emails.length > 0 
      ? emails.reduce((sum, email) => sum + email.confidence, 0) / emails.length 
      : 0

    return {
      domain: data.data.domain,
      organization: data.data.organization,
      country: data.data.country,
      emails,
      socialMedia,
      totalEmails: emails.length,
      confidence: Math.round(avgConfidence)
    }
  }

  /**
   * Gerar insights baseados nos dados do Hunter.io
   */
  gerarInsights(data: HunterFormattedData): string[] {
    const insights: string[] = []

    insights.push(`${data.totalEmails} emails encontrados para ${data.domain}`)
    
    if (data.confidence > 80) {
      insights.push(`Alta confiança nos emails encontrados (${data.confidence}%)`)
    } else if (data.confidence > 60) {
      insights.push(`Confiança moderada nos emails (${data.confidence}%)`)
    } else {
      insights.push(`Confiança baixa nos emails (${data.confidence}%)`)
    }

    const emailTypes = [...new Set(data.emails.map(e => e.type))]
    insights.push(`Tipos de email encontrados: ${emailTypes.join(', ')}`)

    const socialCount = Object.keys(data.socialMedia).length
    if (socialCount > 0) {
      insights.push(`${socialCount} redes sociais identificadas`)
    }

    const highConfidenceEmails = data.emails.filter(e => e.confidence > 80)
    if (highConfidenceEmails.length > 0) {
      insights.push(`${highConfidenceEmails.length} emails com alta confiança (>80%)`)
    }

    return insights
  }
}

export const hunter = new HunterService()

