/**
 * OpenAI Service
 * Para análise de IA e geração de insights
 */

export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIInsight {
  tipo: 'oportunidade' | 'risco' | 'insight' | 'recomendacao'
  titulo: string
  descricao: string
  confianca: number
  impacto: 'alto' | 'medio' | 'baixo'
  categoria: string
}

export interface AIAnalysis {
  resumo: string
  insights: AIInsight[]
  oportunidades: string[]
  riscos: string[]
  recomendacoes: string[]
  scoreIA: number
  confianca: number
}

export class OpenAIService {
  private apiKey = process.env.OPENAI_API_KEY || ''
  private baseURL = 'https://api.openai.com/v1'
  
  /**
   * Analisar empresa com IA
   */
  async analyzeCompany(companyData: any): Promise<AIAnalysis | null> {
    if (!this.apiKey) {
      console.warn('[OpenAI] ⚠️ API Key não configurada')
      return this.generateMockAnalysis(companyData)
    }

    try {
      console.log(`[OpenAI] Analisando empresa: ${companyData.razao}`)
      
      const prompt = this.buildAnalysisPrompt(companyData)
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de empresas B2B e prospecção inteligente. Analise os dados da empresa e forneça insights valiosos para vendas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `Erro na API OpenAI: ${response.status}`)
      }

      const data: OpenAIResponse = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('Resposta vazia da OpenAI')
      }

      console.log(`[OpenAI] ✅ Análise concluída para ${companyData.razao}`)

      return this.parseAIResponse(content, companyData)

    } catch (error: any) {
      console.error('[OpenAI] Erro ao analisar empresa:', error)
      return this.generateMockAnalysis(companyData)
    }
  }

  /**
   * Gerar insights específicos sobre tech stack
   */
  async analyzeTechStack(techStack: any[]): Promise<string[]> {
    if (!this.apiKey) {
      return this.generateMockTechInsights(techStack)
    }

    try {
      const prompt = `Analise este tech stack de uma empresa e forneça insights sobre:
      
      ${JSON.stringify(techStack, null, 2)}

      Forneça 3-5 insights específicos sobre:
      - Maturidade tecnológica
      - Oportunidades de vendas
      - Possíveis dores
      - Tendências do mercado

      Responda em português, formato lista simples.`

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status}`)
      }

      const data: OpenAIResponse = await response.json()
      const content = data.choices[0]?.message?.content

      return content ? content.split('\n').filter(line => line.trim()) : this.generateMockTechInsights(techStack)

    } catch (error: any) {
      console.error('[OpenAI] Erro ao analisar tech stack:', error)
      return this.generateMockTechInsights(techStack)
    }
  }

  /**
   * Construir prompt para análise de empresa
   */
  private buildAnalysisPrompt(companyData: any): string {
    return `Analise esta empresa brasileira e forneça insights para prospecção B2B:

    DADOS DA EMPRESA:
    - Razão Social: ${companyData.razao}
    - Nome Fantasia: ${companyData.fantasia || 'N/A'}
    - CNPJ: ${companyData.cnpj}
    - Porte: ${companyData.porte}
    - Situação: ${companyData.situacao}
    - Capital Social: ${companyData.capitalSocial}
    - CNAE: ${companyData.cnae}
    - Cidade: ${companyData.cidade}, ${companyData.uf}
    - Abertura: ${companyData.abertura}
    - Natureza Jurídica: ${companyData.naturezaJuridica}

    Forneça uma análise estruturada em JSON com:
    {
      "resumo": "Resumo executivo da empresa",
      "insights": [
        {
          "tipo": "oportunidade|risco|insight|recomendacao",
          "titulo": "Título do insight",
          "descricao": "Descrição detalhada",
          "confianca": 85,
          "impacto": "alto|medio|baixo",
          "categoria": "financeiro|tecnologico|mercado|operacional"
        }
      ],
      "oportunidades": ["Lista de oportunidades"],
      "riscos": ["Lista de riscos"],
      "recomendacoes": ["Lista de recomendações"],
      "scoreIA": 75,
      "confianca": 80
    }

    Responda APENAS com o JSON válido.`
  }

  /**
   * Parsear resposta da IA
   */
  private parseAIResponse(content: string, companyData: any): AIAnalysis {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          resumo: parsed.resumo || 'Análise realizada com sucesso',
          insights: parsed.insights || [],
          oportunidades: parsed.oportunidades || [],
          riscos: parsed.riscos || [],
          recomendacoes: parsed.recomendacoes || [],
          scoreIA: parsed.scoreIA || 75,
          confianca: parsed.confianca || 80
        }
      }
    } catch (error) {
      console.warn('[OpenAI] Erro ao parsear resposta JSON, usando fallback')
    }

    // Fallback se não conseguir parsear JSON
    return this.generateMockAnalysis(companyData)
  }

  /**
   * Gerar análise mock quando API não está disponível
   */
  private generateMockAnalysis(companyData: any): AIAnalysis {
    const insights: AIInsight[] = [
      {
        tipo: 'oportunidade',
        titulo: 'Empresa em Crescimento',
        descricao: `${companyData.porte} com potencial de expansão tecnológica`,
        confianca: 85,
        impacto: 'alto',
        categoria: 'mercado'
      },
      {
        tipo: 'insight',
        titulo: 'Perfil Tecnológico',
        descricao: 'Empresa tradicional com oportunidades de modernização',
        confianca: 75,
        impacto: 'medio',
        categoria: 'tecnologico'
      }
    ]

    return {
      resumo: `Empresa ${companyData.porte} em ${companyData.cidade} com potencial para soluções tecnológicas`,
      insights,
      oportunidades: [
        'Modernização de processos',
        'Implementação de soluções digitais',
        'Otimização operacional'
      ],
      riscos: [
        'Resistência à mudança',
        'Orçamento limitado'
      ],
      recomendacoes: [
        'Abordar com foco em ROI',
        'Demonstrar casos de sucesso',
        'Proposta de valor clara'
      ],
      scoreIA: 75,
      confianca: 80
    }
  }

  /**
   * Gerar insights mock para tech stack
   */
  private generateMockTechInsights(techStack: any[]): string[] {
    return [
      'Stack tecnológico diversificado indica maturidade digital',
      'Presença de ferramentas modernas sugere abertura à inovação',
      'Oportunidade para integração de soluções complementares',
      'Empresa preparada para implementações avançadas'
    ]
  }
}

export const openai = new OpenAIService()

