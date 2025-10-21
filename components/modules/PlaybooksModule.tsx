"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { BookOpen, FileText, Download, Loader2, Play } from "lucide-react"

interface PlaybooksModuleProps {
  companyId?: string
}

export function PlaybooksModule({ companyId }: PlaybooksModuleProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [playbook, setPlaybook] = useState<any>(null)
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    if (companyId) {
      loadPlaybook()
    }
  }, [companyId])

  async function loadPlaybook() {
    if (!companyId) return

    setLoading(true)
    try {
      // Buscar playbook salvo
      const { data, error } = await supabase
        .from('Playbook')
        .select('*')
        .eq('companyId', companyId)
        .maybeSingle()

      if (data) {
        setPlaybook(data)
        console.log('[Playbooks] ✅ Playbook carregado')
      }
    } catch (error: any) {
      console.error('[Playbooks] ❌ Erro:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function generatePlaybook() {
    if (!companyId) return

    setGenerating(true)
    try {
      console.log('[Playbooks] 🚀 Gerando playbook para:', companyId)

      const response = await fetch('/api/playbook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro ao gerar playbook')
      }

      console.log('[Playbooks] ✅ Playbook gerado')
      await loadPlaybook()
    } catch (error: any) {
      console.error('[Playbooks] ❌ Erro:', error.message)
      alert('Erro ao gerar playbook: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  async function downloadPDF() {
    if (!companyId) return

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: 'playbook-v1',
          companyId
        })
      })

      const result = await response.json()

      if (result.success && result.pdfBase64) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${result.pdfBase64}`
        link.download = `playbook-${companyId}.pdf`
        link.click()
      }
    } catch (error: any) {
      console.error('[Playbooks] ❌ Erro ao gerar PDF:', error.message)
    }
  }

  if (!companyId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma empresa para gerar playbooks personalizados
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
            <CardTitle>Playbooks de Vendas</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={generatePlaybook}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Gerar Playbook
                  </>
                )}
              </Button>
              {playbook && (
                <Button onClick={downloadPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">Carregando playbook...</p>
            </div>
          ) : !playbook ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Nenhum playbook gerado ainda</p>
              <p className="text-sm text-gray-500 mb-4">
                Gere um playbook personalizado baseado nos dados da empresa
              </p>
              <Button onClick={generatePlaybook} variant="outline">
                Gerar Agora
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{playbook.title || 'Playbook de Vendas'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{playbook.description}</p>
              </div>

              {playbook.steps && playbook.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{step.action}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{step.owner}</Badge>
                      <Badge variant="outline">{step.timeline}</Badge>
                    </div>
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
