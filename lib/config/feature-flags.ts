/**
 * FEATURE FLAGS
 * Controle de funcionalidades experimentais/progressivas
 */

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
 * Dev/Debug flags
 */
export const DEBUG_LOGS = process.env.NODE_ENV === 'development'
export const VERBOSE_VALIDATION = process.env.VERBOSE_VALIDATION === 'true' || false

