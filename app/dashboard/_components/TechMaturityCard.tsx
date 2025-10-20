"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, TrendingUp, Sparkles } from 'lucide-react'

interface TechMaturityCardProps {
  companyId: string
  enableTechMaturity?: boolean  // Feature flag
}

interface MaturityData {
  scores: {
    infra: number
    systems: number
    data: number
    security: number
    automation: number
    culture: number
    overall: number
  }
  fit: {
    vendor: string
    score: number
    products: Array<{ name: string; category: string; rationale: string }>
    dealSize: string
    rationale: string[]
  }
}

export function TechMaturityCard({ companyId, enableTechMaturity = true }: TechMaturityCardProps) {
  const [maturityData, setMaturityData] = useState<MaturityData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Feature flag: se desabilitado, não renderiza
  if (!enableTechMaturity) {
    return null
  }

  useEffect(() => {
    loadMaturityData()
  }, [companyId])

  const loadMaturityData = async () => {
    try {
      // Buscar dados existentes (se houver)
      const response = await fetch(`/api/maturity?companyId=${companyId}&vendor=TOTVS`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.maturity) {
          setMaturityData({
            scores: typeof data.maturity.scores === 'string' 
              ? JSON.parse(data.maturity.scores) 
              : data.maturity.scores,
            fit: typeof data.maturity.fitRecommendations === 'string'
              ? JSON.parse(data.maturity.fitRecommendations)
              : data.maturity.fitRecommendations
          })
        }
      }
    } catch (err) {
      console.error('[TechMaturityCard] Erro ao carregar:', err)
    }
  }

  const analyzeMaturity = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('[TechMaturityCard] 📊 Analisando maturidade para:', companyId)

      // Buscar tech signals do banco para montar detectedStack
      const signalsResponse = await fetch(`/api/tech-stack?companyId=${companyId}`)
      const signalsData = await signalsResponse.json()

      const detectedStack = {
        erp: signalsData.stacks?.filter((s: any) => s.category === 'ERP') || [],
        crm: signalsData.stacks?.filter((s: any) => s.category === 'CRM') || [],
        cloud: signalsData.stacks?.filter((s: any) => s.category === 'Cloud') || [],
        bi: signalsData.stacks?.filter((s: any) => s.category === 'BI') || [],
        db: signalsData.stacks?.filter((s: any) => s.category === 'Database') || [],
        integrations: signalsData.stacks?.filter((s: any) => s.category === 'Integration') || [],
        security: signalsData.stacks?.filter((s: any) => s.category === 'Security') || []
      }

      // Chamar API de cálculo
      const response = await fetch('/api/maturity/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          vendor: 'TOTVS',
          detectedStack,
          sources: {
            techStack: signalsData.stacks?.length > 0
          }
        })
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.error?.message || 'Erro ao calcular maturidade')
      }

      setMaturityData({
        scores: data.scores,
        fit: data.fit
      })

      console.log('[TechMaturityCard] ✅ Análise concluída')
    } catch (err: any) {
      console.error('[TechMaturityCard] Erro:', err)
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!maturityData) {
    return (
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Maturidade Digital & Tech Fit
          </CardTitle>
          <CardDescription>
            Análise de 6 dimensões + recomendação de produtos TOTVS/OLV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-purple-500/50 mx-auto mb-4" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Análise de maturidade ainda não realizada
            </p>
            <Button
              onClick={analyzeMaturity}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analisar Maturidade
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { scores, fit } = maturityData

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Maturidade Digital
          </div>
          <Badge className="bg-purple-500 text-white text-lg px-4 py-1">
            {scores.overall}%
          </Badge>
        </CardTitle>
        <CardDescription>
          Análise de 6 dimensões + {fit.vendor} Fit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 6 Dimensões */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Infraestrutura</span>
              <span className="font-semibold">{scores.infra}%</span>
            </div>
            <Progress value={scores.infra} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Sistemas</span>
              <span className="font-semibold">{scores.systems}%</span>
            </div>
            <Progress value={scores.systems} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Dados</span>
              <span className="font-semibold">{scores.data}%</span>
            </div>
            <Progress value={scores.data} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Segurança</span>
              <span className="font-semibold">{scores.security}%</span>
            </div>
            <Progress value={scores.security} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Automação</span>
              <span className="font-semibold">{scores.automation}%</span>
            </div>
            <Progress value={scores.automation} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">Cultura</span>
              <span className="font-semibold">{scores.culture}%</span>
            </div>
            <Progress value={scores.culture} className="h-2" />
          </div>
        </div>

        {/* Vendor Fit */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">{fit.vendor} Fit</h4>
            <Badge variant="outline" className="text-lg">
              {fit.score}%
            </Badge>
          </div>

          {/* Produtos Recomendados */}
          {fit.products && fit.products.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Produtos Recomendados:
              </p>
              {fit.products.map((product, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{product.name}</span>
                  <p className="text-xs text-slate-500">{product.rationale}</p>
                </div>
              ))}
            </div>
          )}

          {/* Deal Size */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">Deal Estimado</p>
            <p className="text-lg font-bold text-green-600">{fit.dealSize}</p>
          </div>

          {/* Rationale */}
          {fit.rationale && fit.rationale.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Justificativa:
              </p>
              <ul className="text-xs space-y-1">
                {fit.rationale.map((item, idx) => (
                  <li key={idx} className="text-slate-600 dark:text-slate-400">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Botão Re-analisar */}
        <Button
          onClick={analyzeMaturity}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Re-analisando...
            </>
          ) : (
            'Re-analisar'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

