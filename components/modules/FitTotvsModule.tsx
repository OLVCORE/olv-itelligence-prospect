'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GaugeBar } from '@/components/ui/gauge-bar'
import { GaugePointer } from '@/components/ui/gauge-pointer'
import { SmartTooltip } from '@/components/ui/smart-tooltip'
import { EvidenceButton } from '@/components/ui/evidence-button'
import { OpportunitiesModal } from '@/components/modals/OpportunitiesModal'
import { createTotvsScanEvidence, Evidence } from '@/lib/types/evidence'
import { Loader2, RefreshCw, Target, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'

interface TotvsLiteResult {
  totvs_detected: boolean
  produtos: string[]
  confidence_score: number
  evidences: Array<{
    source: 'website' | 'cse'
    url: string
    snippet?: string
    strength: 'A' | 'B' | 'C'
  }>
  last_scanned_at: string
  lead_temperature: 'frio' | 'morno' | 'quente'
  recommendations: string[]
  pitches: {
    frio: string[]
    morno: string[]
    quente: string[]
  }
}

interface FitTotvsModuleProps {
  companyId?: string
  companyName?: string
}

export function FitTotvsModule({ companyId, companyName }: FitTotvsModuleProps) {
  const [result, setResult] = useState<TotvsLiteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null)
  const [showOpportunities, setShowOpportunities] = useState(false)

  const fetchTotvsData = async () => {
    if (!companyId) return
    
    // Guard: evitar chamadas duplicadas
    if (loading || lastFetchedId === companyId) {
      console.log('[FitTotvs] ⏭️ Scan já em andamento ou já executado para:', companyId)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('[FitTotvs] 🔍 Iniciando scan TOTVS para empresa:', companyId)
      
      const response = await fetch(`/api/technographics/totvs/scan?companyId=${companyId}`)
      const data = await response.json()

      if (data.status === 'success') {
        setResult(data.result)
        setLastFetchedId(companyId)
        console.log('[FitTotvs] ✅ Scan concluído:', data.result)
      } else {
        setError(data.message || 'Erro no scan TOTVS')
        console.error('[FitTotvs] ❌ Erro no scan:', data.message)
      }
    } catch (error: any) {
      setError('Erro ao conectar com o servidor')
      console.error('[FitTotvs] ❌ Erro na requisição:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Apenas carregar se mudar de empresa e ainda não tiver carregado
    if (companyId && companyId !== lastFetchedId) {
      const timer = setTimeout(() => {
        fetchTotvsData()
      }, 300) // Debounce de 300ms
      
      return () => clearTimeout(timer)
    }
  }, [companyId])

  const getTemperatureColor = (temp: 'frio' | 'morno' | 'quente') => {
    switch (temp) {
      case 'frio': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'morno': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'quente': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getTemperatureIcon = (temp: 'frio' | 'morno' | 'quente') => {
    switch (temp) {
      case 'frio': return '❄️'
      case 'morno': return '🌡️'
      case 'quente': return '🔥'
    }
  }

  if (!companyId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            FIT TOTVS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione uma empresa para analisar o FIT TOTVS</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            FIT TOTVS
          </div>
          {companyName && (
            <div className="text-sm text-muted-foreground">
              {companyName}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Analisando tecnografia TOTVS...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button 
              onClick={fetchTotvsData} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            {/* Status Principal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant={result.totvs_detected ? "default" : "secondary"}
                  className={`text-lg px-4 py-2 ${
                    result.totvs_detected 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {result.totvs_detected ? '✅ TOTVS DETECTADO' : '❌ SEM TOTVS'}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confiança:</span>
                  <SmartTooltip 
                    score={result.confidence_score} 
                    type="confianca"
                    customLabel="Score de Confiança"
                    customDescription={`Baseado em ${result.evidences.length} evidências encontradas`}
                  >
                    <GaugePointer 
                      value={result.confidence_score} 
                      size="sm"
                    />
                  </SmartTooltip>
                </div>
              </div>
              
              <Button 
                onClick={fetchTotvsData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Produtos Detectados */}
            {result.produtos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Produtos TOTVS Detectados:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.produtos.map((produto, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {produto}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Temperatura do Lead */}
            <div>
              <h3 className="text-sm font-medium mb-3">Temperatura do Lead:</h3>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getTemperatureColor(result.lead_temperature)}`}>
                <span className="text-2xl">{getTemperatureIcon(result.lead_temperature)}</span>
                <span className="font-medium capitalize">{result.lead_temperature}</span>
                <span className="text-sm opacity-75">
                  ({result.confidence_score < 30 ? '< 30%' : result.confidence_score < 60 ? '30-59%' : '≥ 60%'})
                </span>
              </div>
            </div>

            {/* Evidências */}
            {result.evidences.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Evidências Encontradas:</h3>
                  <EvidenceButton 
                    evidences={result.evidences.map(e => 
                      createTotvsScanEvidence({
                        url: e.url,
                        snippet: e.snippet || 'Evidência TOTVS detectada',
                        strength: e.strength,
                        source: e.source
                      })
                    )}
                    label="Ver todas"
                    variant="ghost"
                    size="sm"
                  />
                </div>
                <div className="space-y-2">
                  {result.evidences.slice(0, 3).map((evidence, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            evidence.strength === 'A' ? 'bg-green-100 text-green-700' :
                            evidence.strength === 'B' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {evidence.strength}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {evidence.source === 'website' ? '🌐 Website' : '🔍 Busca'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {evidence.snippet || 'Evidência encontrada'}
                      </p>
                      
                      <a 
                        href={evidence.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Ver fonte →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações */}
            {result.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Recomendações:</h3>
                <div className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitches por Estágio */}
            <div>
              <h3 className="text-sm font-medium mb-3">Estratégia por Estágio:</h3>
              <div className="space-y-3">
                {Object.entries(result.pitches).map(([stage, pitches]) => (
                  <div key={stage} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize">{stage}:</span>
                      <span className="text-2xl">{getTemperatureIcon(stage as any)}</span>
                    </div>
                    <ul className="space-y-1">
                      {pitches.map((pitch, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{pitch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Última análise: {new Date(result.last_scanned_at).toLocaleString('pt-BR')}</p>
              <p>Evidências analisadas: {result.evidences.length}</p>
            </div>

            {/* Ação: Analisar Oportunidades */}
            {result.totvs_detected && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setShowOpportunities(true)} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analisar Oportunidades TOTVS
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modal de Oportunidades */}
        {companyId && (
          <OpportunitiesModal
            isOpen={showOpportunities}
            onClose={() => setShowOpportunities(false)}
            companyId={companyId}
            companyName={companyName || 'Empresa'}
            vendor="TOTVS"
          />
        )}

        {!result && !loading && !error && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Clique em "Analisar TOTVS" para iniciar a detecção
            </p>
            <Button onClick={fetchTotvsData} disabled={loading}>
              <Target className="h-4 w-4 mr-2" />
              Analisar TOTVS
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
