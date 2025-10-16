"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

export default function AlertasPage() {
  const alerts = [
    {
      id: '1',
      type: 'revalidation',
      title: 'Revalidação de Stack - Empresa A',
      description: 'Stack tecnológico não atualizado há 90 dias. Verificar mudanças.',
      priority: 'high',
      status: 'pending',
      dueAt: new Date('2025-10-20'),
      createdAt: new Date('2025-10-15')
    },
    {
      id: '2',
      type: 'new_evidence',
      title: 'Nova evidência detectada - SAP',
      description: 'Vaga publicada mencionando "Consultor SAP S/4HANA" na Empresa B',
      priority: 'medium',
      status: 'pending',
      dueAt: new Date('2025-10-18'),
      createdAt: new Date('2025-10-16')
    },
    {
      id: '3',
      type: 'contact_change',
      title: 'Mudança de cargo detectada',
      description: 'João Silva promovido a VP of Technology na Empresa A',
      priority: 'medium',
      status: 'acknowledged',
      dueAt: new Date('2025-10-17'),
      createdAt: new Date('2025-10-14')
    },
    {
      id: '4',
      type: 'benchmark_update',
      title: 'Benchmark setorial atualizado',
      description: 'Novos dados disponíveis para o setor de manufatura',
      priority: 'low',
      status: 'resolved',
      dueAt: new Date('2025-10-12'),
      createdAt: new Date('2025-10-10'),
      resolvedAt: new Date('2025-10-11')
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'low': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'acknowledged': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-600" />
      default: return <XCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'acknowledged': return 'Reconhecido'
      case 'resolved': return 'Resolvido'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Monitoramento & Alertas
                </h1>
                <p className="text-sm text-gray-600">
                  Revalidações, mudanças e atualizações automáticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Alertas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Reconhecidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Resolvidos (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">24</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map(alert => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {getStatusIcon(alert.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {alert.description}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Tipo: {alert.type}</span>
                      <span>•</span>
                      <span>Criado: {alert.createdAt.toLocaleDateString('pt-BR')}</span>
                      {alert.dueAt && (
                        <>
                          <span>•</span>
                          <span>Prazo: {alert.dueAt.toLocaleDateString('pt-BR')}</span>
                        </>
                      )}
                      {alert.resolvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">
                            Resolvido: {alert.resolvedAt.toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {getStatusLabel(alert.status)}
                      </Badge>
                      <div className="flex gap-2">
                        {alert.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">
                              Reconhecer
                            </Button>
                            <Button variant="default" size="sm">
                              Resolver
                            </Button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button variant="default" size="sm">
                            Resolver
                          </Button>
                        )}
                        {alert.status === 'resolved' && (
                          <Button variant="ghost" size="sm">
                            Ver detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monitoring Rules */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Regras de Monitoramento Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Revalidação de Stack Web</div>
                  <div className="text-sm text-gray-600">Verificar tecnologias a cada 90 dias</div>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Monitoramento de Decisores</div>
                  <div className="text-sm text-gray-600">Verificar mudanças de cargo semestralmente</div>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Novas Evidências de Stack</div>
                  <div className="text-sm text-gray-600">Alertar quando novas vagas mencionam tecnologias</div>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Atualização de Benchmark Setorial</div>
                  <div className="text-sm text-gray-600">Notificar quando novos dados estão disponíveis</div>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

