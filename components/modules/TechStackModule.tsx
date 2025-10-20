import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FitTotvsModule } from "@/components/modules/FitTotvsModule"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Info,
  Shield,
  Zap,
  TrendingUp,
  RefreshCw,
  Play
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TechStackItem {
  id: string
  category: string
  product: string
  vendor: string
  status: "Confirmado" | "Indeterminado" | "Em Avaliação"
  confidence: number
  evidence: string[]
  source: string
  firstDetected: string
  lastValidated: string
  aiInsights?: string
  recommendations?: string[]
}

interface TechStackModuleProps {
  companyId?: string
  companyName?: string
  company?: any
  data?: TechStackItem[]
  isLoading?: boolean
}

export function TechStackModule({ companyId, company, data = [], companyName = "Empresa", isLoading = false }: TechStackModuleProps) {
  const [techStackData, setTechStackData] = useState<TechStackItem[]>(data)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null)

  // Carregar tech stack existente
  useEffect(() => {
    if (companyId) {
      loadTechStack()
    }
  }, [companyId])

  const loadTechStack = async () => {
    if (!companyId) return
    
    try {
      const response = await fetch(`/api/tech-stack?companyId=${companyId}`)
      const result = await response.json()
      
      if (result.success) {
        setTechStackData(result.techStack)
        setLastAnalyzed(result.summary.lastAnalyzed)
      }
    } catch (error) {
      console.error('Erro ao carregar tech stack:', error)
    }
  }

  const analyzeTechStack = async () => {
    if (!companyId) return
    
    setIsAnalyzing(true)
    try {
      // 1. Analisar Tech Stack
      const techStackResponse = await fetch('/api/tech-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })
      
      const techStackResult = await techStackResponse.json()
      
      if (techStackResult.success) {
        setTechStackData(techStackResult.techStack)
        setLastAnalyzed(new Date().toISOString())
        console.log('[Tech Stack Module] ✅ Tech Stack analisado:', techStackResult.summary)

        // 2. Calcular Maturidade Digital
        const maturityResponse = await fetch('/api/maturity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'default-project',
            companyId,
            vendor: 'TOTVS',
            detectedStack: techStackResult.techStack,
            sources: {
              builtwith: techStackResult.summary?.sources?.builtwith,
              similartech: techStackResult.summary?.sources?.similartech,
              dns: techStackResult.summary?.sources?.dns,
              jobs: techStackResult.summary?.sources?.jobs,
              google: techStackResult.summary?.sources?.google
            }
          })
        })

        const maturityResult = await maturityResponse.json()
        
        if (maturityResult.success) {
          console.log('[Tech Stack Module] ✅ Maturidade calculada:', maturityResult.maturity.summary)
          // Aqui podemos adicionar estado para mostrar maturidade se necessário
        }
      }
    } catch (error) {
      console.error('Erro ao analisar tech stack:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmado": return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "Em Avaliação": return <Clock className="h-5 w-5 text-yellow-500" />
      default: return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-emerald-500"
    if (confidence >= 80) return "text-blue-500"
    if (confidence >= 70) return "text-yellow-500"
    return "text-orange-500"
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "ERP": "bg-purple-500/10 text-purple-400 border-purple-500/30",
      "CRM": "bg-blue-500/10 text-blue-400 border-blue-500/30",
      "Cloud": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      "BI": "bg-green-500/10 text-green-400 border-green-500/30",
      "Database": "bg-orange-500/10 text-orange-400 border-orange-500/30"
    }
    return colors[category] || "bg-slate-500/10 text-slate-400 border-slate-500/30"
  }

  return (
    <div className="space-y-6">
      {/* FIT TOTVS Module */}
      <FitTotvsModule 
        companyId={companyId || company?.id} 
        companyName={companyName || company?.name || company?.tradeName} 
      />

      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Stack Tecnológico Confirmado
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é o Stack Tecnológico?</p>
                      <p className="text-sm">
                        Seção 3 OBRIGATÓRIA do relatório. Identifica todas as tecnologias que a empresa utiliza 
                        (ERP, CRM, Cloud, BI, etc.) através de múltiplas fontes como DNS, vagas de emprego, 
                        e análise de headers HTTP.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Identificar oportunidades de vendas complementares</li>
                        <li>Avaliar maturidade tecnológica da empresa</li>
                        <li>Entender o ecossistema atual antes de propor soluções</li>
                        <li>Calcular o fit com produtos TOTVS</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Maturidade Digital:</strong> Score baseado nas tecnologias detectadas</li>
                        <li><strong>Fit TOTVS:</strong> Análise de compatibilidade com portfólio</li>
                        <li><strong>Relatórios:</strong> Base para recomendações técnicas</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                Detecção real de tecnologias através de <strong>BuiltWith</strong>, <strong>SimilarTech</strong>, 
                <strong> DNS</strong>, <strong>vagas de emprego</strong> e <strong>análise de headers HTTP</strong>. 
                Cada tecnologia possui nível de confiança baseado em múltiplas evidências.
              </CardDescription>
              {lastAnalyzed && (
                <div className="mt-2 text-xs text-slate-400">
                  Última análise: {new Date(lastAnalyzed).toLocaleString('pt-BR')}
                </div>
              )}
              {isLoading && (
                <div className="mt-2 flex items-center gap-2 text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  Analisando tecnologias...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <Shield className="h-3 w-3 mr-1" />
                {techStackData?.filter(t => t.status === "Confirmado").length || 0} Confirmadas
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10">
                <Clock className="h-3 w-3 mr-1" />
                {techStackData?.filter(t => t.status === "Em Avaliação").length || 0} Em Avaliação
              </Badge>
              <Button
                onClick={analyzeTechStack}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analisar Tech Stack
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Tecnologias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {techStackData?.map((tech) => (
          <Card key={tech.id} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getCategoryColor(tech.category)} border`}>
                      {tech.category}
                    </Badge>
                    {getStatusIcon(tech.status)}
                  </div>
                  <CardTitle className="text-xl text-white">{tech.product}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {tech.vendor}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`text-2xl font-bold ${getConfidenceColor(tech.confidence)}`}>
                          {tech.confidence}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Nível de Confiança</p>
                        <p className="text-sm">
                          {tech.confidence >= 90 && "Muito Alto - Múltiplas evidências"}
                          {tech.confidence >= 80 && tech.confidence < 90 && "Alto - Evidências sólidas"}
                          {tech.confidence >= 70 && tech.confidence < 80 && "Moderado - Validação recomendada"}
                          {tech.confidence < 70 && "Baixo - Requer confirmação"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-slate-500">Confiança</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Evidências */}
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Evidências ({tech.evidence.length})
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Fontes que confirmam o uso desta tecnologia. 
                            Quanto mais evidências, maior a confiança.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tech.evidence?.map((ev, idx) => (
                      <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                        {ev}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Fonte e Datas */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <p className="font-semibold">Fonte:</p>
                    <p>{tech.source}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Detectado:</p>
                    <p>{new Date(tech.firstDetected).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Insights de IA */}
                {tech.aiInsights && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Insight de IA
                    </p>
                    <p className="text-xs text-slate-300">{tech.aiInsights}</p>
                  </div>
                )}

                {/* Recomendações */}
                {tech.recommendations && tech.recommendations.length > 0 && (
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Recomendações
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {tech.recommendations?.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-400">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Evidências
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700/50">
                    Revalidar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legenda e Explicações */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Como interpretar estes dados?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold text-slate-200 mb-2">Status das Tecnologias</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <strong>Confirmado:</strong> 2+ evidências, alta confiança
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <strong>Em Avaliação:</strong> 1 evidência, validação necessária
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  <strong>Indeterminado:</strong> Suspeita sem confirmação
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-2">Nível de Confiança</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li><strong className="text-emerald-500">90-100%:</strong> Múltiplas fontes confirmam</li>
                <li><strong className="text-blue-500">80-89%:</strong> Evidências sólidas</li>
                <li><strong className="text-yellow-500">70-79%:</strong> Moderado, validar</li>
                <li><strong className="text-orange-500">&lt;70%:</strong> Baixo, requer confirmação</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-2">Fontes de Dados</p>
              <ul className="text-sm text-slate-300 space-y-1">
                <li><strong>BuiltWith:</strong> Análise de site e domínio</li>
                <li><strong>DNS Records:</strong> Servidores e infraestrutura</li>
                <li><strong>Job Postings:</strong> Vagas de emprego (LinkedIn)</li>
                <li><strong>HTTP Headers:</strong> Tecnologias web</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
