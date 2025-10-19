/**
 * OpportunitiesModal - Análise de Oportunidades Comerciais
 * Integra com Vendor Match (OLV/TOTVS/CUSTOM)
 * Conforme Prompt Master: score, products, decisor, next steps
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GaugePointer } from '@/components/ui/gauge-pointer'
import { SmartTooltip } from '@/components/ui/smart-tooltip'
import { formatCurrency } from '@/lib/utils/format'
import {
  Loader2,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  FileText,
  RefreshCw,
  X
} from 'lucide-react'

interface OpportunitiesModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  companyName: string
  vendor: 'OLV' | 'TOTVS' | 'BOTH'
}

interface VendorMatchResult {
  companyName: string
  cnpj: string
  overallScore: number
  buyingMoment: 'IDEAL' | 'BOM' | 'REGULAR' | 'BAIXO'
  matches: Array<{
    product: {
      id: string
      name: string
      vendor: string
      category: string
      description: string
      averageTicket: number
    }
    fitScore: number
    reasoning: string[]
    evidence: string[]
    pitch: string
    estimatedBudget: number
    priority: 'ALTA' | 'MEDIA' | 'BAIXA'
  }>
  topRecommendation: any
  nextSteps: string[]
  decisionMaker?: {
    name: string
    role: string
    approach: string
  }
}

export function OpportunitiesModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  vendor
}: OpportunitiesModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VendorMatchResult | null>(null)

  const fetchOpportunities = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('[OpportunitiesModal] 🎯 Buscando oportunidades:', { companyId, vendor })
      
      // Buscar dados da empresa primeiro
      const companyRes = await fetch(`/api/companies/${companyId}`)
      const companyData = await companyRes.json()

      if (!companyData) {
        throw new Error('Empresa não encontrada')
      }

      // Chamar API de vendor match
      const response = await fetch('/api/opportunities/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: {
            cnpj: companyData.cnpj,
            name: companyData.name,
            tradeName: companyData.tradeName,
            size: companyData.size,
            capital: companyData.capital,
            // ... outros campos necessários
          },
          options: {
            vendorFilter: vendor !== 'BOTH' ? vendor : undefined
          }
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        setResult(data.data)
        console.log('[OpportunitiesModal] ✅ Oportunidades carregadas:', data.data)
      } else {
        setError(data.message || 'Erro ao carregar oportunidades')
      }
    } catch (error: any) {
      console.error('[OpportunitiesModal] ❌ Erro:', error.message)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchOpportunities()
    }
  }, [isOpen, companyId, vendor])

  const getBuyingMomentBadge = (moment: string) => {
    switch (moment) {
      case 'IDEAL':
        return <Badge className="bg-green-600 text-white">🔥 Momento Ideal</Badge>
      case 'BOM':
        return <Badge className="bg-blue-600 text-white">👍 Bom Momento</Badge>
      case 'REGULAR':
        return <Badge className="bg-yellow-600 text-white">⚡ Regular</Badge>
      case 'BAIXO':
        return <Badge className="bg-gray-600 text-white">❄️ Baixo</Badge>
      default:
        return <Badge variant="secondary">{moment}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return <Badge className="bg-red-600 text-white">🚀 Alta</Badge>
      case 'MEDIA':
        return <Badge className="bg-orange-600 text-white">⚡ Média</Badge>
      case 'BAIXA':
        return <Badge className="bg-gray-600 text-white">📋 Baixa</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-purple-600" />
              <span>Análise de Oportunidades</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {companyName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchOpportunities} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Reprocessar
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Análise de fit comercial e oportunidades de venda para {companyName}
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-sm text-muted-foreground">
              Analisando fit comercial...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOpportunities} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Overall Score e Buying Moment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Score de Propensão Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <SmartTooltip 
                    score={result.overallScore} 
                    type="propensao"
                    customLabel="Score Geral"
                    customDescription="Média ponderada dos top 3 produtos com melhor fit"
                  >
                    <GaugePointer value={result.overallScore} size="lg" />
                  </SmartTooltip>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Momento de Compra</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  {getBuyingMomentBadge(result.buyingMoment)}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {result.buyingMoment === 'IDEAL' && 'Empresa em momento perfeito para abordagem'}
                    {result.buyingMoment === 'BOM' && 'Bom momento para iniciar contato'}
                    {result.buyingMoment === 'REGULAR' && 'Momento neutro, qualificar melhor'}
                    {result.buyingMoment === 'BAIXO' && 'Aguardar sinais mais fortes'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Produtos Recomendados */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Produtos Recomendados ({result.matches.length})
              </h3>
              
              <div className="space-y-4">
                {result.matches.map((match, index) => (
                  <Card key={match.product.id} className={index === 0 ? 'border-purple-600 ring-2 ring-purple-600/20' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-base">{match.product.name}</CardTitle>
                            {getPriorityBadge(match.priority)}
                            {index === 0 && (
                              <Badge className="bg-purple-600 text-white">
                                🏆 Top Recomendação
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{match.product.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-muted-foreground">
                              Categoria: <strong>{match.product.category}</strong>
                            </span>
                            <span className="text-muted-foreground">
                              Ticket Médio: <strong>{formatCurrency(match.product.averageTicket)}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Fit Score</p>
                          <div className="text-3xl font-bold text-purple-600">{match.fitScore}</div>
                          <p className="text-xs text-muted-foreground">/100</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Pitch */}
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4" />
                          Pitch Personalizado
                        </p>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          {match.pitch}
                        </p>
                      </div>

                      {/* Reasoning */}
                      {match.reasoning.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Por que este produto?</p>
                          <ul className="space-y-1">
                            {match.reasoning.map((reason, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Evidence */}
                      {match.evidence.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Evidências:</p>
                          <div className="space-y-1">
                            {match.evidence.map((ev, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                {ev}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Decision Maker */}
            {result.decisionMaker && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Decisor Identificado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nome</p>
                      <p className="font-semibold">{result.decisionMaker.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cargo</p>
                      <p className="font-semibold">{result.decisionMaker.role}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Abordagem Sugerida</p>
                    <p className="text-sm">{result.decisionMaker.approach}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {result.nextSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Fechar
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => {
                  // TODO: Abrir PreviewModal
                  console.log('[OpportunitiesModal] Ir para Pré-Relatório')
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ir para Pré-Relatório
                </Button>
                <Button onClick={fetchOpportunities} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Reprocessar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Clique em "Reprocessar" para analisar oportunidades
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

