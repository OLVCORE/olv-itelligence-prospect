/**
 * MÓDULO 4: Persona Extractor
 * Extrai vetor de persona de posts classificados
 * 
 * VETOR DE PERSONA (8 dimensões):
 * 1. topics[] - Tópicos de interesse
 * 2. objections[] - Objeções identificadas
 * 3. tone - Tom de comunicação
 * 4. activitySlots - Horários de atividade
 * 5. channelPref[] - Canais preferidos
 * 6. dores[] - Dores citadas
 * 7. gatilhos[] - Gatilhos de valor
 * 8. style - Estilo de comunicação
 */

interface Post {
  id: string
  network: string
  text: string
  postedAt: Date
}

interface Classification {
  topics: string[]
  intent: string
  sentiment: string
  style?: string
  confidence: number
}

interface PersonaVector {
  topics: string[]
  objections: string[]
  tone: string
  activitySlots: { day: string; hours: string[] }[]
  channelPref: string[]
  dores: string[]
  gatilhos: string[]
  style: string
  metadata: {
    totalPosts: number
    avgConfidence: number
    lastUpdated: string
  }
}

export class PersonaExtractor {
  private objectionKeywords = [
    'caro', 'expensive', 'custo', 'cost', 'preço', 'price',
    'difícil', 'difficult', 'complexo', 'complex',
    'tempo', 'time', 'demora', 'slow',
    'não funciona', 'not working', 'problema', 'issue'
  ]

  private doresKeywords = [
    'problema', 'problem', 'dificuldade', 'difficulty',
    'lento', 'slow', 'manual', 'repetitivo', 'repetitive',
    'erro', 'error', 'falha', 'failure',
    'integração', 'integration', 'legado', 'legacy'
  ]

  private gatilhosKeywords = [
    'roi', 'retorno', 'return', 'produtividade', 'productivity',
    'eficiência', 'efficiency', 'automatizar', 'automate',
    'economizar', 'save', 'reduzir', 'reduce',
    'crescimento', 'growth', 'escalabilidade', 'scalability'
  ]

  /**
   * Extrair vetor de persona de posts + classificações
   */
  extractPersona(
    posts: Post[],
    classifications: Map<string, Classification>
  ): PersonaVector {
    // 1. Agregar tópicos
    const topicCounts = new Map<string, number>()
    posts.forEach(post => {
      const classification = classifications.get(post.id)
      if (classification) {
        classification.topics.forEach(topic => {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
        })
      }
    })

    const topics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic)

    // 2. Detectar objeções
    const objections = this.extractKeywords(posts, this.objectionKeywords)

    // 3. Tom de comunicação (baseado em sentimento)
    const sentiments = Array.from(classifications.values()).map(c => c.sentiment)
    const tone = this.determineTone(sentiments)

    // 4. Horários de atividade
    const activitySlots = this.extractActivitySlots(posts)

    // 5. Canais preferidos (baseado em volume de posts)
    const channelCounts = new Map<string, number>()
    posts.forEach(post => {
      channelCounts.set(post.network, (channelCounts.get(post.network) || 0) + 1)
    })

    const channelPref = Array.from(channelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([channel]) => channel)

    // 6. Dores citadas
    const dores = this.extractKeywords(posts, this.doresKeywords)

    // 7. Gatilhos de valor
    const gatilhos = this.extractKeywords(posts, this.gatilhosKeywords)

    // 8. Estilo de comunicação (moda dos estilos)
    const styles = Array.from(classifications.values())
      .map(c => c.style)
      .filter(s => s !== undefined)
    const style = this.findMode(styles as string[]) || 'formal'

    // Metadata
    const avgConfidence = Array.from(classifications.values())
      .reduce((sum, c) => sum + c.confidence, 0) / classifications.size

    return {
      topics,
      objections,
      tone,
      activitySlots,
      channelPref,
      dores,
      gatilhos,
      style,
      metadata: {
        totalPosts: posts.length,
        avgConfidence,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * Extrair keywords relevantes dos posts
   */
  private extractKeywords(posts: Post[], keywords: string[]): string[] {
    const found = new Set<string>()

    posts.forEach(post => {
      const text = post.text.toLowerCase()
      keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          found.add(keyword)
        }
      })
    })

    return Array.from(found).slice(0, 5)
  }

  /**
   * Determinar tom baseado em sentimentos
   */
  private determineTone(sentiments: string[]): string {
    const counts = {
      positive: 0,
      neutral: 0,
      negative: 0
    }

    sentiments.forEach(s => {
      if (s in counts) {
        counts[s as keyof typeof counts]++
      }
    })

    if (counts.positive > counts.negative * 1.5) return 'otimista'
    if (counts.negative > counts.positive * 1.5) return 'crítico'
    if (counts.neutral > (counts.positive + counts.negative)) return 'neutro'
    return 'balanceado'
  }

  /**
   * Extrair slots de atividade (dia + hora)
   */
  private extractActivitySlots(posts: Post[]): { day: string; hours: string[] }[] {
    const dayHours = new Map<string, Set<string>>()

    posts.forEach(post => {
      const date = new Date(post.postedAt)
      const day = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()]
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`

      if (!dayHours.has(day)) {
        dayHours.set(day, new Set())
      }
      dayHours.get(day)!.add(hour)
    })

    return Array.from(dayHours.entries())
      .map(([day, hours]) => ({
        day,
        hours: Array.from(hours).sort()
      }))
      .slice(0, 3) // Top 3 dias mais ativos
  }

  /**
   * Encontrar moda (valor mais frequente)
   */
  private findMode(arr: string[]): string | null {
    if (arr.length === 0) return null

    const counts = new Map<string, number>()
    arr.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1)
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }
}

export const personaExtractor = new PersonaExtractor()

