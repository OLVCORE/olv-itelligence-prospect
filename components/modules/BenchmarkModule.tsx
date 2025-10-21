"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Minus, Building2, AlertCircle, Loader2 } from "lucide-react"

interface Company {
  id: string
  name: string
  tradeName?: string
  capital?: number
  size?: string
  domain?: string
}

interface BenchmarkModuleProps {
  companies: Company[]
}

export function BenchmarkModule({ companies }: BenchmarkModuleProps) {
  const [loading, setLoading] = useState(false)
  const [benchmarkData, setBenchmarkData] = useState<any[]>([])
  const supabase = getSupabaseBrowser()

  useEffect(() => {
    if (companies.length > 0) {
      loadBenchmarkData()
    } else {
      setBenchmarkData([])
    }
  }, [companies])

  async function loadBenchmarkData() {
    if (companies.length === 0) return

    setLoading(true)
    try {
      console.log('[Benchmark] 📊 Carregando dados de', companies.length, 'empresas')

      const results = await Promise.all(
        companies.map(async (c) => {
          // Buscar maturidade da empresa
          const { data: maturity } = await supabase
            .from('CompanyTechMaturity')
            .select('*')
            .eq('companyId', c.id)
            .maybeSingle()

          // Buscar tech stack
          const { data: techStack } = await supabase
            .from('TechStack')
            .select('*')
            .eq('companyId', c.id)

          return {
            company: c,
            maturity: maturity?.scores || { overall: 0, infra: 0, systems: 0, security: 0 },
            techCount: techStack?.length || 0,
            hasCloud: techStack?.some((t: any) => t.category?.includes('Cloud')) || false,
            hasERP: techStack?.some((t: any) => t.category?.includes('ERP')) || false
          }
        })
      )

      setBenchmarkData(results)
      console.log('[Benchmark] ✅ Dados carregados:', results)
    } catch (error: any) {
      console.error('[Benchmark] ❌ Erro:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Selecione pelo menos 2 empresas no dashboard para comparar
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando dados de benchmark...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Benchmark Comparativo - {companies.length} Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-center p-2">Capital</th>
                  <th className="text-center p-2">Porte</th>
                  <th className="text-center p-2">Maturidade</th>
                  <th className="text-center p-2">Tech Stack</th>
                  <th className="text-center p-2">Cloud</th>
                  <th className="text-center p-2">ERP</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="p-2 font-semibold">{item.company.tradeName || item.company.name}</td>
                    <td className="p-2 text-center">
                      {item.company.capital ? `R$ ${(item.company.capital / 1000000).toFixed(1)}M` : 'N/D'}
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="outline">{item.company.size || 'N/D'}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <span className="font-bold">{item.maturity.overall || 0}/100</span>
                    </td>
                    <td className="p-2 text-center">
                      <Badge>{item.techCount} techs</Badge>
                    </td>
                    <td className="p-2 text-center">
                      {item.hasCloud ? '✅' : '❌'}
                    </td>
                    <td className="p-2 text-center">
                      {item.hasERP ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {benchmarkData.length > 0 && (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="font-semibold">Maior Capital:</span>
                  <span>{benchmarkData.sort((a, b) => (b.company.capital || 0) - (a.company.capital || 0))[0]?.company.tradeName}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="font-semibold">Maior Maturidade:</span>
                  <span>{benchmarkData.sort((a, b) => b.maturity.overall - a.maturity.overall)[0]?.company.tradeName}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <span className="font-semibold">Mais Tecnologias:</span>
                  <span>{benchmarkData.sort((a, b) => b.techCount - a.techCount)[0]?.company.tradeName}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
