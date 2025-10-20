interface CadenceStep {
  step: number
  action: 'email' | 'linkedin' | 'call' | 'wait'
  template: string
  timing: number // horas após step anterior
  conditions?: {
    minScore?: number
    maxScore?: number
    verticals?: string[]
    personas?: string[]
  }
}

interface CadenceTemplate {
  id: string
  name: string
  vertical: string
  persona: string
  steps: CadenceStep[]
  description: string
  expectedDuration: number // dias
}

interface CadenceExecution {
  id: string
  companyId: string
  cadenceId: string
  currentStep: number
  status: 'active' | 'paused' | 'completed' | 'stopped'
  startedAt: Date
  lastStepAt?: Date
  completedAt?: Date
  results: {
    step: number
    action: string
    executedAt: Date
    result: 'positive' | 'negative' | 'neutral' | 'no_response'
    notes?: string
  }[]
}

export class CadenceManager {
  private readonly defaultCadences: CadenceTemplate[] = [
    {
      id: 'totvs-protheus-manufatura-ceo',
      name: 'TOTVS Protheus - Manufatura - CEO',
      vertical: 'Manufatura',
      persona: 'CEO',
      description: 'Cadência para CEOs de manufatura interessados em ERP',
      expectedDuration: 21,
      steps: [
        {
          step: 1,
          action: 'email',
          template: 'totvs-protheus-intro-ceo',
          timing: 0,
          conditions: {
            minScore: 70,
            verticals: ['Manufatura']
          }
        },
        {
          step: 2,
          action: 'linkedin',
          template: 'linkedin-connection-manufatura',
          timing: 72, // 3 dias
          conditions: {
            minScore: 60
          }
        },
        {
          step: 3,
          action: 'email',
          template: 'totvs-protheus-case-study',
          timing: 120, // 5 dias
          conditions: {
            minScore: 60
          }
        },
        {
          step: 4,
          action: 'call',
          template: 'call-script-discovery',
          timing: 168, // 7 dias
          conditions: {
            minScore: 70
          }
        },
        {
          step: 5,
          action: 'email',
          template: 'totvs-protheus-final-value',
          timing: 72, // 3 dias
          conditions: {
            minScore: 50
          }
        }
      ]
    },
    {
      id: 'totvs-fluig-servicos-cto',
      name: 'TOTVS Fluig - Serviços - CTO',
      vertical: 'Serviços',
      persona: 'CTO',
      description: 'Cadência para CTOs de serviços interessados em BPM',
      expectedDuration: 14,
      steps: [
        {
          step: 1,
          action: 'email',
          template: 'totvs-fluig-intro-cto',
          timing: 0,
          conditions: {
            minScore: 60,
            verticals: ['Serviços']
          }
        },
        {
          step: 2,
          action: 'linkedin',
          template: 'linkedin-connection-servicos',
          timing: 48, // 2 dias
          conditions: {
            minScore: 50
          }
        },
        {
          step: 3,
          action: 'email',
          template: 'totvs-fluig-demo-invite',
          timing: 96, // 4 dias
          conditions: {
            minScore: 60
          }
        },
        {
          step: 4,
          action: 'call',
          template: 'call-script-technical',
          timing: 120, // 5 dias
          conditions: {
            minScore: 70
          }
        }
      ]
    },
    {
      id: 'olv-consultoria-generica-executivo',
      name: 'OLV Consultoria - Genérica - Executivo',
      vertical: 'Todos',
      persona: 'Executivo',
      description: 'Cadência genérica para executivos interessados em consultoria',
      expectedDuration: 28,
      steps: [
        {
          step: 1,
          action: 'email',
          template: 'olv-consultoria-intro',
          timing: 0,
          conditions: {
            minScore: 50
          }
        },
        {
          step: 2,
          action: 'linkedin',
          template: 'linkedin-connection-generic',
          timing: 72, // 3 dias
          conditions: {
            minScore: 40
          }
        },
        {
          step: 3,
          action: 'email',
          template: 'olv-consultoria-value-prop',
          timing: 168, // 7 dias
          conditions: {
            minScore: 50
          }
        },
        {
          step: 4,
          action: 'email',
          template: 'olv-consultoria-case-study',
          timing: 168, // 7 dias
          conditions: {
            minScore: 50
          }
        },
        {
          step: 5,
          action: 'call',
          template: 'call-script-consultoria',
          timing: 168, // 7 dias
          conditions: {
            minScore: 60
          }
        },
        {
          step: 6,
          action: 'email',
          template: 'olv-consultoria-final',
          timing: 168, // 7 dias
          conditions: {
            minScore: 40
          }
        }
      ]
    }
  ]

  // Selecionar cadência apropriada baseada no perfil da empresa
  selectCadence(icpProfile: any, propensityScore: number, persona: string): CadenceTemplate | null {
    console.log('[Cadence Manager] 🔍 Selecionando cadência para:', { icpProfile, propensityScore, persona })

    // Filtrar cadências por vertical e persona
    const suitableCadences = this.defaultCadences.filter(cadence => {
      const verticalMatch = cadence.vertical === 'Todos' || cadence.vertical === icpProfile.vertical
      const personaMatch = cadence.persona === persona
      const scoreMatch = propensityScore >= 40 // Score mínimo para iniciar cadência

      return verticalMatch && personaMatch && scoreMatch
    })

    if (suitableCadences.length === 0) {
      console.log('[Cadence Manager] ⚠️ Nenhuma cadência adequada encontrada')
      return null
    }

    // Selecionar a cadência com melhor fit
    const selectedCadence = suitableCadences.reduce((best, current) => {
      const bestScore = this.calculateCadenceFit(best, icpProfile, propensityScore)
      const currentScore = this.calculateCadenceFit(current, icpProfile, propensityScore)
      
      return currentScore > bestScore ? current : best
    })

    console.log('[Cadence Manager] ✅ Cadência selecionada:', selectedCadence.name)
    return selectedCadence
  }

  private calculateCadenceFit(cadence: CadenceTemplate, icpProfile: any, propensityScore: number): number {
    let fitScore = 0

    // Score por vertical match
    if (cadence.vertical === icpProfile.vertical) {
      fitScore += 50
    } else if (cadence.vertical === 'Todos') {
      fitScore += 30
    }

    // Score por propensão
    fitScore += Math.min(30, propensityScore * 0.3)

    // Score por ICP tier
    if (icpProfile.tier === 'A') {
      fitScore += 20
    } else if (icpProfile.tier === 'B') {
      fitScore += 10
    }

    return fitScore
  }

  // Executar próximo step da cadência
  executeNextStep(execution: CadenceExecution, cadence: CadenceTemplate): {
    action: string
    template: string
    timing: Date
    canExecute: boolean
  } {
    const currentStep = execution.currentStep
    const nextStep = cadence.steps.find(step => step.step === currentStep + 1)

    if (!nextStep) {
      return {
        action: 'completed',
        template: '',
        timing: new Date(),
        canExecute: false
      }
    }

    // Verificar condições do step
    const canExecute = this.checkStepConditions(nextStep, execution)

    // Calcular timing
    const lastStepAt = execution.lastStepAt || execution.startedAt
    const timing = new Date(lastStepAt.getTime() + (nextStep.timing * 60 * 60 * 1000))

    return {
      action: nextStep.action,
      template: nextStep.template,
      timing,
      canExecute
    }
  }

  private checkStepConditions(step: CadenceStep, execution: CadenceExecution): boolean {
    if (!step.conditions) return true

    const conditions = step.conditions

    // Verificar score mínimo
    if (conditions.minScore) {
      // Aqui precisaríamos buscar o score atual da empresa
      // Por enquanto, assumimos que pode executar
    }

    // Verificar score máximo
    if (conditions.maxScore) {
      // Similar ao acima
    }

    // Verificar verticais
    if (conditions.verticals && conditions.verticals.length > 0) {
      // Aqui precisaríamos verificar o vertical da empresa
      // Por enquanto, assumimos que pode executar
    }

    // Verificar personas
    if (conditions.personas && conditions.personas.length > 0) {
      // Aqui precisaríamos verificar a persona do contato
      // Por enquanto, assumimos que pode executar
    }

    return true
  }

  // Pausar cadência baseada em resposta
  pauseCadence(execution: CadenceExecution, reason: string): void {
    console.log('[Cadence Manager] ⏸️ Pausando cadência:', execution.id, 'Motivo:', reason)
    
    // Aqui implementaríamos a lógica de pausar a cadência
    // Por exemplo, atualizar status no banco de dados
  }

  // Parar cadência baseada em resultado negativo
  stopCadence(execution: CadenceExecution, reason: string): void {
    console.log('[Cadence Manager] ⏹️ Parando cadência:', execution.id, 'Motivo:', reason)
    
    // Aqui implementaríamos a lógica de parar a cadência
    // Por exemplo, atualizar status no banco de dados
  }

  // Obter templates de cadência
  getCadenceTemplates(): CadenceTemplate[] {
    return this.defaultCadences
  }

  // Criar nova cadência personalizada
  createCustomCadence(template: Omit<CadenceTemplate, 'id'>): CadenceTemplate {
    const newCadence: CadenceTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    this.defaultCadences.push(newCadence)
    console.log('[Cadence Manager] ✅ Nova cadência criada:', newCadence.name)

    return newCadence
  }

  // Obter estatísticas de cadência
  getCadenceStats(execution: CadenceExecution): {
    completionRate: number
    averageResponseTime: number
    positiveResponses: number
    negativeResponses: number
  } {
    const results = execution.results
    const totalSteps = results.length
    const positiveResponses = results.filter(r => r.result === 'positive').length
    const negativeResponses = results.filter(r => r.result === 'negative').length
    
    const completionRate = totalSteps > 0 ? (positiveResponses + negativeResponses) / totalSteps : 0
    
    // Calcular tempo médio de resposta (simplificado)
    const averageResponseTime = totalSteps > 0 ? 
      results.reduce((sum, r) => sum + 24, 0) / totalSteps : 0 // Simplificado para 24h

    return {
      completionRate: Math.round(completionRate * 100),
      averageResponseTime: Math.round(averageResponseTime),
      positiveResponses,
      negativeResponses
    }
  }
}

export const cadenceManager = new CadenceManager()
