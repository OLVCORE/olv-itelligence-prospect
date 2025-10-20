"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { parseCSVFile, CSVTemplateRow } from "@/lib/utils/csv-template"
import {
  Upload,
  FileText,
  Check,
  X,
  Loader2,
  AlertCircle,
  Download,
  Play,
  CheckSquare
} from "lucide-react"

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface CompanyUploadRow extends CSVTemplateRow {
  id: string
  selected: boolean
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
  result?: any
}

export function BulkUploadModal({ isOpen, onClose, onComplete }: BulkUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const [companies, setCompanies] = useState<CompanyUploadRow[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const rows = await parseCSVFile(file)
      
      // Converter para CompanyUploadRow com IDs únicos e seleção padrão baseada na prioridade
      const uploadRows: CompanyUploadRow[] = rows.map((row, index) => ({
        ...row,
        id: `row-${index}-${Date.now()}`,
        selected: (row.prioridade || 3) >= 3, // Prioridade 3+ = selecionado por padrão
        status: 'pending'
      }))
      
      setCompanies(uploadRows)
      setStep('preview')
    } catch (error: any) {
      alert(`Erro ao processar arquivo: ${error.message}`)
    }
  }, [])

  // Drag & Drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [handleFileUpload])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }, [handleFileUpload])

  // Toggle company selection
  const toggleCompany = (id: string) => {
    setCompanies(prev => 
      prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    )
  }

  // Select all / deselect all
  const toggleAll = () => {
    const allSelected = companies.every(c => c.selected)
    setCompanies(prev => prev.map(c => ({ ...c, selected: !allSelected })))
  }

  // Process selected companies
  const processCompanies = async () => {
    setStep('processing')
    setProcessing(true)
    setProgress(0)
    
    const selected = companies.filter(c => c.selected)
    const total = selected.length
    let completed = 0

    for (const company of selected) {
      try {
        // Atualizar status
        setCompanies(prev => 
          prev.map(c => c.id === company.id ? { ...c, status: 'processing' } : c)
        )

        // Chamar API para gerar análise
        const response = await fetch('/api/companies/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cnpj: company.cnpj,
            useAI: true,
            useCrossReference: true
          })
        })

        const data = await response.json()

        if (data.status === 'success') {
          // Salvar empresa no banco
          const saveResponse = await fetch('/api/companies/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnpj: company.cnpj })
          })

          const saveData = await saveResponse.json()

          setCompanies(prev => 
            prev.map(c => c.id === company.id ? { 
              ...c, 
              status: 'completed',
              result: saveData.data
            } : c)
          )
        } else {
          throw new Error(data.message || 'Erro ao processar empresa')
        }
      } catch (error: any) {
        console.error(`[BulkUpload] Erro ao processar ${company.cnpj}:`, error.message)
        setCompanies(prev => 
          prev.map(c => c.id === company.id ? { 
            ...c, 
            status: 'error',
            error: error.message
          } : c)
        )
      }

      completed++
      setProgress(Math.round((completed / total) * 100))
      
      // Delay de 1s entre requisições para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setProcessing(false)
    onComplete()
  }

  // Reset modal
  const handleClose = () => {
    setStep('upload')
    setCompanies([])
    setProgress(0)
    setProcessing(false)
    onClose()
  }

  const selectedCount = companies.filter(c => c.selected).length
  const completedCount = companies.filter(c => c.status === 'completed').length
  const errorCount = companies.filter(c => c.status === 'error').length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Análise em Massa - Upload CSV
          </DialogTitle>
          <DialogDescription>
            Carregue um arquivo CSV com CNPJs para processar múltiplas empresas de uma vez
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4 py-6">
            <div
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                Arraste o arquivo CSV aqui
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ou clique no botão abaixo para selecionar
              </p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild>
                  <span>
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Formato do CSV:
              </p>
              <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                <li>• CNPJ (obrigatório) - apenas números</li>
                <li>• Prioridade 1-5 (opcional, padrão: 3)</li>
                <li>• Instagram, LinkedIn, Facebook, YouTube, X/Twitter (handles sem @)</li>
                <li>• Website (URL completa)</li>
                <li>• Máximo 50 empresas por upload</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 2: Preview com Checkboxes */}
        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-4">
                <Badge className="text-base px-4 py-2">
                  {companies.length} empresas carregadas
                </Badge>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {selectedCount} selecionadas
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {companies.every(c => c.selected) ? 'Desmarcar Todas' : 'Marcar Todas'}
                </Button>
                <Button
                  onClick={processCompanies}
                  disabled={selectedCount === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Processar {selectedCount > 0 && `(${selectedCount})`}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {companies.map((company, index) => (
                  <div
                    key={company.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border transition-all
                      ${company.selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'}
                    `}
                  >
                    <Checkbox
                      checked={company.selected}
                      onCheckedChange={() => toggleCompany(company.id)}
                      className="w-5 h-5"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold">
                          {company.cnpj}
                        </span>
                        {company.nome_fantasia && (
                          <span className="text-sm text-gray-600">
                            - {company.nome_fantasia}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {company.prioridade && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              company.prioridade === 5 ? 'bg-red-100 text-red-700' :
                              company.prioridade === 4 ? 'bg-orange-100 text-orange-700' :
                              company.prioridade === 3 ? 'bg-yellow-100 text-yellow-700' :
                              company.prioridade === 2 ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            Prioridade {company.prioridade}
                          </Badge>
                        )}
                        {company.instagram && <span>📷 {company.instagram}</span>}
                        {company.linkedin && <span>💼 {company.linkedin}</span>}
                        {company.website && <span>🌐 Website</span>}
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* STEP 3: Processing */}
        {step === 'processing' && (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">
                Processando Empresas...
              </h3>
              <p className="text-sm text-gray-600">
                Aguarde enquanto geramos os relatórios automáticos
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Progresso Global</span>
                <span className="text-2xl font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>✅ Concluídas: {completedCount}</span>
                <span>⏳ Pendentes: {selectedCount - completedCount - errorCount}</span>
                {errorCount > 0 && <span className="text-red-600">❌ Erros: {errorCount}</span>}
              </div>
            </div>

            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-2">
                {companies.filter(c => c.selected).map(company => (
                  <div
                    key={company.id}
                    className="flex items-center gap-2 text-sm p-2 rounded"
                  >
                    {company.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    {company.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                    {company.status === 'completed' && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {company.status === 'error' && (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    
                    <span className="font-mono text-xs">{company.cnpj}</span>
                    <span className="flex-1 text-xs text-gray-600">
                      {company.nome_fantasia || 'Processando...'}
                    </span>
                    
                    {company.status === 'error' && (
                      <span className="text-xs text-red-600">{company.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {progress === 100 && (
              <div className="text-center pt-4">
                <Button onClick={handleClose} size="lg">
                  <Check className="h-4 w-4 mr-2" />
                  Concluído! Fechar
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

