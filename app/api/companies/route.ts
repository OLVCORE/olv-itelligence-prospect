import { NextRequest, NextResponse } from "next/server"

// Mock data para demonstração
const mockCompanies = [
  {
    id: "1",
    cnpj: "33.000.092/0142-08",
    razao: "COSAN LUBRIFICANTES E ESPECIALIDADES S.A.",
    fantasia: "Moove Lubrificantes",
    tipo: "ESTRADA",
    endereco: "PARA PARNAIBA",
    numero: "6550",
    complemento: "SALA MOOVE",
    bairro: "JARDIM DAS COLINAS",
    cidade: "FRANCO DA ROCHA",
    uf: "SP",
    cep: "07.811-060",
    telefone1: "1934238000",
    telefone2: "",
    email: "fiscalizacaocar@moovelub.com",
    site: "www.moovelub.com",
    cnaePrincipal: "1922599",
    textoCnaePrincipal: "Fabricação de outros produtos derivados do petróleo exceto produtos do refino",
    cnaeSecundario: "4681805,4684299,4686902",
    situacao: "ATIVA",
    abertura: "01/01/2000",
    naturezaJuridica: "Sociedade Anônima",
    capitalSocial: "R$ 1.000.000.000,00",
    porte: "Grande",
    qsa: [],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAnalyzed: new Date().toISOString()
  },
  {
    id: "2",
    cnpj: "11.222.333/0001-81",
    razao: "TECHNOLOGY SOLUTIONS LTDA",
    fantasia: "TechSol",
    tipo: "RUA",
    endereco: "AVENIDA PAULISTA",
    numero: "1000",
    complemento: "SALA 100",
    bairro: "BELA VISTA",
    cidade: "SÃO PAULO",
    uf: "SP",
    cep: "01310-100",
    telefone1: "1133334444",
    telefone2: "",
    email: "contato@techsol.com.br",
    site: "www.techsol.com.br",
    cnaePrincipal: "6201500",
    textoCnaePrincipal: "Desenvolvimento de programas de computador sob encomenda",
    cnaeSecundario: "6202300,6209100",
    situacao: "ATIVA",
    abertura: "01/01/2015",
    naturezaJuridica: "Sociedade Empresária Limitada",
    capitalSocial: "R$ 100.000,00",
    porte: "Médio",
    qsa: [],
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAnalyzed: new Date().toISOString()
  }
]

const mockAnalysisSessions = [
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
  return NextResponse.json({ companies: mockCompanies })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cnpj, razao, fantasia } = body

    const newCompany = {
      id: Date.now().toString(),
      cnpj: cnpj || "",
      razao: razao || "",
      fantasia: fantasia || "",
      tipo: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      telefone1: "",
      telefone2: "",
      email: "",
      site: "",
      cnaePrincipal: "",
      textoCnaePrincipal: "",
      cnaeSecundario: "",
      situacao: "",
      abertura: "",
      naturezaJuridica: "",
      capitalSocial: "",
      porte: "",
      qsa: [],
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAnalyzed: new Date().toISOString()
    }

    mockCompanies.push(newCompany)

    return NextResponse.json({ company: newCompany }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    )
  }
}