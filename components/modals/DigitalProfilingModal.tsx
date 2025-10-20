"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Youtube,
  Loader2,
  ExternalLink,
  TrendingUp,
  User,
  Building2,
  Briefcase
} from "lucide-react"

interface DigitalProfilingModalProps {
  isOpen: boolean
  onClose: () => void
  companyName?: string
}

interface Profile {
  network: string
  url: string
  handle: string | null
  confidence: number
  status: 'confirmed' | 'probable' | 'pending'
  metadata?: any
}

interface ResolutionResult {
  person: {
    id: string
    name: string
    role: string | null
    company: string | null
  }
  profiles: Profile[]
  summary: {
    total: number
    confirmed: number
    probable: number
    pending: number
  }
}

const networkIcons: Record<string, any> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  github: Github,
  youtube: Youtube
}

const networkColors: Record<string, string> = {
  linkedin: 'text-blue-500',
  twitter: 'text-sky-400',
  instagram: 'text-pink-500',
  github: 'text-purple-500',
  youtube: 'text-red-500'
}

const statusConfig = {
  confirmed: { 
    icon: CheckCircle2, 
    color: 'text-green-500', 
    bg: 'bg-green-500/10 border-green-500/20',
    label: 'Confirmado'
  },
  probable: { 
    icon: AlertCircle, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    label: 'Provável'
  },
  pending: { 
    icon: Clock, 
    color: 'text-slate-500', 
    bg: 'bg-slate-500/10 border-slate-500/20',
    label: 'Pendente'
  }
}

export function DigitalProfilingModal({ isOpen, onClose, companyName }: DigitalProfilingModalProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResolutionResult | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [company, setCompany] = useState(companyName || '')
  const [role, setRole] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [email, setEmail] = useState('')

  const handleResolve = async () => {
    if (!name) {
      alert('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/identity/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          role,
          linkedinUrl,
          email
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
        console.log('[Digital Profiling] ✅ Resolução completa:', data.summary)
      } else {
        console.error('[Digital Profiling] ❌ Erro:', data.error)
        alert('Erro ao resolver identidade: ' + data.error)
      }
    } catch (error) {
      console.error('[Digital Profiling] ❌ Erro na requisição:', error)
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, confidence: number) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label} ({Math.round(confidence * 100)}%)
        </span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            Perfil Digital Inteligente
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Descoberta automática de perfis sociais com validação por IA
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark:bg-slate-800">
            <TabsTrigger value="input" className="dark:data-[state=active]:bg-slate-700">
              <Search className="h-4 w-4 mr-2" />
              Buscar Perfis
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              disabled={!result}
              className="dark:data-[state=active]:bg-slate-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Resultados {result && `(${result.summary.total})`}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: INPUT */}
          <TabsContent value="input" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-200 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="company" className="dark:text-gray-200 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </Label>
                <Input
                  id="company"
                  placeholder="Tech Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Cargo */}
              <div className="space-y-2">
                <Label htmlFor="role" className="dark:text-gray-200 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Cargo
                </Label>
                <Input
                  id="role"
                  placeholder="Diretor de TI"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@techcorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="linkedin" className="dark:text-gray-200 flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-500" />
                  LinkedIn URL (opcional)
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/joaosilva"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Info Box */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 dark:border-purple-500/30 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold dark:text-white mb-1">
                    Como funciona?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Nossa IA busca automaticamente em <strong>LinkedIn, Twitter, Instagram, GitHub, YouTube</strong> e mais. 
                    Cada perfil recebe um <strong>score de confiança</strong> baseado em evidências cruzadas. 
                    Apenas perfis com <strong>≥85% + 2 evidências</strong> são marcados como confirmados.
                  </p>
                </div>
              </div>
            </Card>

            {/* Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleResolve}
                disabled={loading || !name}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Descobrindo Perfis...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Iniciar Busca Inteligente
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: RESULTS */}
          <TabsContent value="results" className="space-y-6 mt-6">
            {result && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 dark:border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                        <p className="text-2xl font-bold dark:text-white">{result.summary.total}</p>
                      </div>
                      <Sparkles className="h-8 w-8 text-purple-500" />
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 dark:border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Confirmados</p>
                        <p className="text-2xl font-bold text-green-500">{result.summary.confirmed}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 dark:border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Prováveis</p>
                        <p className="text-2xl font-bold text-yellow-500">{result.summary.probable}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-slate-500/10 to-slate-500/5 border-slate-500/20 dark:border-slate-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pendentes</p>
                        <p className="text-2xl font-bold text-slate-500">{result.summary.pending}</p>
                      </div>
                      <Clock className="h-8 w-8 text-slate-500" />
                    </div>
                  </Card>
                </div>

                {/* Profile List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold dark:text-white">Perfis Descobertos</h3>
                  
                  {result.profiles.map((profile, index) => {
                    const Icon = networkIcons[profile.network] || User
                    const colorClass = networkColors[profile.network] || 'text-slate-500'
                    
                    return (
                      <Card 
                        key={index}
                        className="p-4 hover:shadow-lg transition-all dark:bg-slate-800 dark:border-slate-700 hover:border-purple-500/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-900`}>
                              <Icon className={`h-6 w-6 ${colorClass}`} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold capitalize dark:text-white">
                                  {profile.network}
                                </h4>
                                {profile.handle && (
                                  <Badge variant="outline" className="text-xs dark:border-slate-600">
                                    @{profile.handle}
                                  </Badge>
                                )}
                              </div>
                              <a 
                                href={profile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1"
                              >
                                {profile.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getStatusBadge(profile.status, profile.confidence)}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button variant="outline" onClick={onClose} className="dark:border-slate-600 dark:text-white">
                    Fechar
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Playbook (Em Breve)
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

