import { SafeArray, SafeObject, SafeString, SafeNumber, hasValidData, isEmpty } from '../defensive'

describe('Defensive Programming Utilities', () => {
  describe('SafeArray', () => {
    it('retorna array vazio para undefined', () => {
      expect(SafeArray(undefined)).toEqual([])
    })

    it('retorna array vazio para null', () => {
      expect(SafeArray(null)).toEqual([])
    })

    it('retorna o array original se válido', () => {
      const arr = [1, 2, 3]
      expect(SafeArray(arr)).toBe(arr)
    })
  })

  describe('SafeObject', () => {
    it('retorna fallback para undefined', () => {
      const fallback = { id: 0 }
      expect(SafeObject(undefined, fallback)).toBe(fallback)
    })

    it('retorna objeto original se válido', () => {
      const obj = { id: 1 }
      const fallback = { id: 0 }
      expect(SafeObject(obj, fallback)).toBe(obj)
    })
  })

  describe('SafeString', () => {
    it('retorna string vazia para undefined', () => {
      expect(SafeString(undefined)).toBe('')
    })

    it('retorna fallback customizado', () => {
      expect(SafeString(null, 'N/A')).toBe('N/A')
    })
  })

  describe('SafeNumber', () => {
    it('retorna 0 para undefined', () => {
      expect(SafeNumber(undefined)).toBe(0)
    })

    it('retorna fallback para NaN', () => {
      expect(SafeNumber(NaN, -1)).toBe(-1)
    })

    it('retorna número válido', () => {
      expect(SafeNumber(42)).toBe(42)
    })
  })

  describe('hasValidData', () => {
    it('retorna false para array vazio', () => {
      expect(hasValidData([])).toBe(false)
    })

    it('retorna false para undefined', () => {
      expect(hasValidData(undefined)).toBe(false)
    })

    it('retorna true para array com dados', () => {
      expect(hasValidData([1, 2])).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('detecta valores vazios corretamente', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('detecta valores não-vazios corretamente', () => {
      expect(isEmpty('texto')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })
  })
})

