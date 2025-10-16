"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  DollarSign,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react"

interface CompanySearchResult {
  cnpj: string
  razao: string
  fantasia: string
  cidade: string
  uf: string
  porte: string
  situacao: string
  abertura: string
  naturezaJuridica: string
  capitalSocial: string
  cnae: string
  email?: string
  telefone?: string
  website?: string
}

export function CompanySearchModule() {
  const [searchType, setSearchType] = useState<"cnpj" | "website">("cnpj")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<CompanySearchResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Digite um CNPJ ou website para buscar")
      return
    }

    setIsSearching(true)
    setError("")
    setSearchResult(null)
    setSuccess("")

    try {
      console.log('[CompanySearch] Buscando:', searchType, searchQuery)
      
      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: searchType,
          query: searchQuery
        })
      })

      const data = await response.json()
      console.log('[CompanySearch] Resposta:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar empresa')
      }

      // Mostrar preview COMPLETO da empresa
      setSearchResult({
        ...data.company,
        preview: data.preview // Dados completos incluindo insights, red flags, score
      })
      console.log('[CompanySearch] Empresa REAL encontrada:', data.company.razao)
      console.log('[CompanySearch] Preview completo:', data.preview)
      
    } catch (error: any) {
      console.error('[CompanySearch] Erro:', error)
      setError(error.message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!searchResult) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      console.log('[CompanySearch] Salvando e analisando empresa:', searchResult.razao)
      
      const response = await fetch('/api/companies/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cnpj',
          query: searchResult.cnpj
        })
      })

      const data = await response.json()
      console.log('[CompanySearch] Resposta salvar:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar empresa')
      }

      setSuccess(`✅ Empresa "${searchResult.fantasia}" adicionada e analisada com sucesso! Redirecionando...`)
      setSearchResult(null)
      setSearchQuery("")
      
      // Recarregar página após 3 segundos para mostrar a nova empresa
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error: any) {
      console.error('[CompanySearch] Erro ao salvar:', error)
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVA": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "INATIVA": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "SUSPENSA": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getPorteColor = (porte: string) => {
    switch (porte) {
      case "GRANDE": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "MÉDIO": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "PEQUENO": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-6 w-6 text-blue-400" />
          Adicionar Nova Empresa
        </CardTitle>
        <CardDescription className="text-slate-400">
          Busque empresas por CNPJ ou website e adicione ao sistema para análise completa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Busca */}
          <div className="space-y-4">
            <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "cnpj" | "website")}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                <TabsTrigger value="cnpj" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Buscar por CNPJ
                </TabsTrigger>
                <TabsTrigger value="website" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Buscar por Website
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="text-slate-300">
                  {searchType === "cnpj" ? "CNPJ" : "Website"}
                </Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchType === "cnpj" ? "00.000.000/0000-00" : "exemplo.com.br"}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-blue-600 to-slate-600 text-white font-medium hover:from-blue-700 hover:to-slate-700"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          {/* Resultado da Busca */}
          {searchResult && (
            <Card className="bg-slate-700/30 border-slate-600/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {searchResult.fantasia || searchResult.razao}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {searchResult.razao}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(searchResult.situacao)}>
                      {searchResult.situacao}
                    </Badge>
                    <Badge className={getPorteColor(searchResult.porte)}>
                      {searchResult.porte}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">CNPJ:</span>
                      <span className="text-sm">{searchResult.cnpj}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Localização:</span>
                      <span className="text-sm">{searchResult.cidade}/{searchResult.uf}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Abertura:</span>
                      <span className="text-sm">{new Date(searchResult.abertura).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Capital Social:</span>
                      <span className="text-sm">{searchResult.capitalSocial}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {searchResult.email && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm">{searchResult.email}</span>
                      </div>
                    )}
                    {searchResult.telefone && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm font-medium">Telefone:</span>
                        <span className="text-sm">{searchResult.telefone}</span>
                      </div>
                    )}
                    {searchResult.website && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">Website:</span>
                        <span className="text-sm">{searchResult.website}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">CNAE:</span>
                      <span className="text-sm">{searchResult.cnae}</span>
                    </div>
                  </div>
                </div>

                {/* Insights de IA */}
                {(searchResult as any).preview?.insights && (searchResult as any).preview.insights.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-blue-400">💡</span> Insights Automáticos
                    </h3>
                    <div className="space-y-2">
                      {(searchResult as any).preview.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span className="text-slate-300">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {(searchResult as any).preview?.redFlags && (searchResult as any).preview.redFlags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-orange-400">⚠️</span> Pontos de Atenção
                    </h3>
                    <div className="space-y-2">
                      {(searchResult as any).preview.redFlags.map((flag: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-400 mt-0.5">•</span>
                          <span className="text-slate-300">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score de Confiabilidade */}
                {(searchResult as any).preview?.score && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Score de Confiabilidade:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                            style={{ width: `${(searchResult as any).preview.score}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-white">{(searchResult as any).preview.score}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quadro Societário */}
                {(searchResult as any).preview?.quadroSocietario && (searchResult as any).preview.quadroSocietario.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="text-purple-400">👥</span> Quadro Societário ({(searchResult as any).preview.quadroSocietario.length})
                    </h3>
                    <div className="space-y-2">
                      {(searchResult as any).preview.quadroSocietario.slice(0, 3).map((socio: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-slate-700/30 rounded">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <div>
                            <div className="text-white font-medium">{socio.nome}</div>
                            <div className="text-slate-400 text-xs">{socio.qualificacao}</div>
                          </div>
                        </div>
                      ))}
                      {(searchResult as any).preview.quadroSocietario.length > 3 && (
                        <p className="text-xs text-slate-400 text-center">
                          +{(searchResult as any).preview.quadroSocietario.length - 3} sócios adicionais
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-slate-600/50">
                  <Button
                    onClick={handleSaveCompany}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Adicionando e Analisando..." : "Adicionar e Analisar Empresa"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">Como funciona:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Digite o CNPJ (com ou sem formatação) ou o website da empresa</li>
              <li>• O sistema busca dados reais na Receita Federal</li>
              <li>• Após adicionar, a empresa será analisada automaticamente</li>
              <li>• Tech Stack, Decisores, Financeiro e Maturidade serão calculados</li>
              <li>• A empresa aparecerá na lista do dashboard</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
