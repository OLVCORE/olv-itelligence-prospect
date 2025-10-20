"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DecisionMakerCard } from "@/components/DecisionMakerCard"
import {
  Building2,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react"

interface CompanyIntelligenceModalProps {
  isOpen: boolean
  onClose: () => void
  companyId?: string
  companyName: string
  domain?: string
  cnpj?: string
}

export function CompanyIntelligenceModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  domain,
  cnpj
}: CompanyIntelligenceModalProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/company/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyName,
          domain,
          cnpj
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        console.log('[Company Intelligence] ✅ Análise completa:', data.stats)
      } else {
        console.error('[Company Intelligence] ❌ Erro:', data.error)
        alert('Erro na análise: ' + data.error)
      }
    } catch (error) {
      console.error('[Company Intelligence] ❌ Erro:', error)
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            Company Intelligence B2B
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Análise profunda via Sales Navigator + Enriquecimento de Contatos
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="py-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-purple-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold dark:text-white mb-2">{companyName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Clique abaixo para iniciar análise completa via Sales Navigator
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Iniciar Análise B2B
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 dark:bg-slate-800">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="decision-makers">👥 Decisores ({result.decisionMakers?.length || 0})</TabsTrigger>
              <TabsTrigger value="buying-signals">🎯 Sinais ({result.buyingSignals?.length || 0})</TabsTrigger>
              <TabsTrigger value="vendor-fit">⚡ Fit Vendor</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Decisores</p>
                  <p className="text-2xl font-bold dark:text-white">{result.stats.decisionMakersFound}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Contatos Enriquecidos</p>
                  <p className="text-2xl font-bold dark:text-white">{result.stats.contactsEnriched}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sinais de Compra</p>
                  <p className="text-2xl font-bold dark:text-white">{result.stats.buyingSignalsDetected}</p>
                </Card>
              </div>

              <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                <h4 className="font-semibold dark:text-white mb-4">Informações da Empresa</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Setor</p>
                    <p className="font-medium dark:text-white">{result.company.industry}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Tamanho</p>
                    <p className="font-medium dark:text-white">{result.company.size}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Funcionários</p>
                    <p className="font-medium dark:text-white">{result.company.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Fundada em</p>
                    <p className="font-medium dark:text-white">{result.company.yearFounded || 'N/A'}</p>
                  </div>
                </div>
                {result.company.specialties && result.company.specialties.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.company.specialties.map((spec: string, i: number) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-400">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* TAB 2: DECISION MAKERS */}
            <TabsContent value="decision-makers" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.decisionMakers.map((dm: any, i: number) => (
                  <DecisionMakerCard
                    key={i}
                    decisionMaker={dm}
                    onOutreach={(channel) => {
                      console.log(`[Outreach] 📧 Iniciando ${channel} para ${dm.name}`)
                      // TODO: Registrar outreach history
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: BUYING SIGNALS */}
            <TabsContent value="buying-signals" className="space-y-4 mt-6">
              {result.buyingSignals.map((signal: any, i: number) => (
                <Card key={i} className="p-4 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.strength === 'very_strong' ? 'bg-red-500/20' :
                      signal.strength === 'strong' ? 'bg-orange-500/20' :
                      signal.strength === 'medium' ? 'bg-yellow-500/20' : 'bg-slate-500/20'
                    }`}>
                      <Target className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold dark:text-white">{signal.description}</h4>
                        <Badge className={
                          signal.strength === 'very_strong' ? 'bg-red-500/20 text-red-400' :
                          signal.strength === 'strong' ? 'bg-orange-500/20 text-orange-400' :
                          signal.strength === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {signal.strength}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Fonte: {signal.source} • {new Date(signal.detectedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* TAB 4: VENDOR FIT */}
            <TabsContent value="vendor-fit" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TOTVS Fit */}
                <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold dark:text-white">TOTVS Fit</h3>
                    <div className="text-3xl font-bold text-blue-500">
                      {result.vendorFit.totvs.fitScore}%
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${result.vendorFit.totvs.fitScore}%` }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Produtos Recomendados:</p>
                      <div className="space-y-1">
                        {result.vendorFit.totvs.recommendedProducts.map((product: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {product}
                          </div>
                        ))}
                      </div>
                    </div>
                    {result.vendorFit.totvs.estimatedDealSize && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deal Estimado:</p>
                        <p className="text-lg font-bold text-green-500">
                          R$ {(result.vendorFit.totvs.estimatedDealSize.min / 1000).toFixed(0)}k - {(result.vendorFit.totvs.estimatedDealSize.max / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* OLV Fit */}
                <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold dark:text-white">OLV Fit</h3>
                    <div className="text-3xl font-bold text-purple-500">
                      {result.vendorFit.olv.fitScore}%
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                      style={{ width: `${result.vendorFit.olv.fitScore}%` }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Serviços Recomendados:</p>
                      <div className="space-y-1">
                        {result.vendorFit.olv.recommendedServices.map((service: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm dark:text-gray-300">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                    {result.vendorFit.olv.estimatedDealSize && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deal Estimado:</p>
                        <p className="text-lg font-bold text-green-500">
                          R$ {(result.vendorFit.olv.estimatedDealSize.min / 1000).toFixed(0)}k - {(result.vendorFit.olv.estimatedDealSize.max / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

