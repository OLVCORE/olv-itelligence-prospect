/**
 * Testes Snapshot - Formatação pt-BR
 * Garante que valores críticos sejam exibidos corretamente
 */

import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatCNPJ,
  parseNumber,
} from '../format'

describe('formatCurrency', () => {
  it('deve formatar capital da OLV Internacional corretamente', () => {
    // CRÍTICO: Capital social exato da ReceitaWS
    expect(formatCurrency(230000)).toBe('R$ 230.000,00')
    expect(formatCurrency('230000')).toBe('R$ 230.000,00')
    expect(formatCurrency('230000.00')).toBe('R$ 230.000,00')
  })

  it('deve formatar valores grandes sem sufixos k/M', () => {
    expect(formatCurrency(1250000)).toBe('R$ 1.250.000,00')
    expect(formatCurrency(50000000)).toBe('R$ 50.000.000,00')
    expect(formatCurrency(1000000000)).toBe('R$ 1.000.000.000,00')
  })

  it('deve retornar N/D para valores inválidos', () => {
    expect(formatCurrency(null)).toBe('N/D')
    expect(formatCurrency(undefined)).toBe('N/D')
    expect(formatCurrency('')).toBe('N/D')
    expect(formatCurrency('invalid')).toBe('N/D')
  })

  it('deve respeitar range válido', () => {
    expect(formatCurrency(-100)).toBe('N/D') // Negativo
    expect(formatCurrency(2e12)).toBe('N/D') // Acima de 1 trilhão
  })
})

describe('parseNumber', () => {
  it('deve fazer parse de valores pt-BR corretamente', () => {
    expect(parseNumber('230.000,00')).toBe(230000)
    expect(parseNumber('R$ 230.000,00')).toBe(230000)
    expect(parseNumber('1.250.000,50')).toBe(1250000.50)
    expect(parseNumber('1250000')).toBe(1250000)
  })

  it('deve retornar null para valores inválidos', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('R$ abc')).toBeNull()
  })
})

describe('formatNumber', () => {
  it('deve formatar sem casas decimais por padrão', () => {
    expect(formatNumber(230000)).toBe('230.000')
    expect(formatNumber(1250000)).toBe('1.250.000')
  })

  it('deve respeitar casas decimais quando especificado', () => {
    expect(formatNumber(230000, 2)).toBe('230.000,00')
    expect(formatNumber(1250.5, 1)).toBe('1.250,5')
  })
})

describe('formatPercent', () => {
  it('deve formatar percentual com 1 casa decimal', () => {
    expect(formatPercent(85.5)).toBe('85,5%')
    expect(formatPercent(100)).toBe('100,0%')
    expect(formatPercent(0)).toBe('0,0%')
  })

  it('deve tratar valor como decimal quando asDecimal=true', () => {
    expect(formatPercent(0.855, true)).toBe('85,5%')
    expect(formatPercent(1, true)).toBe('100,0%')
  })
})

describe('formatCNPJ', () => {
  it('deve formatar CNPJ corretamente', () => {
    expect(formatCNPJ('03479371000183')).toBe('03.479.371/0001-83')
    expect(formatCNPJ('03.479.371/0001-83')).toBe('03.479.371/0001-83')
  })

  it('deve retornar N/D para valores inválidos', () => {
    expect(formatCNPJ(null)).toBe('N/D')
    expect(formatCNPJ('')).toBe('N/D')
  })

  it('deve retornar original se CNPJ não tiver 14 dígitos', () => {
    expect(formatCNPJ('12345')).toBe('12345')
  })
})

describe('formatDate', () => {
  it('deve formatar data pt-BR', () => {
    const date = new Date('2025-10-19T10:00:00')
    expect(formatDate(date)).toBe('19/10/2025')
  })

  it('deve formatar string ISO', () => {
    expect(formatDate('2025-10-19')).toBe('19/10/2025')
  })

  it('deve retornar N/D para valores inválidos', () => {
    expect(formatDate(null)).toBe('N/D')
    expect(formatDate('invalid')).toBe('N/D')
  })
})

