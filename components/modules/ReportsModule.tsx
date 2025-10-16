"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText,
  Info,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModuleContext } from "@/lib/contexts/ModuleContext"
import { notify } from "@/components/NotificationSystem"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "executive" | "technical" | "financial" | "strategic"
  sections: string[]
  aiPrompt: string
  createdAt: string
  isDefault: boolean
}

interface GeneratedReport {
  id: string
  templateId: string
  companyId: string
  title: string
  status: "generating" | "completed" | "failed"
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  previewUrl?: string
  aiInsights: string[]
  metrics: {
    pages: number
    sections: number
    charts: number
    confidence: number
  }
}

interface ReportsModuleProps {
  data?: GeneratedReport[]
}

export function ReportsModule({ data = [] }: ReportsModuleProps) {
  const { selectedCompany, analysisData, isLoading } = useModuleContext()
  const [reports, setReports] = useState<GeneratedReport[]>(data)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  // Templates padrão
  useEffect(() => {
    const defaultTemplates: ReportTemplate[] = [
      {
        id: "exec-1",
        name: "Relatório Executivo Completo",
        description: "Análise estratégica completa com insights de IA para tomada de decisão",
        type: "executive",
        sections: ["Resumo Executivo", "Análise de Mercado", "Oportunidades", "Riscos", "Recomendações"],
        aiPrompt: "Gere um relatório executivo completo analisando a empresa {companyName} com foco em oportunidades de negócio, riscos identificados e recomendações estratégicas baseadas nos dados de tech stack, decisores e maturidade digital.",
        createdAt: new Date().toISOString(),
        isDefault: true
      },
      {
        id: "tech-1",
        name: "Análise Técnica Detalhada",
        description: "Deep dive no stack tecnológico e infraestrutura da empresa",
        type: "technical",
        sections: ["Tech Stack", "Infraestrutura", "Segurança", "Integrações", "Roadmap"],
        aiPrompt: "Analise detalhadamente o stack tecnológico da empresa {companyName}, identifique gaps, oportunidades de modernização e recomende soluções técnicas específicas.",
        createdAt: new Date().toISOString(),
        isDefault: true
      },
      {
        id: "strat-1",
        name: "Estratégia de Prospecção",
        description: "Plano de abordagem personalizado baseado em dados e IA",
        type: "strategic",
        sections: ["Perfil da Empresa", "Decisores-Chave", "Estratégia de Abordagem", "Timeline", "KPIs"],
        aiPrompt: "Crie uma estratégia de prospecção personalizada para {companyName} considerando o perfil dos decisores, maturidade digital e oportunidades identificadas.",
        createdAt: new Date().toISOString(),
        isDefault: true
      }
    ]
    setTemplates(defaultTemplates)
  }, [])

  const generateReport = async (template: ReportTemplate) => {
    if (!selectedCompany) {
      notify("warning", "Atenção", "Selecione uma empresa primeiro")
      return
    }

    setIsGenerating(true)
    const reportId = `report-${Date.now()}`
    
    // Criar relatório em status "generating"
    const newReport: GeneratedReport = {
      id: reportId,
      templateId: template.id,
      companyId: selectedCompany.id,
      title: `${template.name} - ${selectedCompany.fantasia}`,
      status: "generating",
      createdAt: new Date().toISOString(),
      aiInsights: [],
      metrics: { pages: 0, sections: 0, charts: 0, confidence: 0 }
    }
    
    setReports(prev => [newReport, ...prev])
    notify("info", "Gerando Relatório", `Iniciando geração do ${template.name}`)

    try {
      // Simular geração com IA (2-5 segundos)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000))
      
      // Simular insights de IA
      const aiInsights = [
        "Empresa apresenta alta maturidade digital com potencial de crescimento",
        "Identificadas 3 oportunidades de integração com soluções TOTVS",
        "Decisores-chave identificados com estratégias de abordagem personalizadas",
        "Risco baixo com alta probabilidade de conversão"
      ]

      // Atualizar relatório como completo
      const completedReport: GeneratedReport = {
        ...newReport,
        status: "completed",
        completedAt: new Date().toISOString(),
        downloadUrl: `/api/reports/download/${reportId}`,
        previewUrl: `/api/reports/preview/${reportId}`,
        aiInsights,
        metrics: {
          pages: Math.floor(Math.random() * 15) + 8,
          sections: template.sections.length,
          charts: Math.floor(Math.random() * 8) + 3,
          confidence: Math.floor(Math.random() * 20) + 80
        }
      }

      setReports(prev => prev.map(r => r.id === reportId ? completedReport : r))
      notify("success", "Relatório Pronto", `${template.name} gerado com sucesso!`)
      
    } catch (error) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: "failed" } : r))
      notify("error", "Erro na Geração", "Falha ao gerar o relatório")
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusIcon = (status: GeneratedReport['status']) => {
    switch (status) {
      case "generating": return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed": return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: GeneratedReport['status']) => {
    switch (status) {
      case "generating": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "failed": return "bg-red-500/20 text-red-400 border-red-500/30"
    }
  }

  const getTypeColor = (type: ReportTemplate['type']) => {
    switch (type) {
      case "executive": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "technical": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "financial": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "strategic": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
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
                Relatórios Executivos com IA
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-purple-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que são Relatórios Executivos com IA?</p>
                      <p className="text-sm">
                        Sistema de geração automática de relatórios profissionais usando IA de grandes modelos. 
                        Combina dados de todos os módulos para criar análises estratégicas personalizadas.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Relatórios executivos profissionais</li>
                        <li>Análises estratégicas personalizadas</li>
                        <li>Insights de IA para tomada de decisão</li>
                        <li>Documentação automática de prospecção</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Todos os módulos:</strong> Agrega dados de toda a plataforma</li>
                        <li><strong>IA:</strong> Gera insights personalizados</li>
                        <li><strong>Canvas:</strong> Documenta estratégias visuais</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                <strong>Geração automática</strong> de relatórios profissionais com <strong>IA embarcada</strong>, 
                <strong> templates personalizáveis</strong> e <strong>insights estratégicos</strong> para 
                tomada de decisão executiva.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10">
                <Sparkles className="h-3 w-3 mr-1" />
                {reports.filter(r => r.status === "completed").length} Relatórios
              </Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10">
                <Target className="h-3 w-3 mr-1" />
                {templates.length} Templates
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Templates de Relatórios */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Templates Disponíveis
            </CardTitle>
            <Button 
              variant="outline" 
              className="border-slate-500 text-slate-100 hover:bg-slate-700/50"
              onClick={() => setShowTemplateEditor(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-slate-400 text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Seções incluídas:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={() => generateReport(template)}
                        disabled={isGenerating || !selectedCompany}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? "Gerando..." : "Gerar Relatório"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-600 text-slate-200"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Gerados */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Relatórios Gerados ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhum relatório gerado</p>
              <p className="text-sm">Selecione uma empresa e escolha um template para gerar seu primeiro relatório</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card key={report.id} className="bg-slate-700/30 border-slate-600/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{report.title}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {report.completedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(report.completedAt).toLocaleTimeString('pt-BR')}
                            </span>
                          )}
                          {report.metrics.pages > 0 && (
                            <span>{report.metrics.pages} páginas</span>
                          )}
                          {report.metrics.confidence > 0 && (
                            <span>Confiança: {report.metrics.confidence}%</span>
                          )}
                        </div>

                        {report.aiInsights.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-1">Insights de IA:</p>
                            <div className="space-y-1">
                              {report.aiInsights.slice(0, 2).map((insight, idx) => (
                                <p key={idx} className="text-xs text-slate-300">• {insight}</p>
                              ))}
                              {report.aiInsights.length > 2 && (
                                <p className="text-xs text-slate-500">+{report.aiInsights.length - 2} insights adicionais</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {report.status === "completed" && (
                          <>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-200">
                              <Eye className="h-4 w-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                        {report.status === "failed" && (
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Tentar Novamente
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor de Templates */}
      {showTemplateEditor && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Criar Novo Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Nome do Template</Label>
              <Input 
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Ex: Relatório de Análise Financeira"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Descrição</Label>
              <Textarea 
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Descreva o propósito deste template..."
                rows={3}
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Prompt de IA</Label>
              <Textarea 
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Instruções específicas para a IA gerar o relatório..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-200"
                onClick={() => setShowTemplateEditor(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

