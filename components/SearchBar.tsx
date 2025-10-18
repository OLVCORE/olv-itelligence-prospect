'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface SearchBarProps {
  onSuccess?: () => void
}

export function SearchBar({ onSuccess }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  function buildPayload(input: string) {
    const onlyDigits = input.replace(/\D/g, '')
    
    // Se tem 14 dígitos, é CNPJ
    if (onlyDigits.length === 14) {
      return { cnpj: onlyDigits }
    }
    
    // Se tem http ou ponto (domínio), é website
    if (/^https?:\/\//i.test(input) || /\./. test(input)) {
      return { website: input.trim() }
    }
    
    throw new Error('Informe um CNPJ (14 dígitos) ou um website válido (ex: empresa.com.br)')
  }

  async function handleSearch() {
    try {
      setError(null)
      setLoading(true)

      const payload = buildPayload(value)
      console.log('[SearchBar] 🔍 Buscando:', payload)

      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Falha ao analisar empresa')
      }

      console.log('[SearchBar] ✅ Empresa analisada:', data.data.company.name)

      toast({
        title: '✅ Empresa analisada com sucesso!',
        description: `${data.data.company.name} foi adicionada ao sistema`,
        variant: 'default',
      })

      setValue('')
      onSuccess?.()
    } catch (e: any) {
      console.error('[SearchBar] ❌ Erro:', e.message)
      setError(e.message)
      
      toast({
        title: '❌ Erro ao analisar empresa',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        Buscar por CNPJ ou Website
        <span className="text-xs text-gray-500 font-normal">
          (O sistema coletará dados oficiais, site, notícias e gerará análise por IA)
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
            className={error ? 'border-red-500' : ''}
            data-tour="search-cnpj"
          />
          {error && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={loading || !value.trim()}
          className="min-w-[120px]"
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

      {loading && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>🔍 Buscando dados cadastrais...</p>
          <p>🌐 Coletando presença digital...</p>
          <p>🤖 Gerando análise com IA...</p>
          <p>💾 Salvando no banco de dados...</p>
        </div>
      )}
    </div>
  )
}

