'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { ResolveCompanyModal } from '@/components/modals/ResolveCompanyModal'
import { PreviewModal } from '@/components/modals/PreviewModal'

interface SearchBarProps {
  onSuccess?: () => void
}

interface Candidate {
  name: string
  cnpj?: string
  url: string
  confidence: number
  snippet: string
}

export function SearchBar({ onSuccess }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Resolve modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  // Preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pendingCnpj, setPendingCnpj] = useState<string | null>(null)

  function buildPayload(input: string) {
    const onlyDigits = input.replace(/\D/g, '')
    
    // Se tem 14 dígitos, é CNPJ
    if (onlyDigits.length === 14) {
      return { type: 'cnpj' as const, value: onlyDigits }
    }
    
    // Se tem http ou ponto (domínio), é website
    if (/^https?:\/\//i.test(input) || /\./.test(input)) {
      return { type: 'website' as const, value: input.trim() }
    }
    
    throw new Error('Informe um CNPJ (14 dígitos) ou um website válido (ex: empresa.com.br)')
  }

  async function handleSearch() {
    try {
      setLoading(true)

      const payload = buildPayload(value)
      console.log('[SearchBar] 🔍 Tipo:', payload.type, 'Valor:', payload.value)

      if (payload.type === 'cnpj') {
        // Fluxo direto: CNPJ → Preview
        await loadPreview(payload.value)
      } else {
        // Fluxo com desambiguação: Website → Resolve → (escolha) → Preview
        await resolveWebsite(payload.value)
      }
    } catch (e: any) {
      console.error('[SearchBar] ❌ Erro:', e.message)
      toast({
        title: '❌ Erro',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function resolveWebsite(website: string) {
    console.log('[SearchBar] 🔍 Resolvendo website:', website)

    const response = await fetch('/api/companies/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website }),
    })

    const data = await response.json()

    if (data.status === 'empty') {
      throw new Error('Nenhuma empresa encontrada para este website. Tente informar o CNPJ diretamente.')
    }

    if (data.status !== 'success') {
      throw new Error(data.message || 'Erro ao resolver website')
    }

    // Se encontrou múltiplos candidatos, abrir modal de escolha
    if (data.candidates.length > 1) {
      console.log('[SearchBar] 📋 Múltiplos candidatos encontrados:', data.candidates.length)
      setCandidates(data.candidates)
      setResolveModalOpen(true)
    } else if (data.candidates.length === 1 && data.candidates[0].cnpj) {
      // Se só tem 1 candidato com CNPJ, ir direto para preview
      console.log('[SearchBar] ✅ Candidato único:', data.candidates[0].cnpj)
      await loadPreview(data.candidates[0].cnpj)
    } else {
      throw new Error('Não foi possível identificar o CNPJ. Informe manualmente.')
    }
  }

  async function loadPreview(cnpj: string) {
    try {
      setPreviewLoading(true)
      setPreviewModalOpen(true)
      setPendingCnpj(cnpj)

      console.log('[SearchBar] 📄 Gerando preview para CNPJ:', cnpj)

      const response = await fetch('/api/companies/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, useAI: true }),
      })

      const data = await response.json()

      if (data.status !== 'success') {
        throw new Error(data.message || 'Erro ao gerar preview')
      }

      console.log('[SearchBar] ✅ Preview gerado')
      setPreviewData(data.data)
    } catch (e: any) {
      console.error('[SearchBar] ❌ Erro ao gerar preview:', e.message)
      toast({
        title: '❌ Erro ao gerar preview',
        description: e.message,
        variant: 'destructive',
      })
      setPreviewModalOpen(false)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleConfirmSave() {
    if (!pendingCnpj) return

    try {
      console.log('[SearchBar] 💾 Salvando empresa:', pendingCnpj)

      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj: pendingCnpj }),
      })

      const data = await response.json()

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Falha ao salvar empresa')
      }

      console.log('[SearchBar] ✅ Empresa salva:', data.data.company.name)

      toast({
        title: '✅ Empresa salva com sucesso!',
        description: `${data.data.company.name} foi adicionada ao sistema`,
        variant: 'default',
      })

      // Limpar e fechar
      setValue('')
      setPreviewModalOpen(false)
      setPreviewData(null)
      setPendingCnpj(null)
      
      // Notificar sucesso
      onSuccess?.()
    } catch (e: any) {
      console.error('[SearchBar] ❌ Erro ao salvar:', e.message)
      toast({
        title: '❌ Erro ao salvar empresa',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  function handleResolveConfirm(cnpj: string | null) {
    setResolveModalOpen(false)
    
    if (cnpj) {
      loadPreview(cnpj)
    }
  }

  function handlePreviewClose() {
    setPreviewModalOpen(false)
    setPreviewData(null)
    setPendingCnpj(null)
  }

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          Buscar por CNPJ ou Website
          <span className="text-xs text-gray-500 font-normal">
            (Visualize o pré-relatório antes de salvar)
          </span>
        </label>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Digite CNPJ (apenas números) ou website (ex: empresa.com.br)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSearch()
                }
              }}
              disabled={loading}
              className="h-11"
            />
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={loading || !value.trim()}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Resolução (múltiplos CNPJs) */}
      <ResolveCompanyModal
        isOpen={resolveModalOpen}
        candidates={candidates}
        onConfirm={handleResolveConfirm}
        onClose={() => setResolveModalOpen(false)}
      />

      {/* Modal de Preview */}
      <PreviewModal
        isOpen={previewModalOpen}
        data={previewData}
        loading={previewLoading}
        onClose={handlePreviewClose}
        onConfirmSave={handleConfirmSave}
      />
    </>
  )
}
