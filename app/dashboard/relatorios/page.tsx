"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, FileText, Download, Eye, Plus, Sparkles } from "lucide-react"

export default function RelatoriosPage() {
  const [generatingReport, setGeneratingReport] = useState(false)

  const reports = [
    {
      id: '1',
      title: 'Relatório Executivo - Empresa A',
      type: 'executive',
      company: 'Empresa A',
      createdAt: new Date('2025-10-15'),
      pages: 9,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Snapshot 1 Página - Empresa B',
      type: 'snapshot',
      company: 'Empresa B',
      createdAt: new Date('2025-10-14'),
      pages: 1,
      status: 'completed'
    },
    {
      id: '3',
      title: 'Tabela Consolidada - 15 Empresas',
      type: 'consolidated',
      company: 'Múltiplas',
      createdAt: new Date('2025-10-10'),
      pages: 3,
      status: 'completed'
    }
  ]

  const templates = [
    {
      id: 'executive',
      name: 'Relatório Executivo Completo',
      description: 'Diagnóstico 360°, Stack Confirmado (Seção 3 obrigatória), decisores, fit e playbook',
      pages: '9 páginas',
      icon: '📊',
      mandatory: 'Seção 3 obrigatória'
    },
    {
      id: 'snapshot',
      name: 'Snapshot 1 Página',
      description: 'KPIs essenciais, principais tecnologias e recomendação chave',
      pages: '1 página',
      icon: '⚡'
    },
    {
      id: 'consolidated',
      name: 'Tabela Consolidada',
      description: 'Comparativo de múltiplas empresas com scores e priorização',
      pages: 'Variável',
      icon: '📋'
    },
    {
      id: 'post_meeting',
      name: 'Resumo Pós-Reunião',
      description: 'Decisões, responsáveis, prazos e próximos passos',
      pages: '2 páginas',
      icon: '📝'
    }
  ]

  const handleGenerateReport = async (templateId: string) => {
    setGeneratingReport(true)
    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false)
      alert(`Relatório ${templateId} gerado com sucesso!`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-50 p-3 rounded-lg">
                <Rocket className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Relatórios Executivos
                </h1>
                <p className="text-sm text-gray-600">
                  Geração automática HTML/PDF com evidências
                </p>
              </div>
            </div>
            <Button className="gap-2" disabled={generatingReport}>
              <Plus className="h-4 w-4" />
              {generatingReport ? 'Gerando...' : 'Novo Relatório'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList>
            <TabsTrigger value="gallery">Galeria de Templates</TabsTrigger>
            <TabsTrigger value="generated">Relatórios Gerados</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{template.icon}</div>
                        <div>
                          <CardTitle className="text-lg mb-1">
                            {template.name}
                          </CardTitle>
                          <CardDescription>
                            {template.description}
                          </CardDescription>
                          {template.mandatory && (
                            <Badge variant="destructive" className="mt-2">
                              {template.mandatory}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {template.pages}
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => handleGenerateReport(template.id)}
                        disabled={generatingReport}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Info Banner */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 text-2xl">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">
                      Seção 3 - Stack Tecnológico Confirmado (OBRIGATÓRIA)
                    </h3>
                    <p className="text-sm text-purple-800 mb-3">
                      Todos os relatórios executivos devem incluir a Seção 3 com:
                    </p>
                    <ul className="text-sm text-purple-800 space-y-1 ml-4">
                      <li>• Tabela completa de tecnologias por categoria</li>
                      <li>• Evidências (URLs, trechos, prints) para cada item</li>
                      <li>• Nível de confiança (0-100%) e status (Confirmado/Indeterminado)</li>
                      <li>• Data da última validação</li>
                      <li>• Fonte de cada dado (BuiltWith, Apollo, HTTP Headers, etc.)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">18</div>
                  <div className="text-sm text-gray-600">Total gerados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-gray-600">Este mês</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">Executivos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">6</div>
                  <div className="text-sm text-gray-600">Snapshots</div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {report.title}
                          </h3>
                          <div className="flex gap-3 text-sm text-gray-600">
                            <span>{report.company}</span>
                            <span>•</span>
                            <span>{report.pages} {report.pages === 1 ? 'página' : 'páginas'}</span>
                            <span>•</span>
                            <span>{report.createdAt.toLocaleDateString('pt-BR')}</span>
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            {report.type === 'executive' ? 'Executivo' : 
                             report.type === 'snapshot' ? 'Snapshot' : 'Consolidado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


