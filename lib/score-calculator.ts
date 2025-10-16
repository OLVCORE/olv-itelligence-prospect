/**
 * Sistema de Cálculo do Score de Confiabilidade
 * Baseado em múltiplos fatores da Receita Federal
 */

export interface ScoreBreakdown {
  total: number
  factors: {
    name: string
    value: number
    maxValue: number
    description: string
    achieved: boolean
  }[]
}

export function calculateScoreBreakdown(data: any): ScoreBreakdown {
  const factors = []
  let total = 50 // Base inicial

  // 1. Situação Ativa (+20 pontos)
  const situacaoAtiva = data.situacao === 'ATIVA'
  factors.push({
    name: 'Situação Regular',
    value: situacaoAtiva ? 20 : 0,
    maxValue: 20,
    description: 'Empresa com situação cadastral ATIVA perante a Receita Federal',
    achieved: situacaoAtiva
  })
  if (situacaoAtiva) total += 20

  // 2. Capital Social (+10 pontos)
  const temCapital = data.capital_social && parseFloat(data.capital_social.replace(/[^\d,]/g, '').replace(',', '.')) > 0
  factors.push({
    name: 'Capital Social Declarado',
    value: temCapital ? 10 : 0,
    maxValue: 10,
    description: 'Empresa possui capital social declarado e maior que zero',
    achieved: temCapital
  })
  if (temCapital) total += 10

  // 3. Email Cadastrado (+5 pontos)
  const temEmail = !!data.email
  factors.push({
    name: 'Email Cadastrado',
    value: temEmail ? 5 : 0,
    maxValue: 5,
    description: 'Empresa possui email de contato registrado na Receita Federal',
    achieved: temEmail
  })
  if (temEmail) total += 5

  // 4. Telefone Cadastrado (+5 pontos)
  const temTelefone = !!data.telefone
  factors.push({
    name: 'Telefone Cadastrado',
    value: temTelefone ? 5 : 0,
    maxValue: 5,
    description: 'Empresa possui telefone de contato registrado na Receita Federal',
    achieved: temTelefone
  })
  if (temTelefone) total += 5

  // 5. Quadro Societário (+10 pontos)
  const temSocios = data.qsa && data.qsa.length > 0
  factors.push({
    name: 'Quadro Societário Completo',
    value: temSocios ? 10 : 0,
    maxValue: 10,
    description: 'Empresa possui quadro de sócios e administradores cadastrado',
    achieved: temSocios
  })
  if (temSocios) total += 10

  // 6. É Matriz (+5 pontos)
  const ehMatriz = data.tipo === 'MATRIZ'
  factors.push({
    name: 'Estabelecimento Matriz',
    value: ehMatriz ? 5 : 0,
    maxValue: 5,
    description: 'Estabelecimento matriz (não filial) indica maior relevância',
    achieved: ehMatriz
  })
  if (ehMatriz) total += 5

  // 7. Dados Atualizados Recentemente (+10 pontos)
  let dadosAtualizados = false
  if (data.ultima_atualizacao) {
    const dataAtualizacao = new Date(data.ultima_atualizacao)
    const diasDesdeAtualizacao = Math.floor((Date.now() - dataAtualizacao.getTime()) / (1000 * 60 * 60 * 24))
    dadosAtualizados = diasDesdeAtualizacao < 30
  }
  factors.push({
    name: 'Dados Atualizados',
    value: dadosAtualizados ? 10 : 0,
    maxValue: 10,
    description: 'Dados atualizados nos últimos 30 dias na Receita Federal',
    achieved: dadosAtualizados
  })
  if (dadosAtualizados) total += 10

  // 8. Atividades Secundárias (+5 pontos)
  const temAtivSecundarias = data.atividades_secundarias && data.atividades_secundarias.length > 0
  factors.push({
    name: 'Diversificação de Atividades',
    value: temAtivSecundarias ? 5 : 0,
    maxValue: 5,
    description: 'Empresa com atividades econômicas secundárias indica diversificação',
    achieved: temAtivSecundarias
  })
  if (temAtivSecundarias) total += 5

  // 9. Endereço Completo (+5 pontos)
  const enderecoCompleto = data.logradouro && data.numero && data.cep
  factors.push({
    name: 'Endereço Completo',
    value: enderecoCompleto ? 5 : 0,
    maxValue: 5,
    description: 'Endereço completo com logradouro, número e CEP cadastrado',
    achieved: enderecoCompleto
  })
  if (enderecoCompleto) total += 5

  return {
    total: Math.min(total, 100),
    factors: factors.sort((a, b) => b.value - a.value) // Ordenar por pontuação
  }
}

export function getScoreLevel(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 90) {
    return {
      level: 'EXCELENTE',
      color: 'text-green-400',
      description: 'Empresa com dados cadastrais completos e confiáveis'
    }
  } else if (score >= 75) {
    return {
      level: 'MUITO BOM',
      color: 'text-blue-400',
      description: 'Empresa com bons indicadores de confiabilidade'
    }
  } else if (score >= 60) {
    return {
      level: 'BOM',
      color: 'text-yellow-400',
      description: 'Empresa com indicadores satisfatórios'
    }
  } else if (score >= 40) {
    return {
      level: 'REGULAR',
      color: 'text-orange-400',
      description: 'Empresa com alguns dados incompletos'
    }
  } else {
    return {
      level: 'BAIXO',
      color: 'text-red-400',
      description: 'Empresa com dados cadastrais limitados'
    }
  }
}
