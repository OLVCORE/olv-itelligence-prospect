// Sistema de IA para geração de relatórios e insights
export interface AIInsight {
  type: "opportunity" | "risk" | "recommendation" | "analysis"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  category: string
}

export interface AIReportData {
  companyData: any
  techStack: any[]
  decisionMakers: any[]
  financialData: any
  maturityScore: number
  propensityScore: number
}

class AIReportGenerator {
  private apiKey: string | null = null

  constructor() {
    // Em produção, usar variável de ambiente
    this.apiKey = process.env.OPENAI_API_KEY || null
  }

  async generateExecutiveInsights(data: AIReportData): Promise<AIInsight[]> {
    if (!this.apiKey) {
      // Fallback para insights simulados se não houver API key
      return this.generateMockInsights(data)
    }

    try {
      const prompt = this.buildExecutivePrompt(data)
      const response = await this.callOpenAI(prompt)
      return this.parseAIResponse(response)
    } catch (error) {
      console.error("Erro na IA:", error)
      return this.generateMockInsights(data)
    }
  }

  async generateTechnicalAnalysis(data: AIReportData): Promise<AIInsight[]> {
    if (!this.apiKey) {
      return this.generateMockTechnicalInsights(data)
    }

    try {
      const prompt = this.buildTechnicalPrompt(data)
      const response = await this.callOpenAI(prompt)
      return this.parseAIResponse(response)
    } catch (error) {
      console.error("Erro na IA:", error)
      return this.generateMockTechnicalInsights(data)
    }
  }

  async generateStrategicRecommendations(data: AIReportData): Promise<AIInsight[]> {
    if (!this.apiKey) {
      return this.generateMockStrategicInsights(data)
    }

    try {
      const prompt = this.buildStrategicPrompt(data)
      const response = await this.callOpenAI(prompt)
      return this.parseAIResponse(response)
    } catch (error) {
      console.error("Erro na IA:", error)
      return this.generateMockStrategicInsights(data)
    }
  }

  private buildExecutivePrompt(data: AIReportData): string {
    return `
Analise a empresa ${data.companyData.fantasia} e gere insights executivos estratégicos.

DADOS DA EMPRESA:
- Nome: ${data.companyData.fantasia}
- CNPJ: ${data.companyData.cnpj}
- Porte: ${data.companyData.porte}
- Capital Social: ${data.companyData.capitalSocial}
- Localização: ${data.companyData.cidade}/${data.companyData.uf}

STACK TECNOLÓGICO:
${data.techStack.map(tech => `- ${tech.product} (${tech.vendor}) - Confiança: ${tech.confidence}%`).join('\n')}

DECISORES IDENTIFICADOS:
${data.decisionMakers.map(dm => `- ${dm.name} (${dm.title}) - ${dm.department}`).join('\n')}

MÉTRICAS:
- Maturidade Digital: ${data.maturityScore}%
- Propensão de Compra: ${data.propensityScore}%

Gere insights estratégicos focando em:
1. Oportunidades de negócio identificadas
2. Riscos potenciais
3. Recomendações de abordagem
4. Análise de mercado e posicionamento

Formato de resposta: JSON com array de insights contendo type, title, description, confidence, impact e category.
    `
  }

  private buildTechnicalPrompt(data: AIReportData): string {
    return `
Analise tecnicamente o stack tecnológico da empresa ${data.companyData.fantasia}.

STACK ATUAL:
${data.techStack.map(tech => `- ${tech.product} (${tech.vendor}) - Categoria: ${tech.category}`).join('\n')}

Gere análise técnica focando em:
1. Gaps tecnológicos identificados
2. Oportunidades de modernização
3. Integrações possíveis
4. Roadmap técnico sugerido
5. Análise de segurança e compliance

Formato de resposta: JSON com array de insights técnicos.
    `
  }

  private buildStrategicPrompt(data: AIReportData): string {
    return `
Desenvolva estratégia de prospecção para ${data.companyData.fantasia}.

PERFIL DA EMPRESA:
- Porte: ${data.companyData.porte}
- Capital: ${data.companyData.capitalSocial}
- Maturidade: ${data.maturityScore}%

DECISORES-CHAVE:
${data.decisionMakers.map(dm => `- ${dm.name} (${dm.title}) - ${dm.department}`).join('\n')}

Gere estratégia focando em:
1. Abordagem personalizada por decisor
2. Timeline de prospecção
3. Argumentos de venda específicos
4. Objeções potenciais e respostas
5. KPIs de acompanhamento

Formato de resposta: JSON com array de insights estratégicos.
    `
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise empresarial e prospecção B2B. Gere insights estratégicos baseados em dados reais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private parseAIResponse(response: string): AIInsight[] {
    try {
      // Tentar parsear JSON
      const parsed = JSON.parse(response)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      // Se não conseguir parsear, criar insight genérico
      return [{
        type: "analysis",
        title: "Análise Gerada por IA",
        description: response.substring(0, 200) + "...",
        confidence: 85,
        impact: "medium",
        category: "AI Generated"
      }]
    }
  }

  // Insights simulados para quando não há API key
  private generateMockInsights(data: AIReportData): AIInsight[] {
    return [
      {
        type: "opportunity",
        title: "Alta Maturidade Digital",
        description: `A empresa ${data.companyData.fantasia} apresenta maturidade digital de ${data.maturityScore}%, indicando alta sofisticação tecnológica e potencial para soluções avançadas.`,
        confidence: 92,
        impact: "high",
        category: "Digital Maturity"
      },
      {
        type: "recommendation",
        title: "Estratégia de Abordagem Personalizada",
        description: `Identificados ${data.decisionMakers.length} decisores-chave. Recomenda-se abordagem multi-canal com foco em ${data.decisionMakers[0]?.title || 'decisores técnicos'}.`,
        confidence: 88,
        impact: "high",
        category: "Sales Strategy"
      },
      {
        type: "analysis",
        title: "Stack Tecnológico Robusto",
        description: `Empresa utiliza ${data.techStack.length} tecnologias confirmadas, incluindo soluções enterprise como SAP e Salesforce, indicando capacidade de investimento significativa.`,
        confidence: 95,
        impact: "medium",
        category: "Technology"
      },
      {
        type: "opportunity",
        title: "Integração com Soluções TOTVS",
        description: `Identificadas oportunidades de integração entre o stack atual e soluções TOTVS, especialmente em áreas de ERP e automação de processos.`,
        confidence: 85,
        impact: "high",
        category: "Integration"
      }
    ]
  }

  private generateMockTechnicalInsights(data: AIReportData): AIInsight[] {
    return [
      {
        type: "analysis",
        title: "Análise de Infraestrutura",
        description: "Stack tecnológico bem estruturado com presença de soluções enterprise e cloud computing.",
        confidence: 90,
        impact: "medium",
        category: "Infrastructure"
      },
      {
        type: "recommendation",
        title: "Modernização de Sistemas",
        description: "Identificados sistemas legados que podem ser modernizados com soluções TOTVS.",
        confidence: 82,
        impact: "high",
        category: "Modernization"
      }
    ]
  }

  private generateMockStrategicInsights(data: AIReportData): AIInsight[] {
    return [
      {
        type: "recommendation",
        title: "Abordagem Multi-Canal",
        description: "Estratégia de prospecção deve incluir email, LinkedIn e telefone para maximizar engajamento.",
        confidence: 87,
        impact: "high",
        category: "Outreach"
      },
      {
        type: "analysis",
        title: "Timeline de Prospecção",
        description: "Ciclo de vendas estimado em 45-60 dias baseado no porte e maturidade da empresa.",
        confidence: 80,
        impact: "medium",
        category: "Timeline"
      }
    ]
  }
}

export const aiReportGenerator = new AIReportGenerator()
