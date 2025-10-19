"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Award,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BenchmarkItem {
  id: string
  metric: string
  companyValue: number | string
  industryAverage: number | string
  topQuartile: number | string
  percentile: number
  trend: "up" | "down" | "stable"
  aiInsights: string
}

interface BenchmarkModuleProps {
  companyId?: string
  companyName?: string
}

export function BenchmarkModule({ companyId, companyName }: BenchmarkModuleProps) {
  // TODO: Buscar dados reais de benchmark (Google Trends, market data) - Sprint 2
  const data: BenchmarkItem[] = [] // Vazio até engine de benchmark estar pronta
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-slate-400" />
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return "text-emerald-500"
    if (percentile >= 60) return "text-blue-500"
    if (percentile >= 40) return "text-yellow-500"
    return "text-orange-500"
  }

  const getPerformanceLabel = (percentile: number) => {
    if (percentile >= 90) return "Top 10%"
    if (percentile >= 75) return "Top 25%"
    if (percentile >= 50) return "Acima da Média"
    if (percentile >= 25) return "Abaixo da Média"
    return "Bottom 25%"
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-orange-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Inteligência de Mercado e Benchmarking
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-orange-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é Benchmark Comparativo?</p>
                      <p className="text-sm">
                        Compara a empresa com a média do setor e com os melhores performers 
                        (top 25%) em métricas críticas: maturidade digital, investimento em TI, 
                        automação, cloud e segurança.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Identificar gaps competitivos da empresa</li>
                        <li>Demonstrar posicionamento no mercado</li>
                        <li>Justificar investimentos (catching up vs líder)</li>
                        <li>Criar senso de urgência na proposta comercial</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Maturidade:</strong> Compara score com setor</li>
                        <li><strong>Tech Stack:</strong> Adoção de tecnologias vs mercado</li>
                        <li><strong>Relatórios:</strong> Seção de análise competitiva</li>
                        <li><strong>Playbooks:</strong> Argumentos de venda baseados em gaps</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                Análise comparativa usando <strong>Google Trends</strong>, <strong>dados públicos</strong> e 
                <strong> inteligência setorial</strong>. Cada métrica mostra posicionamento percentil 
                da empresa vs. setor.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {data?.filter(d => d.percentile >= 75).length || 0} Acima da Média
              </Badge>
              <Badge variant="outline" className="border-orange-500 text-orange-400 bg-orange-500/10">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {data?.filter(d => d.percentile < 50).length || 0} Gaps Identificados
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas de Benchmark */}
      <div className="grid grid-cols-1 gap-4">
        {data.map((item) => (
          <Card key={item.id} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    {item.metric}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="text-sm">{item.aiInsights}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend)}
                  <Badge className={`${
                    item.percentile >= 80 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    item.percentile >= 60 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                    item.percentile >= 40 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                    "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  } border`}>
                    {getPerformanceLabel(item.percentile)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comparação Visual */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Empresa</p>
                  <p className={`text-2xl font-bold ${getPercentileColor(item.percentile)}`}>
                    {typeof item.companyValue === 'number' && item.companyValue < 100 
                      ? `${item.companyValue}${item.metric.includes('%') || item.metric.includes('Investimento') ? '%' : ''}`
                      : item.companyValue}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Média do Setor</p>
                  <p className="text-2xl font-bold text-slate-300">
                    {typeof item.industryAverage === 'number' && item.industryAverage < 100 
                      ? `${item.industryAverage}${item.metric.includes('%') || item.metric.includes('Investimento') ? '%' : ''}`
                      : item.industryAverage}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Top 25%</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {typeof item.topQuartile === 'number' && item.topQuartile < 100 
                      ? `${item.topQuartile}${item.metric.includes('%') || item.metric.includes('Investimento') ? '%' : ''}`
                      : item.topQuartile}
                  </p>
                </div>
              </div>

              {/* Progress Bar com Percentil */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Posição no Mercado</span>
                  <span className={getPercentileColor(item.percentile)}>
                    Percentil {item.percentile}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={item.percentile} />
                  {/* Marcadores de referência */}
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-yellow-500">Média (50%)</span>
                    <span className="text-blue-500">Top 25%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Insights de IA */}
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">{item.aiInsights}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise Competitiva Geral */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Análise Competitiva e Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pontos Fortes */}
          <div>
            <p className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Pontos Fortes (Acima da Média)
            </p>
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
              <ul className="text-sm text-slate-300 space-y-1">
                {data?.filter(d => d.percentile >= 50).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>
                      <strong>{item.metric}:</strong> {item.percentile}º percentil - 
                      {item.percentile >= 90 ? " Líder de mercado" : 
                       item.percentile >= 75 ? " Posicionamento forte" : 
                       " Acima da média setorial"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gaps e Oportunidades */}
          {data.some(d => d.percentile < 50) && (
            <div>
              <p className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Gaps e Oportunidades (Abaixo da Média)
              </p>
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-3">
                <ul className="text-sm text-slate-300 space-y-1">
                  {data?.filter(d => d.percentile < 50).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400">⚠</span>
                      <span>
                        <strong>{item.metric}:</strong> {item.percentile}º percentil - 
                        Oportunidade de modernização e catching up com mercado
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Recomendações Estratégicas */}
          <div>
            <p className="font-semibold text-blue-400 mb-2">Recomendações Estratégicas (IA):</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-1">Prioridade 1: Manter Liderança</p>
                <p className="text-xs text-slate-400">
                  Investir continuamente nas áreas onde já é líder para manter vantagem competitiva
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-1">Prioridade 2: Fechar Gaps</p>
                <p className="text-xs text-slate-400">
                  Modernizar áreas abaixo da média para evitar desvantagem competitiva
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-1">Argumento de Venda</p>
                <p className="text-xs text-slate-400">
                  Usar gaps como justificativa para investimento urgente em modernização
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-1">ROI Demonstrável</p>
                <p className="text-xs text-slate-400">
                  Mostrar ganhos de eficiência e competitividade ao alcançar top 25%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Como interpretar o Benchmark?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold mb-2">Percentis:</p>
              <ul className="space-y-1">
                <li><strong className="text-emerald-500">90+:</strong> Top 10% - Líder de mercado</li>
                <li><strong className="text-blue-500">75-89:</strong> Top 25% - Posição forte</li>
                <li><strong className="text-yellow-500">50-74:</strong> Acima da média</li>
                <li><strong className="text-orange-500">&lt;50:</strong> Abaixo da média - Oportunidade</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Fontes de Dados:</p>
              <ul className="space-y-1">
                <li>• Google Trends: Adoção de tecnologias</li>
                <li>• Dados públicos: Relatórios setoriais</li>
                <li>• Pesquisas de mercado: Gartner, IDC</li>
                <li>• Base interna: Histórico de clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

