'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnalysisProgress } from '@/components/ui/AnalysisProgress'
import { 
  Building2, 
  Globe, 
  Server, 
  Users, 
  BarChart3, 
  Target, 
  FileText, 
  Layout,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

interface PipelineStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'running' | 'completed' | 'error'
  expanded: boolean
  data?: any
  error?: string
}

interface UnifiedPipelineProps {
  companyId?: string
  cnpj?: string
  initialData?: any
}

export function UnifiedPipeline({ companyId, cnpj, initialData }: UnifiedPipelineProps) {
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 'receita',
      title: 'Dados Cadastrais',
      description: 'Busca na Receita Federal (ReceitaWS)',
      icon: <Building2 className="h-5 w-5" />,
      status: initialData ? 'completed' : 'pending',
      expanded: false,
      data: initialData?.receitaData
    },
    {
      id: 'digital',
      title: 'Presença Digital',
      description: 'Website, notícias e redes sociais',
      icon: <Globe className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'techstack',
      title: 'Tech Stack',
      description: 'Tecnologias e infraestrutura',
      icon: <Server className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'decisores',
      title: 'Decisores & Contato',
      description: 'Apollo + Hunter (verificação)',
      icon: <Users className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'maturidade',
      title: 'Maturidade Digital',
      description: 'Score por regras OLV (6 pilares)',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'fit',
      title: 'Fit TOTVS',
      description: 'Oportunidades e prioridade',
      icon: <Target className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'playbook',
      title: 'Playbook & PDF',
      description: 'Relatório executivo completo',
      icon: <FileText className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    },
    {
      id: 'canvas',
      title: 'Canvas Colaborativo',
      description: 'Editor em tempo real com autosave',
      icon: <Layout className="h-5 w-5" />,
      status: 'pending',
      expanded: false
    }
  ])

  const [isProcessing, setIsProcessing] = useState(false)

  async function toggleStep(stepId: string) {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, expanded: !s.expanded } : s
    ))
  }

  async function executeStep(stepId: string) {
    if (!companyId) {
      alert('Erro: Nenhuma empresa selecionada. Busque uma empresa primeiro.')
      return
    }

    console.log(`[Pipeline] 🚀 Executando etapa: ${stepId} para empresa: ${companyId}`)

    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status: 'running' as const } : s
    ))

    try {
      let endpoint = ''
      let body: any = { companyId }

      switch (stepId) {
        case 'techstack':
          endpoint = '/api/intelligence/techstack'
          break
        case 'decisores':
          endpoint = '/api/intelligence/decision-makers'
          break
        case 'maturidade':
          endpoint = '/api/intelligence/maturity'
          break
        case 'fit':
          endpoint = '/api/intelligence/fit-totvs'
          break
        case 'digital':
          endpoint = '/api/enrichment/digital'
          break
        case 'playbook':
          endpoint = '/api/reports/generate'
          body = { templateId: 'executive-report-v1', companyId }
          break
        default:
          console.log(`[Pipeline] ⏭️ Etapa ${stepId} pulada (já concluída ou não implementada)`)
          setSteps(prev => prev.map(s => 
            s.id === stepId ? { ...s, status: 'completed' as const } : s
          ))
          return
      }

      console.log(`[Pipeline] 📡 Chamando: ${endpoint}`)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      console.log(`[Pipeline] 📥 Resposta:`, result)

      if (!result.ok && !result.success) {
        throw new Error(result.error?.message || 'Erro ao executar etapa')
      }

      setSteps(prev => prev.map(s => 
        s.id === stepId ? { 
          ...s, 
          status: 'completed' as const, 
          data: result.data || result,
          expanded: true 
        } : s
      ))

      console.log(`[Pipeline] ✅ Etapa ${stepId} concluída`)
    } catch (error: any) {
      console.error(`[Pipeline] ❌ Erro na etapa ${stepId}:`, error.message)
      
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { 
          ...s, 
          status: 'error' as const, 
          error: error.message,
          expanded: true 
        } : s
      ))
    }
  }

  async function executeAll() {
    if (!companyId) {
      alert('Erro: Nenhuma empresa selecionada. Busque uma empresa primeiro.')
      return
    }

    console.log('[Pipeline] 🚀 Executando pipeline completo para:', companyId)
    setIsProcessing(true)

    // Executar em sequência (exceto as que já estão completas)
    const stepsToExecute = ['digital', 'techstack', 'decisores', 'maturidade', 'fit', 'playbook']
    
    for (const stepId of stepsToExecute) {
      const step = steps.find(s => s.id === stepId)
      if (step && step.status !== 'completed') {
        await executeStep(stepId)
        // Delay entre etapas para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsProcessing(false)
    console.log('[Pipeline] ✅ Pipeline completo')
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
    }
  }

  function renderStepContent(step: PipelineStep) {
    if (!step.data) return null

    switch (step.id) {
      case 'receita':
        return (
          <div className="space-y-2 text-sm">
            <p><strong>Razão Social:</strong> {step.data.razao}</p>
            <p><strong>CNPJ:</strong> {step.data.cnpj}</p>
            <p><strong>Porte:</strong> {step.data.porte}</p>
            <p><strong>Capital Social:</strong> {step.data.capitalSocial}</p>
            <p><strong>Situação:</strong> {step.data.situacao}</p>
          </div>
        )
      case 'techstack':
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Tecnologias encontradas: {step.data.technologies?.length || 0}</p>
            {step.data.technologies?.slice(0, 5).map((tech: any, i: number) => (
              <div key={i} className="text-sm">
                {tech.product} ({tech.vendor}) - {tech.confidence}%
              </div>
            ))}
          </div>
        )
      case 'maturidade':
        return (
          <div className="space-y-2 text-sm">
            <p className="text-lg font-bold">Score: {step.data.overall}/100</p>
            <div className="grid grid-cols-2 gap-2">
              <div>Infraestrutura: {step.data.scores?.infra}/100</div>
              <div>Sistemas: {step.data.scores?.systems}/100</div>
              <div>Processos: {step.data.scores?.processes}/100</div>
              <div>Segurança: {step.data.scores?.security}/100</div>
            </div>
          </div>
        )
      case 'fit':
        return (
          <div className="space-y-2">
            <p className="text-sm font-semibold">
              {step.data.usesTOTVS ? '✅ Cliente TOTVS' : '❌ Não usa TOTVS'}
            </p>
            <p className="text-sm">Oportunidades: {step.data.opportunities?.length || 0}</p>
            {step.data.opportunities?.slice(0, 3).map((opp: any, i: number) => (
              <div key={i} className="text-sm border-l-2 border-blue-500 pl-2">
                <strong>{opp.product}</strong> - {opp.priority}
                <p className="text-xs text-gray-600">{opp.rationale}</p>
              </div>
            ))}
          </div>
        )
      default:
        return <pre className="text-xs">{JSON.stringify(step.data, null, 2)}</pre>
    }
  }

  return (
    <div className="space-y-4">
      {/* Header com botão executar tudo */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white">Pipeline de Análise</h2>
        {companyId && (
          <Button
            onClick={executeAll}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? 'Executando...' : 'Executar Tudo'}
          </Button>
        )}
      </div>

      {/* Timeline de etapas */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`
              transition-all dark:bg-slate-800 dark:border-slate-700
              ${step.status === 'running' ? 'ring-2 ring-blue-500' : ''}
              ${step.status === 'completed' ? 'ring-1 ring-green-500' : ''}
              ${step.status === 'error' ? 'ring-1 ring-red-500' : ''}
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Número */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>

                  {/* Status icon */}
                  {getStatusIcon(step.status)}

                  {/* Ícone e título */}
                  <div className="text-blue-600 dark:text-blue-400">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base dark:text-white">{step.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {step.status === 'pending' && companyId && (
                    <Button
                      onClick={() => executeStep(step.id)}
                      size="sm"
                      variant="outline"
                    >
                      Executar
                    </Button>
                  )}

                  {step.status === 'completed' && (
                    <Badge variant="default">Concluído</Badge>
                  )}

                  {step.status === 'error' && (
                    <Badge variant="destructive">Erro</Badge>
                  )}

                  {(step.data || step.error) && (
                    <Button
                      onClick={() => toggleStep(step.id)}
                      size="sm"
                      variant="ghost"
                    >
                      {step.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Conteúdo expandido */}
            {step.expanded && (
              <CardContent className="pt-0">
                {step.error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-800 dark:text-red-300">
                    {step.error}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded p-4">
                    {renderStepContent(step)}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

