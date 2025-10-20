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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Building2,
  Search,
  FileText,
  Download,
  Plus,
  RefreshCw,
  Upload,
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  Play,
  BarChart3,
  Filter,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  ShoppingCart,
  Newspaper,
  Scale,
  Heart,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  ShoppingBag,
  Store,
  Search as SearchIcon,
  ArrowRight,
  Sparkles
} from "lucide-react"

interface Company {
  id: string
  cnpj?: string
  name: string
  tradeName?: string
  capital?: number
  status?: string
  domain?: string
    createdAt: string
  updatedAt: string
  analyses?: any[]
}

interface IndividualSearchData {
  cnpj: string
  website: string
  redesSociais: string
  marketplacesB2B: string
  marketplacesB2C: string
  portaisEletronicos: string
  portaisSetor: string
  noticiasRecentes: string
  juridico: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { activeModule, setActiveModule } = useModuleContext()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState<'individual' | 'massa'>('individual')
  const [individualSearchData, setIndividualSearchData] = useState<IndividualSearchData>({
    cnpj: '',
    website: '',
    redesSociais: '',
    marketplacesB2B: '',
    marketplacesB2C: '',
    portaisEletronicos: '',
    portaisSetor: '',
    noticiasRecentes: '',
    juridico: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'capital' | 'analysis' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const supabase = getSupabaseBrowser()

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Company')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      // Fallback para dados mock se Supabase falhar
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      setLoading(true)
      const response = await fetch('/api/companies/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: searchTerm,
          useCrossReference: true,
          individualSearchData: searchMode === 'individual' ? individualSearchData : undefined
        })
      })

      if (!response.ok) throw new Error('Erro na busca')

      const data = await response.json()
      setPreviewData(data)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualSearch = async () => {
    if (!individualSearchData.cnpj.trim() && !individualSearchData.website.trim()) {
      alert('Digite pelo menos CNPJ ou Website')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/companies/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: individualSearchData.cnpj,
          website: individualSearchData.website,
          useCrossReference: true,
          individualSearchData: individualSearchData
        })
      })

      if (!response.ok) throw new Error('Erro na busca individual')

      const data = await response.json()
      setPreviewData(data)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Erro na busca individual:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    if (filterStatus !== 'all' && company.status !== filterStatus) return false
    if (searchTerm && !company.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'capital':
        aValue = a.capital || 0
        bValue = b.capital || 0
        break
      case 'analysis':
        aValue = a.analyses?.length || 0
        bValue = b.analyses?.length || 0
        break
      case 'date':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCompanies = sortedCompanies.slice(startIndex, startIndex + itemsPerPage)

  const renderIndividualSearchForm = () => (
    <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Pesquisa Individual Avançada
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Preencha os campos abaixo para uma análise completa e personalizada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CNPJ e Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="cnpj" className="text-sm font-medium dark:text-gray-200">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={individualSearchData.cnpj}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, cnpj: e.target.value }))}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="website" className="text-sm font-medium dark:text-gray-200">Website</Label>
            <Input
              id="website"
              placeholder="empresa.com.br"
              value={individualSearchData.website}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, website: e.target.value }))}
              className="h-9"
            />
          </div>
        </div>

        {/* Grid de Categorias Compactas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Redes Sociais */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              <Label className="text-sm font-medium dark:text-gray-200">📱 Redes Sociais</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Digite handles/links das redes sociais separados por vírgula. 
                    Ex: @empresa_insta, empresa-linkedin, empresa.facebook
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="@empresa_insta, empresa-linkedin, empresa.facebook, @empresa_youtube, @empresa_twitter, @empresa_threads"
              value={individualSearchData.redesSociais}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, redesSociais: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Marketplaces B2B */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium dark:text-gray-200">🛒 Marketplaces B2B</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Links de marketplaces B2B onde a empresa vende. 
                    Ex: empresa.alibaba.com, shopee.com.br/shop/empresa
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="empresa.alibaba.com, shopee.com.br/shop/empresa, b2bbrasil.com.br/empresa, globalsupplies.com/empresa, tradekey.com/empresa, ec21.com/empresa"
              value={individualSearchData.marketplacesB2B}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, marketplacesB2B: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Marketplaces B2C */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-medium dark:text-gray-200">🛍️ Marketplaces B2C</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Links de marketplaces B2C onde a empresa vende para consumidores finais. 
                    Ex: mercadolivre.com.br/perfil/empresa
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="mercadolivre.com.br/perfil/empresa, amazon.com.br/shops/empresa, americanas.com.br/loja/empresa, magazineluiza.com.br/loja/empresa, submarino.com.br/loja/empresa"
              value={individualSearchData.marketplacesB2C}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, marketplacesB2C: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Portais Eletrônicos */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-medium dark:text-gray-200">🌐 Portais Eletrônicos</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Links de portais de negócios e avaliações. 
                    Ex: g.page/empresa, reclameaqui.com.br/empresa
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="g.page/empresa, reclameaqui.com.br/empresa, glassdoor.com.br/empresa, b2bbrasil.com.br/empresa, me.com.br/empresa"
              value={individualSearchData.portaisEletronicos}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, portaisEletronicos: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Portais do Setor */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" />
              <Label className="text-sm font-medium dark:text-gray-200">🏢 Portais do Setor</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Links de sindicatos, associações e portais específicos do setor. 
                    Ex: sbinee.com.br, abimac.com.br
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="sbinee.com.br, abimac.com.br, sindicatos específicos do setor, associações comerciais, federações"
              value={individualSearchData.portaisSetor}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, portaisSetor: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Notícias Recentes */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-medium dark:text-gray-200">📰 Notícias Recentes</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Palavras-chave para buscar notícias dos últimos 12 meses. 
                    Ex: empresa, produto, tecnologia, inovação
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="Digite palavras-chave para busca de notícias (ex: empresa, produto, tecnologia, inovação)"
              value={individualSearchData.noticiasRecentes}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, noticiasRecentes: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Jurídico */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-red-500" />
              <Label className="text-sm font-medium dark:text-gray-200">⚖️ Jurídico</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <SearchIcon className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Links de portais jurídicos e informações legais. 
                    Ex: jusbrasil.com.br/empresa, processos, ações
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="jusbrasil.com.br/empresa, outros portais jurídicos relevantes, processos, ações, sentenças"
              value={individualSearchData.juridico}
              onChange={(e) => setIndividualSearchData(prev => ({ ...prev, juridico: e.target.value }))}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="flex justify-end pt-3">
          <Button
            onClick={handleIndividualSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar Empresa
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderMassaSearchInstructions = () => (
    <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Pesquisa em Massa
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Instruções para análise de múltiplas empresas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Como usar a Pesquisa em Massa:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Clique em <strong>"Template CSV"</strong> para baixar a planilha modelo</li>
            <li>Preencha a planilha com os dados das empresas (CNPJ, Razão Social, etc.)</li>
            <li>Clique em <strong>"Upload CSV"</strong> para carregar o arquivo</li>
            <li>Selecione as empresas que deseja analisar com prioridade</li>
            <li>O sistema processará todas as empresas automaticamente</li>
          </ol>
                      </div>
                    
        <div className="flex gap-3">
                    <Button
            onClick={() => {
              const { downloadCSVTemplate } = require('@/lib/utils/csv-template')
              downloadCSVTemplate()
            }}
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Template CSV
          </Button>

          <Button
            onClick={() => setShowBulkUploadModal(true)}
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
                    </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderCompanyGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {paginatedCompanies.map((company) => (
        <Card key={company.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCompanies(prev => [...prev, company.id])
                    } else {
                      setSelectedCompanies(prev => prev.filter(id => id !== company.id))
                    }
                  }}
                  className="rounded"
                />
                <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                  {company.status === 'active' ? 'ATIVA' : 'INATIVA'}
                </Badge>
                  </div>
                </div>

            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {company.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-2">
              CNPJ: {company.cnpj || 'N/D'}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capital:</span>
                <span className="font-semibold">
                  {company.capital ? formatCurrency(company.capital) : 'N/D'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Análises:</span>
                <span className="font-semibold">{company.analyses?.length || 0}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setCurrentCompany(company)
                setSearchTerm(company.cnpj)
                handleSearch()
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
                {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderCompanyList = () => (
    <div className="space-y-3">
      {paginatedCompanies.map((company) => (
        <Card key={company.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCompanies(prev => [...prev, company.id])
                    } else {
                      setSelectedCompanies(prev => prev.filter(id => id !== company.id))
                    }
                  }}
                  className="rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? 'ATIVA' : 'INATIVA'}
                              </Badge>
                                </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">CNPJ:</span> {company.cnpj || 'N/D'}
                            </div>
                    <div>
                      <span className="font-medium">Capital:</span> {company.capital ? formatCurrency(company.capital) : 'N/D'}
                          </div>
                    <div>
                      <span className="font-medium">Análises:</span> {company.analyses?.length || 0}
                            </div>
                            </div>
                            </div>
                          </div>
              
                          <Button
                onClick={() => {
                  setCurrentCompany(company)
                  setSearchTerm(company.cnpj)
                  handleSearch()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório
                  </>
                )}
                          </Button>
            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <EnvCheck />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Prospecção Inteligente
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Análise completa com dados reais do Supabase
          </p>
        </div>

        {/* Tabs para Individual vs Massa */}
        <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'individual' | 'massa')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Pesquisa Individual
            </TabsTrigger>
            <TabsTrigger value="massa" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Pesquisa em Massa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            {renderIndividualSearchForm()}
              </TabsContent>

          <TabsContent value="massa">
            {renderMassaSearchInstructions()}
              </TabsContent>
        </Tabs>

        {/* Controles de Gestão */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Empresas Cadastradas ({filteredCompanies.length})
                </CardTitle>
                <CardDescription>
                  Gerencie e analise suas empresas
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  variant="outline"
                  size="sm"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  size="sm"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={loadCompanies}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
          </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
      </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Ordenar por:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'capital' | 'analysis' | 'date')}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="name">Nome</option>
                  <option value="capital">Capital</option>
                  <option value="analysis">Análises</option>
                  <option value="date">Data</option>
                </select>
              </div>
              </div>

            {/* Lista de Empresas */}
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            ) : paginatedCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma empresa encontrada</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? renderCompanyGrid() : renderCompanyList()}
                
                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* FIT TOTVS Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              FIT TOTVS
            </CardTitle>
            <CardDescription>
              Análise de compatibilidade com soluções TOTVS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma empresa para analisar o FIT TOTVS</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewData(null)
        }}
        data={previewData}
        loading={false}
        onConfirmSave={async () => {
          console.log('[Dashboard] 💾 Preview confirmado')
          setShowPreviewModal(false)
          setPreviewData(null)
          await loadCompanies()
        }}
      />

      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onComplete={async () => {
          setShowBulkUploadModal(false)
          await loadCompanies()
        }}
      />

      <BenchmarkComparisonModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
        companies={companies.filter(c => selectedCompanies.includes(c.id))}
      />
    </div>
  )
}