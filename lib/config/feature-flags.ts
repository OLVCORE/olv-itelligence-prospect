/**
 * FEATURE FLAGS
 * Controle de funcionalidades experimentais/progressivas
 */

/**
 * 🔴 KILL-SWITCH ANTI-MOCK (OBRIGATÓRIO)
 * Quando true, sistema NUNCA retorna dados fictícios
 */
export const NO_MOCKS = true // SEMPRE ATIVO
export const USE_REAL_ENGINES = true // SEMPRE ATIVO

/**
 * MÓDULO 9: Busca ASSERTIVA com validação por CNPJ/sócios/domínio
 * Quando true, aplica validação rigorosa em todos os links encontrados
 */
export const SEARCH_ASSERTIVE = process.env.SEARCH_ASSERTIVE === 'true' || true

/**
 * MÓDULO 5: Oportunidades Vendor Match
 * Quando true, habilita análise de oportunidades por vendor (TOTVS/OLV/Custom)
 */
export const OPPORTUNITIES_VENDOR = process.env.OPPORTUNITIES_VENDOR === 'true' || true

/**
 * MÓDULO 8: Billing & Quotas (SaaS por CNPJ)
 * Quando true, habilita controle de quotas e cobrança por projeto
 */
export const BILLING_ENABLED = process.env.BILLING_ENABLED === 'true' || false

/**
 * MODO RÁPIDO: reduz drasticamente o número de buscas para evitar timeout
 * - Website: 2 estratégias (antes: 10)
 * - Redes sociais: 1 estratégia por plataforma (antes: 6)
 * - Marketplaces: 5 plataformas (antes: 20)
 * - Jusbrasil: 1 estratégia (antes: 6)
 * - Outros links: 2 estratégias (antes: 6)
 */
export const FAST_MODE = process.env.FAST_MODE === 'true' || true // ATIVADO por padrão para evitar timeout

/**
 * Dev/Debug flags
 */
export const DEBUG_LOGS = process.env.NODE_ENV === 'development'
export const VERBOSE_VALIDATION = process.env.VERBOSE_VALIDATION === 'true' || false
export const PUBLIC_QA_MODE = process.env.PUBLIC_QA_MODE === 'true' || false

/**
 * 🔴 GUARD ANTI-MOCK
 * Aborta execução se dados fictícios forem detectados
 */
export function assertNoMockData(data: any, context: string): void {
  if (!NO_MOCKS) return

  const dataStr = JSON.stringify(data).toLowerCase()
  
  const FORBIDDEN_PATTERNS = [
    'mock_',
    'placeholder_',
    'sample_',
    'lorem ipsum',
    'fake',
    'hardcoded demo',
    'static demo',
    'exemplo fixo',
    'teste demo'
  ]

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (dataStr.includes(pattern)) {
      const error = `🔴 MOCK DETECTADO em ${context}: Pattern "${pattern}" encontrado. Sistema configurado com NO_MOCKS=true.`
      console.error(error)
      throw new Error(error)
    }
  }
}

/**
 * 🔴 GUARD ANTI-VALORES-INVENTADOS
 * Verifica se número crítico tem fonte/evidência
 */
export function assertHasEvidence(value: number | null, fieldName: string, evidence?: any): void {
  if (!NO_MOCKS) return
  
  if (value !== null && value !== undefined && value !== 0 && !evidence) {
    console.warn(`⚠️ ATENÇÃO: ${fieldName}=${value} sem evidência rastreável`)
    // Não aborta, apenas avisa (alguns valores podem ser calculados)
  }
}
