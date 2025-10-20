interface ICPFeatures {
  porte: string
  capital: number
  industry: string
  region: string
  techStack: string[]
  maturityScore: number
  digitalPresence: number
  employeeCount?: number
}

interface ICPProfile {
  vertical: string
  subVertical?: string
  tier: 'A' | 'B' | 'C'
  score: number
  features: ICPFeatures
  rationale: string[]
}

interface VerticalConfig {
  name: string
  subVerticals: string[]
  idealFeatures: {
    porte: string[]
    capitalRange: [number, number]
    techStack: string[]
    maturityMin: number
    digitalPresenceMin: number
  }
  weightFactors: {
    porte: number
    capital: number
    techStack: number
    maturity: number
    digitalPresence: number
  }
}

export class ICPClassifier {
  private readonly verticals: VerticalConfig[] = [
    {
      name: 'Manufatura',
      subVerticals: ['Automotivo', 'Alimentício', 'Químico', 'Têxtil', 'Metalúrgico'],
      idealFeatures: {
        porte: ['Grande', 'Médio'],
        capitalRange: [1000000, 100000000],
        techStack: ['SAP', 'Oracle', 'TOTVS', 'Protheus', 'Datasul'],
        maturityMin: 60,
        digitalPresenceMin: 50
      },
      weightFactors: {
        porte: 0.25,
        capital: 0.20,
        techStack: 0.30,
        maturity: 0.15,
        digitalPresence: 0.10
      }
    },
    {
      name: 'Distribuição',
      subVerticals: ['Atacado', 'Logística', 'Transporte', 'Armazenagem'],
      idealFeatures: {
        porte: ['Grande', 'Médio'],
        capitalRange: [500000, 50000000],
        techStack: ['SAP', 'TOTVS', 'Protheus', 'Datasul', 'WMS'],
        maturityMin: 55,
        digitalPresenceMin: 60
      },
      weightFactors: {
        porte: 0.20,
        capital: 0.25,
        techStack: 0.25,
        maturity: 0.15,
        digitalPresence: 0.15
      }
    },
    {
      name: 'Varejo',
      subVerticals: ['Supermercado', 'Farmácia', 'Eletrônicos', 'Moda', 'Casa e Decoração'],
      idealFeatures: {
        porte: ['Grande', 'Médio'],
        capitalRange: [200000, 20000000],
        techStack: ['TOTVS', 'Protheus', 'Datasul', 'PDV', 'E-commerce'],
        maturityMin: 50,
        digitalPresenceMin: 70
      },
      weightFactors: {
        porte: 0.15,
        capital: 0.20,
        techStack: 0.20,
        maturity: 0.20,
        digitalPresence: 0.25
      }
    },
    {
      name: 'Serviços',
      subVerticals: ['Consultoria', 'TI', 'Financeiro', 'Educação', 'Saúde'],
      idealFeatures: {
        porte: ['Médio', 'Pequeno'],
        capitalRange: [100000, 10000000],
        techStack: ['TOTVS', 'Fluig', 'CRM', 'BI', 'Cloud'],
        maturityMin: 65,
        digitalPresenceMin: 80
      },
      weightFactors: {
        porte: 0.10,
        capital: 0.15,
        techStack: 0.25,
        maturity: 0.25,
        digitalPresence: 0.25
      }
    }
  ]

  classifyICP(features: ICPFeatures): ICPProfile {
    console.log('[ICP Classifier] 🔍 Classificando empresa:', features)

    let bestMatch: ICPProfile | null = null
    let bestScore = 0

    // Calcular score para cada vertical
    for (const vertical of this.verticals) {
      const score = this.calculateVerticalScore(features, vertical)
      const subVertical = this.detectSubVertical(features, vertical)
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = {
          vertical: vertical.name,
          subVertical,
          tier: this.determineTier(score),
          score,
          features,
          rationale: this.generateRationale(features, vertical, score)
        }
      }
    }

    if (!bestMatch) {
      // Fallback para empresa não classificada
      bestMatch = {
        vertical: 'Outros',
        tier: 'C',
        score: 30,
        features,
        rationale: ['Empresa não se encaixa nos perfis ideais conhecidos']
      }
    }

    console.log('[ICP Classifier] ✅ Classificação:', bestMatch)
    return bestMatch
  }

  private calculateVerticalScore(features: ICPFeatures, vertical: VerticalConfig): number {
    let score = 0
    const weights = vertical.weightFactors
    const ideal = vertical.idealFeatures

    // Score por porte (25% peso)
    if (ideal.porte.includes(features.porte)) {
      score += weights.porte * 100
    } else {
      score += weights.porte * 50 // Score parcial
    }

    // Score por capital (20% peso)
    const [minCap, maxCap] = ideal.capitalRange
    if (features.capital >= minCap && features.capital <= maxCap) {
      score += weights.capital * 100
    } else if (features.capital >= minCap * 0.5 && features.capital <= maxCap * 2) {
      score += weights.capital * 70 // Score parcial
    } else {
      score += weights.capital * 30
    }

    // Score por tech stack (30% peso)
    const techMatches = features.techStack.filter(tech => 
      ideal.techStack.some(idealTech => 
        tech.toLowerCase().includes(idealTech.toLowerCase()) ||
        idealTech.toLowerCase().includes(tech.toLowerCase())
      )
    ).length

    const techScore = Math.min(100, (techMatches / ideal.techStack.length) * 100)
    score += weights.techStack * techScore

    // Score por maturidade (15% peso)
    if (features.maturityScore >= ideal.maturityMin) {
      score += weights.maturity * 100
    } else {
      const maturityRatio = features.maturityScore / ideal.maturityMin
      score += weights.maturity * Math.max(0, maturityRatio * 100)
    }

    // Score por presença digital (10% peso)
    if (features.digitalPresence >= ideal.digitalPresenceMin) {
      score += weights.digitalPresence * 100
    } else {
      const digitalRatio = features.digitalPresence / ideal.digitalPresenceMin
      score += weights.digitalPresence * Math.max(0, digitalRatio * 100)
    }

    return Math.round(score)
  }

  private detectSubVertical(features: ICPFeatures, vertical: VerticalConfig): string | undefined {
    // Lógica simples baseada em keywords no nome da empresa ou CNAE
    const companyName = features.industry?.toLowerCase() || ''
    
    for (const subVertical of vertical.subVerticals) {
      const keywords = this.getSubVerticalKeywords(subVertical)
      if (keywords.some(keyword => companyName.includes(keyword))) {
        return subVertical
      }
    }

    return undefined
  }

  private getSubVerticalKeywords(subVertical: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'Automotivo': ['auto', 'carro', 'veículo', 'montadora'],
      'Alimentício': ['alimento', 'comida', 'bebida', 'food'],
      'Químico': ['químico', 'química', 'petroquímico'],
      'Têxtil': ['têxtil', 'tecido', 'roupa', 'moda'],
      'Metalúrgico': ['metal', 'aço', 'ferro', 'mineração'],
      'Atacado': ['atacado', 'atacadista', 'distribuidor'],
      'Logística': ['logística', 'logistic', 'frete'],
      'Transporte': ['transporte', 'transportadora', 'frete'],
      'Supermercado': ['supermercado', 'super', 'hipermercado'],
      'Farmácia': ['farmácia', 'farmacêutico', 'drogaria'],
      'Eletrônicos': ['eletrônico', 'eletro', 'tecnologia'],
      'Consultoria': ['consultoria', 'consultor', 'advisory'],
      'TI': ['tecnologia', 'software', 'sistemas', 'ti'],
      'Financeiro': ['financeiro', 'banco', 'investimento'],
      'Educação': ['educação', 'escola', 'universidade', 'ensino'],
      'Saúde': ['saúde', 'hospital', 'médico', 'clínica']
    }

    return keywordMap[subVertical] || []
  }

  private determineTier(score: number): 'A' | 'B' | 'C' {
    if (score >= 80) return 'A'
    if (score >= 60) return 'B'
    return 'C'
  }

  private generateRationale(features: ICPFeatures, vertical: VerticalConfig, score: number): string[] {
    const rationale: string[] = []
    const weights = vertical.weightFactors
    const ideal = vertical.idealFeatures

    // Porte
    if (ideal.porte.includes(features.porte)) {
      rationale.push(`Porte ${features.porte} ideal para ${vertical.name}`)
    } else {
      rationale.push(`Porte ${features.porte} não é ideal para ${vertical.name}`)
    }

    // Capital
    const [minCap, maxCap] = ideal.capitalRange
    if (features.capital >= minCap && features.capital <= maxCap) {
      rationale.push(`Capital social adequado para ${vertical.name}`)
    } else {
      rationale.push(`Capital social fora do range ideal para ${vertical.name}`)
    }

    // Tech Stack
    const techMatches = features.techStack.filter(tech => 
      ideal.techStack.some(idealTech => 
        tech.toLowerCase().includes(idealTech.toLowerCase())
      )
    )

    if (techMatches.length > 0) {
      rationale.push(`Stack tecnológico compatível: ${techMatches.join(', ')}`)
    } else {
      rationale.push('Stack tecnológico não compatível com o vertical')
    }

    // Maturidade
    if (features.maturityScore >= ideal.maturityMin) {
      rationale.push(`Maturidade digital adequada (${features.maturityScore}%)`)
    } else {
      rationale.push(`Maturidade digital baixa (${features.maturityScore}%)`)
    }

    // Presença Digital
    if (features.digitalPresence >= ideal.digitalPresenceMin) {
      rationale.push(`Presença digital forte (${features.digitalPresence}%)`)
    } else {
      rationale.push(`Presença digital fraca (${features.digitalPresence}%)`)
    }

    return rationale
  }

  // Método para obter configurações de vertical (útil para UI)
  getVerticalConfigs(): VerticalConfig[] {
    return this.verticals
  }

  // Método para calcular score de uma empresa específica para uma oferta
  calculateOfferFit(icpProfile: ICPProfile, offer: string): number {
    const offerConfigs: Record<string, { verticals: string[], minScore: number }> = {
      'TOTVS_Protheus': {
        verticals: ['Manufatura', 'Distribuição'],
        minScore: 70
      },
      'TOTVS_Fluig': {
        verticals: ['Serviços', 'Manufatura'],
        minScore: 60
      },
      'TOTVS_Manufatura': {
        verticals: ['Manufatura'],
        minScore: 80
      },
      'OLV_Consultoria': {
        verticals: ['Manufatura', 'Distribuição', 'Varejo', 'Serviços'],
        minScore: 50
      }
    }

    const config = offerConfigs[offer]
    if (!config) return 0

    const verticalMatch = config.verticals.includes(icpProfile.vertical)
    if (!verticalMatch) return 0

    const scoreRatio = icpProfile.score / 100
    const fitScore = Math.min(100, (scoreRatio * 100) + (verticalMatch ? 20 : 0))

    return Math.round(fitScore)
  }
}

export const icpClassifier = new ICPClassifier()
