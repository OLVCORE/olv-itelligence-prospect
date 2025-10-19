/**
 * Serviço de análise com OpenAI
 * Agora com scoring híbrido (IA + Engine de Regras)
 */

import OpenAI from 'openai'
import { calculatePropensityScore, type ScoringInput, type ScoringOutput } from '@/lib/scoring/scoring-engine'

interface AnalysisInput {
  company: {
    nome?: string
    fantasia?: string
    situacao?: string
    abertura?: string
    capital_social?: string
    porte?: string
    atividade_principal?: Array<{ text: string }>
    atividades_secundarias?: Array<{ text: string }>
    qsa?: Array<{ nome: string; qual: string }>
    simples?: { optante?: boolean }
  }
  website: string | null
  news: Array<{
    title: string
    snippet: string
    date?: string | null
  }>
  digitalPresence?: any // Presença digital completa
  vendorMatch?: any // Dados de vendor match para enriquecer análise
}

interface AnalysisOutput {
  score: number // Score híbrido final
  scoreIA: number // Score apenas da IA
  scoreRegras: number // Score do engine de regras
  breakdown: ScoringOutput['breakdown'] // Detalhamento por pilar
  insights: string[]
  redFlags: string[]
  justification: string
  classificacao: string
}

export async function analyzeWithOpenAI(input: AnalysisInput): Promise<AnalysisOutput> {
  const apiKey = process.env.OPENAI_API_KEY

  // SEMPRE calcular score baseado em regras (robusto e auditável)
  const scoringInput: ScoringInput = {
    situacao: input.company.situacao || 'DESCONHECIDA',
    abertura: input.company.abertura || '01/01/2000',
    capitalSocial: parseFloat((input.company.capital_social || '0').replace(/\D/g, '')) || 0,
    porte: input.company.porte || 'NÃO INFORMADO',
    simplesOptante: input.company.simples?.optante ?? false,
    meiOptante: false, // TODO: adicionar campo MEI
    temWebsite: !!input.website,
    temNoticias: input.news.length > 0,
    noticiasRecentes: input.news.filter(n => {
      if (!n.date) return false
      const newsDate = new Date(n.date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return newsDate >= threeMonthsAgo
    }).length,
    atividadePrincipal: input.company.atividade_principal?.[0]?.text || 'Não informado',
  }

  const scoringResult = calculatePropensityScore(scoringInput)

  if (!apiKey) {
    console.warn('[OpenAI] ⚠️ API Key não configurada, usando apenas score de regras')
    return {
      score: scoringResult.scoreTotal,
      scoreIA: 0,
      scoreRegras: scoringResult.scoreTotal,
      breakdown: scoringResult.breakdown,
      insights: generateBasicInsights(input),
      redFlags: generateBasicRedFlags(input),
      justification: scoringResult.justificativa,
      classificacao: scoringResult.classificacao,
    }
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
    const scoreIA = result.score ?? 50

    console.log('[OpenAI] ✅ Score IA:', scoreIA)
    console.log('[OpenAI] ✅ Score Regras:', scoringResult.scoreTotal)

    // Score híbrido: 70% IA + 30% Regras (balanceado e auditável)
    const scoreHibrido = Math.round((scoreIA * 0.7) + (scoringResult.scoreTotal * 0.3))

    console.log('[OpenAI] ✅ Score Híbrido Final:', scoreHibrido)

    // Adicionar score das regras ao breakdown para referência futura
    scoringInput.scoreIA = scoreIA
    const finalScoring = calculatePropensityScore(scoringInput)

    return {
      score: scoreHibrido, // Score híbrido (70% IA + 30% Regras)
      scoreIA, // Score puro da IA
      scoreRegras: scoringResult.scoreTotal, // Score puro das regras
      breakdown: finalScoring.breakdown, // Detalhamento por pilar
      insights: Array.isArray(result.insights) ? result.insights : [],
      redFlags: Array.isArray(result.redFlags) ? result.redFlags : [],
      justification: result.justification || scoringResult.justificativa,
      classificacao: scoreHibrido >= 80 ? 'Alto Potencial' : 
                     scoreHibrido >= 60 ? 'Bom Potencial' : 
                     scoreHibrido >= 40 ? 'Potencial Moderado' : 'Baixo Potencial',
    }
  } catch (error: any) {
    console.error('[OpenAI] ❌ Erro na análise:', error.message)
    
    // Fallback: retornar apenas score de regras
    return {
      score: scoringResult.scoreTotal,
      scoreIA: 0,
      scoreRegras: scoringResult.scoreTotal,
      breakdown: scoringResult.breakdown,
      insights: generateBasicInsights(input),
      redFlags: generateBasicRedFlags(input),
      justification: scoringResult.justificativa,
      classificacao: scoringResult.classificacao,
    }
  }
}

// ==================== HELPERS ====================

function generateBasicInsights(input: AnalysisInput): string[] {
  const insights: string[] = []
  
  if (input.company.situacao === 'ATIVA') {
    insights.push(`Empresa ativa desde ${input.company.abertura || 'data desconhecida'}`)
  }
  
  if (input.website) {
    insights.push('Presença digital detectada - empresa acessível online')
  }
  
  if (input.news.length > 0) {
    insights.push(`${input.news.length} notícia(s) recente(s) - empresa com visibilidade`)
  }
  
  const capital = parseFloat((input.company.capital_social || '0').replace(/\D/g, ''))
  if (capital > 100000) {
    insights.push('Capital social adequado para operações de médio porte')
  }

  return insights.length > 0 ? insights : ['Dados limitados para análise detalhada']
}

function generateBasicRedFlags(input: AnalysisInput): string[] {
  const redFlags: string[] = []
  
  if (input.company.situacao !== 'ATIVA') {
    redFlags.push('⚠️ Empresa não está ativa no cadastro da Receita')
  }
  
  if (!input.website) {
    redFlags.push('⚠️ Sem presença digital detectada')
  }
  
  if (!input.company.capital_social || parseFloat(input.company.capital_social.replace(/\D/g, '')) < 5000) {
    redFlags.push('⚠️ Capital social muito baixo ou não informado')
  }

  if (input.news.length === 0) {
    redFlags.push('ℹ️ Sem notícias recentes - empresa com baixa visibilidade')
  }

  return redFlags
}

function generateBasicAnalysis(input: AnalysisInput): AnalysisOutput {
  // Esta função não é mais usada, mas mantemos para compatibilidade
  const scoringInput: ScoringInput = {
    situacao: input.company.situacao || 'DESCONHECIDA',
    abertura: input.company.abertura || '01/01/2000',
    capitalSocial: parseFloat((input.company.capital_social || '0').replace(/\D/g, '')) || 0,
    porte: input.company.porte || 'NÃO INFORMADO',
    simplesOptante: input.company.simples?.optante ?? false,
    meiOptante: false,
    temWebsite: !!input.website,
    temNoticias: input.news.length > 0,
    noticiasRecentes: 0,
    atividadePrincipal: input.company.atividade_principal?.[0]?.text || 'Não informado',
  }

  const scoringResult = calculatePropensityScore(scoringInput)

  return {
    score: scoringResult.scoreTotal,
    scoreIA: 0,
    scoreRegras: scoringResult.scoreTotal,
    breakdown: scoringResult.breakdown,
    insights: generateBasicInsights(input),
    redFlags: generateBasicRedFlags(input),
    justification: scoringResult.justificativa,
    classificacao: scoringResult.classificacao,
  }
}

