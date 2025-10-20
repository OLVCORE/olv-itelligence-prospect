/**
 * Vendor Fit - Recomendação de Produtos TOTVS/OLV
 * Baseado em stack detectado e scores de maturidade
 */

import { DetectedStack, MaturityScores } from './tech-maturity'

export interface VendorFit {
  vendor: 'TOTVS' | 'OLV' | 'CUSTOM'
  score: number  // 0-100
  products: Array<{
    name: string
    category: string
    rationale: string
  }>
  dealSize: string
  rationale: string[]
}

interface FitInputs {
  vendor: 'TOTVS' | 'OLV' | 'CUSTOM'
  detectedStack: DetectedStack
  scores: MaturityScores
}

export function suggestFit(inputs: FitInputs): VendorFit {
  const { vendor, detectedStack, scores } = inputs

  console.log('[Vendor Fit] 🎯 Calculando fit para:', vendor)

  if (vendor === 'TOTVS') {
    return calculateTOTVSFit(detectedStack, scores)
  } else if (vendor === 'OLV') {
    return calculateOLVFit(detectedStack, scores)
  } else {
    return calculateCustomFit(detectedStack, scores)
  }
}

function calculateTOTVSFit(stack: DetectedStack, scores: MaturityScores): VendorFit {
  let score = 50  // Base
  const products: Array<any> = []
  const rationale: string[] = []

  // ERP Fit
  const hasLegacyERP = stack.erp?.some(e => 
    ['SAP', 'Oracle', 'Microsiga'].includes(e.vendor || '')
  )
  
  if (hasLegacyERP) {
    score += 20
    products.push({
      name: 'TOTVS Protheus',
      category: 'ERP',
      rationale: 'Substituição de ERP legado (SAP/Oracle) por solução nacional'
    })
    rationale.push('Stack legado necessita modernização')
  } else if (!stack.erp || stack.erp.length === 0) {
    score += 15
    products.push({
      name: 'TOTVS Protheus',
      category: 'ERP',
      rationale: 'Empresa sem ERP - oportunidade greenfield'
    })
    rationale.push('Ausência de ERP representa oportunidade')
  }

  // BPM/Workflow
  if (scores.automation < 60) {
    score += 10
    products.push({
      name: 'TOTVS Fluig',
      category: 'BPM',
      rationale: 'Baixa automação detectada - Fluig pode elevar'
    })
    rationale.push(`Automação em ${scores.automation}% - gap significativo`)
  }

  // BI/Analytics
  if (!stack.bi || stack.bi.length === 0 || scores.data < 65) {
    score += 10
    products.push({
      name: 'TOTVS BI',
      category: 'Analytics',
      rationale: 'Gap em analytics - TOTVS BI com painéis prontos'
    })
    rationale.push('Dados não estruturados ou sem BI')
  }

  // RH
  if (scores.systems < 70) {
    products.push({
      name: 'TOTVS RH',
      category: 'Recursos Humanos',
      rationale: 'Modernização de gestão de pessoas'
    })
  }

  // Deal size baseado em número de produtos
  let dealSize = 'R$ 80k - 150k'
  if (products.length >= 3) {
    dealSize = 'R$ 300k - 600k'
    score += 10
  } else if (products.length >= 2) {
    dealSize = 'R$ 150k - 300k'
    score += 5
  }

  // Maturity boost
  if (scores.overall >= 70) {
    score += 10
    rationale.push('Maturidade digital alta facilita adoção')
  } else if (scores.overall < 50) {
    score -= 10
    rationale.push('Maturidade baixa pode requerer mais consultoria')
  }

  score = Math.min(100, Math.max(0, score))

  return {
    vendor: 'TOTVS',
    score,
    products,
    dealSize,
    rationale
  }
}

function calculateOLVFit(stack: DetectedStack, scores: MaturityScores): VendorFit {
  let score = 50
  const products: Array<any> = []
  const rationale: string[] = []

  // OLV é consultoria - quanto MENOR a maturidade, MAIOR o fit
  if (scores.overall < 60) {
    score += 20
    rationale.push('Maturidade digital baixa - alto potencial para consultoria')
  }

  // Gaps em cultura
  if (scores.culture < 50) {
    score += 15
    products.push({
      name: 'Diagnóstico 360°',
      category: 'Consultoria',
      rationale: 'Gap cultural necessita transformação guiada'
    })
    rationale.push('Cultura digital incipiente')
  }

  // Gaps em processos
  if (scores.automation < 50) {
    score += 10
    products.push({
      name: 'Roadmap de Automação',
      category: 'Consultoria',
      rationale: 'Definir estratégia de automação de processos'
    })
  }

  // Sempre oferece diagnóstico
  if (!products.some(p => p.name === 'Diagnóstico 360°')) {
    products.push({
      name: 'Diagnóstico 360°',
      category: 'Consultoria',
      rationale: 'Mapeamento completo de maturidade e gaps'
    })
  }

  // Change management
  products.push({
    name: 'Gestão de Mudança',
    category: 'Consultoria',
    rationale: 'Preparação do time para transformação digital'
  })

  const dealSize = products.length >= 3 ? 'R$ 100k - 200k' : 'R$ 50k - 100k'

  score = Math.min(100, Math.max(30, score))  // OLV sempre tem fit mínimo de 30

  return {
    vendor: 'OLV',
    score,
    products,
    dealSize,
    rationale
  }
}

function calculateCustomFit(stack: DetectedStack, scores: MaturityScores): VendorFit {
  return {
    vendor: 'CUSTOM',
    score: 50,
    products: [{
      name: 'Solução Customizada',
      category: 'Custom Development',
      rationale: 'Necessidades específicas não atendidas por produtos de prateleira'
    }],
    dealSize: 'R$ 200k - 500k',
    rationale: ['Empresa com necessidades muito específicas']
  }
}

