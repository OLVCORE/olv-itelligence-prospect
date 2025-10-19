"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Info, TrendingUp, Globe, Clock, Building2, Activity, Brain } from "lucide-react"

interface ScoreBreakdownProps {
  scoreTotal: number
  breakdown: {
    saudeFinanceira: { score: number; peso: number; detalhes: string }
    maturidadeDigital: { score: number; peso: number; detalhes: string }
    tempoMercado: { score: number; peso: number; detalhes: string }
    porteCapacidade: { score: number; peso: number; detalhes: string }
    atividadeRecente: { score: number; peso: number; detalhes: string }
    analiseIA: { score: number; peso: number; detalhes: string }
  }
  classificacao: string
  justificativa: string
  compact?: boolean
}

export function ScoreBreakdown({
  scoreTotal,
  breakdown,
  classificacao,
  justificativa,
  compact = false,
}: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-blue-600'
    if (score >= 40) return 'bg-amber-600'
    return 'bg-red-600'
  }

  const pillars = [
    {
      id: 'saudeFinanceira',
      label: 'Saúde Financeira',
      icon: TrendingUp,
      tooltip: 'Avalia situação cadastral, capital social e regime tributário. Empresas ativas com capital adequado recebem pontuação maior.',
      data: breakdown.saudeFinanceira,
    },
    {
      id: 'maturidadeDigital',
      label: 'Maturidade Digital',
      icon: Globe,
      tooltip: 'Mede presença online (website oficial) e visibilidade em notícias. Empresas com forte presença digital são mais acessíveis.',
      data: breakdown.maturidadeDigital,
    },
    {
      id: 'tempoMercado',
      label: 'Tempo de Mercado',
      icon: Clock,
      tooltip: 'Anos de atividade da empresa. Mais de 5 anos indica consolidação e reduz risco.',
      data: breakdown.tempoMercado,
    },
    {
      id: 'porteCapacidade',
      label: 'Porte & Capacidade',
      icon: Building2,
      tooltip: 'Porte da empresa (MEI, Micro, Pequena, Média, Grande). Portes maiores indicam maior capacidade de investimento.',
      data: breakdown.porteCapacidade,
    },
    {
      id: 'atividadeRecente',
      label: 'Atividade Recente',
      icon: Activity,
      tooltip: 'Notícias nos últimos 3 meses indicam empresa ativa e em crescimento.',
      data: breakdown.atividadeRecente,
    },
    {
      id: 'analiseIA',
      label: 'Análise IA',
      icon: Brain,
      tooltip: 'Avaliação qualitativa por Inteligência Artificial considerando contexto geral e insights não estruturados.',
      data: breakdown.analiseIA,
    },
  ]

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Score de Propensão</span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(scoreTotal)}`}>
                    {scoreTotal}
                  </span>
                  <Info className="h-4 w-4 text-slate-400 cursor-help" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">{justificativa}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Progress value={scoreTotal} className="h-2" />
        <Badge variant={scoreTotal >= 60 ? 'default' : 'secondary'} className="text-xs">
          {classificacao}
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Total com Tooltip */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Score de Propensão
                    </p>
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-xs">
                    <strong>Score de Propensão:</strong> Métrica de 0-100 que indica o potencial da empresa como cliente.
                    Calculado com base em 6 pilares ponderados: saúde financeira (30%), maturidade digital (25%), 
                    tempo de mercado (15%), porte (15%), atividade recente (10%) e análise IA (5%).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-5xl font-bold ${getScoreColor(scoreTotal)}`}>
                {scoreTotal}
              </span>
              <span className="text-2xl text-slate-400">/100</span>
            </div>
          </div>
          <Badge variant={scoreTotal >= 60 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {classificacao}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          {justificativa}
        </p>
      </div>

      {/* Breakdown dos Pilares */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          Detalhamento por Pilar
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">
                  Cada pilar contribui com um peso específico para o score final. 
                  Analise os pilares individualmente para entender os pontos fortes e fracos da empresa.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>

        {pillars.map((pillar) => {
          const Icon = pillar.icon
          const contribuicao = Math.round(pillar.data.score * pillar.data.peso)

          return (
            <TooltipProvider key={pillar.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 cursor-help hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{pillar.label}</span>
                        <span className="text-xs text-slate-500">
                          (peso {Math.round(pillar.data.peso * 100)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getScoreColor(pillar.data.score)}`}>
                          {pillar.data.score}
                        </span>
                        <span className="text-xs text-slate-400">
                          → +{contribuicao}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={pillar.data.score} 
                      className="h-1.5"
                    />
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {pillar.data.detalhes}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs font-semibold mb-1">{pillar.label}</p>
                  <p className="text-xs">{pillar.tooltip}</p>
                  <div className="mt-2 pt-2 border-t text-xs space-y-1">
                    <p><strong>Score:</strong> {pillar.data.score}/100</p>
                    <p><strong>Peso:</strong> {Math.round(pillar.data.peso * 100)}%</p>
                    <p><strong>Contribuição:</strong> +{contribuicao} pontos</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Resumo da Contribuição */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-xs">
        <p className="font-semibold mb-2">Como o score é calculado:</p>
        <div className="space-y-1 text-slate-600 dark:text-slate-400">
          {pillars.map((pillar) => {
            const contribuicao = Math.round(pillar.data.score * pillar.data.peso)
            return (
              <div key={pillar.id} className="flex justify-between">
                <span>{pillar.label}:</span>
                <span className="font-mono">
                  {pillar.data.score} × {Math.round(pillar.data.peso * 100)}% = +{contribuicao}
                </span>
              </div>
            )
          })}
          <div className="flex justify-between pt-2 border-t font-bold text-primary">
            <span>TOTAL:</span>
            <span>{scoreTotal}/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

