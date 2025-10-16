"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CanvasBoard from "@/components/CanvasBoard"
import { ModeToggle } from "@/components/ModeToggle"
import { Target, Save, Share2, Users, Download } from "lucide-react"

export default function CanvasPage() {
  const [mode, setMode] = useState<"canva" | "powerbi">("canva")
  const [roomId] = useState("project-canvas-001")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-pink-50 p-3 rounded-lg">
                <Target className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Canvas Estratégico Colaborativo
                </h1>
                <p className="text-sm text-gray-600">
                  Edição em tempo real • Modo Canva / Power BI
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <ModeToggle mode={mode} setMode={setMode} />
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                3 online
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PNG
              </Button>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600">
                ℹ️
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Canvas Colaborativo em Tempo Real
                </h3>
                <p className="text-sm text-blue-800">
                  Alterações são sincronizadas automaticamente entre todos os colaboradores. 
                  Use o modo <strong>Canva</strong> para brainstorming visual ou <strong>Power BI</strong> para dashboards executivos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Board */}
        <Card>
          <CardHeader>
            <CardTitle>Projeto: Estratégia de Prospecção Q4 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <CanvasBoard roomId={roomId} mode={mode} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">➕ Adicionar Bloco</h3>
              <p className="text-sm text-gray-600">
                Insira novas ideias, métricas ou conexões
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">🔗 Criar Conexão</h3>
              <p className="text-sm text-gray-600">
                Conecte blocos para mostrar relações
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📊 Importar Dados</h3>
              <p className="text-sm text-gray-600">
                Traga KPIs e métricas do projeto
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Template Gallery */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Templates Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Business Model Canvas', emoji: '💼' },
                { name: 'Value Proposition', emoji: '💎' },
                { name: 'Customer Journey', emoji: '🗺️' },
                { name: 'SWOT Analysis', emoji: '📊' }
              ].map(template => (
                <div 
                  key={template.name}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="text-3xl mb-2">{template.emoji}</div>
                  <div className="text-sm font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

