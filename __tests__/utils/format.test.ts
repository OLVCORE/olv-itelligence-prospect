/**
 * Testes para lib/utils/format.ts
 * REGRA CRÍTICA: formatCurrency NUNCA deve dividir por 1000 ou adicionar sufixo "k"
 */

import { formatCurrency, formatNumber, formatPercent, formatCNPJ, parseNumber } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('deve formatar valores sem dividir por 1000', () => {
    expect(formatCurrency(5000)).toBe('R$ 5.000,00')
    expect(formatCurrency(50000)).toBe('R$ 50.000,00')
    expect(formatCurrency(500000)).toBe('R$ 500.000,00')
    expect(formatCurrency(5000000)).toBe('R$ 5.000.000,00')
  })

  it('NUNCA deve adicionar sufixo "k"', () => {
    const result = formatCurrency(50000)
    expect(result).not.toContain('k')
    expect(result).not.toContain('K')
  })

  it('deve usar locale pt-BR', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
    expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
  })

  it('deve retornar N/D para valores inválidos', () => {
    expect(formatCurrency(null)).toBe('N/D')
    expect(formatCurrency(undefined)).toBe('N/D')
    expect(formatCurrency('')).toBe('N/D')
  })

  it('deve aceitar valores como string', () => {
    expect(formatCurrency('50000')).toBe('R$ 50.000,00')
  })

  it('deve respeitar casas decimais', () => {
    expect(formatCurrency(1234.5, { minimumFractionDigits: 2 })).toBe('R$ 1.234,50')
  })

  it('deve validar range até 1 quadrilhão', () => {
    expect(formatCurrency(1e15)).toBe('N/D') // Acima do range
    expect(formatCurrency(1e14)).not.toBe('N/D') // Dentro do range
  })
})

describe('formatNumber', () => {
  it('deve formatar números sem moeda', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
    expect(formatNumber(1234567, 2)).toBe('1.234.567,00')
  })
})

describe('formatPercent', () => {
  it('deve formatar percentual', () => {
    expect(formatPercent(85.5)).toBe('85,5%')
    expect(formatPercent(100)).toBe('100,0%')
  })

  it('deve converter decimal para percentual', () => {
    expect(formatPercent(0.855, true)).toBe('85,5%')
  })
})

describe('formatCNPJ', () => {
  it('deve formatar CNPJ', () => {
    expect(formatCNPJ('00000000000191')).toBe('00.000.000/0001-91')
  })

  it('deve retornar N/D para CNPJ inválido', () => {
    expect(formatCNPJ(null)).toBe('N/D')
    expect(formatCNPJ('')).toBe('N/D')
  })
})

describe('parseNumber', () => {
  it('deve fazer parse de número pt-BR', () => {
    expect(parseNumber('1.234,56')).toBe(1234.56)
    expect(parseNumber('R$ 50.000,00')).toBe(50000)
  })

  it('deve retornar null para inválidos', () => {
    expect(parseNumber('')).toBe(null)
    expect(parseNumber('abc')).toBe(null)
  })
})

