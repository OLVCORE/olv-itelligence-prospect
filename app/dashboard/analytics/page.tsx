"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/KpiCard"
import { BarChart3, TrendingUp, Users, DollarSign, Target, Zap } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics & Métricas
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboards visuais e métricas executivas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KpiCard
            title="Taxa de Conversão"
            value="42%"
            description="Últimos 90 dias"
            icon={Target}
            trend={{ value: 8, isPositive: true }}
          />
          <KpiCard
            title="ROI Médio"
            value="3.2x"
            description="Retorno sobre investimento"
            icon={DollarSign}
            trend={{ value: 12, isPositive: true }}
          />
          <KpiCard
            title="Ticket Médio"
            value="R$ 280K"
            description="Por empresa convertida"
            icon={TrendingUp}
          />
          <KpiCard
            title="Ciclo de Venda"
            value="45 dias"
            description="Média de fechamento"
            icon={Zap}
            trend={{ value: 5, isPositive: false }}
          />
          <KpiCard
            title="Empresas Ativas"
            value="12"
            description="Em pipeline ativo"
            icon={Users}
          />
          <KpiCard
            title="Score Médio"
            value="78/100"
            description="Qualificação média"
            icon={BarChart3}
          />
        </div>

        {/* Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Funil de Prospecção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Entrada (Cadastro)', count: 12, pct: 100, color: 'bg-blue-500' },
                { stage: 'Enriquecimento Completo', count: 10, pct: 83, color: 'bg-blue-600' },
                { stage: 'Qualificado (Score > 70)', count: 8, pct: 67, color: 'bg-purple-500' },
                { stage: 'Abordagem Iniciada', count: 6, pct: 50, color: 'bg-purple-600' },
                { stage: 'Proposta Enviada', count: 4, pct: 33, color: 'bg-green-500' },
                { stage: 'Negociação', count: 2, pct: 17, color: 'bg-green-600' },
                { stage: 'Fechado', count: 1, pct: 8, color: 'bg-green-700' }
              ].map((stage, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-gray-600">
                      {stage.count} empresas ({stage.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                    <div 
                      className={`${stage.color} h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                      style={{ width: `${stage.pct}%` }}
                    >
                      {stage.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { sector: 'Tecnologia', count: 4, pct: 33 },
                  { sector: 'Manufatura', count: 3, pct: 25 },
                  { sector: 'Logística', count: 3, pct: 25 },
                  { sector: 'Varejo', count: 2, pct: 17 }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.sector}</span>
                      <span className="text-sm text-gray-600">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Porte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { size: 'Grande', count: 5, pct: 42 },
                  { size: 'Médio', count: 4, pct: 33 },
                  { size: 'Pequeno', count: 3, pct: 25 }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.size}</span>
                      <span className="text-sm text-gray-600">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


