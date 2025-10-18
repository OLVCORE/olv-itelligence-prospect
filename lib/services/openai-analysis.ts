/**
 * Serviço de análise com OpenAI
 */

import OpenAI from 'openai'

interface AnalysisInput {
  company: {
    nome?: string
    fantasia?: string
    situacao?: string
    abertura?: string
    capital_social?: string
    porte?: string
    atividade_principal?: Array<{ text: string }>
  }
  website: string | null
  news: Array<{
    title: string
    snippet: string
    date?: string | null
  }>
}

interface AnalysisOutput {
  score: number
  insights: string[]
  redFlags: string[]
  justification: string
}

export async function analyzeWithOpenAI(input: AnalysisInput): Promise<AnalysisOutput> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('[OpenAI] ⚠️ API Key não configurada, retornando análise básica')
    return generateBasicAnalysis(input)
  }

  try {
    console.log('[OpenAI] 🤖 Iniciando análise para:', input.company.nome || input.company.fantasia)

    const openai = new OpenAI({ apiKey })

    const prompt = `Você é um analista de risco empresarial especializado. Analise os dados abaixo e produza uma avaliação objetiva e prática.

**DADOS CADASTRAIS:**
- Razão Social: ${input.company.nome || 'N/D'}
- Nome Fantasia: ${input.company.fantasia || 'N/D'}
- Situação: ${input.company.situacao || 'N/D'}
- Data de Abertura: ${input.company.abertura || 'N/D'}
- Capital Social: ${input.company.capital_social || 'N/D'}
- Porte: ${input.company.porte || 'N/D'}
- Atividade: ${input.company.atividade_principal?.[0]?.text || 'N/D'}

**PRESENÇA DIGITAL:**
- Website oficial: ${input.website || 'Não encontrado'}

**NOTÍCIAS RECENTES:**
${input.news.length > 0 
  ? input.news.map((n, i) => `${i + 1}. ${n.title}\n   ${n.snippet}`).join('\n\n')
  : 'Nenhuma notícia encontrada'}

**TAREFA:**
Produza uma análise em JSON com:
1) "score": número de 0 a 100 (quanto maior, menor o risco)
2) "redFlags": array com 3 alertas de risco objetivos (se houver; senão, retorne menos)
3) "insights": array com 3 insights executivos práticos para prospecção comercial
4) "justification": string com 2 frases explicando o score

**FORMATO DE SAÍDA (JSON puro, sem markdown):**
{
  "score": 75,
  "redFlags": ["Exemplo de red flag 1", "Exemplo 2", "Exemplo 3"],
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "justification": "Empresa com X anos de mercado e Y de capital. Presença digital Z indica..."
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de risco empresarial. Responda SEMPRE em JSON puro, sem markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    console.log('[OpenAI] ✅ Análise concluída. Score:', result.score)

    return {
      score: result.score ?? 50,
      insights: Array.isArray(result.insights) ? result.insights : [],
      redFlags: Array.isArray(result.redFlags) ? result.redFlags : [],
      justification: result.justification || 'Análise gerada automaticamente'
    }
  } catch (error: any) {
    console.error('[OpenAI] ❌ Erro na análise:', error.message)
    return generateBasicAnalysis(input)
  }
}

function generateBasicAnalysis(input: AnalysisInput): AnalysisOutput {
  // Análise básica sem IA (fallback)
  let score = 50

  // Ajustar score baseado em dados básicos
  if (input.company.situacao === 'ATIVA') score += 20
  if (input.company.capital_social && parseFloat(input.company.capital_social.replace(/\D/g, '')) > 100000) score += 10
  if (input.website) score += 10
  if (input.news.length > 0) score += 10

  const redFlags: string[] = []
  if (input.company.situacao !== 'ATIVA') redFlags.push('Empresa não está ativa')
  if (!input.website) redFlags.push('Sem presença digital detectada')
  if (!input.company.capital_social) redFlags.push('Capital social não informado')

  const insights: string[] = [
    `Empresa ${input.company.situacao === 'ATIVA' ? 'ativa' : 'inativa'} desde ${input.company.abertura || 'data desconhecida'}`,
    `Presença digital: ${input.website ? 'Detectada' : 'Não encontrada'}`,
    `Notícias encontradas: ${input.news.length} nos últimos meses`
  ]

  return {
    score: Math.min(100, Math.max(0, score)),
    insights,
    redFlags,
    justification: 'Análise básica baseada em dados cadastrais (OpenAI não disponível)'
  }
}

