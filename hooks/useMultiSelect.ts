/**
 * Hook para gerenciar seleção múltipla de empresas
 * Suporte a checkbox, contador dinâmico e persistência
 */

import { useState, useCallback } from 'react'

export interface MultiSelectCompany {
  id: string
  cnpj: string
  name: string
  tradeName?: string | null
  status?: string | null
  capital?: number | null
  analyses?: any[]
}

export interface MultiSelectState {
  selectedCompanies: MultiSelectCompany[]
  isSelected: (companyId: string) => boolean
  toggleSelection: (company: MultiSelectCompany) => void
  clearSelection: () => void
  selectAll: (companies: MultiSelectCompany[]) => void
  getSelectedCount: () => number
  canCompare: () => boolean
  getComparisonData: () => MultiSelectCompany[]
}

export function useMultiSelect(): MultiSelectState {
  const [selectedCompanies, setSelectedCompanies] = useState<MultiSelectCompany[]>([])

  const isSelected = useCallback((companyId: string) => {
    return selectedCompanies.some(company => company.id === companyId)
  }, [selectedCompanies])

  const toggleSelection = useCallback((company: MultiSelectCompany) => {
    setSelectedCompanies(prev => {
      const isAlreadySelected = prev.some(c => c.id === company.id)
      
      if (isAlreadySelected) {
        // Remover da seleção
        return prev.filter(c => c.id !== company.id)
      } else {
        // Adicionar à seleção (máximo 5 empresas)
        if (prev.length >= 5) {
          console.warn('[MultiSelect] Máximo de 5 empresas para comparação')
          return prev
        }
        return [...prev, company]
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCompanies([])
  }, [])

  const selectAll = useCallback((companies: MultiSelectCompany[]) => {
    // Selecionar até 5 empresas
    const companiesToSelect = companies.slice(0, 5)
    setSelectedCompanies(companiesToSelect)
  }, [])

  const getSelectedCount = useCallback(() => {
    return selectedCompanies.length
  }, [selectedCompanies])

  const canCompare = useCallback(() => {
    return selectedCompanies.length >= 2
  }, [selectedCompanies])

  const getComparisonData = useCallback(() => {
    return selectedCompanies
  }, [selectedCompanies])

  return {
    selectedCompanies,
    isSelected,
    toggleSelection,
    clearSelection,
    selectAll,
    getSelectedCount,
    canCompare,
    getComparisonData
  }
}
