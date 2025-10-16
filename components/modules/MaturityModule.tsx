"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Gauge,
  Info,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Database,
  Cloud,
  Cpu,
  Users
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MaturityDimension {
  name: string
  score: number
  description: string
  status: string
  recommendations: string[]
}

interface MaturityData {
  overall: number
  dimensions: MaturityDimension[]
  aiInsights: string
  evolutionTrend: string
  industryComparison: string
}

interface MaturityModuleProps {
  data: MaturityData
}

export function MaturityModule({ data }: MaturityModuleProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 55) return "text-yellow-500"
    return "text-orange-500"
  }

  const getStatusIcon = (score: number) => {
    if (score >= 85) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    if (score >= 70) return <Zap className="h-5 w-5 text-blue-500" />
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  const getDimensionIcon = (name: string) => {
    switch (name) {
      case "Infraestrutura Tecnológica": return <Cloud />
      case "Sistemas e Aplicações": return <Cpu />
      case "Dados e Analytics": return <Database />
      case "Segurança e Compliance": return <Shield />
      case "Automação de Processos": return <Zap />
      case "Cultura Digital": return <Users />
      default: return <Gauge />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Maturidade Digital e Automação
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-indigo-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é Maturidade Digital?</p>
                      <p className="text-sm">
                        Mede o nível de digitalização da empresa em 6 pilares críticos. 
                        Score de 0-100 calculado através de média ponderada baseada no 
                        stack tecnológico detectado, processos automatizados e cultura.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Identificar gaps e oportunidades de modernização</li>
                        <li>Calcular fit e prontidão para novas soluções</li>
                        <li>Priorizar prospects por maturidade</li>
                        <li>Personalizar proposta baseada no estágio atual</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Tech Stack:</strong> Base principal do cálculo</li>
                        <li><strong>Fit TOTVS:</strong> Peso de 20% no score final</li>
                        <li><strong>Benchmark:</strong> Comparação setorial de maturidade</li>
                        <li><strong>Relatórios:</strong> Roadmap de transformação digital</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                Análise de maturidade em <strong>6 dimensões</strong>: Infraestrutura, Sistemas, Dados, 
                Segurança, Automação e Cultura. Score baseado em <strong>evidências reais</strong> do 
                stack tecnológico e processos identificados.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={`border-indigo-500 ${getScoreColor(data.overall)} bg-indigo-500/10`}>
                <Gauge className="h-3 w-3 mr-1" />
                Score: {data.overall}/100
              </Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                {data.evolutionTrend}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Geral com Gauge Visual */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              {/* Gauge visual simulado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(data.overall)}`}>
                    {data.overall}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">Maturidade Digital</p>
                </div>
              </div>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(51, 65, 85)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={data.overall >= 85 ? "rgb(16, 185, 129)" : data.overall >= 70 ? "rgb(59, 130, 246)" : "rgb(234, 179, 8)"}
                  strokeWidth="8"
                  strokeDasharray={`${(data.overall / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 w-full">
              <div className="text-center">
                <p className="text-xs text-slate-400">Nível</p>
                <p className="text-sm font-semibold text-white">
                  {data.overall >= 85 ? "Excelente" : data.overall >= 70 ? "Muito Bom" : data.overall >= 55 ? "Bom" : "Em Desenvolvimento"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Tendência</p>
                <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {data.evolutionTrend}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">vs. Setor</p>
                <p className="text-sm font-semibold text-blue-400">{data.industryComparison}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6 Dimensões da Maturidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.dimensions.map((dimension, idx) => (
          <Card key={idx} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-900/30 border border-indigo-700/30 flex items-center justify-center text-indigo-400">
                    {getDimensionIcon(dimension.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {dimension.name}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{dimension.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{dimension.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusIcon(dimension.score)}
                  <div className={`text-2xl font-bold ${getScoreColor(dimension.score)} mt-1`}>
                    {dimension.score}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Score</span>
                  <span>{dimension.score}/100</span>
                </div>
                <Progress value={dimension.score} />
              </div>

              {/* Status */}
              <div>
                <Badge className={`${
                  dimension.status === "Excelente" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  dimension.status === "Muito Bom" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  dimension.status === "Bom" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                  "bg-orange-500/20 text-orange-400 border-orange-500/30"
                } border`}>
                  {dimension.status}
                </Badge>
              </div>

              {/* Recomendações */}
              {dimension.recommendations.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-400 mb-2">Recomendações:</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {dimension.recommendations.map((rec, recIdx) => (
                      <li key={recIdx} className="flex items-start gap-1">
                        <span className="text-blue-400">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights de IA e Roadmap */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            Análise Preditiva e Roadmap de Transformação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-slate-300 leading-relaxed">{data.aiInsights}</p>
          </div>

          {/* Roadmap Recomendado */}
          <div>
            <p className="font-semibold text-white mb-3">Roadmap Recomendado por IA:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Curto Prazo (0-6 meses)</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Implementar RPA em processos manuais • Expandir uso de Power BI • 
                    Capacitar equipe em automação
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Médio Prazo (6-12 meses)</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Integrar sistemas legados • Implementar Data Governance • 
                    Modernizar aplicações críticas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Longo Prazo (12-24 meses)</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Expandir uso de IA/ML • Implementar Zero Trust • 
                    Cultura de experimentação e inovação
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Como interpretar o Score de Maturidade?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold mb-2">Níveis de Maturidade:</p>
              <ul className="space-y-1">
                <li><strong className="text-emerald-500">85-100:</strong> Excelente - Líder digital</li>
                <li><strong className="text-blue-500">70-84:</strong> Muito Bom - Maturidade alta</li>
                <li><strong className="text-yellow-500">55-69:</strong> Bom - Em desenvolvimento</li>
                <li><strong className="text-orange-500">&lt;55:</strong> Regular - Oportunidades significativas</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Cálculo do Score:</p>
              <ul className="space-y-1">
                <li>• Infraestrutura (20%): Cloud, servidores, rede</li>
                <li>• Sistemas (20%): ERP, CRM, BI</li>
                <li>• Dados (15%): Analytics, ML, Data Lake</li>
                <li>• Segurança (20%): SOC, compliance, certificações</li>
                <li>• Automação (15%): RPA, workflows</li>
                <li>• Cultura (10%): Capacitação, inovação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

