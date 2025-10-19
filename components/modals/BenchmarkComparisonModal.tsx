'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GaugeBar } from '@/components/ui/gauge-bar'
import { GaugePointer } from '@/components/ui/gauge-pointer'
import { SmartTooltip } from '@/components/ui/smart-tooltip'
import { 
  X, 
  Download, 
  TrendingUp, 
  Target, 
  Building2, 
  DollarSign,
  BarChart3,
  Users,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { MultiSelectCompany } from '@/hooks/useMultiSelect'

interface BenchmarkComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  companies: MultiSelectCompany[]
}

export function BenchmarkComparisonModal({ 
  isOpen, 
  onClose, 
  companies 
}: BenchmarkComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tech-stack' | 'maturity' | 'fit-totvs'>('overview')

  // Dados mock para demonstração - serão substituídos por dados reais
  const getMockData = (company: MultiSelectCompany) => ({
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    capital: company.capital || Math.floor(Math.random() * 10000) + 1000,
    analyses: company.analyses?.length || Math.floor(Math.random() * 5),
    techStack: {
      total: Math.floor(Math.random() * 15) + 5,
      confirmed: Math.floor(Math.random() * 10) + 3,
      confidence: Math.floor(Math.random() * 30) + 70
    },
    maturity: {
      overall: Math.floor(Math.random() * 40) + 60,
      governance: Math.floor(Math.random() * 40) + 60,
      processes: Math.floor(Math.random() * 40) + 60,
      technology: Math.floor(Math.random() * 40) + 60,
      people: Math.floor(Math.random() * 40) + 60,
      culture: Math.floor(Math.random() * 40) + 60
    },
    fitTotvs: {
      detected: Math.random() > 0.5,
      products: Math.random() > 0.5 ? ['Protheus', 'RM'] : ['Fluig'],
      confidence: Math.floor(Math.random() * 40) + 60,
      temperature: Math.random() > 0.6 ? 'quente' : Math.random() > 0.3 ? 'morno' : 'frio'
    }
  })

  const exportToCSV = () => {
    const headers = ['Empresa', 'CNPJ', 'Score', 'Capital', 'Análises', 'Tech Stack', 'Maturidade', 'Fit TOTVS']
    const rows = companies.map(company => {
      const data = getMockData(company)
      return [
        company.name || company.tradeName || 'N/A',
        company.cnpj,
        data.score,
        `R$ ${data.capital.toLocaleString()}k`,
        data.analyses,
        data.techStack.total,
        data.maturity.overall,
        data.fitTotvs.detected ? 'Sim' : 'Não'
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-comparacao-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'frio': return '❄️'
      case 'morno': return '🌡️'
      case 'quente': return '🔥'
      default: return '🌡️'
    }
  }

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'frio': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'morno': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'quente': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Benchmark Comparativo</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {companies.length} empresas
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs de Navegação */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'tech-stack', label: 'Tech Stack', icon: Layers },
            { id: 'maturity', label: 'Maturidade', icon: TrendingUp },
            { id: 'fit-totvs', label: 'Fit TOTVS', icon: Target }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {companies.map((company, index) => {
                  const data = getMockData(company)
                  return (
                    <Card key={company.id} className="relative">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          {company.name || company.tradeName}
                          <Badge variant="outline" className="ml-auto">
                            #{index + 1}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600">CNPJ: {company.cnpj}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Score Geral</p>
                            <SmartTooltip 
                              score={data.score} 
                              type="maturidade"
                              customLabel="Score de Maturidade"
                              customDescription={`Baseado em análise completa da empresa`}
                            >
                              <GaugePointer value={data.score} size="sm" />
                            </SmartTooltip>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Capital Social</p>
                            <p className="text-lg font-bold text-green-600">
                              R$ {data.capital.toLocaleString()}k
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Análises</p>
                            <p className="text-lg font-bold text-purple-600">{data.analyses}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tech Stack</p>
                            <p className="text-lg font-bold text-blue-600">{data.techStack.total}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Ranking Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Ranking Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {companies
                      .map(company => ({ company, data: getMockData(company) }))
                      .sort((a, b) => b.data.score - a.data.score)
                      .map(({ company, data }, index) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{company.name || company.tradeName}</p>
                              <p className="text-sm text-gray-600">{company.cnpj}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <SmartTooltip 
                              score={data.score} 
                              type="maturidade"
                              customLabel="Score de Maturidade"
                            >
                              <GaugeBar value={data.score} size="sm" />
                            </SmartTooltip>
                            <span className="font-bold text-lg">{data.score}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tech-stack' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Comparação Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Empresa</th>
                        <th className="text-center p-3 font-medium">Total</th>
                        <th className="text-center p-3 font-medium">Confirmados</th>
                        <th className="text-center p-3 font-medium">Confiança</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map(company => {
                        const data = getMockData(company)
                        return (
                          <tr key={company.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{company.name || company.tradeName}</p>
                                <p className="text-sm text-gray-600">{company.cnpj}</p>
                              </div>
                            </td>
                            <td className="text-center p-3">
                              <Badge variant="outline">{data.techStack.total}</Badge>
                            </td>
                            <td className="text-center p-3">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {data.techStack.confirmed}
                              </Badge>
                            </td>
                            <td className="text-center p-3">
                              <SmartTooltip 
                                score={data.techStack.confidence} 
                                type="confianca"
                                customLabel="Confiança Tech Stack"
                              >
                                <GaugeBar value={data.techStack.confidence} size="sm" />
                              </SmartTooltip>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'fit-totvs' && (
            <div className="space-y-4">
              {companies.map(company => {
                const data = getMockData(company)
                return (
                  <Card key={company.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{company.name || company.tradeName}</h3>
                          <p className="text-sm text-gray-600">{company.cnpj}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">TOTVS Detectado</p>
                            <Badge variant={data.fitTotvs.detected ? "default" : "secondary"}
                              className={data.fitTotvs.detected ? 'bg-green-600' : 'bg-gray-200'}>
                              {data.fitTotvs.detected ? '✅ Sim' : '❌ Não'}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Temperatura</p>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border ${getTemperatureColor(data.fitTotvs.temperature)}`}>
                              <span>{getTemperatureIcon(data.fitTotvs.temperature)}</span>
                              <span className="capitalize font-medium">{data.fitTotvs.temperature}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Confiança</p>
                            <SmartTooltip 
                              score={data.fitTotvs.confidence} 
                              type="confianca"
                              customLabel="Confiança FIT TOTVS"
                            >
                              <GaugePointer value={data.fitTotvs.confidence} size="sm" />
                            </SmartTooltip>
                          </div>
                        </div>
                      </div>
                      
                      {data.fitTotvs.detected && data.fitTotvs.products.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Produtos Detectados:</p>
                          <div className="flex gap-2">
                            {data.fitTotvs.products.map((product, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
