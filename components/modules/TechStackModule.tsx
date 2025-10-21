import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Clock, Play, RefreshCw, Server, Loader2 } from "lucide-react"

interface TechStackItem {
  id: string
  category: string
  product: string
  vendor: string
  status: string
  confidence: number
  evidence: any
  fetchedAt: string
}

interface TechStackModuleProps {
  companyId?: string
}

export function TechStackModule({ companyId }: TechStackModuleProps) {
  const [techStack, setTechStack] = useState<TechStackItem[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    if (companyId) {
      loadTechStack()
    }
  }, [companyId])

  async function loadTechStack() {
    if (!companyId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('TechStack')
        .select('*')
        .eq('companyId', companyId)

      if (error) throw error

      setTechStack(data || [])
      console.log('[TechStack] ✅ Carregado:', data?.length || 0, 'tecnologias')
    } catch (error: any) {
      console.error('[TechStack] ❌ Erro:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeTechStack() {
    if (!companyId) return

    setAnalyzing(true)
    try {
      console.log('[TechStack] 🚀 Analisando empresa:', companyId)

      const response = await fetch('/api/intelligence/techstack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.error?.message || 'Erro ao analisar')
      }

      console.log('[TechStack] ✅ Análise concluída')
      await loadTechStack()
    } catch (error: any) {
      console.error('[TechStack] ❌ Erro:', error.message)
      alert('Erro ao analisar: ' + error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (!companyId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma empresa para analisar o stack tecnológico
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stack Tecnológico</CardTitle>
            <Button
              onClick={analyzeTechStack}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Analisar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">Carregando tecnologias...</p>
            </div>
          ) : techStack.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Nenhuma tecnologia detectada ainda</p>
              <Button onClick={analyzeTechStack} variant="outline">
                Executar Análise
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {techStack.map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{tech.product}</span>
                      <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{tech.vendor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Confiança</p>
                      <p className="font-bold">{tech.confidence}%</p>
                    </div>
                    <Badge variant={tech.status === 'Confirmado' ? 'default' : 'secondary'}>
                      {tech.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
