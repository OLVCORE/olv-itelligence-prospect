"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  User,
  Mail, 
  Phone, 
  Linkedin,
  Info,
  Target,
  TrendingUp,
  MessageSquare,
  Calendar,
  Award,
  Briefcase
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DecisionMaker {
  id: string
  name: string
  title: string
  department: string
  email: string
  phone: string
  linkedin: string
  score: number
  source: string
  influenceLevel: "Alto" | "Médio" | "Baixo"
  verifiedAt: string
  aiInsights?: string
  engagementStrategy?: string[]
}

interface DecisionMakersModuleProps {
  data: DecisionMaker[]
}

export function DecisionMakersModule({ data }: DecisionMakersModuleProps) {
  const getInfluenceColor = (level: string) => {
    switch (level) {
      case "Alto": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500"
    if (score >= 80) return "text-blue-500"
    if (score >= 70) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Inteligência de Pessoas e Poder
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-purple-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é Inteligência de Decisores?</p>
                      <p className="text-sm">
                        Identifica quem são as pessoas-chave que decidem, influenciam e operacionalizam 
                        compras de tecnologia na empresa. Utiliza Apollo.io, ZoomInfo, LinkedIn e outras 
                        fontes para mapear o organograma de poder.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Identificar quem contactar primeiro (CTO, CFO, COO)</li>
                        <li>Entender o fluxo de decisão e aprovação</li>
                        <li>Personalizar abordagem para cada stakeholder</li>
                        <li>Mapear influenciadores técnicos e financeiros</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Playbooks:</strong> Define estratégia de abordagem por persona</li>
                        <li><strong>Fit TOTVS:</strong> Score ponderado por qualidade dos decisores</li>
                        <li><strong>Relatórios:</strong> Seção de stakeholders e estratégia de engajamento</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                Mapeamento de decisores através de <strong>Apollo.io</strong>, <strong>ZoomInfo</strong>, 
                <strong> LinkedIn</strong> e <strong>Hunter.io</strong>. Cada decisor possui score de influência 
                e estratégia de engajamento personalizada por IA.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10">
                <Award className="h-3 w-3 mr-1" />
                {data.filter(d => d.influenceLevel === "Alto").length} Alto Impacto
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                <User className="h-3 w-3 mr-1" />
                {data.length} Decisores
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Decisores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((dm) => (
          <Card key={dm.id} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {dm.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{dm.name}</CardTitle>
                    <CardDescription className="text-slate-400">{dm.title}</CardDescription>
                    <Badge variant="outline" className="mt-1 text-xs border-slate-600 text-slate-300">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {dm.department}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`text-3xl font-bold ${getScoreColor(dm.score)}`}>
                          {dm.score}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Score de Influência</p>
                        <p className="text-sm">
                          Baseado em: cargo, departamento, rede LinkedIn, 
                          histórico de decisões e poder orçamentário.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-slate-500">Score</p>
                  <Badge className={`mt-1 ${getInfluenceColor(dm.influenceLevel)} border text-xs`}>
                    {dm.influenceLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contatos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${dm.email}`} className="hover:text-blue-400 transition-colors">
                    {dm.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${dm.phone}`} className="hover:text-blue-400 transition-colors">
                    {dm.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Linkedin className="h-4 w-4 text-slate-400" />
                  <a 
                    href={`https://${dm.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Ver perfil LinkedIn
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Target className="h-3 w-3" />
                  Fonte: {dm.source} • Verificado em {new Date(dm.verifiedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Insights de IA */}
              {dm.aiInsights && (
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Perfil e Influência
                  </p>
                  <p className="text-xs text-slate-300">{dm.aiInsights}</p>
                </div>
              )}

              {/* Estratégia de Engajamento */}
              {dm.engagementStrategy && dm.engagementStrategy.length > 0 && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Estratégia de Abordagem (IA)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="text-sm">
                            Recomendações geradas por IA baseadas no perfil, cargo e 
                            comportamento típico desta persona. Use como guia para 
                            personalizar sua abordagem comercial.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {dm.engagementStrategy.map((strategy, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  Agendar Reunião
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                  <Mail className="h-3 w-3 mr-1" />
                  Enviar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mapa de Influência */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            Mapa de Influência e Decisão
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <p className="text-sm">
                    Visualização do fluxo de decisão típico para compras de tecnologia 
                    nesta empresa, baseado nos decisores identificados.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Decisores Financeiros */}
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                <p className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Decisor Financeiro
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  Aprova orçamento e ROI
                </p>
                <div className="space-y-1">
                  {data.filter(d => d.title.includes('CFO') || d.title.includes('Financ')).map(d => (
                    <p key={d.id} className="text-xs text-slate-400">• {d.name}</p>
                  ))}
                </div>
              </div>

              {/* Decisores Técnicos */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <p className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Decisor Técnico
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  Valida solução e integração
                </p>
                <div className="space-y-1">
                  {data.filter(d => d.title.includes('CTO') || d.title.includes('TI') || d.title.includes('Tecnologia')).map(d => (
                    <p key={d.id} className="text-xs text-slate-400">• {d.name}</p>
                  ))}
                </div>
              </div>

              {/* Influenciadores */}
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <p className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Influenciadores
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  Aceleram ou bloqueiam
                </p>
                <div className="space-y-1">
                  {data.filter(d => d.influenceLevel === "Médio").map(d => (
                    <p key={d.id} className="text-xs text-slate-400">• {d.name}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Fluxo de Decisão */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="font-semibold text-slate-200 mb-3">Fluxo de Decisão Típico:</p>
              <div className="flex items-center gap-2 text-sm text-slate-300 flex-wrap">
                <span className="bg-blue-900/30 px-3 py-1 rounded">1. Decisor Técnico (CTO)</span>
                <span className="text-slate-500">→</span>
                <span className="bg-yellow-900/30 px-3 py-1 rounded">2. Influenciador (Gerente TI)</span>
                <span className="text-slate-500">→</span>
                <span className="bg-red-900/30 px-3 py-1 rounded">3. Decisor Financeiro (CFO)</span>
                <span className="text-slate-500">→</span>
                <span className="bg-emerald-900/30 px-3 py-1 rounded">4. Aprovação Final</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                💡 Dica: Engaje o decisor técnico primeiro para validação, depois apresente ROI para o financeiro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
