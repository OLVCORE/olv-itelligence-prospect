"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen,
  Info,
  Play,
  CheckCircle2,
  Clock,
  Users,
  Mail,
  Phone,
  FileText,
  Target,
  TrendingUp
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PlaybookStep {
  step: number
  action: string
  owner: string
  timeline: string
  template: string | null
  kpi: string
}

interface Playbook {
  id: string
  name: string
  stage: string
  duration: string
  steps: PlaybookStep[]
  successRate: number
  aiInsights: string
}

interface PlaybooksModuleProps {
  data: Playbook[]
}

export function PlaybooksModule({ data }: PlaybooksModuleProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Prospecção": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Qualificação": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Negociação": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
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
                Playbooks de Abordagem e Engajamento
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-indigo-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que são Playbooks?</p>
                      <p className="text-sm">
                        Sequências pré-definidas e testadas de ações comerciais para cada etapa 
                        do funil: prospecção, qualificação e fechamento. Incluem templates, 
                        timelines e KPIs de sucesso.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Padronizar abordagem comercial</li>
                        <li>Aumentar taxa de conversão</li>
                        <li>Acelerar ciclo de vendas</li>
                        <li>Treinar novos vendedores rapidamente</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Decisores:</strong> Define quem contactar em cada etapa</li>
                        <li><strong>Fit TOTVS:</strong> Personaliza playbook por fit</li>
                        <li><strong>Relatórios:</strong> Documentação de abordagem</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                <strong>Sequências de vendas</strong> testadas e validadas com <strong>templates prontos</strong>, 
                <strong> timelines definidos</strong> e <strong>KPIs de sucesso</strong>. Baseadas em análise 
                de milhares de vendas bem-sucedidas.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                Taxa média: 65%
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                <BookOpen className="h-3 w-3 mr-1" />
                {data.length} Playbooks
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Playbooks */}
      {data.map((playbook) => (
        <Card key={playbook.id} className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl text-white">{playbook.name}</CardTitle>
                  <Badge className={`${getStageColor(playbook.stage)} border`}>
                    {playbook.stage}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {playbook.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {playbook.steps.length} etapas
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Taxa de sucesso: {playbook.successRate}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-500">{playbook.successRate}%</div>
                <p className="text-xs text-slate-500">Conversão</p>
                <Progress value={playbook.successRate} className="mt-2 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Steps do Playbook */}
            <div className="space-y-3">
              {playbook.steps.map((step) => (
                <div key={step.step} className="flex items-start gap-3 bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{step.action}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Responsável:</span> {step.owner}
                      </div>
                      <div>
                        <span className="text-slate-500">Timeline:</span> {step.timeline}
                      </div>
                      <div>
                        <span className="text-slate-500">KPI:</span> {step.kpi}
                      </div>
                      {step.template && (
                        <div>
                          <Button size="sm" variant="ghost" className="h-6 text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Ver Template
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Insights de IA */}
            <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Insights e Dicas de Sucesso
              </p>
              <p className="text-xs text-slate-300">{playbook.aiInsights}</p>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-600">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Playbook
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <FileText className="h-4 w-4 mr-2" />
                Ver Templates
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200">
                Personalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Dicas de Uso */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Como usar os Playbooks?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold mb-2">1. Selecione o Playbook</p>
              <p className="text-xs text-slate-400">
                Escolha baseado na etapa do funil e perfil do prospect
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">2. Personalize</p>
              <p className="text-xs text-slate-400">
                Adapte templates com dados do prospect (nome, cargo, empresa)
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">3. Execute e Monitore</p>
              <p className="text-xs text-slate-400">
                Siga timeline, monitore KPIs e ajuste conforme necessário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

