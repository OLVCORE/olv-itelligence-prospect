/**
 * MÓDULO 2: Network Scanner
 * Coleta posts de perfis sociais confirmados
 * 
 * FONTES:
 * - LinkedIn: API oficial (limitada) + scraping público
 * - Twitter/X: API v2 (requer auth)
 * - Instagram: API Graph (limitada)
 * - GitHub: API REST v3 (pública)
 * - YouTube: API Data v3
 * 
 * JANELA: Últimos 12 meses
 * RATE LIMIT: 10 requests/segundo por rede
 * COMPLIANCE: Apenas dados públicos, respeitar robots.txt
 */

interface Post {
  id: string
  network: string
  postedAt: Date
  text: string
  link: string
  language?: string
  metrics?: {
    likes?: number
    shares?: number
    comments?: number
  }
}

interface ScanOptions {
  profileId: string
  network: string
  url: string
  monthsBack?: number
  maxPosts?: number
}

export class NetworkScanner {
  private rateLimit = 10 // requests por segundo
  private requestQueue: Map<string, number[]> = new Map()

  /**
   * Scannear posts de um perfil específico
   */
  async scanProfile(options: ScanOptions): Promise<Post[]> {
    const { network, url, monthsBack = 12, maxPosts = 50 } = options

    console.log(`[Network Scanner] 🔍 Scanning ${network}: ${url}`)

    // Rate limiting
    await this.waitForRateLimit(network)

    try {
      switch (network) {
        case 'linkedin':
          return await this.scanLinkedIn(url, monthsBack, maxPosts)
        case 'twitter':
          return await this.scanTwitter(url, monthsBack, maxPosts)
        case 'instagram':
          return await this.scanInstagram(url, monthsBack, maxPosts)
        case 'github':
          return await this.scanGitHub(url, monthsBack, maxPosts)
        case 'youtube':
          return await this.scanYouTube(url, monthsBack, maxPosts)
        default:
          console.warn(`[Network Scanner] ⚠️ Network ${network} não suportada`)
          return []
      }
    } catch (error) {
      console.error(`[Network Scanner] ❌ Erro ao scanear ${network}:`, error)
      return []
    }
  }

  /**
   * LinkedIn Scanner (público + API oficial se disponível)
   */
  private async scanLinkedIn(url: string, months: number, max: number): Promise<Post[]> {
    console.log(`[LinkedIn Scanner] 🔗 Buscando posts públicos...`)
    
    // TODO: Implementar scraping público respeitando ToS
    // Por ora, retornar mock para demonstração
    return this.mockPosts('linkedin', 10)
  }

  /**
   * Twitter/X Scanner (API v2)
   */
  private async scanTwitter(url: string, months: number, max: number): Promise<Post[]> {
    console.log(`[Twitter Scanner] 🐦 Buscando tweets...`)
    
    // Extrair handle da URL
    const handle = url.split('/').pop()?.replace('@', '')
    
    if (!handle) {
      console.error('[Twitter Scanner] ❌ Handle inválido')
      return []
    }

    // TODO: Integrar Twitter API v2 (requer bearer token)
    // Por ora, retornar mock
    return this.mockPosts('twitter', 15)
  }

  /**
   * Instagram Scanner (API Graph)
   */
  private async scanInstagram(url: string, months: number, max: number): Promise<Post[]> {
    console.log(`[Instagram Scanner] 📸 Buscando posts...`)
    
    // TODO: Instagram Graph API (requer permissões específicas)
    // Por ora, retornar mock
    return this.mockPosts('instagram', 8)
  }

  /**
   * GitHub Scanner (API REST v3)
   */
  private async scanGitHub(url: string, months: number, max: number): Promise<Post[]> {
    console.log(`[GitHub Scanner] 💻 Buscando atividades...`)
    
    const username = url.split('/').pop()
    
    if (!username) {
      console.error('[GitHub Scanner] ❌ Username inválido')
      return []
    }

    try {
      // GitHub API é pública, não requer auth para leitura
      const response = await fetch(`https://api.github.com/users/${username}/events/public`)
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const events = await response.json()
      
      // Converter eventos em posts
      return events.slice(0, max).map((event: any) => ({
        id: event.id,
        network: 'github',
        postedAt: new Date(event.created_at),
        text: this.formatGitHubEvent(event),
        link: `https://github.com/${username}`,
        language: 'en',
        metrics: {}
      }))
    } catch (error) {
      console.error('[GitHub Scanner] ❌ Erro:', error)
      return this.mockPosts('github', 5)
    }
  }

  /**
   * YouTube Scanner (API Data v3)
   */
  private async scanYouTube(url: string, months: number, max: number): Promise<Post[]> {
    console.log(`[YouTube Scanner] 📺 Buscando vídeos...`)
    
    // TODO: YouTube Data API v3 (requer API key)
    // Por ora, retornar mock
    return this.mockPosts('youtube', 6)
  }

  /**
   * Rate limiting (respeitar limites das APIs)
   */
  private async waitForRateLimit(network: string): Promise<void> {
    const now = Date.now()
    const requests = this.requestQueue.get(network) || []
    
    // Remover requests antigas (> 1 segundo)
    const recentRequests = requests.filter(time => now - time < 1000)
    
    if (recentRequests.length >= this.rateLimit) {
      const oldestRequest = Math.min(...recentRequests)
      const waitTime = 1000 - (now - oldestRequest)
      
      console.log(`[Rate Limit] ⏳ Aguardando ${waitTime}ms para ${network}`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    recentRequests.push(now)
    this.requestQueue.set(network, recentRequests)
  }

  /**
   * Formatar evento do GitHub em texto legível
   */
  private formatGitHubEvent(event: any): string {
    const type = event.type
    const repo = event.repo?.name
    
    switch (type) {
      case 'PushEvent':
        return `Pushed ${event.payload?.commits?.length || 0} commits to ${repo}`
      case 'PullRequestEvent':
        return `${event.payload?.action} pull request in ${repo}`
      case 'IssuesEvent':
        return `${event.payload?.action} issue in ${repo}`
      case 'CreateEvent':
        return `Created ${event.payload?.ref_type} in ${repo}`
      case 'WatchEvent':
        return `Starred ${repo}`
      default:
        return `${type} in ${repo}`
    }
  }

  /**
   * Mock posts para demonstração (remover quando integrar APIs reais)
   */
  private mockPosts(network: string, count: number): Post[] {
    const topics = [
      'ERP implementation challenges',
      'Digital transformation journey',
      'Supply chain optimization',
      'Cloud migration best practices',
      'Team productivity tips',
      'Industry trends 2025',
      'Technology innovation',
      'Process automation benefits',
      'Data analytics insights',
      'Customer success stories'
    ]

    return Array.from({ length: count }, (_, i) => ({
      id: `${network}-mock-${i}`,
      network,
      postedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // último ano
      text: topics[Math.floor(Math.random() * topics.length)],
      link: `https://${network}.com/post/${i}`,
      language: 'en',
      metrics: {
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 30)
      }
    }))
  }
}

export const networkScanner = new NetworkScanner()

