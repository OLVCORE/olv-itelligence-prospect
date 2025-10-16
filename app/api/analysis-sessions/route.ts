import { NextRequest, NextResponse } from "next/server"

// Mock data para sessões de análise
let mockSessions = [
  {
    id: "session-1",
    companyId: "1",
    status: "completed",
    progress: 100,
    currentStep: "Análise completa",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    results: {
      techStack: [
        {
          category: "Web Server",
          product: "Apache",
          vendor: "Apache",
          status: "Confirmado",
          confidence: 95
        }
      ],
      decisionMakers: [
        {
          name: "Carlos Santos",
          title: "Diretor de TI",
          score: 95
        }
      ]
    }
  },
  {
    id: "session-2",
    companyId: "2",
    status: "running",
    progress: 65,
    currentStep: "Analisando stack tecnológico",
    startedAt: new Date().toISOString(),
    results: null
  }
]

export async function GET() {
  return NextResponse.json({ sessions: mockSessions })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId } = body

    const newSession = {
      id: `session-${Date.now()}`,
      companyId: companyId || "1",
      status: "running",
      progress: 0,
      currentStep: "Iniciando análise",
      startedAt: new Date().toISOString(),
      results: null
    }

    mockSessions.push(newSession)

    // Simular progresso da análise
    setTimeout(() => {
      const sessionIndex = mockSessions.findIndex(s => s.id === newSession.id)
      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].progress = 25
        mockSessions[sessionIndex].currentStep = "Coletando dados da Receita Federal"
      }
    }, 2000)

    setTimeout(() => {
      const sessionIndex = mockSessions.findIndex(s => s.id === newSession.id)
      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].progress = 50
        mockSessions[sessionIndex].currentStep = "Analisando stack tecnológico"
      }
    }, 4000)

    setTimeout(() => {
      const sessionIndex = mockSessions.findIndex(s => s.id === newSession.id)
      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].progress = 75
        mockSessions[sessionIndex].currentStep = "Identificando decisores"
      }
    }, 6000)

    setTimeout(() => {
      const sessionIndex = mockSessions.findIndex(s => s.id === newSession.id)
      if (sessionIndex !== -1) {
        mockSessions[sessionIndex].progress = 100
        mockSessions[sessionIndex].status = "completed"
        mockSessions[sessionIndex].currentStep = "Análise completa"
        mockSessions[sessionIndex].completedAt = new Date().toISOString()
        mockSessions[sessionIndex].results = {
          techStack: [
            {
              category: "Web Server",
              product: "Apache",
              vendor: "Apache",
              status: "Confirmado",
              confidence: 95
            },
            {
              category: "Framework",
              product: "PHP",
              vendor: "PHP",
              status: "Confirmado",
              confidence: 90
            }
          ],
          decisionMakers: [
            {
              name: "Carlos Santos",
              title: "Diretor de TI",
              score: 95
            },
            {
              name: "Maria Oliveira",
              title: "CFO",
              score: 98
            }
          ],
          maturity: 87,
          propensity: 92,
          priority: 89
        }
      }
    }, 8000)

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao iniciar análise" },
      { status: 500 }
    )
  }
}

