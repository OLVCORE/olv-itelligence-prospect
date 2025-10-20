interface PropensityFeatures {
  icpScore: number
  icpTier: 'A' | 'B' | 'C'
  vertical: string
  maturityScore: number
  techStackScore: number
  digitalPresenceScore: number
  recentSignals: number // número de sinais recentes
  signalIntensity: 'low' | 'medium' | 'high'
  companyAge: number // anos desde fundação
  capitalGrowth: number // crescimento do capital nos últimos anos
  newsSentiment: 'positive' | 'neutral' | 'negative'
  hiringActivity: number // número de vagas recentes
  websiteChanges: number // mudanças no site recentes
}

interface PropensityResult {
  score: number
  timeframe: number // dias para conversão
  confidence: number
  features: PropensityFeatures
  rationale: string[]
  nextActions: string[]
}

interface OfferConfig {
  name: string
  verticals: string[]
  minICPScore: number
  idealTimeframe: number
  weightFactors: {
    icpScore: number
    maturityScore: number
    techStackScore: number
    digitalPresenceScore: number
    recentSignals: number
    signalIntensity: number
    companyAge: number
    capitalGrowth: number
    newsSentiment: number
    hiringActivity: number
    websiteChanges: number
  }
}

export class PropensityScorer {
  private readonly offers: OfferConfig[] = [
    {
      name: 'TOTVS_Protheus',
      verticals: ['Manufatura', 'Distribuição'],
      minICPScore: 70,
      idealTimeframe: 60,
      weightFactors: {
        icpScore: 0.25,
        maturityScore: 0.20,
        techStackScore: 0.15,
        digitalPresenceScore: 0.10,
        recentSignals: 0.15,
        signalIntensity: 0.10,
        companyAge: 0.05,
        capitalGrowth: 0.10,
        newsSentiment: 0.05,
        hiringActivity: 0.10,
        websiteChanges: 0.05
      }
    },
    {
      name: 'TOTVS_Fluig',
      verticals: ['Serviços', 'Manufatura'],
      minICPScore: 60,
      idealTimeframe: 45,
      weightFactors: {
        icpScore: 0.20,
        maturityScore: 0.25,
        techStackScore: 0.10,
        digitalPresenceScore: 0.15,
        recentSignals: 0.10,
        signalIntensity: 0.10,
        companyAge: 0.05,
        capitalGrowth: 0.05,
        newsSentiment: 0.05,
        hiringActivity: 0.15,
        websiteChanges: 0.10
      }
    },
    {
      name: 'TOTVS_Manufatura',
      verticals: ['Manufatura'],
      minICPScore: 80,
      idealTimeframe: 90,
      weightFactors: {
        icpScore: 0.30,
        maturityScore: 0.15,
        techStackScore: 0.20,
        digitalPresenceScore: 0.05,
        recentSignals: 0.10,
        signalIntensity: 0.10,
        companyAge: 0.05,
        capitalGrowth: 0.15,
        newsSentiment: 0.05,
        hiringActivity: 0.05,
        websiteChanges: 0.05
      }
    },
    {
      name: 'OLV_Consultoria',
      verticals: ['Manufatura', 'Distribuição', 'Varejo', 'Serviços'],
      minICPScore: 50,
      idealTimeframe: 30,
      weightFactors: {
        icpScore: 0.15,
        maturityScore: 0.20,
        techStackScore: 0.10,
        digitalPresenceScore: 0.20,
        recentSignals: 0.15,
        signalIntensity: 0.10,
        companyAge: 0.05,
        capitalGrowth: 0.05,
        newsSentiment: 0.10,
        hiringActivity: 0.10,
        websiteChanges: 0.10
      }
    }
  ]

  calculatePropensity(features: PropensityFeatures, offer: string): PropensityResult {
    console.log('[Propensity Scorer] 🔍 Calculando propensão para:', offer, features)

    const offerConfig = this.offers.find(o => o.name === offer)
    if (!offerConfig) {
      throw new Error(`Oferta não encontrada: ${offer}`)
    }

    // Verificar se a empresa está no vertical ideal
    if (!offerConfig.verticals.includes(features.vertical)) {
      return {
        score: 0,
        timeframe: offerConfig.idealTimeframe,
        confidence: 0,
        features,
        rationale: [`Empresa não está no vertical ideal para ${offer}`],
        nextActions: ['Considerar outras ofertas mais adequadas']
      }
    }

    // Verificar ICP mínimo
    if (features.icpScore < offerConfig.minICPScore) {
      return {
        score: Math.round(features.icpScore * 0.5), // Score reduzido
        timeframe: offerConfig.idealTimeframe * 1.5, // Timeframe estendido
        confidence: 30,
        features,
        rationale: [`ICP score abaixo do mínimo (${offerConfig.minICPScore})`],
        nextActions: ['Melhorar qualificação da empresa antes de abordar']
      }
    }

    // Calcular score ponderado
    const weights = offerConfig.weightFactors
    let score = 0

    // ICP Score (25% peso)
    score += weights.icpScore * features.icpScore

    // Maturity Score (20% peso)
    score += weights.maturityScore * features.maturityScore

    // Tech Stack Score (15% peso)
    score += weights.techStackScore * features.techStackScore

    // Digital Presence Score (10% peso)
    score += weights.digitalPresenceScore * features.digitalPresenceScore

    // Recent Signals (15% peso)
    const signalScore = Math.min(100, features.recentSignals * 20)
    score += weights.recentSignals * signalScore

    // Signal Intensity (10% peso)
    const intensityScore = features.signalIntensity === 'high' ? 100 : 
                          features.signalIntensity === 'medium' ? 70 : 40
    score += weights.signalIntensity * intensityScore

    // Company Age (5% peso)
    const ageScore = features.companyAge > 5 ? 100 : 
                     features.companyAge > 2 ? 70 : 40
    score += weights.companyAge * ageScore

    // Capital Growth (10% peso)
    const growthScore = features.capitalGrowth > 0.2 ? 100 :
                        features.capitalGrowth > 0 ? 70 : 30
    score += weights.capitalGrowth * growthScore

    // News Sentiment (5% peso)
    const sentimentScore = features.newsSentiment === 'positive' ? 100 :
                           features.newsSentiment === 'neutral' ? 60 : 20
    score += weights.newsSentiment * sentimentScore

    // Hiring Activity (10% peso)
    const hiringScore = features.hiringActivity > 5 ? 100 :
                        features.hiringActivity > 2 ? 70 : 40
    score += weights.hiringActivity * hiringScore

    // Website Changes (5% peso)
    const changesScore = features.websiteChanges > 3 ? 100 :
                         features.websiteChanges > 1 ? 70 : 40
    score += weights.websiteChanges * changesScore

    const finalScore = Math.round(Math.min(100, Math.max(0, score)))
    const confidence = this.calculateConfidence(features, offerConfig)
    const timeframe = this.calculateTimeframe(finalScore, offerConfig.idealTimeframe)
    const rationale = this.generateRationale(features, offerConfig, finalScore)
    const nextActions = this.generateNextActions(finalScore, features)

    console.log('[Propensity Scorer] ✅ Score calculado:', finalScore)

    return {
      score: finalScore,
      timeframe,
      confidence,
      features,
      rationale,
      nextActions
    }
  }

  private calculateConfidence(features: PropensityFeatures, offerConfig: OfferConfig): number {
    let confidence = 50 // Base confidence

    // Aumentar confiança com mais dados
    if (features.recentSignals > 3) confidence += 20
    if (features.maturityScore > 70) confidence += 15
    if (features.icpScore > 80) confidence += 15

    // Diminuir confiança com dados inconsistentes
    if (features.newsSentiment === 'negative') confidence -= 10
    if (features.capitalGrowth < 0) confidence -= 15

    return Math.min(100, Math.max(0, confidence))
  }

  private calculateTimeframe(score: number, idealTimeframe: number): number {
    // Empresas com score alto têm timeframe menor
    if (score >= 80) return Math.round(idealTimeframe * 0.7)
    if (score >= 60) return idealTimeframe
    if (score >= 40) return Math.round(idealTimeframe * 1.3)
    return Math.round(idealTimeframe * 1.8)
  }

  private generateRationale(features: PropensityFeatures, offerConfig: OfferConfig, score: number): string[] {
    const rationale: string[] = []

    // ICP
    if (features.icpScore >= offerConfig.minICPScore) {
      rationale.push(`ICP score alto (${features.icpScore}) - empresa ideal`)
    } else {
      rationale.push(`ICP score baixo (${features.icpScore}) - qualificação questionável`)
    }

    // Maturidade
    if (features.maturityScore >= 70) {
      rationale.push(`Maturidade digital alta (${features.maturityScore}%)`)
    } else if (features.maturityScore >= 50) {
      rationale.push(`Maturidade digital média (${features.maturityScore}%)`)
    } else {
      rationale.push(`Maturidade digital baixa (${features.maturityScore}%)`)
    }

    // Sinais recentes
    if (features.recentSignals > 3) {
      rationale.push(`Muitos sinais de atividade recente (${features.recentSignals})`)
    } else if (features.recentSignals > 0) {
      rationale.push(`Alguns sinais de atividade (${features.recentSignals})`)
    } else {
      rationale.push('Poucos sinais de atividade recente')
    }

    // Intensidade dos sinais
    if (features.signalIntensity === 'high') {
      rationale.push('Sinais de alta intensidade detectados')
    } else if (features.signalIntensity === 'medium') {
      rationale.push('Sinais de intensidade média')
    } else {
      rationale.push('Sinais de baixa intensidade')
    }

    // Crescimento
    if (features.capitalGrowth > 0.2) {
      rationale.push('Crescimento acelerado do capital social')
    } else if (features.capitalGrowth > 0) {
      rationale.push('Crescimento moderado do capital social')
    } else {
      rationale.push('Sem crescimento ou redução do capital social')
    }

    return rationale
  }

  private generateNextActions(score: number, features: PropensityFeatures): string[] {
    const actions: string[] = []

    if (score >= 80) {
      actions.push('Abordagem imediata - alta probabilidade de conversão')
      actions.push('Enviar proposta comercial personalizada')
      actions.push('Agendar reunião executiva')
    } else if (score >= 60) {
      actions.push('Abordagem em 1-2 semanas')
      actions.push('Enviar conteúdo educativo relevante')
      actions.push('Iniciar processo de nurturing')
    } else if (score >= 40) {
      actions.push('Abordagem em 1 mês')
      actions.push('Focar em educação e awareness')
      actions.push('Coletar mais informações sobre a empresa')
    } else {
      actions.push('Não abordar no momento')
      actions.push('Monitorar sinais futuros')
      actions.push('Considerar outras ofertas mais adequadas')
    }

    return actions
  }

  // Método para obter configurações de ofertas
  getOfferConfigs(): OfferConfig[] {
    return this.offers
  }

  // Método para calcular propensão para múltiplas ofertas
  calculateMultiplePropensities(features: PropensityFeatures): Record<string, PropensityResult> {
    const results: Record<string, PropensityResult> = {}

    for (const offer of this.offers) {
      try {
        results[offer.name] = this.calculatePropensity(features, offer.name)
      } catch (error) {
        console.error(`Erro ao calcular propensão para ${offer.name}:`, error)
      }
    }

    return results
  }
}

export const propensityScorer = new PropensityScorer()
