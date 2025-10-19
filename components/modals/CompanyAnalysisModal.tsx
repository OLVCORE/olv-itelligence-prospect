"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScoreBreakdown } from "@/components/scoring/ScoreBreakdown"
import { Loader2, TrendingUp, AlertTriangle, Lightbulb, Calendar } from "lucide-react"

interface Analysis {
  id: string
  score: number
  scoreIA?: number
  scoreRegras?: number
  breakdown?: any
  classificacao?: string
  justification?: string
  insights: string[]
  redFlags: string[]
  createdAt: string
  updatedAt: string
}

interface CompanyAnalysisModalProps {
  isOpen: boolean
  companyId: string | null
  companyName: string
  onClose: () => void
}

export function CompanyAnalysisModal({
  isOpen,
  companyId,
  companyName,
  onClose,
}: CompanyAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && companyId) {
      loadAnalysis()
    }
  }, [isOpen, companyId])

  const loadAnalysis = async () => {
    if (!companyId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/last-analysis?companyId=${companyId}`)
      const data = await response.json()

      if (data.status === 'success') {
        setAnalysis(data.analysis)
      } else if (data.status === 'empty') {
        setError('Nenhuma análise disponível para esta empresa ainda.')
      } else {
        setError(data.message || 'Erro ao carregar análise')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default', label: 'Excelente' }
    if (score >= 60) return { variant: 'default', label: 'Bom' }
    if (score >= 40) return { variant: 'secondary', label: 'Regular' }
    return { variant: 'destructive', label: 'Baixo' }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Análise Completa
          </DialogTitle>
          <DialogDescription>
            {companyName}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">
              Carregando análise...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-amber-800 dark:text-amber-200">
              {error}
            </p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Score com Breakdown Detalhado */}
            {analysis.breakdown ? (
              <ScoreBreakdown
                scoreTotal={analysis.score}
                breakdown={analysis.breakdown}
                classificacao={analysis.classificacao || getScoreBadge(analysis.score).label}
                justificativa={analysis.justification || 'Análise baseada em múltiplos critérios objetivos'}
                compact={false}
              />
            ) : (
              /* Score Simples (fallback para análises antigas) */
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Score de Propensão
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}
                      </span>
                      <span className="text-2xl text-slate-400">/100</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge {...getScoreBadge(analysis.score) as any}>
                      {getScoreBadge(analysis.score).label}
                    </Badge>
                    <TrendingUp className={`h-8 w-8 ${getScoreColor(analysis.score)}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {analysis.insights && analysis.insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Insights Estratégicos
                </h3>
                <ul className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags */}
            {analysis.redFlags && analysis.redFlags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Pontos de Atenção
                </h3>
                <ul className="space-y-2">
                  {analysis.redFlags.map((flag, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {flag}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Criada: {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Atualizada: {new Date(analysis.updatedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

