// lib/ai/analysis.ts
export interface AIInsights {
  overall: string
  opportunities: string[]
  risks: string[]
  recommendations: string[]
  techInsights: Record<string, string>
  decisionMakerInsights: Record<string, string>
}

export async function generateAIInsights(companyData: any, techStack: any[], decisionMakers: any[]): Promise<AIInsights> {
  try {
    // Se OpenAI API key estiver disponível, usar GPT-4
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(companyData, techStack, decisionMakers)
    }
    
    // Fallback para análise local baseada em regras
    return generateLocalInsights(companyData, techStack, decisionMakers)
    
  } catch (error) {
    console.error('Erro ao gerar insights de IA:', error)
    return generateLocalInsights(companyData, techStack, decisionMakers)
  }
}

async function generateWithOpenAI(companyData: any, techStack: any[], decisionMakers: any[]): Promise<AIInsights> {
  const prompt = `
Analise esta empresa B2B e gere insights estratégicos:

DADOS DA EMPRESA:
- Nome: ${companyData.razao}
- Setor: ${companyData.textoCnaePrincipal}
- Porte: ${companyData.porte}
- Localização: ${companyData.cidade}/${companyData.uf}

STACK TECNOLÓGICO:
${techStack.map(tech => `- ${tech.product} (${tech.vendor}) - ${tech.category} - Confiança: ${tech.confidence}%`).join('\n')}

DECISORES:
${decisionMakers.map(dm => `- ${dm.name} (${dm.title}) - Score: ${dm.score} - Departamento: ${dm.department}`).join('\n')}

Gere insights em português brasileiro com foco em:
1. Análise geral da empresa
2. Oportunidades de vendas
3. Riscos identificados
4. Recomendações estratégicas
5. Insights específicos para cada tecnologia
6. Estratégias para cada decisor

Formato JSON:
{
  "overall": "análise geral",
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "risks": ["risco 1", "risco 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "techInsights": {"tecnologia": "insight"},
  "decisionMakerInsights": {"decisor": "insight"}
}
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Você é um especialista em análise de empresas B2B e prospecção comercial. Responda sempre em português brasileiro.'
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    return JSON.parse(content)
  } catch {
    // Se não conseguir fazer parse, usar análise local
    return generateLocalInsights(companyData, techStack, decisionMakers)
  }
}

function generateLocalInsights(companyData: any, techStack: any[], decisionMakers: any[]): AIInsights {
  const opportunities: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []
  const techInsights: Record<string, string> = {}
  const decisionMakerInsights: Record<string, string> = {}

  // Análise baseada em regras
  const companySize = companyData.porte || 'Médio'
  const industry = companyData.textoCnaePrincipal || ''
  const hasHighTechMaturity = techStack.filter(t => t.confidence > 80).length > 3

  // Oportunidades baseadas no setor
  if (industry.includes('tecnologia') || industry.includes('software')) {
    opportunities.push('Empresa do setor de tecnologia com alto potencial para soluções inovadoras')
  }
  if (industry.includes('financeiro') || industry.includes('bancário')) {
    opportunities.push('Setor financeiro com necessidade de compliance e segurança')
  }
  if (industry.includes('saúde') || industry.includes('médico')) {
    opportunities.push('Setor de saúde com foco em digitalização e eficiência')
  }

  // Oportunidades baseadas no porte
  if (companySize.includes('Grande')) {
    opportunities.push('Empresa de grande porte com orçamento para investimentos significativos')
  } else if (companySize.includes('Pequeno')) {
    opportunities.push('Empresa pequena com necessidade de soluções econômicas e escaláveis')
  }

  // Oportunidades baseadas na maturidade tecnológica
  if (hasHighTechMaturity) {
    opportunities.push('Alta maturidade tecnológica indica abertura para inovações')
  } else {
    opportunities.push('Baixa maturidade tecnológica representa oportunidade de transformação digital')
  }

  // Riscos baseados na análise
  if (decisionMakers.length === 0) {
    risks.push('Nenhum decisor identificado - dificulta o processo de vendas')
  }
  if (techStack.length === 0) {
    risks.push('Stack tecnológico desconhecido - dificulta a proposição de valor')
  }

  // Recomendações baseadas nos dados
  if (decisionMakers.some(dm => dm.department === 'Tecnologia')) {
    recommendations.push('Abordar o Diretor de TI com proposta técnica detalhada')
  }
  if (decisionMakers.some(dm => dm.department === 'Financeiro')) {
    recommendations.push('Envolver o CFO com business case focado em ROI')
  }
  if (techStack.some(tech => tech.vendor === 'Microsoft')) {
    recommendations.push('Aproveitar o ecossistema Microsoft existente')
  }

  // Insights específicos para tecnologias
  techStack.forEach(tech => {
    if (tech.category === 'ERP') {
      techInsights[tech.product] = 'ERP indica processos estruturados e potencial para integrações'
    } else if (tech.category === 'CRM') {
      techInsights[tech.product] = 'CRM sugere foco em vendas e marketing - oportunidade para automação'
    } else if (tech.category === 'Cloud') {
      techInsights[tech.product] = 'Cloud-first indica estratégia moderna e escalável'
    }
  })

  // Insights específicos para decisores
  decisionMakers.forEach(dm => {
    if (dm.influenceLevel === 'Alto') {
      decisionMakerInsights[dm.name] = 'Decisor de alto nível - foco em estratégia e ROI'
    } else if (dm.department === 'Tecnologia') {
      decisionMakerInsights[dm.name] = 'Perfil técnico - abordar com detalhes de implementação'
    } else if (dm.department === 'Financeiro') {
      decisionMakerInsights[dm.name] = 'Foco financeiro - destacar economia e eficiência'
    }
  })

  // Análise geral
  const overall = `Empresa ${companySize.toLowerCase()} do setor ${industry.split(' ')[0]} com ${techStack.length} tecnologias identificadas e ${decisionMakers.length} decisores mapeados. ${hasHighTechMaturity ? 'Alta maturidade tecnológica' : 'Maturidade tecnológica em desenvolvimento'}.`

  return {
    overall,
    opportunities,
    risks,
    recommendations,
    techInsights,
    decisionMakerInsights
  }
}

export async function generateTechInsights(tech: any): Promise<string> {
  const insights = {
    'SAP': 'SAP indica empresa de médio/grande porte com processos estruturados. Alto potencial para soluções complementares.',
    'Salesforce': 'Salesforce sugere foco em vendas B2B. Oportunidade para soluções de marketing automation.',
    'Microsoft': 'Ecossistema Microsoft indica estratégia integrada. Potencial para Microsoft 365 e Power Platform.',
    'Oracle': 'Oracle sugere empresa enterprise com necessidades complexas. Foco em soluções de alto valor.',
    'AWS': 'AWS indica estratégia cloud-first. Oportunidade para soluções nativas em nuvem.',
    'Azure': 'Azure sugere integração com Microsoft. Potencial para soluções híbridas.',
    'Google Cloud': 'Google Cloud indica foco em analytics e ML. Oportunidade para soluções de dados.'
  }

  return insights[tech.vendor] || insights[tech.product] || 'Tecnologia identificada com potencial para integração e otimização.'
}

export async function generateDecisionMakerInsights(decisionMaker: any): Promise<string> {
  const title = decisionMaker.title.toLowerCase()
  const department = decisionMaker.department.toLowerCase()
  
  if (title.includes('ceo') || title.includes('president')) {
    return 'Executivo de alto nível com poder de decisão total. Foco em estratégia e visão de longo prazo.'
  } else if (title.includes('cto') || department.includes('tecnologia')) {
    return 'Perfil técnico com foco em inovação e eficiência. Abordar com soluções técnicas detalhadas.'
  } else if (title.includes('cfo') || department.includes('financeiro')) {
    return 'Foco financeiro com ênfase em ROI e eficiência operacional. Destacar economia e retorno.'
  } else if (title.includes('cmo') || department.includes('marketing')) {
    return 'Foco em marketing e vendas. Abordar com soluções de crescimento e automação.'
  } else if (title.includes('manager') || title.includes('gerente')) {
    return 'Gerente operacional com foco em eficiência. Destacar benefícios operacionais.'
  }
  
  return 'Decisor identificado com potencial de influência no processo de compra.'
}
