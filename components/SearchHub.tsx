'use client'

import { useState } from 'react'
import { Search, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SearchHubProps {
  onSearchIndividual: (query: string, mode: 'cnpj' | 'website') => Promise<void>
  onSearchBulk: (file: File) => Promise<void>
  loading: boolean
}

export function SearchHub({ onSearchIndividual, onSearchBulk, loading }: SearchHubProps) {
  const [query, setQuery] = useState('')
  const [file, setFile] = useState<File | null>(null)

  async function handleIndividual() {
    if (!query.trim()) return

    // Detectar se é CNPJ ou website
    const isCnpj = /^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(query.trim())
    await onSearchIndividual(query.trim(), isCnpj ? 'cnpj' : 'website')
    setQuery('')
  }

  async function handleBulk() {
    if (!file) return
    await onSearchBulk(file)
    setFile(null)
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Buscar Empresas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual">
          <TabsList className="grid w-full grid-cols-2 dark:bg-slate-900">
            <TabsTrigger value="individual">
              <Search className="h-4 w-4 mr-2" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Upload className="h-4 w-4 mr-2" />
              CSV (até 80)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-3">
            <Input
              placeholder="Digite CNPJ ou website (ex: empresa.com.br)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleIndividual()}
              disabled={loading}
            />
            <Button
              onClick={handleIndividual}
              disabled={loading || !query.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-3">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <Button
              onClick={handleBulk}
              disabled={loading || !file}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

