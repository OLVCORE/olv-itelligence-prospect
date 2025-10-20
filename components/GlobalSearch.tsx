'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className = "" }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    try {
      // Buscar empresa via API
      const response = await fetch('/api/companies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnpj: searchQuery
        })
      })

      const data = await response.json()
      
      if (response.ok && data.data?.company) {
        // Redirecionar para dashboard com empresa selecionada
        router.push(`/dashboard?company=${data.data.company.id}`)
      } else {
        // Se não encontrou, mostrar erro
        alert(data.message || 'Empresa não encontrada')
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      alert('Erro ao buscar empresa')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1 max-w-md">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite CNPJ para buscar empresa..."
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
