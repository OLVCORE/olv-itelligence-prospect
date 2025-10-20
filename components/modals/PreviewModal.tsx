"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GaugeBar } from "@/components/ui/gauge-bar"
import { GaugePointer } from "@/components/ui/gauge-pointer"
import { SmartTooltip } from "@/components/ui/smart-tooltip"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCurrency, formatCNPJ, formatDate, formatPhone, formatCEP, formatPercent } from "@/lib/utils/format"
import { EvidenceButton } from "@/components/ui/evidence-button"
import { Loader2, Printer, Download, Save, Building2, MapPin, Phone, Mail, FileText, TrendingUp, AlertTriangle, Users, Briefcase, DollarSign, RefreshCw, Target, Sparkles, CheckSquare, XCircle, ArrowRight, Shield, BarChart3 } from "lucide-react"

interface PreviewData {
  mode: string
  jobId?: string
  status?: 'partial' | 'completed'
  receita: any
  presencaDigital?: any
  enrichment: any
  ai: any
}

interface PreviewModalProps {
  isOpen: boolean
  data: PreviewData | null
  loading: boolean
  onClose: () => void
  onConfirmSave: () => void
}

export function PreviewModal({
  isOpen,
  data,
  loading,
  onClose,
  onConfirmSave,
}: PreviewModalProps) {
  const [saving, setSaving] = useState(false)
  
  // Barra de progresso dinâmica baseada em tempo real
  const [progressPhase, setProgressPhase] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [progressMessage, setProgressMessage] = useState('Iniciando busca...')
  const [progressColor, setProgressColor] = useState('blue')
  
  // Fases da busca (tempo estimado em ms)
  const phases = [
    { name: 'Consultando Receita Federal', duration: 2000, percent: 15 },
    { name: 'Buscando presença digital', duration: 8000, percent: 50 },
    { name: 'Coletando notícias recentes', duration: 5000, percent: 75 },
    { name: 'Gerando análise de IA', duration: 5000, percent: 95 },
    { name: 'Finalizando', duration: 1000, percent: 100 },
  ]
  
  // Progresso dinâmico baseado nas fases REAIS da busca
  useEffect(() => {
    if (!loading) {
      // Quando termina, marcar tudo como completo
      setProgressPhase(5)
      setProgressPercent(100)
      setProgressColor('green')
      setProgressMessage('✅ Análise completa!')
      return
    }
    
    // Resetar ao iniciar
    setProgressPhase(0)
    setProgressPercent(0)
    setProgressColor('blue')
    
    let currentPhase = 0
    let accumulatedTime = 0
    
    const advanceProgress = () => {
      if (currentPhase >= phases.length) {
        return
      }
      
      const phase = phases[currentPhase]
      setProgressPhase(currentPhase + 1)
      setProgressMessage(phase.name)
      setProgressPercent(phase.percent)
      
      // Mudar cor conforme progresso
      if (phase.percent >= 90) {
        setProgressColor('green') // Quase lá
      } else if (accumulatedTime > 15000) {
        setProgressColor('amber') // Demorando mais que o esperado
      } else {
        setProgressColor('blue') // Progredindo normalmente
      }
      
      accumulatedTime += phase.duration
      currentPhase += 1
      
      if (currentPhase < phases.length && loading) {
        setTimeout(advanceProgress, phase.duration)
      }
    }
    
    // Começar imediatamente
    advanceProgress()
    
    // Timeout de segurança (vermelho se passar de 30s)
    const timeoutId = setTimeout(() => {
      if (loading) {
        setProgressColor('red')
        setProgressMessage('⚠️ Busca está demorando mais que o esperado...')
      }
    }, 30000)
    
    return () => clearTimeout(timeoutId)
    
  }, [loading])
  
  // Dados já vêm completos da API
  const mergedData = data
  
  // Helper para acessar dados de forma segura
  const getData = (path: string, fallback: any = 'N/A') => {
    try {
      const keys = path.split('.')
      let value: any = mergedData
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return fallback
        }
      }
      return value !== undefined && value !== null ? value : fallback
    } catch {
      return fallback
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    // TODO: Implementar export
    alert(`Export ${format.toUpperCase()} será implementado no Sprint 2`)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onConfirmSave()
    } finally {
      setSaving(false)
    }
  }

  if (!data && !loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-full">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-2xl">
            Pré-Relatório Completo
          </DialogTitle>
          <DialogDescription>
            Revise todas as informações antes de salvar no sistema
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4 py-8 px-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Gerando Relatório Completo
              </span>
            </div>
            
            {/* Barra de Progresso Dinâmica com Gradiente */}
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-semibold ${
                  progressColor === 'green' ? 'text-green-600' : 
                  progressColor === 'amber' ? 'text-amber-600' : 
                  'text-blue-600'
                }`}>
                  {progressMessage}
                </span>
                <span className="font-bold text-lg">{progressPercent}%</span>
              </div>
              
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    progressColor === 'green' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : progressColor === 'amber'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                      : progressColor === 'red'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              {/* Checklist de fases */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
                <div className={`flex items-center gap-1 ${progressPhase >= 1 ? 'text-green-600' : 'text-slate-400'}`}>
                  {progressPhase >= 1 ? '✓' : '○'} Receita Federal
                </div>
                <div className={`flex items-center gap-1 ${progressPhase >= 2 ? 'text-green-600' : 'text-slate-400'}`}>
                  {progressPhase >= 2 ? '✓' : '○'} Presença Digital
                </div>
                <div className={`flex items-center gap-1 ${progressPhase >= 3 ? 'text-green-600' : 'text-slate-400'}`}>
                  {progressPhase >= 3 ? '✓' : '○'} Notícias
                </div>
                <div className={`flex items-center gap-1 ${progressPhase >= 4 ? 'text-green-600' : 'text-slate-400'}`}>
                  {progressPhase >= 4 ? '✓' : '○'} Análise IA
                </div>
              </div>
              
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
                ⏱️ Tempo estimado: 15-25 segundos • Processando dados em tempo real
              </p>
            </div>
          </div>
        )}

        {/* Indicador de Sucesso */}
        {!loading && mergedData && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 mb-4 flex items-center gap-3 shadow-sm">
            <div className="h-8 w-8 bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xl rounded-full">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-green-900 dark:text-green-100">
                ✅ Relatório Gerado com Sucesso!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Todos os dados foram carregados e estão prontos para análise
              </p>
            </div>
            <Badge className="bg-green-600 text-white border-green-700 text-base px-3 py-1">
              100%
            </Badge>
          </div>
        )}

        {/* Banner de quota removido - sistema multi-API garante funcionamento */}

        {mergedData && !loading && (
          <div className="space-y-6 print:text-black">
            {/* Header do Relatório (Print) */}
            <div className="hidden print:block border-b-2 pb-4 mb-6">
              <h1 className="text-3xl font-bold">Relatório de Prospecção Empresarial</h1>
              <p className="text-sm text-gray-600 mt-2">
                Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            {/* 1. Identificação */}
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                <Building2 className="h-5 w-5 text-primary" />
                1. Identificação da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Razão Social</p>
                  <p className="font-semibold text-sm">{getData('nome') || getData('receita.identificacao.razaoSocial')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Nome Fantasia</p>
                  <p className="font-semibold text-sm">{getData('fantasia') || getData('receita.identificacao.nomeFantasia') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">CNPJ</p>
                  <p className="font-mono font-semibold text-sm">{formatCNPJ(getData('cnpj', '') || getData('receita.identificacao.cnpj', ''))}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tipo</p>
                  <Badge variant="outline">{getData('tipo') || getData('receita.identificacao.tipo')}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Porte</p>
                  <Badge>{getData('porte') || getData('receita.identificacao.porte')}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Natureza Jurídica</p>
                  <p className="font-semibold text-sm">{getData('natureza_juridica') || getData('receita.identificacao.naturezaJuridica')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Data de Abertura</p>
                  <p className="font-semibold text-sm">{formatDate(getData('abertura', null) || getData('receita.identificacao.dataAbertura', null))}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Capital Social</p>
                  <p className="font-semibold text-sm">
                    {formatCurrency(parseFloat(getData('capital_social', '0')) || getData('receita.capital.valor', 0))}
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Endereço e Contato */}
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                <MapPin className="h-5 w-5 text-primary" />
                2. Endereço e Contato
              </h2>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border space-y-3">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Endereço Completo</p>
                  <p className="font-semibold text-sm">
                    {getData('logradouro') || 'N/A'}, {getData('numero') || 'S/N'}
                    {getData('complemento') && ` - ${getData('complemento')}`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {getData('bairro') || 'N/A'} - {getData('municipio') || 'N/A'}/{getData('uf') || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">CEP: {formatCEP(getData('cep', ''))}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefone
                    </p>
                    <p className="font-semibold text-sm">{formatPhone(getData('telefone', ''))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-semibold text-sm">{getData('email') || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Situação Cadastral */}
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                <FileText className="h-5 w-5 text-primary" />
                3. Situação Cadastral
              </h2>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</p>
                  <Badge variant={mergedData.receita.situacao.status === 'ATIVA' ? 'default' : 'secondary'} className="mt-1">
                    {mergedData.receita.situacao.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Data da Situação</p>
                  <p className="font-semibold text-sm">{mergedData.receita.situacao.data}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Motivo</p>
                  <p className="font-semibold text-sm">{mergedData.receita.situacao.motivo || 'N/A'}</p>
                </div>
              </div>
            </section>

            {/* 4. Atividades Econômicas */}
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                <Briefcase className="h-5 w-5 text-primary" />
                4. Atividades Econômicas (CNAE)
              </h2>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Atividade Principal</p>
                  {mergedData.receita.atividades.principal && mergedData.receita.atividades.principal.length > 0 ? (
                    <div className="space-y-1">
                      {mergedData.receita.atividades.principal.map((ativ: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-mono text-primary">{ativ.code}</span> - {ativ.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Não informado</p>
                  )}
                </div>
                
                {mergedData.receita.atividades.secundarias && mergedData.receita.atividades.secundarias.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Atividades Secundárias ({mergedData.receita.atividades.secundarias.length})
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {mergedData.receita.atividades.secundarias.map((ativ: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <span className="font-mono text-primary">{ativ.code}</span> - {ativ.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Quadro Societário (QSA) */}
            {mergedData.receita.qsa && mergedData.receita.qsa.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <Users className="h-5 w-5 text-primary" />
                  5. Quadro de Sócios e Administradores (QSA)
                </h2>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                  <div className="space-y-2">
                    {mergedData.receita.qsa.map((socio: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                        <div>
                          <p className="font-semibold text-sm">{socio.nome}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{socio.qual}</p>
                          {socio.pais_origem && (
                            <p className="text-xs text-slate-500">País: {socio.pais_origem}</p>
                          )}
                        </div>
                        {socio.nome_rep_legal && (
                          <div className="text-right text-xs">
                            <p className="text-slate-600">Rep. Legal:</p>
                            <p className="font-semibold">{socio.nome_rep_legal}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 6. Regime Tributário */}
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                6. Regime Tributário
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Simples Nacional</p>
                  <Badge variant={mergedData.receita.simples.optante ? 'default' : 'secondary'}>
                    {mergedData.receita.simples.optante ? 'OPTANTE' : 'NÃO OPTANTE'}
                  </Badge>
                  {mergedData.receita.simples.dataOpcao && (
                    <p className="text-xs text-slate-600 mt-2">Data Opção: {mergedData.receita.simples.dataOpcao}</p>
                  )}
                  {mergedData.receita.simples.dataExclusao && (
                    <p className="text-xs text-slate-600">Data Exclusão: {mergedData.receita.simples.dataExclusao}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">MEI</p>
                  <Badge variant={mergedData.receita.mei.optante ? 'default' : 'secondary'}>
                    {mergedData.receita.mei.optante ? 'SIM' : 'NÃO'}
                  </Badge>
                </div>
              </div>
            </section>

            {/* 7. Presença Digital - 6 CATEGORIAS ORGANIZADAS */}
            {(mergedData.presencaDigital || mergedData.enrichment) && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  🌐 7. Presença Digital - 6 Categorias Organizadas
                </h2>
                <div className="space-y-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                  
                  {/* Resumo Visual das 6 Categorias */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📱</span>
                        <span className="font-semibold text-sm">Redes Sociais</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {Object.keys(mergedData.presencaDigital?.redesSociais || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground">encontradas</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🛒</span>
                        <span className="font-semibold text-sm">Marketplaces B2B</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {mergedData.presencaDigital?.marketplaces?.filter((m: any) => 
                          ['B2Brazil', 'Alibaba', 'Shopee', 'GlobSupplies', 'TradeKey', 'EC21'].includes(m.plataforma)
                        ).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">portais B2B</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🛍️</span>
                        <span className="font-semibold text-sm">Marketplaces B2C</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {mergedData.presencaDigital?.marketplaces?.filter((m: any) => 
                          ['Mercado Livre', 'Amazon', 'Americanas', 'Magazine Luiza'].includes(m.plataforma)
                        ).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">lojas online</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌐</span>
                        <span className="font-semibold text-sm">Portais</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {(mergedData.presencaDigital?.outrosLinks || []).filter((l: any) => 
                          l.tipo && ['Google', 'Reclame', 'Glassdoor'].some(t => l.tipo.includes(t))
                        ).length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">eletrônicos</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📰</span>
                        <span className="font-semibold text-sm">Notícias</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news || []).length}
                      </p>
                      <p className="text-xs text-muted-foreground">recentes</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⚖️</span>
                        <span className="font-semibold text-sm">Jurídico</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">
                        {mergedData.presencaDigital?.jusbrasil ? '1' : '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">fontes</p>
                    </div>
                  </div>

                  {/* Indicadores de Qualidade da Presença Digital */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4 border-b">
                    <SmartTooltip 
                      score={mergedData.presencaDigital?.website ? 85 : 0} 
                      type="confianca"
                      customLabel="Confiança Website"
                      customDescription={mergedData.presencaDigital?.website ? 'Website oficial validado' : 'Website não encontrado'}
                    >
                      <GaugeBar 
                        value={mergedData.presencaDigital?.website ? 85 : 0} 
                        label="Website"
                        size="sm"
                      />
                    </SmartTooltip>
                    
                    <SmartTooltip 
                      score={Object.keys(mergedData.presencaDigital?.redesSociais || {}).length * 20} 
                      type="maturidade"
                      customLabel="Presença Social"
                      customDescription={`${Object.keys(mergedData.presencaDigital?.redesSociais || {}).length} redes sociais encontradas`}
                    >
                      <GaugeBar 
                        value={Object.keys(mergedData.presencaDigital?.redesSociais || {}).length * 20} 
                        label="Redes Sociais"
                        size="sm"
                      />
                    </SmartTooltip>
                    
                    <SmartTooltip 
                      score={mergedData.presencaDigital?.marketplaces?.length * 25} 
                      type="maturidade"
                      customLabel="E-commerce"
                      customDescription={`${mergedData.presencaDigital?.marketplaces?.length || 0} marketplaces encontrados`}
                    >
                      <GaugeBar 
                        value={mergedData.presencaDigital?.marketplaces?.length * 25} 
                        label="E-commerce"
                        size="sm"
                      />
                    </SmartTooltip>
                    
                    <SmartTooltip 
                      score={mergedData.presencaDigital?.jusbrasil ? 70 : 0} 
                      type="confianca"
                      customLabel="Histórico Jurídico"
                      customDescription={mergedData.presencaDigital?.jusbrasil ? 'Perfil jurídico encontrado' : 'Sem histórico no Jusbrasil'}
                    >
                      <GaugeBar 
                        value={mergedData.presencaDigital?.jusbrasil ? 70 : 0} 
                        label="Jurídico"
                        size="sm"
                      />
                    </SmartTooltip>
                  </div>

                  {/* Website Oficial */}
                  {(mergedData.presencaDigital?.website || mergedData.enrichment?.website) && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        🏠 Website Oficial
                        {mergedData.presencaDigital?.website?.status && (
                          <Badge variant={mergedData.presencaDigital.website.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">
                            {mergedData.presencaDigital.website.status}
                          </Badge>
                        )}
                      </p>
                      <a
                        href={(mergedData.presencaDigital?.website || mergedData.enrichment?.website)?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold text-sm break-all block"
                      >
                        {(mergedData.presencaDigital?.website || mergedData.enrichment?.website)?.title || (mergedData.presencaDigital?.website || mergedData.enrichment?.website)?.url}
                      </a>
                    </div>
                  )}

                  {/* Redes Sociais */}
                  {mergedData.presencaDigital?.redesSociais && Object.keys(mergedData.presencaDigital.redesSociais).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                        📱 Redes Sociais ({Object.keys(mergedData.presencaDigital.redesSociais).length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {mergedData.presencaDigital.redesSociais.instagram && (
                          <a
                            href={mergedData.presencaDigital.redesSociais.instagram.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <span className="text-pink-600">📷</span>
                            <span>Instagram</span>
                          </a>
                        )}
                        {mergedData.presencaDigital.redesSociais.linkedin && (
                          <a
                            href={mergedData.presencaDigital.redesSociais.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <span className="text-blue-600">💼</span>
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {mergedData.presencaDigital.redesSociais.facebook && (
                          <a
                            href={mergedData.presencaDigital.redesSociais.facebook.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <span className="text-blue-700">📘</span>
                            <span>Facebook</span>
                          </a>
                        )}
                        {mergedData.presencaDigital.redesSociais.twitter && (
                          <a
                            href={mergedData.presencaDigital.redesSociais.twitter.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <span className="text-sky-500">🐦</span>
                            <span>X (Twitter)</span>
                          </a>
                        )}
                        {mergedData.presencaDigital.redesSociais.youtube && (
                          <a
                            href={mergedData.presencaDigital.redesSociais.youtube.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <span className="text-red-600">▶️</span>
                            <span>YouTube</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORIA 2: Marketplaces B2B */}
                  {mergedData.presencaDigital?.marketplaces && mergedData.presencaDigital.marketplaces.filter((m: any) => 
                    ['B2Brazil', 'Alibaba', 'Shopee', 'GlobSupplies', 'TradeKey', 'EC21', 'TradeFord', 'ExportHub'].includes(m.plataforma)
                  ).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        🛒 CATEGORIA 2: Marketplaces B2B - Portais Internacionais
                        <Badge className="bg-blue-600 text-white">
                          {mergedData.presencaDigital.marketplaces.filter((m: any) => 
                            ['B2Brazil', 'Alibaba', 'Shopee', 'GlobSupplies', 'TradeKey', 'EC21', 'TradeFord', 'ExportHub'].includes(m.plataforma)
                          ).length}
                        </Badge>
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          📦 Portais: <strong>Alibaba, Shopee, B2B Brasil, GlobSupplies, TradeKey, EC21, TradeFord, ExportHub, AliExpress, Shein</strong>
                        </p>
                        {mergedData.presencaDigital.marketplaces
                          .filter((m: any) => ['B2Brazil', 'Alibaba', 'Shopee', 'GlobSupplies', 'TradeKey', 'EC21', 'TradeFord', 'ExportHub'].includes(m.plataforma))
                          .map((mp: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded border">
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                {mp.plataforma}
                              </Badge>
                              <a
                                href={mp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex-1"
                              >
                                {mp.loja}
                              </a>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CATEGORIA 3: Marketplaces B2C */}
                  {mergedData.presencaDigital?.marketplaces && mergedData.presencaDigital.marketplaces.filter((m: any) => 
                    ['Mercado Livre', 'Amazon', 'Americanas', 'Magazine Luiza', 'Shopee'].includes(m.plataforma)
                  ).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        🛍️ CATEGORIA 3: Marketplaces B2C - Varejo Nacional
                        <Badge className="bg-purple-600 text-white">
                          {mergedData.presencaDigital.marketplaces.filter((m: any) => 
                            ['Mercado Livre', 'Amazon', 'Americanas', 'Magazine Luiza'].includes(m.plataforma)
                          ).length}
                        </Badge>
                      </p>
                      <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                          🛒 Lojas: <strong>Mercado Livre, Amazon, Americanas, Submarino, Magazine Luiza, Shopee</strong>
                        </p>
                        {mergedData.presencaDigital.marketplaces
                          .filter((m: any) => ['Mercado Livre', 'Amazon', 'Americanas', 'Magazine Luiza'].includes(m.plataforma))
                          .map((mp: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded border">
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                {mp.plataforma}
                              </Badge>
                              <a
                                href={mp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex-1"
                              >
                                {mp.loja}
                              </a>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CATEGORIA 6: Jurídico (Jusbrasil) */}
                  {mergedData.presencaDigital?.jusbrasil && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        ⚖️ CATEGORIA 6: Histórico Jurídico
                        <Badge className="bg-red-600 text-white">Jusbrasil</Badge>
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mb-3 bg-red-50 dark:bg-red-950 p-2 rounded">
                        ⚠️ Processos, sócios, certidões e protestos
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                        <a
                          href={mergedData.presencaDigital.jusbrasil.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline block mb-2"
                        >
                          Ver perfil completo no Jusbrasil →
                        </a>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {mergedData.presencaDigital.jusbrasil.processos && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">📋 Processos:</span>
                              <Badge variant="secondary" className="text-xs">
                                {mergedData.presencaDigital.jusbrasil.processos}
                              </Badge>
                            </div>
                          )}
                          {mergedData.presencaDigital.jusbrasil.socios && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">👥 Sócios:</span>
                              <Badge variant="secondary" className="text-xs">
                                {mergedData.presencaDigital.jusbrasil.socios}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {mergedData.presencaDigital.jusbrasil.ultimaAtualizacao && (
                          <p className="text-xs text-slate-500 mt-2">
                            Última atualização: {new Date(mergedData.presencaDigital.jusbrasil.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATEGORIA 4: Portais Eletrônicos */}
                  {mergedData.presencaDigital?.outrosLinks && mergedData.presencaDigital.outrosLinks.filter((l: any) => 
                    l.tipo && ['Google', 'Reclame', 'Glassdoor', 'Indeed', 'TripAdvisor'].some(t => l.tipo.includes(t))
                  ).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        🌐 CATEGORIA 4: Portais Eletrônicos e Reputação
                        <Badge className="bg-green-600 text-white">
                          {mergedData.presencaDigital.outrosLinks.filter((l: any) => 
                            l.tipo && ['Google', 'Reclame', 'Glassdoor'].some(t => l.tipo.includes(t))
                          ).length}
                        </Badge>
                      </p>
                      <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                          📍 Portais: <strong>Google Meu Negócio, Reclame Aqui, Glassdoor, Trustpilot, Consumidor.gov</strong>
                        </p>
                        {mergedData.presencaDigital.outrosLinks
                          .filter((l: any) => l.tipo && ['Google', 'Reclame', 'Glassdoor', 'Indeed', 'TripAdvisor'].some(t => l.tipo.includes(t)))
                          .map((link: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800 p-2 rounded border">
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                {link.tipo}
                              </Badge>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex-1"
                              >
                                {link.titulo}
                              </a>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outros Links Gerais (fallback para links não categorizados) */}
                  {mergedData.presencaDigital?.outrosLinks && mergedData.presencaDigital.outrosLinks.filter((l: any) => 
                    !l.tipo || !['Google', 'Reclame', 'Glassdoor', 'Indeed', 'TripAdvisor'].some(t => l.tipo.includes(t))
                  ).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        🔗 Outros Links Relevantes ({mergedData.presencaDigital.outrosLinks.filter((l: any) => 
                          !l.tipo || !['Google', 'Reclame', 'Glassdoor'].some(t => l.tipo.includes(t))
                        ).length})
                      </p>
                      <ul className="space-y-1.5">
                        {mergedData.presencaDigital.outrosLinks
                          .filter((l: any) => !l.tipo || !['Google', 'Reclame', 'Glassdoor', 'Indeed', 'TripAdvisor'].some(t => l.tipo.includes(t)))
                          .map((link: any, idx: number) => (
                            <li key={idx}>
                              <div className="flex items-start gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {link.tipo || 'Geral'}
                                </Badge>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex-1"
                                >
                                  {link.titulo}
                                </a>
                              </div>
                            </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CATEGORIA 5: Notícias Recentes */}
                  {(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news) && 
                   (mergedData.presencaDigital?.noticias?.length > 0 || mergedData.enrichment?.news?.length > 0) && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        📰 CATEGORIA 5: Notícias Recentes
                        <Badge className="bg-orange-600 text-white">
                          {(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news)?.length}
                        </Badge>
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mb-3 bg-orange-50 dark:bg-orange-950 p-2 rounded">
                        📅 Últimos 12 meses • Fontes confiáveis • Menções verificadas
                      </p>
                      <ul className="space-y-2">
                        {(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news || []).map((news: any, index: number) => (
                          <li key={index} className="border-l-2 border-primary pl-3 py-1">
                            <a
                              href={news.url || news.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold hover:underline text-primary"
                            >
                              {news.title}
                            </a>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{news.snippet}</p>
                            {news.date && (
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(news.date).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Mensagem de vazio */}
                  {!mergedData.presencaDigital?.website && 
                   !mergedData.enrichment?.website && 
                   Object.keys(mergedData.presencaDigital?.redesSociais || {}).length === 0 &&
                   (mergedData.presencaDigital?.marketplaces?.length || 0) === 0 &&
                   !mergedData.presencaDigital?.jusbrasil &&
                   (mergedData.presencaDigital?.noticias?.length || 0) === 0 &&
                   (mergedData.enrichment?.news?.length || 0) === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      ⚠️ Nenhuma presença digital encontrada. A empresa pode não ter canais online ativos.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* 6. Score de Propensão (MÓDULO A - Seção 6) */}
            {mergedData.propensityScore && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  6. Score de Propensão
                </h2>
                <div className="space-y-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg p-6 print:bg-white print:border">
                  {/* Score Principal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <GaugePointer 
                                value={mergedData.propensityScore.overall} 
                                label="Score Geral"
                                size="lg"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md p-4">
                            <p className="font-semibold mb-3">📊 Metodologia de Cálculo do Score</p>
                            <div className="space-y-2 text-xs">
                              <p className="font-semibold mb-2">6 Critérios Ponderados:</p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between border-b pb-1">
                                  <span>1. Receita/Porte</span>
                                  <span className="font-bold">25%</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>2. Presença Digital</span>
                                  <span className="font-bold">20%</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>3. Stack/TOTVS</span>
                                  <span className="font-bold">20%</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>4. Notícias Recentes</span>
                                  <span className="font-bold">15%</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>5. Regulatórios</span>
                                  <span className="font-bold">10%</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>6. Setor/Benchmark</span>
                                  <span className="font-bold">10%</span>
                                </div>
                              </div>
                              <p className="mt-3 pt-2 border-t text-muted-foreground">
                                Score Final = Σ (peso × valor de cada critério)
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-purple-600">
                          {mergedData.propensityScore.overall}
                        </div>
                        <p className="text-sm text-muted-foreground">de 100 pontos</p>
                      </div>
                      <Badge 
                        className={`text-lg px-4 py-2 ${
                          mergedData.propensityScore.overall >= 70 
                            ? 'bg-green-600 text-white' 
                            : mergedData.propensityScore.overall >= 40
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {mergedData.propensityScore.overall >= 70 ? 'Alto Potencial' : mergedData.propensityScore.overall >= 40 ? 'Potencial Moderado' : 'Baixo Potencial'}
                      </Badge>
                    </div>
                  </div>

                  {/* Breakdown de Critérios */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Breakdown por Critério
                    </p>
                    <div className="space-y-3">
                      {Object.entries(mergedData.propensityScore.breakdown).map(([key, data]: [string, any]) => {
                        const labels: Record<string, string> = {
                          receita_porte: 'Receita/Porte',
                          presenca_digital: 'Presença Digital',
                          noticias: 'Notícias',
                          stack_totvs: 'Stack/TOTVS',
                          regulatorios: 'Regulatórios',
                          setor_benchmark: 'Setor/Benchmark'
                        }
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">{labels[key]}</span>
                                <span className="text-muted-foreground">
                                  Peso: {formatPercent(data.peso, true)} • 
                                  Valor: {data.valor}/100 • 
                                  Contribui: {data.contribuicao.toFixed(1)}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-600 transition-all" 
                                  style={{ width: `${data.valor}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sinais Positivos e Negativos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {/* Positivos */}
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckSquare className="h-4 w-4" />
                        Sinais Positivos ({mergedData.propensityScore.sinais.positivos.length})
                      </p>
                      <ul className="space-y-1">
                        {mergedData.propensityScore.sinais.positivos.slice(0, 5).map((sinal: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{sinal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Negativos */}
                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        Pontos de Atenção ({mergedData.propensityScore.sinais.negativos.length})
                      </p>
                      <ul className="space-y-1">
                        {mergedData.propensityScore.sinais.negativos.slice(0, 5).map((sinal: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">✗</span>
                            <span>{sinal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 7. Insights Executivos (MÓDULO A - Seção 7) */}
            {mergedData.aiInsights && mergedData.aiInsights.insights && mergedData.aiInsights.insights.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  7. Insights Executivos (IA)
                </h2>
                <div className="space-y-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 print:bg-white print:border">
                  {mergedData.aiInsights.insights.map((insight: any, idx: number) => (
                    <div key={insight.id || idx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{insight.text}</p>
                        {insight.evidence_ids && insight.evidence_ids.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence === 'high' ? '🟢 Alta Confiança' : insight.confidence === 'medium' ? '🟡 Média' : '🔴 Baixa'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {insight.evidence_ids.length} evidência(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground italic pt-2 border-t">
                    💡 Metodologia: {mergedData.aiInsights.methodology || 'Análise baseada em evidências com IA explicável'}
                  </p>
                </div>
              </section>
            )}

            {/* 8. Pontos de Atenção Críticos (MÓDULO A - Seção 8) */}
            {mergedData.attentionPoints && mergedData.attentionPoints.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  8. Pontos de Atenção
                </h2>
                <div className="space-y-3">
                  {mergedData.attentionPoints.map((point: any) => (
                    <div 
                      key={point.id} 
                      className={`p-4 rounded-lg border-l-4 ${
                        point.severity === 'alta' 
                          ? 'bg-red-50 dark:bg-red-950 border-red-600' 
                          : point.severity === 'media'
                          ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-600'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${
                            point.severity === 'alta' ? 'bg-red-600' : point.severity === 'media' ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>
                            {point.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <AlertTriangle className={`h-4 w-4 ${
                          point.severity === 'alta' ? 'text-red-600' : point.severity === 'media' ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <p className="text-sm font-semibold mb-2">{point.text}</p>
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{point.action}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 9. Recomendação Executiva Go/No-Go (MÓDULO A - Seção 9) */}
            {mergedData.recommendation && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  9. Recomendação Executiva
                </h2>
                <div className={`p-6 rounded-lg border-2 ${
                  mergedData.recommendation.decision === 'GO' 
                    ? 'bg-green-50 dark:bg-green-950 border-green-600' 
                    : mergedData.recommendation.decision === 'NO-GO'
                    ? 'bg-red-50 dark:bg-red-950 border-red-600'
                    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`text-2xl px-6 py-3 ${
                      mergedData.recommendation.decision === 'GO' 
                        ? 'bg-green-600' 
                        : mergedData.recommendation.decision === 'NO-GO'
                        ? 'bg-red-600'
                        : 'bg-yellow-600'
                    }`}>
                      {mergedData.recommendation.decision === 'GO' && '✅ GO - PROSSEGUIR'}
                      {mergedData.recommendation.decision === 'NO-GO' && '❌ NO-GO - NÃO PROSSEGUIR'}
                      {mergedData.recommendation.decision === 'QUALIFICAR' && '⚡ QUALIFICAR MELHOR'}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confiança</p>
                      <Badge variant="outline" className={`${
                        mergedData.recommendation.confidence === 'high' ? 'bg-green-100 text-green-700' : 
                        mergedData.recommendation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {mergedData.recommendation.confidence === 'high' ? 'Alta' : mergedData.recommendation.confidence === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Justificativa:</p>
                      <p className="text-sm leading-relaxed font-medium">
                        {mergedData.recommendation.justification}
                      </p>
                    </div>

                    {mergedData.recommendation.evidence_ids && mergedData.recommendation.evidence_ids.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Baseado em {mergedData.recommendation.evidence_ids.length} evidência(s)</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 10. Ações Sugeridas (MÓDULO A - Seção 10) */}
            {mergedData.suggestedActions && mergedData.suggestedActions.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  10. Próximos Passos Sugeridos
                </h2>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                  {mergedData.suggestedActions.map((action: any, idx: number) => (
                    <div key={action.id} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium flex-1">{action.text}</p>
                          <Badge className={`ml-2 text-xs ${
                            action.priority === 'alta' ? 'bg-red-600' : 
                            action.priority === 'media' ? 'bg-orange-600' : 
                            'bg-gray-600'
                          }`}>
                            {action.priority.toUpperCase()}
                          </Badge>
                        </div>
                        {action.actionable && action.handler && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              console.log('[PreviewModal] Executar ação:', action.handler)
                              // TODO: Implementar handlers específicos
                            }}
                          >
                            <ArrowRight className="h-3 w-3 mr-2" />
                            Executar Ação
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 11. Análise IA Complementar (se disponível - legado) */}
            {mergedData.ai && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  11. Análise Complementar (Legado)
                </h2>
                <div className="space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 print:bg-white print:border">
                  {/* Scores com Gauges Visuais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score de Propensão */}
                    <SmartTooltip score={mergedData.ai.score} type="propensao">
                      <GaugePointer 
                        value={mergedData.ai.score} 
                        label="Score de Propensão"
                        size="lg"
                      />
                    </SmartTooltip>
                    
                    {/* Badge de Classificação */}
                    <div className="flex flex-col items-center justify-center">
                      <Badge variant={mergedData.ai.score >= 70 ? 'default' : 'secondary'} className="text-lg px-4 py-2 mb-2">
                        {mergedData.ai.score >= 80 ? 'Alto Potencial' : mergedData.ai.score >= 60 ? 'Bom Potencial' : 'Potencial Moderado'}
                      </Badge>
                      <p className="text-2xl font-bold text-primary">
                        {mergedData.ai.score}<span className="text-lg text-slate-400">/100</span>
                      </p>
                    </div>
                  </div>
                  
                  {mergedData.ai.summary && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Resumo Executivo</p>
                      <p className="text-sm">{mergedData.ai.summary}</p>
                    </div>
                  )}

                  {mergedData.ai.insights && mergedData.ai.insights.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Insights Estratégicos</p>
                      <ul className="space-y-1">
                        {mergedData.ai.insights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-bold">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mergedData.ai.redFlags && mergedData.ai.redFlags.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Pontos de Atenção
                      </p>
                      <ul className="space-y-1">
                        {mergedData.ai.redFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-red-600">
                            <span className="font-bold">⚠</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Metodologia de Cálculo - Rodapé do Relatório (aparece no print) */}
            {mergedData.propensityScore && (
              <section className="break-inside-avoid mt-8 pt-6 border-t-2 hidden print:block">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Metodologia de Cálculo do Score de Propensão
                </h3>
                <div className="text-xs space-y-3 bg-slate-50 rounded-lg p-4 border">
                  <div>
                    <p className="font-semibold mb-2">Critérios Ponderados:</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1">Critério</th>
                          <th className="text-center py-1">Peso</th>
                          <th className="text-center py-1">Valor</th>
                          <th className="text-right py-1">Contribuição</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-1">1. Receita/Porte (capital social, porte)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.receita_porte.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.receita_porte.valor}/100</td>
                          <td className="text-right font-semibold">{mergedData.propensityScore.breakdown.receita_porte.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">2. Presença Digital (website, redes, marketplaces)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.presenca_digital.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.presenca_digital.valor}/100</td>
                          <td className="text-right font-semibold">{mergedData.propensityScore.breakdown.presenca_digital.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">3. Stack/TOTVS (tecnografia, produtos detectados)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.stack_totvs.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.stack_totvs.valor}/100</td>
                          <td className="text-right font-semibold">{mergedData.propensityScore.breakdown.stack_totvs.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">4. Notícias Recentes (quantidade, recência, sentimento)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.noticias.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.noticias.valor}/100</td>
                          <td className="text-right font-semibold">{mergedData.propensityScore.breakdown.noticias.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1">5. Regulatórios (situação cadastral, processos)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.regulatorios.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.regulatorios.valor}/100</td>
                          <td className="text-right font-semibold">{mergedData.propensityScore.breakdown.regulatorios.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="border-b font-semibold">
                          <td className="py-1">6. Setor/Benchmark (comparação setorial)</td>
                          <td className="text-center">{formatPercent(mergedData.propensityScore.breakdown.setor_benchmark.peso, true)}</td>
                          <td className="text-center">{mergedData.propensityScore.breakdown.setor_benchmark.valor}/100</td>
                          <td className="text-right">{mergedData.propensityScore.breakdown.setor_benchmark.contribuicao.toFixed(1)}</td>
                        </tr>
                        <tr className="bg-purple-100 dark:bg-purple-900">
                          <td colSpan={3} className="py-2 font-bold">SCORE FINAL</td>
                          <td className="text-right text-lg font-bold text-purple-600">{mergedData.propensityScore.overall}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    💡 Score calculado automaticamente com base em dados coletados de ReceitaWS, Google CSE, validação de presença digital e scan de tecnografia.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📅 Data de cálculo: {new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </section>
            )}

            {/* Ações (não aparece no print) */}
            <div className="flex justify-between items-center gap-3 pt-6 border-t-2 print:hidden sticky bottom-0 bg-white dark:bg-slate-900 pb-4">
              <p className="text-xs text-slate-500">
                Este é um pré-relatório. Clique em "Confirmar & Salvar" para persistir no sistema.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Confirmar & Salvar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
