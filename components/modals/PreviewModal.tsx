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
import { QuotaWarningBanner } from "@/components/QuotaWarningBanner"
import { Loader2, Printer, Download, Save, Building2, MapPin, Phone, Mail, FileText, TrendingUp, AlertTriangle, Users, Briefcase, DollarSign, RefreshCw } from "lucide-react"

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

        {/* Alerta de Quota (se aplicável) */}
        {!loading && mergedData && (
          <>
            {/* Verificar se presença digital está vazia */}
            {(!mergedData.presencaDigital?.website && 
              !Object.keys(mergedData.presencaDigital?.redesSociais || {}).length &&
              !mergedData.presencaDigital?.marketplaces?.length) && (
              <QuotaWarningBanner 
                message="Google CSE com quota excedida (100/dia)"
                showConfigLinks={true}
              />
            )}
          </>
        )}

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
                  <p className="font-semibold text-sm">{mergedData.receita.identificacao.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Nome Fantasia</p>
                  <p className="font-semibold text-sm">{mergedData.receita.identificacao.nomeFantasia || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">CNPJ</p>
                  <p className="font-mono font-semibold text-sm">{mergedData.receita.identificacao.cnpj}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tipo</p>
                  <Badge variant="outline">{mergedData.receita.identificacao.tipo}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Porte</p>
                  <Badge>{mergedData.receita.identificacao.porte}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Natureza Jurídica</p>
                  <p className="font-semibold text-sm">{mergedData.receita.identificacao.naturezaJuridica}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Data de Abertura</p>
                  <p className="font-semibold text-sm">{mergedData.receita.identificacao.dataAbertura}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Capital Social</p>
                  <p className="font-semibold text-sm">R$ {mergedData.receita.capital.valor}</p>
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
                    {mergedData.receita.endereco.logradouro}, {mergedData.receita.endereco.numero}
                    {mergedData.receita.endereco.complemento && ` - ${mergedData.receita.endereco.complemento}`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {mergedData.receita.endereco.bairro} - {mergedData.receita.endereco.municipio}/{mergedData.receita.endereco.uf}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">CEP: {mergedData.receita.endereco.cep}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefone
                    </p>
                    <p className="font-semibold text-sm">{mergedData.receita.endereco.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-semibold text-sm">{mergedData.receita.endereco.email || 'Não informado'}</p>
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

            {/* 7. Presença Digital Completa (EXPANDIDO!) */}
            {(mergedData.presencaDigital || mergedData.enrichment) && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  🌐 7. Presença Digital e Canais de Venda
                </h2>
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
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

                  {/* Marketplaces */}
                  {mergedData.presencaDigital?.marketplaces && mergedData.presencaDigital.marketplaces.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        🛒 Marketplaces e E-commerce ({mergedData.presencaDigital.marketplaces.length})
                      </p>
                      <ul className="space-y-1.5">
                        {mergedData.presencaDigital.marketplaces.map((mp: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs">
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
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Jusbrasil */}
                  {mergedData.presencaDigital?.jusbrasil && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        ⚖️ Jusbrasil - Histórico Jurídico
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

                  {/* Outros Links */}
                  {mergedData.presencaDigital?.outrosLinks && mergedData.presencaDigital.outrosLinks.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        🔗 Outros Links Relevantes ({mergedData.presencaDigital.outrosLinks.length})
                      </p>
                      <ul className="space-y-1.5">
                        {mergedData.presencaDigital.outrosLinks.map((link: any, idx: number) => (
                          <li key={idx}>
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {link.tipo}
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

                  {/* Notícias */}
                  {(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news) && 
                   (mergedData.presencaDigital?.noticias?.length > 0 || mergedData.enrichment?.news?.length > 0) && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        📰 Notícias Recentes ({(mergedData.presencaDigital?.noticias || mergedData.enrichment?.news)?.length})
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

            {/* 8. Análise IA (se disponível) */}
            {mergedData.ai && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  8. Análise Preliminar (Inteligência Artificial)
                </h2>
                <div className="space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 print:bg-white print:border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Score de Propensão</p>
                      <p className="text-4xl font-bold text-primary">{mergedData.ai.score}<span className="text-xl text-slate-400">/100</span></p>
                    </div>
                    <Badge variant={mergedData.ai.score >= 70 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                      {mergedData.ai.score >= 80 ? 'Alto Potencial' : mergedData.ai.score >= 60 ? 'Bom Potencial' : 'Potencial Moderado'}
                    </Badge>
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
