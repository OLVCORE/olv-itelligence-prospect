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
  const [deepScanStatus, setDeepScanStatus] = useState<'pending' | 'completed' | 'error'>('pending')
  const [deepScanData, setDeepScanData] = useState<any>(null)
  const [pollingMessage, setPollingMessage] = useState('Buscando presença digital completa...')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollAttempts = useRef(0)
  
  // Polling para deep-scan
  useEffect(() => {
    // Se não tem jobId ou já completou, não fazer polling
    if (!data?.jobId || data.status === 'completed' || deepScanStatus === 'completed') {
      return
    }
    
    console.log('[PreviewModal] Iniciando polling para jobId:', data.jobId)
    setDeepScanStatus('pending')
    pollAttempts.current = 0
    
    const pollStatus = async () => {
      try {
        pollAttempts.current += 1
        console.log(`[PreviewModal] Polling tentativa ${pollAttempts.current} - jobId: ${data.jobId}`)
        
        const response = await fetch(`/api/preview/status?jobId=${data.jobId}`)
        const result = await response.json()
        
        console.log('[PreviewModal] Resultado do polling:', result.status)
        
        if (result.status === 'completed') {
          console.log('[PreviewModal] Deep-scan concluído! Dados:', result.data)
          setDeepScanData(result.data)
          setDeepScanStatus('completed')
          setPollingMessage('Análise completa!')
          
          // Parar polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else if (result.status === 'error') {
          console.error('[PreviewModal] Erro no deep-scan:', result.message)
          setDeepScanStatus('error')
          setPollingMessage('Erro ao buscar dados completos')
          
          // Parar polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else {
          // Ainda pendente, atualizar mensagem de progresso
          const messages = [
            'Buscando redes sociais...',
            'Analisando marketplaces...',
            'Verificando histórico jurídico...',
            'Coletando notícias recentes...',
            'Finalizando análise...',
          ]
          const messageIndex = Math.min(Math.floor(pollAttempts.current / 2), messages.length - 1)
          setPollingMessage(messages[messageIndex])
        }
        
        // Parar após 60 tentativas (2 minutos com intervalo de 2s)
        if (pollAttempts.current >= 60) {
          console.warn('[PreviewModal] Timeout no polling após 60 tentativas')
          setDeepScanStatus('error')
          setPollingMessage('Timeout - alguns dados podem estar incompletos')
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      } catch (error) {
        console.error('[PreviewModal] Erro no polling:', error)
      }
    }
    
    // Poll imediatamente
    pollStatus()
    
    // Poll a cada 2 segundos
    pollingIntervalRef.current = setInterval(pollStatus, 2000)
    
    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [data?.jobId, data?.status, deepScanStatus])
  
  // Resetar estado quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setDeepScanStatus('pending')
      setDeepScanData(null)
      pollAttempts.current = 0
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isOpen])
  
  // Mesclar dados parciais com deep-scan quando disponível
  const mergedData = deepScanData ? {
    ...data,
    presencaDigital: deepScanData.presencaDigital,
    enrichment: deepScanData.enrichment,
    ai: deepScanData.ai,
    status: 'completed',
  } : data

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
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="ml-4 text-lg text-slate-600">
              Gerando relatório completo...
            </span>
          </div>
        )}

        {/* Indicador de Deep-Scan em andamento */}
        {mergedData && deepScanStatus === 'pending' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  🔍 Análise Profunda em Andamento
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {pollingMessage}
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                {Math.min(pollAttempts.current * 2, 100)}%
              </Badge>
            </div>
            {/* Barra de Progresso */}
            <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(pollAttempts.current * 3.3, 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              ⏱️ Tempo estimado: 15-30 segundos • Os dados básicos já estão disponíveis abaixo
            </p>
          </div>
        )}

        {/* Indicador de Análise Completa */}
        {mergedData && deepScanStatus === 'completed' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center gap-3">
            <div className="h-5 w-5 text-green-600 flex-shrink-0 flex items-center justify-center">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                ✅ Análise Completa!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Todos os dados foram carregados com sucesso
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-300 dark:border-green-700">
              100%
            </Badge>
          </div>
        )}

        {/* Indicador de Erro/Timeout */}
        {mergedData && deepScanStatus === 'error' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  ⚠️ Análise Parcialmente Concluída
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {pollingMessage || 'Alguns dados podem estar incompletos, mas você já pode salvar o relatório com as informações disponíveis.'}
                </p>
              </div>
            </div>
          </div>
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
