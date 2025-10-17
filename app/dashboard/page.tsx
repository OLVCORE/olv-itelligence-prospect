"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { useModuleContext } from "@/lib/contexts/ModuleContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TechStackModule } from "@/components/modules/TechStackModule"
import { DecisionMakersModule } from "@/components/modules/DecisionMakersModule"
import { FinancialModule } from "@/components/modules/FinancialModule"
import { MaturityModule } from "@/components/modules/MaturityModule"
import { BenchmarkModule } from "@/components/modules/BenchmarkModule"
import { FitTOTVSModule } from "@/components/modules/FitTOTVSModule"
import { PlaybooksModule } from "@/components/modules/PlaybooksModule"
import { AlertsModule } from "@/components/modules/AlertsModule"
import { CompanySearchModule } from "@/components/modules/CompanySearchModule"
import { CompanyCard } from "@/components/CompanyCard"
import { 
  mockCompanies,
  mockTechStack, 
  mockDecisionMakers, 
  mockFinancialData, 
  mockMaturityData, 
  mockBenchmarkData, 
  mockFitTOTVS,
  mockPlaybooks,
  mockAlerts
} from "@/lib/mock-data"
import { 
  Building2, 
  Search, 
  FileText, 
  Download, 
  Plus, 
  RefreshCw, 
  BarChart3, 
  Layers, 
  Users, 
  DollarSign, 
  Gauge, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Network, 
  Bell, 
  Activity, 
  Star, 
  Sparkles, 
  Play,
  Eye, 
  LineChart, 
  PieChart, 
  MapPin, 
  Edit, 
  Menu,
  X,
  Info,
  Loader2,
  Lightbulb
} from "lucide-react"

interface CompanyData {
  id: string
  cnpj: string
  razao: string
  fantasia: string
  cidade: string
  uf: string
  porte: string
  status: string
  lastAnalyzed: string
  capitalSocial: string
}

function DashboardContent() {
  const router = useRouter()
  const { selectedCompany, analysisData, isLoading, selectCompany, triggerAnalysis, refreshData } = useModuleContext()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Debug: Log tab changes
  useEffect(() => {
    console.log('[Dashboard] ✅ Active tab changed to:', activeTab)
  }, [activeTab])
  const [companies, setCompanies] = useState<CompanyData[]>(mockCompanies)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [previewCompany, setPreviewCompany] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    
    setUser(JSON.parse(userData))
    loadCompanies()
  }, [router])

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies/list')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
      } else {
        console.error('Erro ao carregar empresas')
        setCompanies(mockCompanies)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      setCompanies(mockCompanies)
    }
  }

  const handleViewCompanyPreview = async (company: CompanyData) => {
    try {
      // Limpar CNPJ (remover formatação)
      const cleanCNPJ = company.cnpj.replace(/[^\d]/g, '')
      console.log('[Dashboard] Buscando preview REAL da empresa:', cleanCNPJ)
      
      // Buscar dados REAIS da ReceitaWS
      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cnpj',
          query: cleanCNPJ
        })
      })

      const data = await response.json()
      console.log('[Dashboard] Resposta da API:', data)
      
      if (response.ok) {
        setPreviewCompany({
          ...company,
          ...data.company,
          preview: data.preview
        })
        setShowPreview(true)
        console.log('[Dashboard] Preview carregado:', data.preview)
      } else {
        console.error('[Dashboard] Erro ao buscar preview:', data.error)
        alert(`Erro ao buscar preview: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error: any) {
      console.error('[Dashboard] Erro ao buscar preview:', error)
      alert(`Erro ao buscar preview: ${error.message}`)
    }
  }

  const handleExportPreview = async (format: 'pdf' | 'xlsx' | 'docx' | 'png') => {
    try {
      console.log(`[Dashboard] Exportando preview em ${format.toUpperCase()}`)
      
      const response = await fetch('/api/export/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: previewCompany,
          format
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `preview-${previewCompany.fantasia}-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log(`[Dashboard] ✅ Preview exportado em ${format.toUpperCase()}`)
      } else {
        alert(`Erro ao exportar em ${format.toUpperCase()}`)
      }
    } catch (error: any) {
      console.error(`[Dashboard] Erro ao exportar ${format}:`, error)
      alert(`Erro ao exportar: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Inativo": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Pendente": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Responsivo */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${sidebarOpen ? 'w-full lg:w-80' : 'w-0 lg:w-0'} 
          fixed lg:relative inset-y-0 left-0 z-40
          transition-all duration-300 
          bg-slate-800/95 lg:bg-slate-800/50 backdrop-blur-xl 
          border-r border-slate-700/50 
          overflow-y-auto overflow-x-hidden
          pt-20 lg:pt-0
        `}>
          <div className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base lg:text-lg font-semibold text-white">Empresas</h2>
            </div>
            
            <div className="space-y-3">
              {companies.map((company) => (
                <Card 
                  key={company.id} 
                  className={`bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-all cursor-pointer ${
                    selectedCompany?.id === company.id ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                  onClick={() => selectCompany(company)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-sm">
                          {company.fantasia || company.razao}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                          {company.cnpj}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {company.cidade}/{company.uf}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {company.porte}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Responsivo */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
            {/* TabsList - Scrollable em mobile */}
            <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 pb-2">
              <TabsList className="inline-flex w-max lg:grid lg:w-full lg:grid-cols-9 bg-slate-800/50 border-slate-700/50 gap-1 p-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="companies" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Building2 className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Empresas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tech-stack" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Layers className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Tech</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="decision-makers" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Users className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Decisores</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <DollarSign className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Finance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="maturity" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Gauge className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Maturidade</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="benchmark" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Benchmark</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="fit-totvs" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Target className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Fit</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="canvas" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white whitespace-nowrap hover:bg-slate-700/50 transition-colors"
                >
                  <Network className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Canvas</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Empresas Analisadas</CardTitle>
                    <Building2 className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{companies.length}</div>
                    <p className="text-xs text-slate-400">+2 esta semana</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Maturidade Digital</CardTitle>
                    <Gauge className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {analysisData?.maturity ? `${analysisData.maturity}%` : "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      {analysisData?.maturity ? `Análise REAL: ${analysisData.maturity}%` : "Execute a análise"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Propensão de Compra</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {analysisData?.propensity ? `${analysisData.propensity}%` : "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      {analysisData?.propensity ? `Probabilidade: ${analysisData.propensity}%` : "Execute a análise"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Ticket Estimado</CardTitle>
                    <DollarSign className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {analysisData?.estimatedTicket ? `R$ ${(analysisData.estimatedTicket / 1000).toFixed(0)}K` : "N/A"}
                    </div>
                    <p className="text-xs text-slate-400">
                      {analysisData?.estimatedTicket ? `Valor: R$ ${analysisData.estimatedTicket.toLocaleString('pt-BR')}` : "Execute a análise"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Empresas por Porte</CardTitle>
                    <CardDescription className="text-slate-400">
                      Distribuição das empresas analisadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Grande</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="text-white font-medium">60%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Médio</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <span className="text-white font-medium">30%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Pequeno</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                          <span className="text-white font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Análises Recentes</CardTitle>
                    <CardDescription className="text-slate-400">
                      Últimas empresas analisadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{company.fantasia}</p>
                            <p className="text-slate-400 text-sm">{company.cnpj}</p>
                          </div>
                          <Badge className={getStatusColor(company.status)}>
                            {company.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="companies" className="space-y-4 lg:space-y-6">
              {/* Módulo de Busca */}
              <CompanySearchModule />
              
              {/* Lista de Empresas */}
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base sm:text-lg">Empresas Cadastradas ({companies.length})</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Clique em "Analisar" para executar análise completa com Motor de Inteligência
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {companies.map((company) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        isSelected={selectedCompany?.id === company.id}
                        isLoading={isLoading}
                        onSelect={() => selectCompany(company)}
                        onAnalyze={() => {
                          selectCompany(company)
                          triggerAnalysis(company.id)
                          setActiveTab("tech-stack")
                        }}
                        onViewPreview={() => handleViewCompanyPreview(company)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Module Tabs */}
            <TabsContent value="tech-stack" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Layers className="h-6 w-6 text-blue-400" />
                    Tech Stack - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Análise de tecnologias utilizadas pela empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TechStackModule 
                    data={analysisData?.techStack || mockTechStack} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decision-makers" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-400" />
                    Decisores - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Identificação de tomadores de decisão e influenciadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DecisionMakersModule 
                    data={analysisData?.decisionMakers || mockDecisionMakers} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                    Financeiro - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Análise financeira e capacidade de investimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FinancialModule 
                    data={analysisData?.companyData ? {
                      porte: analysisData.companyData.porte,
                      capitalSocial: analysisData.companyData.capitalSocial,
                      faturamentoEstimado: mockFinancialData.faturamentoEstimado,
                      riscoCredito: mockFinancialData.riscoCredito,
                      dataAbertura: analysisData.companyData.abertura,
                      naturezaJuridica: analysisData.companyData.naturezaJuridica,
                      statusFiscal: analysisData.companyData.situacao,
                      ultimaAtualizacao: mockFinancialData.ultimaAtualizacao
                    } : mockFinancialData} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maturity" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gauge className="h-6 w-6 text-purple-400" />
                    Maturidade Digital - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Avaliação do nível de maturidade digital da empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaturityModule 
                    data={analysisData?.scores?.maturity ? {
                      overallScore: analysisData.scores.maturity,
                      dimensions: mockMaturityData.dimensions
                    } : mockMaturityData} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmark" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                    Benchmark - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Comparação com empresas similares do mercado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BenchmarkModule 
                    data={analysisData?.benchmark || mockBenchmarkData} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fit-totvs" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-red-400" />
                    Fit TOTVS - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Avaliação de compatibilidade com soluções TOTVS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FitTOTVSModule 
                    data={analysisData?.scores?.priority ? {
                      overall: analysisData.scores.priority,
                      propensity: analysisData.scores.propensity,
                      priority: analysisData.scores.priority,
                      ticketEstimate: analysisData.ticketEstimate || mockFitTOTVS.ticketEstimate,
                      roi: mockFitTOTVS.roi,
                      paybackMonths: mockFitTOTVS.paybackMonths,
                      factors: mockFitTOTVS.factors
                    } : mockFitTOTVS} 
                    companyName={selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="canvas" className="space-y-4 lg:space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="h-6 w-6 text-cyan-400" />
                    Canvas Estratégico - {selectedCompany?.fantasia || selectedCompany?.razao || "Empresa"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualização colaborativa e estratégica da análise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Network className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Canvas Estratégico</h3>
                    <p className="text-slate-400 mb-4">
                      Módulo de colaboração visual em tempo real com React Flow e Yjs
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-blue-400">
                        Este módulo permite colaboração em tempo real entre múltiplos usuários
                        para criar estratégias de prospecção visual e dinâmica.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modal de Preview da Empresa - Responsivo */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-lg sm:text-xl lg:text-2xl">
              {previewCompany?.fantasia || previewCompany?.razao}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm">
              Dados REAIS da Receita Federal - CNPJ: {previewCompany?.cnpj}
            </DialogDescription>
          </DialogHeader>
          
          {previewCompany && (
            <div className="space-y-4 sm:space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-xs font-medium text-slate-400 mb-1">Situação</h3>
                  <Badge className={getStatusColor(previewCompany.preview?.situacao || previewCompany.status)}>
                    {previewCompany.preview?.situacao || previewCompany.status}
                  </Badge>
                  {previewCompany.preview?.dataSituacao && (
                    <p className="text-xs text-slate-500 mt-1">
                      Desde: {previewCompany.preview.dataSituacao}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-400 mb-1">Tipo</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {previewCompany.preview?.tipo || 'MATRIZ'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-400 mb-1">Porte</h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {previewCompany.preview?.porte || previewCompany.porte}
                  </Badge>
                </div>
              </div>

              {/* Informações Cadastrais */}
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-3">Informações Cadastrais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <TooltipProvider>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            Razão Social <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Nome legal e oficial da empresa registrado na Receita Federal</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white font-medium">{previewCompany.preview?.razao || previewCompany.razao}</p>
                    </div>

                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            Nome Fantasia <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Nome comercial usado pela empresa no mercado</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white font-medium">{previewCompany.preview?.fantasia || previewCompany.fantasia}</p>
                    </div>

                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            CNPJ <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Cadastro Nacional da Pessoa Jurídica - Identificador único da empresa</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white font-mono">{previewCompany.preview?.cnpj || previewCompany.cnpj}</p>
                    </div>

                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            Data de Abertura <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Data de registro e início das atividades da empresa</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white">{previewCompany.preview?.abertura || previewCompany.abertura}</p>
                    </div>

                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            Natureza Jurídica <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Tipo de constituição legal da empresa (Ltda, S.A., MEI, etc.)</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white">{previewCompany.preview?.naturezaJuridica || '-'}</p>
                    </div>

                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-slate-400 cursor-help flex items-center gap-1">
                            Capital Social <Info className="h-3 w-3" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700">
                          <p className="text-xs">Valor total do capital investido pelos sócios na empresa</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-white font-medium">{previewCompany.preview?.capitalSocial || previewCompany.capitalSocial}</p>
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              {/* Endereço Completo */}
              {previewCompany.preview && (
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="md:col-span-2">
                      <span className="text-slate-400">Logradouro:</span>
                      <p className="text-white">
                        {previewCompany.preview.logradouro}, {previewCompany.preview.numero}
                        {previewCompany.preview.complemento && ` - ${previewCompany.preview.complemento}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Bairro:</span>
                      <p className="text-white">{previewCompany.preview.bairro}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">CEP:</span>
                      <p className="text-white">{previewCompany.preview.cep}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Município/UF:</span>
                      <p className="text-white">{previewCompany.preview.cidade}/{previewCompany.preview.uf}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contato */}
              {previewCompany.preview && (previewCompany.preview.email || previewCompany.preview.telefone) && (
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {previewCompany.preview.email && (
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <p className="text-white">{previewCompany.preview.email}</p>
                      </div>
                    )}
                    {previewCompany.preview.telefone && (
                      <div>
                        <span className="text-slate-400">Telefone:</span>
                        <p className="text-white">{previewCompany.preview.telefone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Atividades Econômicas */}
              {previewCompany.preview?.atividadePrincipal && (
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Atividades Econômicas</h3>
                  
                  {/* Atividade Principal */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-slate-400">Principal:</span>
                    {previewCompany.preview.atividadePrincipal.map((ativ: any, idx: number) => (
                      <div key={idx} className="mt-1 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                        <p className="text-xs text-blue-400 font-mono">{ativ.code}</p>
                        <p className="text-sm text-white">{ativ.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Atividades Secundárias */}
                  {previewCompany.preview.atividadesSecundarias && previewCompany.preview.atividadesSecundarias.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-400">
                        Secundárias ({previewCompany.preview.atividadesSecundarias.length}):
                      </span>
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {previewCompany.preview.atividadesSecundarias.slice(0, 5).map((ativ: any, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-600/30 rounded text-xs">
                            <span className="text-slate-400 font-mono">{ativ.code}</span>
                            <span className="text-slate-300 ml-2">{ativ.text}</span>
                          </div>
                        ))}
                        {previewCompany.preview.atividadesSecundarias.length > 5 && (
                          <p className="text-xs text-slate-400 text-center py-1">
                            +{previewCompany.preview.atividadesSecundarias.length - 5} atividades adicionais
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Regime Tributário */}
              {previewCompany.preview && (previewCompany.preview.simplesNacional || previewCompany.preview.mei) && (
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Regime Tributário</h3>
                  <div className="flex gap-3">
                    {previewCompany.preview.simplesNacional && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✓ Simples Nacional
                      </Badge>
                    )}
                    {previewCompany.preview.mei && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        ✓ MEI
                      </Badge>
                    )}
                    {!previewCompany.preview.simplesNacional && !previewCompany.preview.mei && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Lucro Real/Presumido
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Score de Confiabilidade */}
              {previewCompany.preview?.score && (
                <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-600/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      Score de Confiabilidade
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-blue-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md bg-slate-800 border-slate-700 p-4">
                            <div className="space-y-2">
                              <p className="font-semibold text-white">Como o Score é Calculado:</p>
                              <div className="text-xs text-slate-300 space-y-1">
                                <p>• Base: 50 pontos</p>
                                <p>• Situação ATIVA: +20 pontos</p>
                                <p>• Capital Social declarado: +10 pontos</p>
                                <p>• Email cadastrado: +5 pontos</p>
                                <p>• Telefone cadastrado: +5 pontos</p>
                                <p>• Quadro societário: +10 pontos</p>
                                <p>• É Matriz: +5 pontos</p>
                                <p>• Dados atualizados (30 dias): +10 pontos</p>
                                <p>• Atividades secundárias: +5 pontos</p>
                                <p>• Endereço completo: +5 pontos</p>
                              </div>
                              <p className="text-xs text-slate-400 pt-2">
                                Score máximo: 100 pontos
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <Badge className={
                      previewCompany.preview.score >= 90 ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      previewCompany.preview.score >= 75 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      previewCompany.preview.score >= 60 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      previewCompany.preview.score >= 40 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }>
                      {previewCompany.preview.score >= 90 ? "EXCELENTE" :
                       previewCompany.preview.score >= 75 ? "MUITO BOM" :
                       previewCompany.preview.score >= 60 ? "BOM" :
                       previewCompany.preview.score >= 40 ? "REGULAR" : "BAIXO"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                        style={{ width: `${previewCompany.preview.score}%` }}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow">
                          {previewCompany.preview.score}%
                        </span>
                      </div>
                    </div>
                    <span className="text-3xl font-bold text-white min-w-[80px] text-right">
                      {previewCompany.preview.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    {previewCompany.preview.score >= 90 ? "Empresa com dados cadastrais completos e confiáveis" :
                     previewCompany.preview.score >= 75 ? "Empresa com bons indicadores de confiabilidade" :
                     previewCompany.preview.score >= 60 ? "Empresa com indicadores satisfatórios" :
                     previewCompany.preview.score >= 40 ? "Empresa com alguns dados incompletos" :
                     "Empresa com dados cadastrais limitados"}
                  </p>
                </div>
              )}

              {/* Insights */}
              {previewCompany.preview?.insights && previewCompany.preview.insights.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-blue-400">💡</span> Insights Automáticos
                  </h3>
                  <div className="space-y-2">
                    {previewCompany.preview.insights.map((insight: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span className="text-slate-300">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {previewCompany.preview?.redFlags && previewCompany.preview.redFlags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-orange-400">⚠️</span> Pontos de Atenção
                  </h3>
                  <div className="space-y-2">
                    {previewCompany.preview.redFlags.map((flag: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span className="text-slate-300">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quadro Societário */}
              {previewCompany.preview?.quadroSocietario && previewCompany.preview.quadroSocietario.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-purple-400">👥</span> Quadro Societário ({previewCompany.preview.quadroSocietario.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {previewCompany.preview.quadroSocietario.map((socio: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
                        <div className="text-white font-medium">{socio.nome}</div>
                        <div className="text-slate-400 text-xs mt-1">{socio.qualificacao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Exportação */}
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-3">Exportar Relatório</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleExportPreview('pdf')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    onClick={() => handleExportPreview('xlsx')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    EXCEL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => handleExportPreview('docx')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    WORD
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    onClick={() => handleExportPreview('png')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </Button>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setShowPreview(false)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700"
                  onClick={() => {
                    selectCompany(previewCompany)
                    triggerAnalysis(previewCompany.id)
                    setShowPreview(false)
                    setActiveTab("tech-stack")
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  )}
                  <span className="text-sm sm:text-base">{isLoading ? "Analisando..." : "Análise Completa"}</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}