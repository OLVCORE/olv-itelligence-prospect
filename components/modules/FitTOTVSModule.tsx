"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Target,
  Info,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  CheckCircle2,
  Package,
  ArrowRight
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FitFactor {
  name: string
  score: number
  weight: number
  description: string
}

interface Opportunity {
  product: string
  fit: number
  priority: "Alta" | "Média" | "Baixa"
  reason: string
}

interface FitTOTVSData {
  overall: number
  propensity: number
  priority: number
  ticketEstimate: string
  roi: number
  paybackMonths: number
  factors: FitFactor[]
  opportunities: Opportunity[]
  aiInsights: string
}

interface FitTOTVSModuleProps {
  data: FitTOTVSData
}

export function FitTOTVSModule({ data }: FitTOTVSModuleProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 55) return "text-yellow-500"
    return "text-orange-500"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Média": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Fit TOTVS/OLV e Modelagem de Negócio
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-purple-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é Fit TOTVS?</p>
                      <p className="text-sm">
                        Modelo preditivo que calcula a propensão de conversão e prioridade 
                        de abordagem baseado em 6 fatores: porte, maturidade, stack, decisores, 
                        timing e fit com portfólio TOTVS.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Priorizar prospects com maior probabilidade de conversão</li>
                        <li>Estimar ticket médio e ROI da venda</li>
                        <li>Identificar produtos TOTVS mais adequados</li>
                        <li>Calcular payback e justificar investimento</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Todos os módulos:</strong> Consolida dados de todos</li>
                        <li><strong>Playbooks:</strong> Define estratégia de abordagem</li>
                        <li><strong>Relatórios:</strong> Seção executiva de recomendação</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                <strong>Modelo preditivo</strong> que combina <strong>maturidade digital</strong>, 
                <strong> capacidade financeira</strong>, <strong>stack atual</strong> e 
                <strong> decisores mapeados</strong> para calcular fit e ROI esperado.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={`border-purple-500 ${getScoreColor(data.overall)} bg-purple-500/10`}>
                <Target className="h-3 w-3 mr-1" />
                Fit: {data.overall}%
              </Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                ROI: {data.roi}%
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs Principais de Fit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 border-purple-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Fit Geral
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Score consolidado de todos os fatores</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(data.overall)}`}>
              {data.overall}%
            </div>
            <Progress value={data.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-blue-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Propensão
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Probabilidade de conversão (0-100%)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(data.propensity)}`}>
              {data.propensity}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {data.propensity >= 75 ? "Muito Alta" : data.propensity >= 60 ? "Alta" : "Moderada"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-slate-800/50 border-red-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Prioridade
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Urgência de abordagem (0-100)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(data.priority)}`}>
              {data.priority}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {data.priority >= 90 ? "Crítica" : data.priority >= 75 ? "Alta" : "Normal"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/50 to-slate-800/50 border-emerald-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Ticket Estimado
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Valor estimado do contrato</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-white">
              {data.ticketEstimate}
            </div>
            <p className="text-xs text-slate-400 mt-1">Range esperado</p>
          </CardContent>
        </Card>
      </div>

      {/* Fatores de Fit */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Fatores de Análise Preditiva
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-sm">
                    Cada fator tem um peso no cálculo final do fit. 
                    Score final = Σ (score × peso) de todos os fatores.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.factors.map((factor, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">{factor.name}</span>
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    Peso: {(factor.weight * 100).toFixed(0)}%
                  </Badge>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(factor.score)}`}>
                  {factor.score}
                </span>
              </div>
              <Progress value={factor.score} />
              <p className="text-xs text-slate-400">{factor.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Oportunidades TOTVS */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            Produtos TOTVS Recomendados
          </CardTitle>
          <CardDescription className="text-slate-300">
            Portfólio TOTVS com maior fit baseado no perfil da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.opportunities.map((opp, idx) => (
            <Card key={idx} className="bg-slate-700/30 border-slate-600/50">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{opp.product}</h3>
                    <p className="text-sm text-slate-400 mt-1">{opp.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(opp.fit)}`}>
                      {opp.fit}%
                    </div>
                    <Badge className={`mt-1 ${getPriorityColor(opp.priority)} border`}>
                      {opp.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-200">
                    Criar Proposta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Análise de ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Análise de ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">ROI Estimado</p>
                <p className="text-3xl font-bold text-emerald-500">{data.roi}%</p>
                <p className="text-xs text-slate-500 mt-1">Em 24 meses</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Payback</p>
                <p className="text-3xl font-bold text-blue-500">{data.paybackMonths}</p>
                <p className="text-xs text-slate-500 mt-1">meses</p>
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-400 mb-2">Benefícios Esperados:</p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Redução de custos operacionais: 20-30%</li>
                <li>• Aumento de produtividade: 35-45%</li>
                <li>• Melhoria em processos: 40-50%</li>
                <li>• Integração de sistemas: 60-70%</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Timeline de Implementação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Fase 1: Discovery (1-2 meses)</p>
                  <p className="text-xs text-slate-400">Levantamento detalhado e POC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Fase 2: Implementação (3-6 meses)</p>
                  <p className="text-xs text-slate-400">Deploy, integração e treinamento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Fase 3: Go-Live (1 mês)</p>
                  <p className="text-xs text-slate-400">Produção e estabilização</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights de IA */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            Recomendação Executiva (IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed mb-4">{data.aiInsights}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-xs font-semibold text-emerald-400 mb-1">Cliente Ideal</p>
              <p className="text-xs text-slate-300">
                Alto fit em múltiplas dimensões. Probabilidade de conversão: 75-85%
              </p>
            </div>
            <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-3">
              <Award className="h-5 w-5 text-blue-400 mb-2" />
              <p className="text-xs font-semibold text-blue-400 mb-1">Abordagem</p>
              <p className="text-xs text-slate-300">
                Consultiva com foco em BPM/automação como porta de entrada
              </p>
            </div>
            <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-3">
              <TrendingUp className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-xs font-semibold text-purple-400 mb-1">Timing</p>
              <p className="text-xs text-slate-300">
                Janela de oportunidade favorável. Abordar nos próximos 30 dias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
