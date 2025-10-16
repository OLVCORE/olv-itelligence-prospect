"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Layers, Plus, Search, Download, RefreshCw } from "lucide-react"

export default function TechStackPage() {
  const [isAddingStack, setIsAddingStack] = useState(false)

  // Mock data for demonstration
  const stacks = [
    {
      id: '1',
      company: 'Empresa A',
      category: 'ERP',
      product: 'TOTVS Protheus',
      vendor: 'TOTVS',
      status: 'Confirmado',
      confidence: 95,
      evidences: ['Vaga LinkedIn: Analista Protheus', 'Subdomínio: erp.empresaa.com.br'],
      validatedAt: new Date('2025-10-10')
    },
    {
      id: '2',
      company: 'Empresa A',
      category: 'Cloud',
      product: 'AWS',
      vendor: 'Amazon',
      status: 'Confirmado',
      confidence: 90,
      evidences: ['DNS CloudFront', 'HTTP Header X-Amz-Cf-Id'],
      validatedAt: new Date('2025-10-15')
    },
    {
      id: '3',
      company: 'Empresa B',
      category: 'CRM',
      product: 'Salesforce',
      vendor: 'Salesforce',
      status: 'Indeterminado',
      confidence: 60,
      evidences: ['Menção em artigo de blog'],
      validatedAt: null
    }
  ]

  const categories = [
    'ERP', 'MES/SCM/TMS/WMS', 'Cloud', 'Fiscal/Contábil', 
    'CRM', 'BI/Analytics', 'E-commerce/Payments', 'RH/Payroll', 
    'Middleware/ETL/ESB', 'Outros'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Stack Tecnológico Confirmado
                </h1>
                <p className="text-sm text-gray-600">
                  Evidências, confiança e validação de tecnologias
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Revalidar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Dialog open={isAddingStack} onOpenChange={setIsAddingStack}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Stack
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Tecnologia</DialogTitle>
                    <DialogDescription>
                      Registre uma nova tecnologia identificada
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Produto</Label>
                      <Input placeholder="Ex: TOTVS Protheus" />
                    </div>
                    <div>
                      <Label>Fornecedor</Label>
                      <Input placeholder="Ex: TOTVS" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Status de confirmação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="indeterminado">Indeterminado</SelectItem>
                          <SelectItem value="avaliacao">Em Avaliação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Evidências (URLs, trechos)</Label>
                      <Input placeholder="Cole links ou descrições" />
                    </div>
                    <Button className="w-full">Adicionar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Stacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Todas as empresas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">32</div>
              <p className="text-xs text-muted-foreground">68% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Confiança Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">85%</div>
              <p className="text-xs text-muted-foreground">Alta qualidade</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revalidações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">7</div>
              <p className="text-xs text-muted-foreground">Últimos 90 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por produto, fornecedor ou empresa..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="indeterminado">Indeterminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stack List */}
        <div className="space-y-4">
          {stacks.map(stack => (
            <Card key={stack.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {stack.product}
                      <Badge variant="secondary" className="ml-3">
                        {stack.category}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {stack.company} • {stack.vendor || 'Fornecedor não identificado'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={stack.status === 'Confirmado' ? 'default' : 'outline'}
                      className={stack.status === 'Confirmado' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {stack.status}
                    </Badge>
                    <div className="text-sm">
                      <span className="font-semibold text-blue-600">{stack.confidence}%</span>
                      <span className="text-gray-500 ml-1">confiança</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Evidências ({stack.evidences.length})
                    </div>
                    <ul className="space-y-1">
                      {stack.evidences.map((evidence, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {stack.validatedAt 
                        ? `Validado em ${stack.validatedAt.toLocaleDateString('pt-BR')}`
                        : 'Aguardando validação'
                      }
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Ver detalhes</Button>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}


