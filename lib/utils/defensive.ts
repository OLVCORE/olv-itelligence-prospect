/**
 * DEFENSIVE PROGRAMMING UTILITIES
 * 
 * Utilitários para programação defensiva - previne crashes por undefined/null
 * USO OBRIGATÓRIO em todos os componentes que lidam com dados externos
 */

/**
 * SafeArray - Garante que sempre retorna um array válido
 * Uso: SafeArray(data).map(item => ...)
 */
export function SafeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : []
}

/**
 * SafeObject - Garante que sempre retorna um objeto válido
 * Uso: SafeObject(data).property
 */
export function SafeObject<T extends object>(value: T | undefined | null, fallback: T): T {
  return value && typeof value === 'object' ? value : fallback
}

/**
 * SafeString - Garante que sempre retorna uma string válida
 */
export function SafeString(value: string | undefined | null, fallback: string = ''): string {
  return value ?? fallback
}

/**
 * SafeNumber - Garante que sempre retorna um número válido
 */
export function SafeNumber(value: number | undefined | null, fallback: number = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback
}

/**
 * hasValidData - Verifica se array tem dados válidos
 */
export function hasValidData<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * isEmpty - Verifica se valor está vazio (null, undefined, [], {}, '')
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * assertNotNull - Lança erro se valor for null/undefined
 * Uso em funções críticas que EXIGEM valor válido
 */
export function assertNotNull<T>(value: T | undefined | null, fieldName: string): asserts value is T {
  if (value == null) {
    throw new Error(`🔴 ERRO CRÍTICO: ${fieldName} é null ou undefined. Sistema requer valor válido.`)
  }
}

/**
 * safeAccess - Acesso seguro a propriedades aninhadas
 * Uso: safeAccess(obj, 'prop1.prop2.prop3', fallback)
 */
export function safeAccess<T>(obj: any, path: string, fallback: T): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return fallback
    }
    result = result[key]
  }
  
  return result ?? fallback
}

