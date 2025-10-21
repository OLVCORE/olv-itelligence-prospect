'use client'

import { CheckCircle, Clock, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AnalysisStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress?: number
  message?: string
  latency?: number
}

interface AnalysisProgressProps {
  steps: AnalysisStep[]
  onRetry?: (stepId: string) => void
}

export function AnalysisProgress({ steps, onRetry }: AnalysisProgressProps) {
  const totalSteps = steps.length
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="pt-6 space-y-4">
        {/* Progresso geral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium dark:text-white">
              Progresso Geral
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {completedSteps} de {totalSteps} concluídos
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Lista de etapas */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-3 p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {/* Ícone de status */}
              <div className="mt-0.5">
                {step.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {step.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {step.status === 'pending' && (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium dark:text-white truncate">
                    {step.name}
                  </h4>
                  <Badge
                    variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'running' ? 'secondary' :
                      step.status === 'error' ? 'destructive' :
                      'outline'
                    }
                    className="ml-2"
                  >
                    {step.status === 'completed' && '✓ Concluído'}
                    {step.status === 'running' && 'Executando...'}
                    {step.status === 'error' && '✗ Erro'}
                    {step.status === 'pending' && 'Aguardando'}
                  </Badge>
                </div>

                {/* Mensagem */}
                {step.message && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {step.message}
                  </p>
                )}

                {/* Progresso individual */}
                {step.status === 'running' && step.progress !== undefined && (
                  <Progress value={step.progress} className="h-1 mb-2" />
                )}

                {/* Latência */}
                {step.latency !== undefined && step.status === 'completed' && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    ⚡ {step.latency}ms
                  </p>
                )}

                {/* Botão retry */}
                {step.status === 'error' && onRetry && (
                  <button
                    onClick={() => onRetry(step.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

