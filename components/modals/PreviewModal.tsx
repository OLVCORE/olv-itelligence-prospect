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
import { Loader2, Printer, Download, Save, Building2, MapPin, Phone, Mail, FileText, TrendingUp, AlertTriangle } from "lucide-react"

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
    alert(`Export ${format.toUpperCase()} em desenvolvimento`)
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
            Pré-Relatório da Empresa
          </DialogTitle>
          <DialogDescription>
            Revise as informações antes de salvar no sistema
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="ml-4 text-lg text-slate-600">
              Gerando relatório...
            </span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-8 print:text-black">
            {/* Header do Relatório (Print) */}
            <div className="hidden print:block border-b pb-4">
              <h1 className="text-3xl font-bold">Relatório de Prospecção</h1>
              <p className="text-sm text-gray-600">
                Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            {/* 1. Identificação */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Identificação
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Razão Social</p>
                  <p className="font-semibold">{data.receita.identificacao.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nome Fantasia</p>
                  <p className="font-semibold">{data.receita.identificacao.nomeFantasia || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">CNPJ</p>
                  <p className="font-mono font-semibold">{data.receita.identificacao.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tipo</p>
                  <Badge>{data.receita.identificacao.tipo}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Porte</p>
                  <Badge variant="outline">{data.receita.identificacao.porte}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Data de Abertura</p>
                  <p className="font-semibold">{data.receita.identificacao.dataAbertura}</p>
                </div>
              </div>
            </section>

            {/* 2. Endereço e Contato */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Endereço e Contato
              </h2>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Endereço</p>
                  <p className="font-semibold">
                    {data.receita.endereco.logradouro}, {data.receita.endereco.numero}
                    {data.receita.endereco.complemento && ` - ${data.receita.endereco.complemento}`}
                  </p>
                  <p className="text-sm">
                    {data.receita.endereco.bairro} - {data.receita.endereco.municipio}/{data.receita.endereco.uf}
                  </p>
                  <p className="text-sm">CEP: {data.receita.endereco.cep}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefone
                  </p>
                  <p className="font-semibold">{data.receita.endereco.telefone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-semibold">{data.receita.endereco.email || '-'}</p>
                </div>
              </div>
            </section>

            {/* 3. Situação */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Situação Cadastral
              </h2>
              <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 print:bg-white print:border">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                  <Badge variant={data.receita.situacao.status === 'ATIVA' ? 'default' : 'secondary'}>
                    {data.receita.situacao.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Data</p>
                  <p className="font-semibold">{data.receita.situacao.data}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Capital Social</p>
                  <p className="font-semibold">{data.receita.capital.valor}</p>
                </div>
              </div>
            </section>

            {/* 4. Website e Notícias */}
            {data.enrichment && (
              <section>
                <h2 className="text-xl font-bold mb-4">Website e Notícias</h2>
                {data.enrichment.website && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Website Oficial</p>
                    <a
                      href={data.enrichment.website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold"
                    >
                      {data.enrichment.website.title || data.enrichment.website.url}
                    </a>
                  </div>
                )}
                {data.enrichment.news && data.enrichment.news.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Notícias Recentes</p>
                    <ul className="space-y-2">
                      {data.enrichment.news.map((news: any, index: number) => (
                        <li key={index} className="border-l-2 border-primary pl-3">
                          <a
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold hover:underline"
                          >
                            {news.title}
                          </a>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{news.snippet}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* 5. Análise IA (se disponível) */}
            {data.ai && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Análise Preliminar (IA)
                </h2>
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Score de Propensão</p>
                    <p className="text-4xl font-bold text-primary">{data.ai.score}/100</p>
                  </div>
                  {data.ai.summary && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Resumo:</p>
                      <p className="text-sm">{data.ai.summary}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Ações (não aparece no print) */}
            <div className="flex justify-end gap-3 pt-6 border-t print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('xlsx')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Confirmar & Salvar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

