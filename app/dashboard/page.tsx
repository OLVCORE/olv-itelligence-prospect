"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { EnvCheck } from "@/components/dev/EnvCheck"
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
import { FitTotvsModule } from "@/components/modules/FitTotvsModule"
import { PlaybooksModule } from "@/components/modules/PlaybooksModule"
import { AlertsModule } from "@/components/modules/AlertsModule"
import { CompanySearchModule } from "@/components/modules/CompanySearchModule"
import { CompanyCard } from "@/components/CompanyCard"
import { SearchBar } from "@/components/SearchBar"
import { BenchmarkComparisonModal } from "@/components/modals/BenchmarkComparisonModal"
import { PreviewModal } from "@/components/modals/PreviewModal"
import { BulkUploadModal } from "@/components/modals/BulkUploadModal"
import { useMultiSelect } from "@/hooks/useMultiSelect"
import { formatCurrency } from "@/lib/utils/format"
// REMOVIDO: Imports de mock-data
// Sistema agora usa dados REAIS de APIs
import {
  Building2,
  Search,
  FileText,
  Download,
  Plus,
  RefreshCw,
  BarChart3,
  Upload,
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

// Inicializar Supabase Client (singleton) - uma única instância para todo o app
const supabase = getSupabaseBrowser()

// Tipo para empresas do Supabase
interface Company {
  id: string
  cnpj: string
  name: string
  tradeName?: string | null
  status?: string | null
  openingDate?: string | null
  capital?: number | null
  userId?: string
  createdAt?: string
  updatedAt?: string
  analyses?: Array<{
    id: string
    score: number
    insights: any
    redFlags: any
    createdAt: string
  }>
}

// Componente de Loading
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-gray-600 text-lg">Carregando empresas...</p>
    </div>
  )
}

// Componente de Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center px-4">
      <div className="rounded-full bg-blue-50 p-6">
        <Search className="h-16 w-16 text-blue-600" />
      </div>
      <h3 className="text-2xl font-semibold">Nenhuma empresa analisada</h3>
      <p className="text-gray-600 max-w-md">
        Use a busca por CNPJ para adicionar e analisar empresas com dados reais.
        O sistema coletará informações da ReceitaWS, análise com IA e muito mais.
      </p>
      <Button className="mt-4">
        <Plus className="mr-2 h-4 w-4" />
        Buscar Primeira Empresa
      </Button>
    </div>
  )
}

// Componente de Error State
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center px-4">
      <div className="rounded-full bg-red-50 p-6">
        <X className="h-16 w-16 text-red-600" />
      </div>
      <h3 className="text-2xl font-semibold text-red-600">Erro ao carregar dados</h3>
      <p className="text-gray-600 max-w-md">{message}</p>
      <Button onClick={onRetry} variant="destructive">
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { selectedCompany, analysisData, isLoading, selectCompany, triggerAnalysis, refreshData } = useModuleContext()
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Multi-select para benchmark comparativo
  const multiSelect = useMultiSelect()
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  
  // Estados para empresas do Supabase
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(false) // Começar fechado
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)

  // Carregar empresas do Supabase
  const loadCompanies = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      // TODO: Recolocar "analyses:Analysis(*)" após padronizar DDL no banco.
      // Alternativa: criar view v_company_with_last_analysis e consumir direto.
      const { data, error: supabaseError } = await supabase
        .from('Company')
        .select(`
          id,
          cnpj,
          name,
          tradeName,
          status,
          openingDate,
          capital,
          userId,
          createdAt,
          updatedAt
        `)
        .order('createdAt', { ascending: false })
        .limit(50)

      if (supabaseError) {
        console.error('[Dashboard] ❌ Erro do Supabase:', supabaseError)
        throw supabaseError
      }

      console.log('[Dashboard] ✅ Empresas carregadas:', data?.length || 0)
      setCompanies(data || [])
    } catch (e: any) {
      console.error('[Dashboard] ❌ Erro ao carregar empresas:', e)
      setError(e.message || 'Falha ao carregar empresas do Supabase')
    } finally {
      setLoading(false)
    }
  }, [])

  // Configurar realtime
  useEffect(() => {
    console.log('[Dashboard] 🎯 Iniciando carregamento e realtime...')
    loadCompanies()

    const channel = supabase
      .channel('companies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Company' },
        (payload) => {
          console.log('[Dashboard] 🔔 Mudança detectada em Company:', payload.eventType)
          loadCompanies()
        }
      )
      .subscribe()

    return () => {
      console.log('[Dashboard] 🔌 Desconectando realtime')
      channel.unsubscribe()
    }
  }, [loadCompanies])

  // Autenticação (mantido do código original)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        router.push('/login')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Log de mudanças de tab
  useEffect(() => {
    console.log('[Dashboard] ✅ Active tab changed to:', activeTab)
    console.log('[Dashboard] Selected company:', selectedCompany?.fantasia || 'Nenhuma empresa selecionada')
  }, [activeTab, selectedCompany])

  // Escutar evento para abrir PreviewModal
  useEffect(() => {
    const handleOpenPreviewModal = (event: CustomEvent) => {
      console.log('[Dashboard] 🎯 Evento openPreviewModal recebido:', event.detail)
      setPreviewData(event.detail.previewData)
      setShowPreviewModal(true)
      console.log('[Dashboard] ✅ PreviewModal aberto:', true)
    }

    console.log('[Dashboard] 👂 Adicionando listener para openPreviewModal')
    window.addEventListener('openPreviewModal', handleOpenPreviewModal as EventListener)
    
    return () => {
      console.log('[Dashboard] 🗑️ Removendo listener para openPreviewModal')
      window.removeEventListener('openPreviewModal', handleOpenPreviewModal as EventListener)
    }
  }, [])

  const handleCompanyClick = (company: Company) => {
    // Selecionar empresa diretamente sem modal
    selectCompany({
      id: company.id,
      cnpj: company.cnpj,
      name: company.name,
      tradeName: company.tradeName,
      website: company.website
    })
    
    // Opcional: mostrar modal para detalhes
    setCurrentCompany(company)
    setShowCompanyDetails(true)
  }

  const handleSelectCompany = (company: Company) => {
    selectCompany({
      id: company.id,
      cnpj: company.cnpj,
      razao: company.name,
      fantasia: company.tradeName || company.name,
      cidade: '',
      uf: '',
      porte: '',
      status: company.status || 'ATIVA',
      lastAnalyzed: company.analyses?.[0]?.createdAt || '',
      capitalSocial: company.capital?.toString() || '0'
    })
  }

  const [generatingPreviewFor, setGeneratingPreviewFor] = useState<string | null>(null)

  const generatePreview = async (cnpj: string) => {
    if (generatingPreviewFor) {
      console.log('[Dashboard] ⏳ Preview já sendo gerado para:', generatingPreviewFor)
      return
    }

    try {
      setGeneratingPreviewFor(cnpj)
      console.log('[Dashboard] 📄 Gerando preview para CNPJ:', cnpj)
      
      const response = await fetch('/api/companies/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, useAI: true, forceRefresh: true })
      })

      console.log('[Dashboard] 📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Dashboard] 📊 Response data:', data)
      
      if (data.status === 'success') {
        console.log('[Dashboard] ✅ Abrindo PreviewModal com dados:', data.data)
        // Abrir PreviewModal com os dados
        const event = new CustomEvent('openPreviewModal', { 
          detail: { previewData: data.data } 
        })
        window.dispatchEvent(event)
        console.log('[Dashboard] 📤 Evento openPreviewModal disparado')
      } else {
        console.error('[Dashboard] ❌ Erro ao gerar preview:', data.message)
        alert(`Erro: ${data.message}`)
      }
    } catch (error: any) {
      console.error('[Dashboard] ❌ Erro ao gerar preview:', error.message)
      alert(`Erro ao gerar relatório: ${error.message}`)
    } finally {
      setGeneratingPreviewFor(null)
      console.log('[Dashboard] ✅ Preview generation finalizada para:', cnpj)
    }
  }

  if (isCheckingAuth) {
    return <LoadingState />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        {/* Sidebar Responsivo com Hover Reveal */}
        <aside
          className={`${
            sidebarOpen || sidebarHovered ? "translate-x-0 w-64 lg:w-80" : "translate-x-0 w-16 lg:w-20"
          } fixed inset-y-0 left-0 z-40 bg-white/95 backdrop-blur-xl border-r border-gray-200 transition-all duration-300 ease-in-out pt-16 lg:pt-20 overflow-y-auto`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className={`${sidebarOpen || sidebarHovered ? 'p-4 lg:p-6' : 'p-2'} space-y-4 lg:space-y-6`}>
            {/* Busca rápida - apenas quando expandido */}
            {(sidebarOpen || sidebarHovered) && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar empresas..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Métricas rápidas - apenas quando expandido */}
            {(sidebarOpen || sidebarHovered) && (
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xs lg:text-sm text-gray-600">Empresas</div>
                    <div className="text-xl lg:text-2xl font-bold text-blue-600">{companies.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xs lg:text-sm text-gray-600">Análises</div>
                    <div className="text-xl lg:text-2xl font-bold text-purple-600">
                      {companies.reduce((acc, c) => acc + (c.analyses?.length || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Métricas compactas quando fechado */}
            {!(sidebarOpen || sidebarHovered) && (
              <div className="space-y-2">
                <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{companies.length}</div>
                </div>
                <div className="flex items-center justify-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {companies.reduce((acc, c) => acc + (c.analyses?.length || 0), 0)}
                  </div>
                </div>
              </div>
            )}

            {/* Navegação de módulos - responsiva */}
            <div className="space-y-2">
              {(sidebarOpen || sidebarHovered) && (
                <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">
                  Módulos Inteligentes
                </h3>
              )}
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                  { id: "tech", label: "Tech Stack", icon: Layers },
                  { id: "decisores", label: "Decisores", icon: Users },
                  { id: "financeiro", label: "Financeiro", icon: DollarSign },
                  { id: "maturidade", label: "Maturidade", icon: Gauge },
                  { id: "benchmark", label: "Benchmark", icon: TrendingUp },
                  { id: "fit", label: "Fit TOTVS", icon: Target },
                  { id: "playbooks", label: "Playbooks", icon: BookOpen },
                  { id: "canvas", label: "Canvas", icon: Network },
                  { id: "alertas", label: "Alertas", icon: Bell }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center ${
                        sidebarOpen || sidebarHovered ? 'gap-3 px-3' : 'justify-center px-2'
                      } py-2 rounded-lg transition-all ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      title={!(sidebarOpen || sidebarHovered) ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                      {(sidebarOpen || sidebarHovered) && (
                        <span className="text-sm lg:text-base">{item.label}</span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen || sidebarHovered ? "lg:ml-80" : "lg:ml-20"
          } pt-16 lg:pt-20`}
        >
          <div className="p-4 lg:p-8 max-w-[2000px] mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Dashboard principal */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Prospecção Inteligente
                    </h1>
                    <p className="text-sm lg:text-base text-gray-600 mt-1">
                      Análise completa com dados reais do Supabase
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {/* Contador de empresas selecionadas */}
                    {multiSelect.getSelectedCount() > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {multiSelect.getSelectedCount()}
                        </div>
                        <span className="text-sm text-blue-700">
                          {multiSelect.getSelectedCount() === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
                        </span>
                        {multiSelect.canCompare() && (
                          <Button
                            onClick={() => setShowComparisonModal(true)}
                            size="sm"
                            className="ml-2"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Comparar
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => {
                        const { downloadCSVTemplate } = require('@/lib/utils/csv-template')
                        downloadCSVTemplate()
                      }}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Template CSV
                    </Button>

                    <Button
                      onClick={() => setShowBulkUploadModal(true)}
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>

                    <Button
                      onClick={loadCompanies}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>
                </div>

                {/* Barra de busca inteligente */}
                <SearchBar onSuccess={loadCompanies} />

                {/* Conteúdo condicional baseado no estado */}
                {loading ? (
                  <LoadingState />
                ) : error ? (
                  <ErrorState message={error} onRetry={loadCompanies} />
                ) : companies.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {companies.map((company) => (
                      <Card
                        key={company.id}
                        className={`hover:shadow-lg transition-all ${
                          multiSelect.isSelected(company.id) 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={multiSelect.isSelected(company.id)}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    multiSelect.toggleSelection({
                                      id: company.id,
                                      cnpj: company.cnpj,
                                      name: company.name,
                                      tradeName: company.tradeName,
                                      status: company.status,
                                      capital: company.capital,
                                      analyses: company.analyses
                                    })
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                {company.tradeName || company.name}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                CNPJ: {company.cnpj}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={company.status === 'ATIVA' ? 'default' : 'secondary'}>
                                {company.status || 'N/D'}
                              </Badge>
                              {multiSelect.isSelected(company.id) && (
                                <div className="bg-blue-100 text-blue-700 border border-blue-300 px-2 py-1 rounded text-xs font-medium">
                                  Selecionada
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Score:</span>
                              <span className={`font-semibold ${company.analyses?.[0]?.score ? 'text-green-600' : 'text-orange-500'}`}>
                                {company.analyses?.[0]?.score ?? 'Gerar'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Capital:</span>
                              <span className="font-semibold">
                                {company.capital ? formatCurrency(company.capital) : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Análises:</span>
                              <span className="font-semibold">
                                {company.analyses?.length || 0}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="w-full mt-4"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Gerar preview diretamente via API
                              generatePreview(company.cnpj)
                            }}
                            disabled={generatingPreviewFor === company.cnpj}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${generatingPreviewFor === company.cnpj ? 'animate-spin' : ''}`} />
                            {generatingPreviewFor === company.cnpj ? 'Gerando...' : 'Gerar Relatório'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Outros módulos (DADOS REAIS) */}
              <TabsContent value="tech">
                <TechStackModule 
                  companyId={selectedCompany?.id} 
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="decisores">
                <DecisionMakersModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="financeiro">
                <FinancialModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="maturidade">
                <MaturityModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="benchmark">
                <BenchmarkModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="fit">
                <FitTotvsModule 
                  companyId={selectedCompany?.id} 
                  companyName={selectedCompany?.name || selectedCompany?.tradeName} 
                />
              </TabsContent>

              <TabsContent value="playbooks">
                <PlaybooksModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>

              <TabsContent value="canvas">
                <div className="text-center p-12">
                  <Network className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Canvas Colaborativo</h3>
                  <p className="text-gray-600">Módulo em desenvolvimento</p>
                </div>
              </TabsContent>

              <TabsContent value="alertas">
                <AlertsModule 
                  companyId={selectedCompany?.id}
                  companyName={selectedCompany?.tradeName || selectedCompany?.name}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Dialog de detalhes (mantido) */}
      <Dialog open={showCompanyDetails} onOpenChange={setShowCompanyDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentCompany?.tradeName || currentCompany?.name}</DialogTitle>
            <DialogDescription>
              CNPJ: {currentCompany?.cnpj}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{currentCompany?.status || 'N/D'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capital Social</p>
                <p className="font-semibold">
                  {currentCompany?.capital ? formatCurrency(currentCompany.capital) : 'N/D'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (currentCompany) {
                  handleSelectCompany(currentCompany)
                  setShowCompanyDetails(false)
                }
              }}
              className="w-full"
            >
              Analisar Empresa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Comparação Benchmark */}
      <BenchmarkComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        companies={multiSelect.getComparisonData()}
      />

      {/* Modal de Preview */}
      <PreviewModal
        isOpen={showPreviewModal}
        data={previewData}
        loading={false}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewData(null)
        }}
        onConfirmSave={async () => {
          // TODO: Implementar salvamento se necessário
          console.log('[Dashboard] 💾 Preview confirmado')
          setShowPreviewModal(false)
          setPreviewData(null)
          await loadCompanies()
        }}
      />

      {/* Modal de Upload em Massa */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onComplete={() => {
          setShowBulkUploadModal(false)
          loadCompanies()
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <TooltipProvider>
      {process.env.NODE_ENV !== 'production' && <EnvCheck />}
      <DashboardContent />
    </TooltipProvider>
  )
}
