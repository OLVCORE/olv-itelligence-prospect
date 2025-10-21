'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Info, AlertCircle, XCircle, X, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Alert {
  id: string
  module: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  meta?: any
}

interface AlertsPanelProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function AlertsPanel({ autoRefresh = true, refreshInterval = 30000 }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')

  useEffect(() => {
    loadAlerts()

    if (autoRefresh) {
      const interval = setInterval(loadAlerts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  async function loadAlerts() {
    try {
      setLoading(true)
      
      // TODO: Implementar endpoint /api/alerts/logs
      // Por enquanto, usar dados mock para demonstração
      const mockAlerts: Alert[] = []
      
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  function dismissAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filterLevel !== 'all' && alert.level !== filterLevel) return false
    if (filterModule !== 'all' && alert.module !== filterModule) return false
    return true
  })

  const modules = Array.from(new Set(alerts.map(a => a.module)))

  function getLevelIcon(level: string) {
    switch (level) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  function getLevelBadge(level: string) {
    switch (level) {
      case 'info': return <Badge variant="secondary">Info</Badge>
      case 'warning': return <Badge className="bg-yellow-500 text-white">Aviso</Badge>
      case 'error': return <Badge variant="destructive">Erro</Badge>
      case 'critical': return <Badge className="bg-red-600 text-white">Crítico</Badge>
      default: return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas e Logs ({filteredAlerts.length})
          </CardTitle>
          <Button
            onClick={loadAlerts}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-3">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-40 dark:bg-slate-900 dark:border-slate-700">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-40 dark:bg-slate-900 dark:border-slate-700">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
              <SelectItem value="all">Todos os módulos</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de alertas */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Carregando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {/* Ícone */}
                <div className="mt-0.5">
                  {getLevelIcon(alert.level)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getLevelBadge(alert.level)}
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {alert.module}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm dark:text-gray-300">
                    {alert.message}
                  </p>
                </div>

                {/* Botão dismiss */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

