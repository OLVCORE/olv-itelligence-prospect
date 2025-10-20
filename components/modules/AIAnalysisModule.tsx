'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Users,
  Building2,
  BarChart3,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'

interface ICPProfile {
  vertical: string
  subVertical?: string
  tier: 'A' | 'B' | 'C'
  score: number
  features: any
  rationale: string[]
}

interface PropensityResult {
  score: number
  timeframe: number
  confidence: number
  rationale: string[]
  nextActions: string[]
}

interface CadenceInfo {
  id: string
  name: string
  vertical: string
  persona: string
  expectedDuration: number
}

interface NextBestAction {
  action: string
  channel: string
  template: string
  timing: string
  rationale: string
}

interface AIAnalysisData {
  icpProfile: ICPProfile
  propensityResults: Record<string, PropensityResult>
  selectedCadence: CadenceInfo | null
  nextBestAction: NextBestAction
  summary: {
    bestOffer: string
    bestScore: number
    recommendedAction: string
    confidence: number
  }
}

interface AIAnalysisModuleProps {
  companyId: string | null
}

export default function AIAnalysisModule({ companyId }: AIAnalysisModuleProps) {
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null)

  useEffect(() => {
    if (companyId) {
      loadAnalysisData()
    }
  }, [companyId])

  const loadAnalysisData = async () => {
    if (!companyId) return
    
    try {
      const response = await fetch(`/api/ai-analysis?companyId=${companyId}`)
      const result = await response.json()
      
      if (result.success && result.analysis.hasAnalysis) {
        // Converter dados do banco para formato esperado
        const icpProfile = result.analysis.icpProfile
        const propensityScores = result.analysis.propensityScores
        
        if (icpProfile && propensityScores.length > 0) {
          const propensityResults: Record<string, PropensityResult> = {}
          propensityScores.forEach((ps: any) => {
            propensityResults[ps.offer] = {
              score: ps.score,
              timeframe: ps.timeframe,
              confidence: 75, // Placeholder
              rationale: ['Análise baseada em dados históricos'],
              nextActions: ['Aguardar próxima ação recomendada']
            }
          })

          const bestOffer = Object.entries(propensityResults)
            .sort(([,a], [,b]) => b.score - a.score)[0]?.[0]

          setAnalysisData({
            icpProfile: {
              ...icpProfile,
              features: icpProfile.features
            },
            propensityResults,
            selectedCadence: null, // Placeholder
            nextBestAction: {
              action: 'email',
              channel: 'email',
              template: 'generic',
              timing: 'immediate',
              rationale: 'Baseado no perfil ICP e propensão'
            },
            summary: {
              bestOffer: bestOffer || '',
              bestScore: bestOffer ? propensityResults[bestOffer].score : 0,
              recommendedAction: 'email',
              confidence: 75
            }
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar análise IA:', error)
    }
  }

  const runAIAnalysis = async () => {
    if (!companyId) return
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId,
          offers: ['TOTVS_Protheus', 'TOTVS_Fluig', 'OLV_Consultoria'],
          persona: 'CEO'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAnalysisData(result.analysis)
        setLastAnalyzed(new Date().toISOString())
        console.log('[AI Analysis Module] ✅ Análise concluída:', result.analysis.summary)
      }
    } catch (error) {
      console.error('Erro ao executar análise IA:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'bg-emerald-100 text-emerald-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'A': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'B': return <Target className="h-4 w-4 text-blue-600" />
      case 'C': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'linkedin': return <Users className="h-4 w-4" />
      case 'wait': return <Clock className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case 'immediate': return 'text-red-600'
      case 'tomorrow': return 'text-orange-600'
      case 'next_week': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (!companyId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análise de IA
          </CardTitle>
          <CardDescription>
            ICP, Propensão e Next Best Action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Selecione uma empresa para análise de IA
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise de IA
              </CardTitle>
              <CardDescription>
                ICP, Propensão e Next Best Action
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastAnalyzed && (
                <Badge variant="outline" className="text-xs">
                  Última análise: {new Date(lastAnalyzed).toLocaleDateString('pt-BR')}
                </Badge>
              )}
              <Button 
                onClick={runAIAnalysis} 
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Executar Análise IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analysisData ? (
        <>
          {/* ICP Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ICP Profile
              </CardTitle>
              <CardDescription>
                Ideal Customer Profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                    <span className="text-3xl font-bold text-blue-600">
                      {analysisData.icpProfile.score}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ICP Score</h3>
                  <Badge className={getTierColor(analysisData.icpProfile.tier)}>
                    Tier {analysisData.icpProfile.tier}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 mb-4">
                    <Building2 className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Vertical</h3>
                  <p className="text-lg font-semibold text-purple-600">
                    {analysisData.icpProfile.vertical}
                  </p>
                  {analysisData.icpProfile.subVertical && (
                    <p className="text-sm text-muted-foreground">
                      {analysisData.icpProfile.subVertical}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                    <TrendingUp className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Confiança</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {analysisData.summary.confidence}%
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <h4 className="font-semibold">Rationale:</h4>
                {analysisData.icpProfile.rationale.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getTierIcon(analysisData.icpProfile.tier)}
                    <span className="text-sm">{reason}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Propensity Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Propensity Scores
              </CardTitle>
              <CardDescription>
                Probabilidade de conversão por oferta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysisData.propensityResults).map(([offer, propensity]) => (
                  <div key={offer} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{offer.replace('_', ' ')}</h4>
                      <Badge variant="outline" className="text-xs">
                        {propensity.score}%
                      </Badge>
                    </div>
                    
                    <Progress value={propensity.score} className="h-2" />
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{propensity.timeframe} dias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        <span>Confiança: {propensity.confidence}%</span>
                      </div>
                    </div>

                    {offer === analysisData.summary.bestOffer && (
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        Melhor Oferta
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Best Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Next Best Action
              </CardTitle>
              <CardDescription>
                Próxima ação recomendada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getActionIcon(analysisData.nextBestAction.action)}
                    <div>
                      <h4 className="font-semibold capitalize">
                        {analysisData.nextBestAction.action}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisData.nextBestAction.channel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <h4 className="font-semibold">Timing</h4>
                      <p className={`text-sm font-medium ${getTimingColor(analysisData.nextBestAction.timing)}`}>
                        {analysisData.nextBestAction.timing === 'immediate' ? 'Imediato' :
                         analysisData.nextBestAction.timing === 'tomorrow' ? 'Amanhã' :
                         analysisData.nextBestAction.timing === 'next_week' ? 'Próxima semana' :
                         analysisData.nextBestAction.timing}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Template</h4>
                    <Badge variant="outline">
                      {analysisData.nextBestAction.template}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Rationale</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysisData.nextBestAction.rationale}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Próximas Ações</h4>
                    <div className="space-y-1">
                      {analysisData.propensityResults[analysisData.summary.bestOffer]?.nextActions.slice(0, 3).map((action, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cadência Selecionada */}
          {analysisData.selectedCadence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Cadência Selecionada
                </CardTitle>
                <CardDescription>
                  Sequência de ações recomendada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{analysisData.selectedCadence.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisData.selectedCadence.vertical} • {analysisData.selectedCadence.persona}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {analysisData.selectedCadence.expectedDuration} dias
                    </Badge>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      Esta cadência foi selecionada baseada no perfil ICP {analysisData.icpProfile.tier} 
                      e propensão de {analysisData.summary.bestScore}% para {analysisData.summary.bestOffer}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma análise de IA encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Execute a análise de IA para obter ICP, propensão e recomendações
            </p>
            <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analisando...' : 'Iniciar Análise IA'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
