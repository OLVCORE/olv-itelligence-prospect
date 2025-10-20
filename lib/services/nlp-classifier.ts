/**
 * MÓDULO 3: NLP Classifier
 * Classifica posts em tópicos, intent, sentimento e estilo
 * 
 * ANÁLISES:
 * - Tópicos: ERP, supply chain, automação, cloud, etc
 * - Intent: inform, ask, complain, buying_signal
 * - Sentimento: positive, neutral, negative
 * - Estilo: formal, technical, direct, humor
 * 
 * COMPLIANCE: Não inferir atributos sensíveis (saúde, política, religião)
 */

interface ClassificationResult {
  topics: string[]
  intent: 'inform' | 'ask' | 'complain' | 'buying_signal' | 'other'
  sentiment: 'positive' | 'neutral' | 'negative'
  style?: 'formal' | 'technical' | 'direct' | 'humor'
  confidence: number
}

interface Post {
  id: string
  network: string
  text: string
  postedAt: Date
}

export class NLPClassifier {
  private topicKeywords = {
    'ERP': ['erp', 'sap', 'oracle', 'totvs', 'protheus', 'enterprise resource'],
    'Supply Chain': ['supply chain', 'logistics', 'inventory', 'warehouse', 'distribution'],
    'Automação': ['automation', 'automaç', 'rpa', 'workflow', 'process'],
    'Cloud': ['cloud', 'aws', 'azure', 'gcp', 'saas', 'paas'],
    'BI/Analytics': ['analytics', 'bi', 'power bi', 'tableau', 'data', 'insights'],
    'CRM': ['crm', 'salesforce', 'customer', 'vendas', 'sales'],
    'Manufatura': ['manufacturing', 'produção', 'chão de fábrica', 'mes', 'aps'],
    'Fiscal': ['fiscal', 'tax', 'nf-e', 'sped', 'compliance'],
    'Financeiro': ['financial', 'finanç', 'accounting', 'contabil', 'budget'],
    'RH': ['hr', 'rh', 'folha', 'payroll', 'recruitment', 'talent']
  }

  private intentKeywords = {
    'buying_signal': ['comprar', 'buy', 'contratar', 'hire', 'orçamento', 'quote', 'demo', 'trial'],
    'complain': ['problema', 'issue', 'bug', 'error', 'não funciona', 'not working', 'ruim', 'bad'],
    'ask': ['como', 'how', 'por que', 'why', 'alguém sabe', 'anyone know', '?'],
    'inform': ['hoje', 'today', 'anuncio', 'announce', 'compartilhar', 'share', 'novo', 'new']
  }

  private sentimentKeywords = {
    'positive': ['excelente', 'excellent', 'ótimo', 'great', 'adorei', 'love', 'sucesso', 'success', 'bom', 'good'],
    'negative': ['ruim', 'bad', 'péssimo', 'terrible', 'problema', 'problem', 'erro', 'error', 'difícil', 'difficult']
  }

  /**
   * Classificar um post
   */
  async classifyPost(post: Post): Promise<ClassificationResult> {
    const text = post.text.toLowerCase()

    return {
      topics: this.extractTopics(text),
      intent: this.detectIntent(text),
      sentiment: this.analyzeSentiment(text),
      style: this.detectStyle(text),
      confidence: this.calculateConfidence(text)
    }
  }

  /**
   * Classificar múltiplos posts
   */
  async classifyBatch(posts: Post[]): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>()

    for (const post of posts) {
      const classification = await this.classifyPost(post)
      results.set(post.id, classification)
    }

    return results
  }

  /**
   * Extrair tópicos do texto
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = []

    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()))
      if (matches.length > 0) {
        topics.push(topic)
      }
    }

    return topics.length > 0 ? topics : ['Geral']
  }

  /**
   * Detectar intenção do post
   */
  private detectIntent(text: string): ClassificationResult['intent'] {
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()))
      if (matches.length > 0) {
        return intent as ClassificationResult['intent']
      }
    }

    return 'other'
  }

  /**
   * Analisar sentimento
   */
  private analyzeSentiment(text: string): ClassificationResult['sentiment'] {
    let positiveScore = 0
    let negativeScore = 0

    for (const keyword of this.sentimentKeywords.positive) {
      if (text.includes(keyword.toLowerCase())) positiveScore++
    }

    for (const keyword of this.sentimentKeywords.negative) {
      if (text.includes(keyword.toLowerCase())) negativeScore++
    }

    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  /**
   * Detectar estilo de comunicação
   */
  private detectStyle(text: string): ClassificationResult['style'] {
    // Formal: usa termos corporativos, pontuação correta
    if (text.match(/\b(prezados|atenciosamente|cordialmente)\b/i)) {
      return 'formal'
    }

    // Technical: usa jargões técnicos
    if (text.match(/\b(api|database|sql|cloud|server|architecture)\b/i)) {
      return 'technical'
    }

    // Humor: usa emojis, pontuação exagerada
    if (text.match(/[😀😃😄😁😆😅😂🤣😊😇🙂😉]/)) {
      return 'humor'
    }

    // Direct: sentenças curtas, imperativo
    if (text.split('.').length <= 2 && text.length < 100) {
      return 'direct'
    }

    return 'formal'
  }

  /**
   * Calcular confidence da classificação
   */
  private calculateConfidence(text: string): number {
    // Confidence baseado em: tamanho do texto, keywords encontradas
    let confidence = 0.5 // base

    if (text.length > 50) confidence += 0.2 // texto substancial
    if (text.length > 150) confidence += 0.1 // texto detalhado

    // Pontuação por keywords encontradas
    const totalKeywords = [
      ...Object.values(this.topicKeywords).flat(),
      ...Object.values(this.intentKeywords).flat()
    ]

    const matches = totalKeywords.filter(k => text.includes(k.toLowerCase()))
    confidence += Math.min(matches.length * 0.05, 0.2)

    return Math.min(confidence, 1.0)
  }

  /**
   * Gerar summary de múltiplas classificações
   */
  generateSummary(classifications: ClassificationResult[]): {
    topTopics: { topic: string; count: number }[]
    dominantIntent: string
    overallSentiment: string
    avgConfidence: number
  } {
    // Contar tópicos
    const topicCounts = new Map<string, number>()
    classifications.forEach(c => {
      c.topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
      })
    })

    const topTopics = Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Intent dominante
    const intentCounts = new Map<string, number>()
    classifications.forEach(c => {
      intentCounts.set(c.intent, (intentCounts.get(c.intent) || 0) + 1)
    })

    const dominantIntent = Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'other'

    // Sentimento geral
    const sentimentScores = {
      positive: 0,
      neutral: 0,
      negative: 0
    }

    classifications.forEach(c => {
      sentimentScores[c.sentiment]++
    })

    const overallSentiment = Object.entries(sentimentScores)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'

    // Confidence média
    const avgConfidence = classifications.reduce((sum, c) => sum + c.confidence, 0) / classifications.length

    return {
      topTopics,
      dominantIntent,
      overallSentiment,
      avgConfidence
    }
  }
}

export const nlpClassifier = new NLPClassifier()

