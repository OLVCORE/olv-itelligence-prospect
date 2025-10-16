"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Mail, Linkedin, Phone, Search, Download, Plus } from "lucide-react"

export default function DecisoresPage() {
  // Mock data
  const contacts = [
    {
      id: '1',
      name: 'João Silva',
      title: 'CIO',
      department: 'Tecnologia',
      company: 'Empresa A',
      email: 'joao.silva@empresaa.com.br',
      phone: '+55 11 98765-4321',
      linkedin: 'linkedin.com/in/joaosilva',
      score: 5,
      source: 'Apollo.io',
      confidence: 90,
      verifiedAt: new Date('2025-10-12')
    },
    {
      id: '2',
      name: 'Maria Santos',
      title: 'CFO',
      department: 'Finanças',
      company: 'Empresa A',
      email: 'maria.santos@empresaa.com.br',
      phone: '+55 11 98765-4322',
      linkedin: 'linkedin.com/in/mariasantos',
      score: 5,
      source: 'ZoomInfo',
      confidence: 85,
      verifiedAt: new Date('2025-10-10')
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      title: 'Gerente de TI',
      department: 'Tecnologia',
      company: 'Empresa B',
      email: 'carlos.oliveira@empresab.com.br',
      phone: null,
      linkedin: 'linkedin.com/in/carlosoliveira',
      score: 3,
      source: 'Hunter.io',
      confidence: 75,
      verifiedAt: new Date('2025-09-28')
    }
  ]

  const getScoreStars = (score: number) => '⭐'.repeat(score)
  const getScoreLabel = (score: number) => {
    const labels = ['Baixa', 'Média-Baixa', 'Média', 'Média-Alta', 'Alta']
    return labels[score - 1] || 'Indefinida'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Decisores & Poder
                </h1>
                <p className="text-sm text-gray-600">
                  Contatos, fontes, scoring de influência
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Contato
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Decisores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                C-Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Área TI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Emails Verificados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confiança Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">83%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, cargo, empresa ou departamento..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map(contact => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{contact.name}</CardTitle>
                    <div className="text-sm text-gray-600">
                      {contact.title} • {contact.company}
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {contact.department}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">
                      {getScoreStars(contact.score)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getScoreLabel(contact.score)} influência
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{contact.phone}</span>
                    </div>
                  )}
                  {contact.linkedin && (
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`https://${contact.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver perfil LinkedIn
                      </a>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <div>Fonte: {contact.source}</div>
                      <div>Confiança: {contact.confidence}%</div>
                      <div>Verificado: {contact.verifiedAt.toLocaleDateString('pt-BR')}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clusters by Department */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Clusters por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { area: 'Tecnologia', count: 12, color: 'bg-blue-50 text-blue-700' },
                { area: 'Operações', count: 7, color: 'bg-green-50 text-green-700' },
                { area: 'Finanças', count: 5, color: 'bg-purple-50 text-purple-700' },
                { area: 'RH', count: 4, color: 'bg-orange-50 text-orange-700' }
              ].map(cluster => (
                <div 
                  key={cluster.area}
                  className={`${cluster.color} p-4 rounded-lg text-center`}
                >
                  <div className="text-3xl font-bold">{cluster.count}</div>
                  <div className="text-sm font-medium mt-1">{cluster.area}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


