'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Target,
  DollarSign,
  Calendar,
  Zap,
  Shield,
  Database,
  Cog,
  Users,
  BarChart3
} from 'lucide-react'

interface MaturityScores {
  infrastructure: number
  systems: number
  data: number
  security: number
  automation: number
  culture: number
  overall: number
}

interface VendorFitRecommendation {
  product: string
  rationale: string
  confidence: number
  estimatedROI: number
  migrationComplexity: 'Low' | 'Medium' | 'High'
  timeline: string
}

interface VendorFit {
  recommendations: VendorFitRecommendation[]
  totalROI: number
  migrationPath: string[]
  competitiveAdvantage: string[]
}

interface MaturityData {
  scores: MaturityScores
  vendorFit: VendorFit
  summary: {
    overallScore: number
    maturityLevel: string
    totalRecommendations: number
    estimatedTotalROI: number
    migrationPath: string[]
  }
  lastAnalyzed?: string
}

interface MaturityModuleProps {
  companyId: string | null
}

export function MaturityModule({ companyId }: MaturityModuleProps) {
  const [maturityData, setMaturityData] = useState<MaturityData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null)

  useEffect(() => {
    if (companyId) {
      loadMaturityData()
    }
  }, [companyId])

  const loadMaturityData = async () => {
    if (!companyId) return
    
    try {
      const response = await fetch(`/api/maturity?companyId=${companyId}&vendor=TOTVS`)
      const result = await response.json()
      
      if (result.success && result.maturity) {
        setMaturityData(result.maturity)
        setLastAnalyzed(result.maturity.lastAnalyzed)
        console.log('[Maturity Module] ✅ Dados carregados:', result.maturity.summary)
      }
    } catch (error) {
      console.error('Erro ao carregar maturidade:', error)
    }
  }

  const analyzeMaturity = async () => {
    if (!companyId) return
    
    setIsAnalyzing(true)
    try {
      // Primeiro buscar tech stack atual
      const techStackResponse = await fetch('/api/tech-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })
      
      const techStackResult = await techStackResponse.json()
      
      if (techStackResult.success) {
        // Agora calcular maturidade
        const maturityResponse = await fetch('/api/maturity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default-project',
            companyId,
            vendor: 'TOTVS',
            detectedStack: techStackResult.techStack,
            sources: {
              builtwith: techStackResult.summary?.sources?.builtwith,
              similartech: techStackResult.summary?.sources?.similartech,
              dns: techStackResult.summary?.sources?.dns,
              jobs: techStackResult.summary?.sources?.jobs,
              google: techStackResult.summary?.sources?.google
            }
          })
        })

        const maturityResult = await maturityResponse.json()
        
        if (maturityResult.success) {
          setMaturityData(maturityResult.maturity)
          setLastAnalyzed(new Date().toISOString())
          console.log('[Maturity Module] ✅ Análise concluída:', maturityResult.maturity.summary)
        }
      }
    } catch (error) {
      console.error('Erro ao analisar maturidade:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100'
    if (score >= 60) return 'bg-blue-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'Low': return <CheckCircle className="h-4 w-4" />
      case 'Medium': return <Clock className="h-4 w-4" />
      case 'High': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!companyId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Maturidade Digital
          </CardTitle>
          <CardDescription>
            Análise de maturidade digital e recomendações de vendor fit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Selecione uma empresa para analisar sua maturidade digital
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
                <BarChart3 className="h-5 w-5" />
                Maturidade Digital
              </CardTitle>
              <CardDescription>
                Análise de maturidade digital e recomendações de vendor fit
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastAnalyzed && (
                <Badge variant="outline" className="text-xs">
                  Última análise: {new Date(lastAnalyzed).toLocaleDateString('pt-BR')}
                </Badge>
              )}
              <Button 
                onClick={analyzeMaturity} 
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
                    <Zap className="h-4 w-4" />
                    Analisar Maturidade
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {maturityData ? (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Score Geral de Maturidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(maturityData.scores.overall)} mb-4`}>
                    <span className={`text-3xl font-bold ${getScoreColor(maturityData.scores.overall)}`}>
                      {maturityData.scores.overall}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Score Geral</h3>
                  <Badge variant="outline" className="text-sm">
                    {maturityData.summary.maturityLevel}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                    <DollarSign className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">ROI Estimado</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(maturityData.summary.estimatedTotalROI)}
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 mb-4">
                    <TrendingUp className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Recomendações</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {maturityData.summary.totalRecommendations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada por Dimensão</CardTitle>
              <CardDescription>
                Avaliação em 6 dimensões críticas da maturidade digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Infraestrutura */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cog className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Infraestrutura</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.infrastructure)}`}>
                      {maturityData.scores.infrastructure}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.infrastructure} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Cloud, CDN, DevOps, Monitoramento
                  </p>
                </div>

                {/* Sistemas */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Sistemas</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.systems)}`}>
                      {maturityData.scores.systems}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.systems} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    ERP, CRM, BI, Integrações
                  </p>
                </div>

                {/* Dados */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Dados</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.data)}`}>
                      {maturityData.scores.data}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.data} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Analytics, Governança, Qualidade
                  </p>
                </div>

                {/* Segurança */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Segurança</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.security)}`}>
                      {maturityData.scores.security}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.security} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    SSL, Firewall, Identity Management
                  </p>
                </div>

                {/* Automação */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Automação</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.automation)}`}>
                      {maturityData.scores.automation}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.automation} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    RPA, Workflow, BPM
                  </p>
                </div>

                {/* Cultura */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">Cultura</span>
                    <Badge variant="outline" className={`ml-auto ${getScoreColor(maturityData.scores.culture)}`}>
                      {maturityData.scores.culture}
                    </Badge>
                  </div>
                  <Progress value={maturityData.scores.culture} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Ferramentas Digitais, Inovação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Fit Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recomendações TOTVS/OLV
              </CardTitle>
              <CardDescription>
                Sugestões de produtos e serviços baseadas na análise de maturidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maturityData.vendorFit.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{rec.product}</h4>
                        <p className="text-muted-foreground mb-3">{rec.rationale}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span>Confiança: {rec.confidence}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>ROI: {formatCurrency(rec.estimatedROI)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span>{rec.timeline}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getComplexityIcon(rec.migrationComplexity)}
                            <Badge className={getComplexityColor(rec.migrationComplexity)}>
                              {rec.migrationComplexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {maturityData.vendorFit.recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma recomendação específica encontrada para esta empresa.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Migration Path */}
          {maturityData.vendorFit.migrationPath.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Caminho de Migração Sugerido
                </CardTitle>
                <CardDescription>
                  Sequência recomendada de implementação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maturityData.vendorFit.migrationPath.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitive Advantages */}
          {maturityData.vendorFit.competitiveAdvantage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Vantagens Competitivas Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {maturityData.vendorFit.competitiveAdvantage.map((advantage, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{advantage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma análise de maturidade encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Execute a análise de maturidade digital para ver recomendações personalizadas
            </p>
            <Button onClick={analyzeMaturity} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analisando...' : 'Iniciar Análise'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}