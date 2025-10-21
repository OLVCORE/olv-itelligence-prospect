'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, X, ExternalLink } from 'lucide-react'
import { formatCNPJ, formatCurrency } from '@/lib/utils/format'

interface CompanySelectorProps {
  company: {
    id: string
    cnpj?: string
    name: string
    tradeName?: string
    capital?: number
    status?: string
    porte?: string
    city?: string
    state?: string
  }
  onClear: () => void
}

export function CompanySelector({ company, onClear }: CompanySelectorProps) {
  return (
    <Card className="sticky top-20 z-30 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-700 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {company.tradeName || company.name}
                </h3>
                <Badge variant={company.status === 'ATIVA' ? 'default' : 'secondary'}>
                  {company.status || 'ATIVA'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                {company.cnpj && (
                  <span>
                    <strong>CNPJ:</strong> {formatCNPJ(company.cnpj)}
                  </span>
                )}
                {company.capital !== undefined && (
                  <span>
                    <strong>Capital:</strong> {formatCurrency(company.capital)}
                  </span>
                )}
                {company.porte && (
                  <span>
                    <strong>Porte:</strong> {company.porte}
                  </span>
                )}
                {(company.city || company.state) && (
                  <span>
                    <strong>Local:</strong> {[company.city, company.state].filter(Boolean).join(' - ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Seleção
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ℹ️ <strong>Empresa selecionada:</strong> Todos os módulos abaixo analisarão esta empresa automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

