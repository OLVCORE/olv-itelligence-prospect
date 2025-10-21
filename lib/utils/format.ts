/**
 * Utilitários de Formatação - pt-BR
 * 
 * REGRAS CRÍTICAS:
 * - NUNCA usar sufixos automáticos "k"/"M"
 * - Sempre exibir valor exato da fonte
 * - Locale pt-BR obrigatório
 * - Parser seguro com validação de range
 */

/**
 * Formatar moeda em pt-BR (R$)
 * @param value - Valor numérico ou string
 * @param options - Opções adicionais de formatação
 * @returns String formatada (ex: "R$ 230.000,00")
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  if (value === null || value === undefined || value === '') {
    return 'N/D'
  }

  // Parser seguro
  const numValue = typeof value === 'string' ? parseNumber(value) : value
  
  if (numValue === null || isNaN(numValue)) {
    console.warn('[Format] Valor inválido para currency:', value)
    return 'N/D'
  }

  // Validar range (0 < capital <= 1e15 - até 1 quadrilhão)
  if (numValue < 0 || numValue > 1e15) {
    console.warn('[Format] Valor fora do range válido:', numValue)
    return 'N/D'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(numValue)
}

/**
 * Formatar número sem moeda
 * @param value - Valor numérico ou string
 * @param decimals - Casas decimais (padrão 0)
 * @returns String formatada (ex: "1.250.000")
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || value === '') {
    return 'N/D'
  }

  const numValue = typeof value === 'string' ? parseNumber(value) : value
  
  if (numValue === null || isNaN(numValue)) {
    console.warn('[Format] Valor inválido para number:', value)
    return 'N/D'
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

/**
 * Formatar percentual
 * @param value - Valor entre 0-100 ou 0-1
 * @param asDecimal - Se true, trata valor como 0-1 (padrão: false, trata como 0-100)
 * @returns String formatada (ex: "85,5%")
 */
export function formatPercent(
  value: number | null | undefined,
  asDecimal: boolean = false
): string {
  if (value === null || value === undefined) {
    return 'N/D'
  }

  const percentValue = asDecimal ? value * 100 : value

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentValue) + '%'
}

/**
 * Formatar data pt-BR
 * @param date - Data como Date, string ISO ou timestamp
 * @returns String formatada (ex: "19/10/2025")
 */
export function formatDate(
  date: Date | string | number | null | undefined
): string {
  if (!date) return 'N/D'

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date

    if (isNaN(dateObj.getTime())) {
      console.warn('[Format] Data inválida:', date)
      return 'N/D'
    }

    return new Intl.DateTimeFormat('pt-BR').format(dateObj)
  } catch (error) {
    console.warn('[Format] Erro ao formatar data:', error)
    return 'N/D'
  }
}

/**
 * Formatar data e hora pt-BR
 * @param date - Data como Date, string ISO ou timestamp
 * @returns String formatada (ex: "19/10/2025 14:30")
 */
export function formatDateTime(
  date: Date | string | number | null | undefined
): string {
  if (!date) return 'N/D'

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date

    if (isNaN(dateObj.getTime())) {
      console.warn('[Format] Data inválida:', date)
      return 'N/D'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(dateObj)
  } catch (error) {
    console.warn('[Format] Erro ao formatar data/hora:', error)
    return 'N/D'
  }
}

/**
 * Parser seguro de número pt-BR
 * @param value - String com número (aceita vírgula como decimal)
 * @returns Número parseado ou null se inválido
 */
export function parseNumber(value: string): number | null {
  if (!value || typeof value !== 'string') return null

  try {
    // Remover R$, espaços e pontos (separador de milhar pt-BR)
    let cleaned = value
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .trim()

    // Substituir vírgula por ponto (decimal pt-BR → JS)
    cleaned = cleaned.replace(',', '.')

    const parsed = parseFloat(cleaned)

    if (isNaN(parsed)) {
      console.warn('[Parser] Valor não numérico:', value)
      return null
    }

    return parsed
  } catch (error) {
    console.warn('[Parser] Erro ao fazer parse:', error)
    return null
  }
}

/**
 * Parse BRL para número (NUNCA multiplica por 1000)
 * @param input - Capital social da ReceitaWS (string, number ou null)
 * @returns Número parseado ou null
 */
export function parseBRLToNumber(input?: string | number | null): number | null {
  if (input === null || input === undefined) return null
  if (typeof input === 'number') return input
  
  let s = String(input).trim()
  s = s.replace(/^R\$\s?/, '')
  
  // Detectar formato BR: 1.000.000,00
  if (/\,\d{2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.')
  }
  
  const n = Number(s)
  return Number.isNaN(n) ? null : n // NUNCA multiplique por 1000
}

/**
 * Apenas dígitos
 */
export function onlyDigits(s: string): string {
  return (s || '').replace(/\D/g, '')
}

/**
 * Normalizar CNPJ (14 dígitos)
 */
export function normalizeCnpj(s: string): string {
  return onlyDigits(s).padStart(14, '0')
}

/**
 * Formatar CNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns String formatada (ex: "00.000.000/0000-00")
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return 'N/D'

  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) {
    return cnpj // Retorna original se inválido
  }

  return cleaned.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  )
}

/**
 * Formatar telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns String formatada (ex: "(11) 98765-4321")
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/D'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone // Retorna original se não bater formato
}

/**
 * Formatar CEP
 * @param cep - CEP com ou sem formatação
 * @returns String formatada (ex: "01310-100")
 */
export function formatCEP(cep: string | null | undefined): string {
  if (!cep) return 'N/D'

  const cleaned = cep.replace(/\D/g, '')

  if (cleaned.length !== 8) {
    return cep // Retorna original se inválido
  }

  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Truncar texto com reticências
 * @param text - Texto a truncar
 * @param maxLength - Tamanho máximo
 * @returns Texto truncado
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitalizar primeira letra
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Formatar porte da empresa
 * @param size - Tamanho (MICRO, PEQUENO, MEDIO, GRANDE)
 * @returns String formatada
 */
export function formatCompanySize(size: string | null | undefined): string {
  if (!size) return 'N/D'
  
  const sizeMap: Record<string, string> = {
    'MICRO': 'Microempresa',
    'PEQUENO': 'Pequena',
    'MEDIO': 'Média',
    'MÉDIO': 'Média',
    'GRANDE': 'Grande',
    'ME': 'Microempresa',
    'EPP': 'Pequena',
  }

  return sizeMap[size.toUpperCase()] || capitalize(size)
}

