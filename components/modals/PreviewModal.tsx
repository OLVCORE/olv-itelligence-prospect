"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Printer, Download, Save, Building2, MapPin, Phone, Mail, FileText, TrendingUp, AlertTriangle, Users, Briefcase, DollarSign } from "lucide-react"

interface PreviewData {
  mode: string
  receita: any
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

        {data && !loading && (
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
                  <p className="font-semibold text-sm">{data.receita.identificacao.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Nome Fantasia</p>
                  <p className="font-semibold text-sm">{data.receita.identificacao.nomeFantasia || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">CNPJ</p>
                  <p className="font-mono font-semibold text-sm">{data.receita.identificacao.cnpj}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tipo</p>
                  <Badge variant="outline">{data.receita.identificacao.tipo}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Porte</p>
                  <Badge>{data.receita.identificacao.porte}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Natureza Jurídica</p>
                  <p className="font-semibold text-sm">{data.receita.identificacao.naturezaJuridica}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Data de Abertura</p>
                  <p className="font-semibold text-sm">{data.receita.identificacao.dataAbertura}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Capital Social</p>
                  <p className="font-semibold text-sm">R$ {data.receita.capital.valor}</p>
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
                    {data.receita.endereco.logradouro}, {data.receita.endereco.numero}
                    {data.receita.endereco.complemento && ` - ${data.receita.endereco.complemento}`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {data.receita.endereco.bairro} - {data.receita.endereco.municipio}/{data.receita.endereco.uf}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">CEP: {data.receita.endereco.cep}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefone
                    </p>
                    <p className="font-semibold text-sm">{data.receita.endereco.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-semibold text-sm">{data.receita.endereco.email || 'Não informado'}</p>
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
                  <Badge variant={data.receita.situacao.status === 'ATIVA' ? 'default' : 'secondary'} className="mt-1">
                    {data.receita.situacao.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Data da Situação</p>
                  <p className="font-semibold text-sm">{data.receita.situacao.data}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Motivo</p>
                  <p className="font-semibold text-sm">{data.receita.situacao.motivo || 'N/A'}</p>
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
                  {data.receita.atividades.principal && data.receita.atividades.principal.length > 0 ? (
                    <div className="space-y-1">
                      {data.receita.atividades.principal.map((ativ: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-mono text-primary">{ativ.code}</span> - {ativ.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Não informado</p>
                  )}
                </div>
                
                {data.receita.atividades.secundarias && data.receita.atividades.secundarias.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Atividades Secundárias ({data.receita.atividades.secundarias.length})
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {data.receita.atividades.secundarias.map((ativ: any, idx: number) => (
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
            {data.receita.qsa && data.receita.qsa.length > 0 && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <Users className="h-5 w-5 text-primary" />
                  5. Quadro de Sócios e Administradores (QSA)
                </h2>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                  <div className="space-y-2">
                    {data.receita.qsa.map((socio: any, idx: number) => (
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
                  <Badge variant={data.receita.simples.optante ? 'default' : 'secondary'}>
                    {data.receita.simples.optante ? 'OPTANTE' : 'NÃO OPTANTE'}
                  </Badge>
                  {data.receita.simples.dataOpcao && (
                    <p className="text-xs text-slate-600 mt-2">Data Opção: {data.receita.simples.dataOpcao}</p>
                  )}
                  {data.receita.simples.dataExclusao && (
                    <p className="text-xs text-slate-600">Data Exclusão: {data.receita.simples.dataExclusao}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">MEI</p>
                  <Badge variant={data.receita.mei.optante ? 'default' : 'secondary'}>
                    {data.receita.mei.optante ? 'SIM' : 'NÃO'}
                  </Badge>
                </div>
              </div>
            </section>

            {/* 7. Website e Presença Digital */}
            {data.enrichment && (data.enrichment.website || data.enrichment.news.length > 0) && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  🌐 7. Presença Digital
                </h2>
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                  {data.enrichment.website && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Website Oficial</p>
                      <a
                        href={data.enrichment.website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold text-sm break-all"
                      >
                        {data.enrichment.website.title || data.enrichment.website.url}
                      </a>
                    </div>
                  )}
                  
                  {data.enrichment.news && data.enrichment.news.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Notícias Recentes ({data.enrichment.news.length})
                      </p>
                      <ul className="space-y-2">
                        {data.enrichment.news.map((news: any, index: number) => (
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
                  
                  {!data.enrichment.website && data.enrichment.news.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      Nenhuma informação digital encontrada para esta empresa
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* 8. Análise IA (se disponível) */}
            {data.ai && (
              <section className="break-inside-avoid">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  8. Análise Preliminar (Inteligência Artificial)
                </h2>
                <div className="space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 print:bg-white print:border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Score de Propensão</p>
                      <p className="text-4xl font-bold text-primary">{data.ai.score}<span className="text-xl text-slate-400">/100</span></p>
                    </div>
                    <Badge variant={data.ai.score >= 70 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                      {data.ai.score >= 80 ? 'Alto Potencial' : data.ai.score >= 60 ? 'Bom Potencial' : 'Potencial Moderado'}
                    </Badge>
                  </div>
                  
                  {data.ai.summary && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Resumo Executivo</p>
                      <p className="text-sm">{data.ai.summary}</p>
                    </div>
                  )}

                  {data.ai.insights && data.ai.insights.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Insights Estratégicos</p>
                      <ul className="space-y-1">
                        {data.ai.insights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-bold">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.ai.redFlags && data.ai.redFlags.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        Pontos de Atenção
                      </p>
                      <ul className="space-y-1">
                        {data.ai.redFlags.map((flag: string, idx: number) => (
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
