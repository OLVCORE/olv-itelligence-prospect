"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Search, 
  FileText, 
  Download, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Layers,
  Target,
  Rocket,
  Bell,
  BarChart3,
  Brain,
  Zap,
  Database,
  Cpu,
  Network,
  Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CompanyData {
  cnpj: string
  razao: string
  fantasia: string
  tipo: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  telefone1: string
  telefone2: string
  email: string
  site: string
  cnaePrincipal: string
  textoCnaePrincipal: string
  cnaeSecundario: string
  situacao?: string
  abertura?: string
  naturezaJuridica?: string
  capitalSocial?: string
  porte?: string
  qsa?: any[]
}

interface TechStack {
  category: string
  product: string
  vendor: string
  status: "Confirmado" | "Indeterminado" | "Em Avaliação"
  confidence: number
  evidence: string[]
  source: string
  aiInsights?: string
  recommendations?: string[]
}

interface DecisionMaker {
  name: string
  title: string
  department: string
  email: string
  phone: string
  linkedin: string
  score: number
  source: string
  influenceLevel: "Alto" | "Médio" | "Baixo"
  aiInsights?: string
  engagementStrategy?: string[]
}

interface BenchmarkData {
  metric: string
  companyValue: string
  industryAverage: string
  percentile: number
  trend: "up" | "down" | "stable"
  aiInsights?: string
}

interface AlertData {
  id: string
  type: "tech_change" | "contact_change" | "market_shift" | "opportunity"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  company: string
  timestamp: string
  aiGenerated: boolean
}

interface CompanyAnalysis {
  company: CompanyData
  techStack: TechStack[]
  decisionMakers: DecisionMaker[]
  benchmark: BenchmarkData[]
  alerts: AlertData[]
  maturity: number
  propensity: number
  priority: number
  aiInsights: {
    overall: string
    opportunities: string[]
    risks: string[]
    recommendations: string[]
  }
  lastUpdated: string
}

export default function DiagnosticoPage() {
  const [cnpj, setCnpj] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showReport, setShowReport] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<string[]>([])

  const analyzeCompany = async () => {
    if (!cnpj) return
    
    setLoading(true)
    setLoadingSteps([])
    
    try {
      setLoadingSteps(prev => [...prev, "Iniciando análise completa..."])
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cnpj })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na análise')
      }
      
      const data = await response.json()
      setAnalysis(data.analysis)
      setLoadingSteps(prev => [...prev, "Análise completa!"])
      
    } catch (error) {
      console.error("Erro na análise:", error)
      setLoadingSteps(prev => [...prev, `Erro: ${error.message}`])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado": return "bg-green-100 text-green-800"
      case "Indeterminado": return "bg-yellow-100 text-yellow-800"
      case "Em Avaliação": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                OLV Intelligent Prospecting System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Núcleo de Inteligência Preditiva com Dados Reais
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                IA Ativa
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Network className="h-3 w-3" />
                Dados Reais
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Análise Inteligente com Dados Reais
            </CardTitle>
            <CardDescription>
              Digite o CNPJ para extrair dados reais da Receita Federal e gerar análise preditiva completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={analyzeCompany} 
                  disabled={loading || !cnpj}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Ativar IA Preditiva
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Loading Steps */}
            {loading && loadingSteps.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Processando análise:</h4>
                <div className="space-y-1">
                  {loadingSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className={step.startsWith('Erro') ? 'text-red-600' : 'text-gray-600'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results with Dynamic Tabs */}
        {analysis && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="tech" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Tech Stack
              </TabsTrigger>
              <TabsTrigger value="decisions" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Decisores
              </TabsTrigger>
              <TabsTrigger value="benchmark" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Benchmark
              </TabsTrigger>
              <TabsTrigger value="canvas" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Canvas
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alertas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Dados Reais da Receita Federal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span><strong>Razão:</strong> {analysis.company.razao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span><strong>Endereço:</strong> {analysis.company.endereco}, {analysis.company.numero}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span><strong>Cidade:</strong> {analysis.company.cidade}/{analysis.company.uf}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span><strong>Telefone:</strong> {analysis.company.telefone1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span><strong>Email:</strong> {analysis.company.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span><strong>Site:</strong> {analysis.company.site}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        <span><strong>CNAE:</strong> {analysis.company.textoCnaePrincipal}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Insights de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Análise Geral</h4>
                        <p className="text-sm text-gray-600">{analysis.aiInsights.overall}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Oportunidades</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.aiInsights.opportunities.map((opp, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Scores Preditivos Calculados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{analysis.maturity}</div>
                      <div className="text-sm text-gray-600 mb-2">Maturidade</div>
                      <div className="text-xs text-gray-500">Baseado em {analysis.techStack.length} tecnologias</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">{analysis.propensity}</div>
                      <div className="text-sm text-gray-600 mb-2">Propensão</div>
                      <div className="text-xs text-gray-500">Probabilidade de compra</div>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{analysis.priority}</div>
                      <div className="text-sm text-gray-600 mb-2">Prioridade</div>
                      <div className="text-xs text-gray-500">Urgência de abordagem</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tech Stack Tab */}
            <TabsContent value="tech" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Stack Tecnológico Real
                  </CardTitle>
                  <CardDescription>
                    Tecnologias identificadas com dados reais de APIs externas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.techStack.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.techStack.map((tech, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{tech.product}</CardTitle>
                                <CardDescription>{tech.vendor} • {tech.category}</CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getStatusColor(tech.status)}>
                                  {tech.status}
                                </Badge>
                                <span className={`font-semibold ${getConfidenceColor(tech.confidence)}`}>
                                  {tech.confidence}%
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-1">Fonte</h4>
                                <p className="text-sm text-gray-600">{tech.source}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-1">Evidências</h4>
                                <p className="text-sm text-gray-600">{tech.evidence.join(", ")}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tecnologia identificada</h3>
                      <p className="text-gray-600">Tente analisar uma empresa com site ativo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Decision Makers Tab */}
            <TabsContent value="decisions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Decisores Identificados
                  </CardTitle>
                  <CardDescription>
                    Contatos encontrados em APIs de dados B2B
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.decisionMakers.length > 0 ? (
                    <div className="space-y-6">
                      {analysis.decisionMakers.map((maker, index) => (
                        <Card key={index} className="border-l-4 border-l-green-500">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{maker.name}</CardTitle>
                                <CardDescription>{maker.title} • {maker.department}</CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{maker.influenceLevel}</Badge>
                                <span className={`font-semibold ${getScoreColor(maker.score)}`}>
                                  Score: {maker.score}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Email:</strong> {maker.email}</div>
                              <div><strong>Telefone:</strong> {maker.phone}</div>
                              <div><strong>LinkedIn:</strong> {maker.linkedin}</div>
                              <div><strong>Fonte:</strong> {maker.source}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum decisor identificado</h3>
                      <p className="text-gray-600">Configure as APIs de dados B2B para identificar contatos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs remain the same... */}
            <TabsContent value="benchmark" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Benchmark Comparativo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.benchmark.map((benchmark, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{benchmark.metric}</h4>
                              <p className="text-sm text-gray-600">
                                Empresa: {benchmark.companyValue} | Média do Setor: {benchmark.industryAverage}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {benchmark.percentile}º Percentil
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Insights de IA</h4>
                            <p className="text-sm text-gray-600">{benchmark.aiInsights}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs... */}
            <TabsContent value="canvas" className="space-y-6">
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Canvas Estratégico</h3>
                    <p className="text-gray-600">Em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios Executivos</h3>
                    <p className="text-gray-600">Em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alertas Inteligentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.alerts.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.alerts.map((alert) => (
                        <Card key={alert.id} className="border-l-4 border-l-orange-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{alert.title}</h4>
                                <p className="text-sm text-gray-600">{alert.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getPriorityColor(alert.priority)}>
                                  {alert.priority}
                                </Badge>
                                {alert.aiGenerated && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    IA
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleString('pt-BR')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta ativo</h3>
                      <p className="text-gray-600">Alertas serão gerados automaticamente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Preditivo</h3>
                    <p className="text-gray-600">Em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Instructions */}
        {!analysis && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema com Dados Reais</h3>
              <p className="text-gray-600 text-center mb-4 max-w-3xl">
                Sistema completo de inteligência artificial para prospecção B2B com integração real de APIs:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Receita Federal
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  BuiltWith API
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Wappalyzer API
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Apollo API
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  ZoomInfo API
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  OpenAI API
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Análise de Headers
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Scoring Preditivo
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}