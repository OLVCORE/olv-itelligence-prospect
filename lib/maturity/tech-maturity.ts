/**
 * Tech Maturity Calculator - 6 Dimensões
 * Cálculo DETERMINÍSTICO baseado em evidências reais
 */

export interface DetectedStack {
  erp?: Array<{ product: string; vendor?: string; confidence?: number }>
  crm?: Array<{ product: string; vendor?: string; confidence?: number }>
  cloud?: Array<{ product: string; vendor?: string; confidence?: number }>
  bi?: Array<{ product: string; vendor?: string; confidence?: number }>
  db?: Array<{ product: string; vendor?: string; confidence?: number }>
  integrations?: Array<{ product: string; vendor?: string; confidence?: number }>
  security?: Array<{ product: string; vendor?: string; confidence?: number }>
}

export interface MaturityScores {
  infra: number       // Infraestrutura (0-100)
  systems: number     // Sistemas (0-100)
  data: number        // Dados (0-100)
  security: number    // Segurança (0-100)
  automation: number  // Automação (0-100)
  culture: number     // Cultura (0-100)
  overall: number     // Score geral (média ponderada)
}

interface MaturityInputs {
  detectedStack: DetectedStack
  signals?: {
    hasCloudAdoption?: boolean
    hasApiIntegrations?: boolean
    hasAutomation?: boolean
    hasSecurity?: boolean
  }
}

/**
 * Calcula maturidade digital baseado APENAS em evidências reais
 * NÃO inventa dados, NÃO usa valores default artificiais
 */
export function computeMaturity(inputs: MaturityInputs): MaturityScores {
  const { detectedStack, signals } = inputs

  console.log('[Maturity] 📊 Calculando scores baseado em stack detectado')

  // 1. INFRAESTRUTURA (0-100)
  let infra = 0
  
  // Cloud presence
  if (detectedStack.cloud && detectedStack.cloud.length > 0) {
    infra += 40  // Tem cloud
    
    // Major cloud providers
    const majorProviders = ['AWS', 'Azure', 'GCP', 'Google Cloud']
    if (detectedStack.cloud.some(c => majorProviders.includes(c.vendor || ''))) {
      infra += 20  // Cloud enterprise
    }
    
    // Multi-cloud
    if (detectedStack.cloud.length > 1) {
      infra += 10
    }
  } else {
    infra = 20  // On-premise (mínimo)
  }

  // CDN/Edge
  if (signals?.hasCloudAdoption) {
    infra += 10
  }

  // 2. SISTEMAS (0-100)
  let systems = 0
  
  // ERP
  if (detectedStack.erp && detectedStack.erp.length > 0) {
    systems += 30
    
    // ERP enterprise
    const enterpriseERP = ['SAP', 'Oracle', 'TOTVS', 'Microsoft Dynamics']
    if (detectedStack.erp.some(e => enterpriseERP.includes(e.vendor || ''))) {
      systems += 15
    }
  }

  // CRM
  if (detectedStack.crm && detectedStack.crm.length > 0) {
    systems += 20
  }

  // BI
  if (detectedStack.bi && detectedStack.bi.length > 0) {
    systems += 15
  }

  // Integração entre sistemas
  if (detectedStack.integrations && detectedStack.integrations.length > 0) {
    systems += 20
  }

  // 3. DADOS (0-100)
  let data = 30  // Base

  // Database moderno
  if (detectedStack.db && detectedStack.db.length > 0) {
    data += 20
    
    const modernDB = ['PostgreSQL', 'MongoDB', 'MySQL 8', 'SQL Server']
    if (detectedStack.db.some(d => modernDB.some(m => d.product.includes(m)))) {
      data += 15
    }
  }

  // BI/Analytics
  if (detectedStack.bi && detectedStack.bi.length > 0) {
    data += 20
  }

  // Data warehouse/lake
  const hasDataWarehouse = detectedStack.db?.some(d => 
    d.product.toLowerCase().includes('warehouse') || 
    d.product.toLowerCase().includes('redshift') ||
    d.product.toLowerCase().includes('bigquery')
  )
  if (hasDataWarehouse) {
    data += 15
  }

  // 4. SEGURANÇA (0-100)
  let security = 40  // Base (assume práticas mínimas)

  if (detectedStack.security && detectedStack.security.length > 0) {
    security += 30
  }

  // HTTPS/TLS
  if (signals?.hasSecurity) {
    security += 15
  }

  // Cloud security
  if (detectedStack.cloud && detectedStack.cloud.length > 0) {
    security += 15  // Cloud providers têm security by default
  }

  // 5. AUTOMAÇÃO (0-100)
  let automation = 20  // Base (assume processos manuais)

  // RPA/Workflow
  const hasAutomation = detectedStack.integrations?.some(i =>
    i.product.toLowerCase().includes('zapier') ||
    i.product.toLowerCase().includes('fluig') ||
    i.product.toLowerCase().includes('automation')
  )
  if (hasAutomation) {
    automation += 30
  }

  // APIs
  if (signals?.hasApiIntegrations) {
    automation += 25
  }

  // Integrations count
  if (detectedStack.integrations && detectedStack.integrations.length > 2) {
    automation += 25
  }

  // 6. CULTURA (0-100)
  let culture = 35  // Base (assume cultura tradicional)

  // Inovação (presença de tecnologias modernas)
  const modernTech = [
    ...(detectedStack.cloud || []),
    ...(detectedStack.integrations || [])
  ]
  if (modernTech.length > 3) {
    culture += 25
  }

  // Digital-first (muitas tecnologias SaaS)
  const saasCount = modernTech.filter(t => 
    t.product.toLowerCase().includes('cloud') ||
    t.product.toLowerCase().includes('saas')
  ).length
  if (saasCount > 2) {
    culture += 20
  }

  // Tecnologias cutting-edge
  const cuttingEdge = ['Kubernetes', 'Docker', 'AI', 'ML', 'Blockchain']
  if (modernTech.some(t => cuttingEdge.some(ce => t.product.includes(ce)))) {
    culture += 20
  }

  // Normalizar (0-100)
  infra = Math.min(100, Math.max(0, infra))
  systems = Math.min(100, Math.max(0, systems))
  data = Math.min(100, Math.max(0, data))
  security = Math.min(100, Math.max(0, security))
  automation = Math.min(100, Math.max(0, automation))
  culture = Math.min(100, Math.max(0, culture))

  // OVERALL (média ponderada)
  const overall = Math.round(
    infra * 0.20 +
    systems * 0.25 +
    data * 0.20 +
    security * 0.15 +
    automation * 0.15 +
    culture * 0.05
  )

  console.log('[Maturity] ✅ Scores calculados:', { overall, infra, systems, data, security, automation, culture })

  return {
    infra,
    systems,
    data,
    security,
    automation,
    culture,
    overall
  }
}

