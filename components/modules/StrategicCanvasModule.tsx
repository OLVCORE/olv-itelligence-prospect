"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Network,
  Info,
  Users,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Lightbulb,
  Plus,
  Edit,
  Save,
  Trash2,
  Share2,
  Download,
  Eye,
  Lock,
  Unlock
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CanvasNode {
  id: string
  type: "company" | "decision-maker" | "technology" | "opportunity" | "risk" | "solution"
  title: string
  description: string
  position: { x: number; y: number }
  connections: string[]
  metadata: {
    confidence?: number
    priority?: "high" | "medium" | "low"
    status?: "active" | "pending" | "resolved"
    lastUpdated?: string
  }
}

interface StrategicCanvasModuleProps {
  data?: CanvasNode[]
}

export function StrategicCanvasModule({ data = [] }: StrategicCanvasModuleProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>(data)
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCollaborative, setIsCollaborative] = useState(true)
  const [newNodeType, setNewNodeType] = useState<CanvasNode["type"]>("company")

  const getNodeColor = (type: CanvasNode["type"]) => {
    switch (type) {
      case "company": return "bg-blue-500/20 border-blue-500/50 text-blue-300"
      case "decision-maker": return "bg-purple-500/20 border-purple-500/50 text-purple-300"
      case "technology": return "bg-green-500/20 border-green-500/50 text-green-300"
      case "opportunity": return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
      case "risk": return "bg-red-500/20 border-red-500/50 text-red-300"
      case "solution": return "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
      default: return "bg-slate-500/20 border-slate-500/50 text-slate-300"
    }
  }

  const getNodeIcon = (type: CanvasNode["type"]) => {
    switch (type) {
      case "company": return <Target className="h-4 w-4" />
      case "decision-maker": return <Users className="h-4 w-4" />
      case "technology": return <Zap className="h-4 w-4" />
      case "opportunity": return <TrendingUp className="h-4 w-4" />
      case "risk": return <Shield className="h-4 w-4" />
      case "solution": return <Lightbulb className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const addNode = () => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      title: `Novo ${newNodeType}`,
      description: "",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      connections: [],
      metadata: {
        confidence: 50,
        priority: "medium",
        status: "active",
        lastUpdated: new Date().toISOString()
      }
    }
    setNodes([...nodes, newNode])
  }

  const updateNode = (id: string, updates: Partial<CanvasNode>) => {
    setNodes(nodes.map(node => 
      node.id === id 
        ? { ...node, ...updates, metadata: { ...node.metadata, lastUpdated: new Date().toISOString() } }
        : node
    ))
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id))
    if (selectedNode?.id === id) {
      setSelectedNode(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Canvas Estratégico Colaborativo
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-indigo-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é o Canvas Estratégico?</p>
                      <p className="text-sm">
                        Ferramenta visual colaborativa que mapeia toda a estratégia de prospecção: 
                        empresa-alvo, decisores, tecnologias, oportunidades, riscos e soluções. 
                        Permite conexões dinâmicas e insights visuais.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Visualizar relacionamentos complexos</li>
                        <li>Identificar gaps e oportunidades</li>
                        <li>Colaborar em tempo real com equipe</li>
                        <li>Documentar estratégia de forma visual</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Decisores:</strong> Mapeia influência e conexões</li>
                        <li><strong>Tech Stack:</strong> Visualiza dependências tecnológicas</li>
                        <li><strong>Fit TOTVS:</strong> Conecta soluções com necessidades</li>
                        <li><strong>Playbooks:</strong> Documenta estratégias visuais</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                <strong>Mapeamento visual</strong> de toda a estratégia de prospecção com 
                <strong> colaboração em tempo real</strong>, <strong>conexões dinâmicas</strong> 
                e <strong>insights de IA</strong> para identificar oportunidades e riscos.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-indigo-500 text-indigo-400 bg-indigo-500/10">
                <Network className="h-3 w-3 mr-1" />
                {nodes.length} Elementos
              </Badge>
              <Badge variant="outline" className={`${isCollaborative ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}>
                {isCollaborative ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                {isCollaborative ? 'Colaborativo' : 'Privado'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controles do Canvas */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
                className={isEditing ? "bg-blue-600" : "border-slate-600 text-slate-200"}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Sair do Modo Edição' : 'Modo Edição'}
              </Button>
              
              <Button 
                onClick={() => setIsCollaborative(!isCollaborative)}
                variant="outline"
                className="border-slate-600 text-slate-200"
              >
                {isCollaborative ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                {isCollaborative ? 'Tornar Privado' : 'Tornar Colaborativo'}
              </Button>
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <select 
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as CanvasNode["type"])}
                  className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="company">Empresa</option>
                  <option value="decision-maker">Decisor</option>
                  <option value="technology">Tecnologia</option>
                  <option value="opportunity">Oportunidade</option>
                  <option value="risk">Risco</option>
                  <option value="solution">Solução</option>
                </select>
                
                <Button onClick={addNode} className="bg-gradient-to-r from-indigo-600 to-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Elemento
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Principal */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700/50 h-[600px]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="h-5 w-5 text-indigo-400" />
                Canvas Estratégico
              </CardTitle>
            </CardHeader>
            <CardContent className="relative h-[500px] overflow-hidden">
              {/* Canvas Area */}
              <div className="relative w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-auto">
                {nodes.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">Canvas Vazio</p>
                      <p className="text-sm">Clique em "Adicionar Elemento" para começar a construir sua estratégia</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {nodes.map((node) => (
                      <div
                        key={node.id}
                        className={`absolute cursor-pointer transition-all hover:scale-105 ${getNodeColor(node.type)} border-2 rounded-lg p-3 min-w-[150px] max-w-[200px]`}
                        style={{ 
                          left: node.position.x, 
                          top: node.position.y,
                          transform: selectedNode?.id === node.id ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getNodeIcon(node.type)}
                          <span className="font-semibold text-sm truncate">{node.title}</span>
                        </div>
                        
                        {node.metadata.priority && (
                          <Badge className={`${getPriorityColor(node.metadata.priority)} border text-xs mb-2`}>
                            {node.metadata.priority.toUpperCase()}
                          </Badge>
                        )}
                        
                        <p className="text-xs text-slate-400 line-clamp-2">{node.description}</p>
                        
                        {node.metadata.confidence && (
                          <div className="mt-2 text-xs text-slate-500">
                            Confiança: {node.metadata.confidence}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Detalhes */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {getNodeIcon(selectedNode.type)}
                    {selectedNode.title}
                  </CardTitle>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteNode(selectedNode.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label className="text-slate-300 text-sm">Título</Label>
                      <Input 
                        value={selectedNode.title}
                        onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-sm">Descrição</Label>
                      <Textarea 
                        value={selectedNode.description}
                        onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-sm">Prioridade</Label>
                      <select 
                        value={selectedNode.metadata.priority || "medium"}
                        onChange={(e) => updateNode(selectedNode.id, { 
                          metadata: { ...selectedNode.metadata, priority: e.target.value as "high" | "medium" | "low" }
                        })}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm"
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Média</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-sm">Confiança (%)</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={selectedNode.metadata.confidence || 50}
                        onChange={(e) => updateNode(selectedNode.id, { 
                          metadata: { ...selectedNode.metadata, confidence: parseInt(e.target.value) }
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Tipo</p>
                      <Badge className={getNodeColor(selectedNode.type)}>
                        {selectedNode.type}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Descrição</p>
                      <p className="text-sm text-slate-300">{selectedNode.description || "Sem descrição"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Prioridade</p>
                      <Badge className={getPriorityColor(selectedNode.metadata.priority || "medium")}>
                        {(selectedNode.metadata.priority || "medium").toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Confiança</p>
                      <p className="text-sm text-slate-300">{selectedNode.metadata.confidence || 50}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Última Atualização</p>
                      <p className="text-sm text-slate-300">
                        {selectedNode.metadata.lastUpdated 
                          ? new Date(selectedNode.metadata.lastUpdated).toLocaleString('pt-BR')
                          : "Nunca"
                        }
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="text-center text-slate-400">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Nenhum Elemento Selecionado</p>
                  <p className="text-sm">Clique em um elemento no canvas para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas do Canvas */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total de Elementos</span>
                <span className="text-sm font-semibold text-white">{nodes.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Alta Prioridade</span>
                <span className="text-sm font-semibold text-red-400">
                  {nodes.filter(n => n.metadata.priority === "high").length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Decisores</span>
                <span className="text-sm font-semibold text-purple-400">
                  {nodes.filter(n => n.type === "decision-maker").length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Oportunidades</span>
                <span className="text-sm font-semibold text-yellow-400">
                  {nodes.filter(n => n.type === "opportunity").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dicas de Uso */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Como usar o Canvas Estratégico?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold mb-2">1. Mapear Elementos</p>
              <p className="text-xs text-slate-400">
                Adicione empresa-alvo, decisores, tecnologias e oportunidades identificadas
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">2. Conectar Relacionamentos</p>
              <p className="text-xs text-slate-400">
                Visualize como cada elemento se relaciona e influencia outros
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">3. Colaborar e Iterar</p>
              <p className="text-xs text-slate-400">
                Compartilhe com equipe, atualize em tempo real e refine a estratégia
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

