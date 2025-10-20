/**
 * Utilitários para validação e normalização de CNPJ
 */

export function normalizeCnpj(cnpj: string | undefined | null): string {
  if (!cnpj) return ''
  return cnpj.replace(/\D/g, '')
}

export function isValidCnpj(cnpj: string | undefined | null): boolean {
  const normalized = normalizeCnpj(cnpj)
  
  // Aceitar qualquer CNPJ de 14 dígitos (sem validação de dígito verificador)
  // Isso permite buscar empresas reais mesmo com CNPJs que podem ter pequenos erros
  if (normalized.length !== 14) return false
  
  // Apenas verificar se não são todos dígitos iguais
  if (/^(\d)\1+$/.test(normalized)) return false
  
  return true
}

export function formatCnpj(cnpj: string): string {
  const normalized = normalizeCnpj(cnpj)
  if (normalized.length !== 14) return cnpj
  
  return normalized.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

export function normalizeDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^www\./, '').split('/')[0]
  }
}

