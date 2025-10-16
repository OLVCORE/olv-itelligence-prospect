"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function BenchmarkPage() {
  const benchmarks = [
    {
      metric: 'Maturidade Digital',
      myValue: 72,
      sectorAverage: 65,
      trend: 'up',
      unit: '/100'
    },
    {
      metric: 'Adoção Cloud',
      myValue: 85,
      sectorAverage: 70,
      trend: 'up',
      unit: '%'
    },
    {
      metric: 'ERP Moderno',
      myValue: 67,
      sectorAverage: 75,
      trend: 'down',
      unit: '%'
    },
    {
      metric: 'CRM Adoption',
      myValue: 58,
      sectorAverage: 62,
      trend: 'down',
      unit: '%'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Benchmark & KPIs
                </h1>
                <p className="text-sm text-gray-600">
                  Comparativos de mercado e oportunidades
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparative Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {benchmarks.map((benchmark, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{benchmark.metric}</CardTitle>
                <CardDescription>vs. média do setor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Sua carteira</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {benchmark.myValue}{benchmark.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${benchmark.myValue}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Média do setor</span>
                      <span className="text-2xl font-bold text-gray-600">
                        {benchmark.sectorAverage}{benchmark.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${benchmark.sectorAverage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge 
                      variant={benchmark.trend === 'up' ? 'default' : 'secondary'}
                      className={benchmark.trend === 'up' ? 'bg-green-600' : 'bg-red-600'}
                    >
                      {benchmark.trend === 'up' ? (
                        <><TrendingUp className="h-3 w-3 mr-1" /> Acima da média</>
                      ) : (
                        <><TrendingDown className="h-3 w-3 mr-1" /> Abaixo da média</>
                      )}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {Math.abs(benchmark.myValue - benchmark.sectorAverage)} pts de diferença
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights Acionáveis</CardTitle>
            <CardDescription>Oportunidades identificadas pela análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-semibold text-green-700">Força: Adoção Cloud</h4>
                <p className="text-sm text-gray-600">
                  Sua carteira está 15 pontos acima da média em adoção cloud. 
                  Oportunidade para cross-sell de soluções cloud-native.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-semibold text-red-700">Gap: ERP Moderno</h4>
                <p className="text-sm text-gray-600">
                  67% das empresas ainda usam ERP legado. Oportunidade de modernização
                  com TOTVS Protheus/Fluig.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold text-yellow-700">Atenção: CRM</h4>
                <p className="text-sm text-gray-600">
                  Apenas 58% das empresas possuem CRM. Pitch de integração CRM + ERP
                  pode acelerar conversão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

