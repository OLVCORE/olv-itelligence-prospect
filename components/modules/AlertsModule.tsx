"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell,
  Info,
  AlertCircle,
  TrendingUp,
  Users,
  RefreshCw,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Alert {
  id: string
  type: string
  title: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  company: string
  timestamp: string
  status: "pending" | "acknowledged" | "resolved"
  aiGenerated: boolean
  actionable: boolean
  suggestedActions?: string[]
}

interface AlertsModuleProps {
  companyId?: string
  companyName?: string
}

export function AlertsModule({ companyId, companyName }: AlertsModuleProps) {
  // TODO: Buscar alertas reais quando engine estiver pronta (Sprint 2)
  const data: Alert[] = [] // Vazio até engine de alertas 24/7 estar pronta
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tech_change": return <Zap className="h-5 w-5 text-purple-400" />
      case "contact_change": return <Users className="h-5 w-5 text-blue-400" />
      case "opportunity": return <Target className="h-5 w-5 text-emerald-400" />
      case "revalidation": return <RefreshCw className="h-5 w-5 text-orange-400" />
      case "benchmark_update": return <TrendingUp className="h-5 w-5 text-indigo-400" />
      default: return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "acknowledged": return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tech_change: "Mudança Tecnológica",
      contact_change: "Mudança de Contato",
      opportunity: "Nova Oportunidade",
      revalidation: "Revalidação Necessária",
      benchmark_update: "Atualização de Benchmark"
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-red-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Monitoramento e Revalidação Contínua
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-red-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que são Alertas Inteligentes?</p>
                      <p className="text-sm">
                        Sistema de monitoramento contínuo que detecta mudanças críticas: 
                        novas tecnologias, troca de decisores, contratos vencendo, 
                        oportunidades de mercado. IA analisa e prioriza automaticamente.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Detectar mudanças antes dos concorrentes</li>
                        <li>Identificar janelas de oportunidade</li>
                        <li>Manter dados sempre atualizados</li>
                        <li>Automatizar follow-ups e revalidações</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Tech Stack:</strong> Alertas de novas tecnologias</li>
                        <li><strong>Decisores:</strong> Mudanças de cargo/empresa</li>
                        <li><strong>Benchmark:</strong> Mudanças de posição</li>
                        <li><strong>Playbooks:</strong> Aciona ações automáticas</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                <strong>Monitoramento 24/7</strong> com <strong>IA embarcada</strong> que detecta 
                mudanças em <strong>tempo real</strong>: tecnologias, decisores, oportunidades 
                e riscos. Sistema gera <strong>ações sugeridas</strong> automaticamente.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {data?.filter(a => a.status === "pending").length || 0} Pendentes
              </Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <Zap className="h-3 w-3 mr-1" />
                {data?.filter(a => a.aiGenerated).length || 0} IA
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {data?.map((alert) => (
          <Card 
            key={alert.id} 
            className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all ${
              alert.status === "pending" ? "border-l-4 border-l-red-500" : ""
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                {/* Ícone do Tipo */}
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(alert.type)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getPriorityColor(alert.priority)} border text-xs`}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {getTypeLabel(alert.type)}
                        </Badge>
                        {alert.aiGenerated && (
                          <Badge variant="outline" className="border-purple-500 text-purple-400 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-white text-lg">{alert.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <span className="text-xs text-slate-500">
                        {new Date(alert.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Target className="h-4 w-4" />
                    {alert.company}
                  </div>

                  {/* Ações Sugeridas */}
                  {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Ações Sugeridas pela IA:
                      </p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {alert.suggestedActions?.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    {alert.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Tomar Ação
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Reconhecer
                        </Button>
                      </>
                    )}
                    {alert.status === "acknowledged" && (
                      <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolver
                      </Button>
                    )}
                    {alert.status === "resolved" && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolvido
                      </Badge>
                    )}
                    <Button size="sm" variant="ghost" className="text-slate-400">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total de Alertas</p>
                <p className="text-2xl font-bold text-white">{data.length}</p>
              </div>
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Pendentes</p>
                <p className="text-2xl font-bold text-red-400">
                  {data?.filter(a => a.status === "pending").length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Resolvidos</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {data?.filter(a => a.status === "resolved").length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Gerados por IA</p>
                <p className="text-2xl font-bold text-purple-400">
                  {data?.filter(a => a.aiGenerated).length || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legenda */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Tipos de Alertas e Prioridades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold mb-2">Tipos de Alertas:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <strong>Mudança Tecnológica:</strong> Nova tech detectada
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <strong>Mudança de Contato:</strong> Decisor mudou de cargo
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <strong>Oportunidade:</strong> Janela de venda identificada
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Níveis de Prioridade:</p>
              <ul className="space-y-1">
                <li><strong className="text-red-400">Critical:</strong> Ação imediata necessária</li>
                <li><strong className="text-orange-400">High:</strong> Ação em 24-48h</li>
                <li><strong className="text-yellow-400">Medium:</strong> Ação em 1 semana</li>
                <li><strong className="text-blue-400">Low:</strong> Monitorar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

