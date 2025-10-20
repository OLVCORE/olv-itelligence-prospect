import { normalizeCnpj, isValidCnpj, formatCnpj, normalizeDomain } from '../lib/utils/cnpj'

describe('CNPJ Utils', () => {
  describe('normalizeCnpj', () => {
    it('should remove non-digits', () => {
      expect(normalizeCnpj('12.345.678/0001-90')).toBe('12345678000190')
      expect(normalizeCnpj('12 345 678 0001 90')).toBe('12345678000190')
      expect(normalizeCnpj('12.345.678/0001-90')).toBe('12345678000190')
    })

    it('should handle empty/null inputs', () => {
      expect(normalizeCnpj('')).toBe('')
      expect(normalizeCnpj(null)).toBe('')
      expect(normalizeCnpj(undefined)).toBe('')
    })
  })

  describe('isValidCnpj', () => {
    it('should validate correct CNPJs', () => {
      expect(isValidCnpj('06990590000123')).toBe(true) // Magazine Luiza
      expect(isValidCnpj('06.990.590/0001-23')).toBe(true)
      expect(isValidCnpj('00000000000191')).toBe(true) // Receita Federal
    })

    it('should reject invalid CNPJs', () => {
      expect(isValidCnpj('123')).toBe(false) // Too short
      expect(isValidCnpj('123456789012345')).toBe(false) // Too long
      expect(isValidCnpj('11111111111111')).toBe(false) // All same digits
      expect(isValidCnpj('06990590000124')).toBe(false) // Wrong check digits
    })

    it('should handle edge cases', () => {
      expect(isValidCnpj('')).toBe(false)
      expect(isValidCnpj(null)).toBe(false)
      expect(isValidCnpj(undefined)).toBe(false)
    })
  })

  describe('formatCnpj', () => {
    it('should format valid CNPJs', () => {
      expect(formatCnpj('06990590000123')).toBe('06.990.590/0001-23')
      expect(formatCnpj('00000000000191')).toBe('00.000.000/0001-91')
    })

    it('should return original for invalid CNPJs', () => {
      expect(formatCnpj('123')).toBe('123')
      expect(formatCnpj('invalid')).toBe('invalid')
    })
  })

  describe('normalizeDomain', () => {
    it('should normalize URLs correctly', () => {
      expect(normalizeDomain('https://www.example.com')).toBe('example.com')
      expect(normalizeDomain('http://example.com')).toBe('example.com')
      expect(normalizeDomain('example.com')).toBe('example.com')
      expect(normalizeDomain('www.example.com')).toBe('example.com')
    })

    it('should handle invalid URLs', () => {
      expect(normalizeDomain('invalid-url')).toBe('invalid-url')
      expect(normalizeDomain('')).toBe('')
    })
  })
})
