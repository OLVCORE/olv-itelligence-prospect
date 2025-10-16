// Mock data para o sistema OLV

// Funções para cálculos dinâmicos e inteligência real
export const calculateMaturityScore = (techStack: any[]) => {
  if (techStack.length === 0) return 25
  const avgConfidence = techStack.reduce((sum, tech) => sum + tech.confidence, 0) / techStack.length
  const cloudTechs = techStack.filter(t => t.category === "Cloud").length
  const automationTechs = techStack.filter(t => t.category === "Automação").length
  const enterpriseTechs = techStack.filter(t => ["SAP", "Oracle", "Microsoft"].includes(t.vendor)).length
  return Math.min(100, Math.round(avgConfidence * 0.5 + cloudTechs * 12 + automationTechs * 10 + enterpriseTechs * 8))
}

export const calculatePropensityScore = (decisionMakers: any[], company: any) => {
  let score = 35
  if (decisionMakers.length > 0) score += 25
  if (company.porte === "GRANDE") score += 20
  if (company.capitalSocial && parseFloat(company.capitalSocial.replace(/\./g, '').replace(',', '.')) > 1000000) score += 15
  const cLevel = decisionMakers.filter(dm => ["CEO", "CFO", "CTO", "Diretor"].includes(dm.title)).length
  score += cLevel * 5
  return Math.min(100, score)
}

export const calculatePriorityScore = (maturity: number, propensity: number, company: any) => {
  let score = (maturity + propensity) / 2
  if (company.porte === "GRANDE") score += 12
  if (company.capitalSocial && parseFloat(company.capitalSocial.replace(/\./g, '').replace(',', '.')) > 5000000) score += 8
  if (score > 85) return 95
  if (score > 70) return 80
  if (score > 55) return 65
  return 50
}

export const calculateTicketEstimado = (company: any, maturity: number) => {
  let baseTicket = 50000
  if (company.porte === "GRANDE") baseTicket = 200000
  else if (company.porte === "MÉDIO") baseTicket = 100000
  
  const maturityMultiplier = maturity / 100
  return Math.round(baseTicket * (0.8 + maturityMultiplier * 0.4))
}

// Mock data para demonstração
export const mockCompanies = [
  {
    id: "1",
    cnpj: "12.345.678/0001-90",
    razao: "TechCorp Soluções Ltda",
    fantasia: "TechCorp",
    cidade: "São Paulo",
    uf: "SP",
    porte: "GRANDE",
    status: "Ativo",
    lastAnalyzed: "2024-10-26T10:30:00Z",
    capitalSocial: "R$ 5.000.000,00"
  },
  {
    id: "2",
    cnpj: "98.765.432/0001-10",
    razao: "Inovação Digital S.A.",
    fantasia: "InovDigital",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    porte: "MÉDIO",
    status: "Ativo",
    lastAnalyzed: "2024-10-25T14:20:00Z",
    capitalSocial: "R$ 1.200.000,00"
  },
  {
    id: "3",
    cnpj: "11.222.333/0001-44",
    razao: "Consultoria Empresarial Ltda",
    fantasia: "ConsultEmp",
    cidade: "Belo Horizonte",
    uf: "MG",
    porte: "PEQUENO",
    status: "Ativo",
    lastAnalyzed: "2024-10-24T09:15:00Z",
    capitalSocial: "R$ 500.000,00"
  }
]

export const mockTechStack = [
  {
    id: "1",
    category: "ERP",
    product: "SAP S/4HANA",
    vendor: "SAP",
    status: "Confirmado",
    confidence: 95,
    evidence: ["DNS Records", "Job Postings", "HTTP Headers"],
    source: "BuiltWith + LinkedIn Jobs",
    firstDetected: "2024-01-15",
    lastValidated: new Date().toISOString(),
    aiInsights: "Sistema ERP empresarial de grande porte. Indica maturidade digital alta e investimento significativo em tecnologia.",
    recommendations: ["Avaliar integração com TOTVS Protheus", "Propor soluções complementares"]
  },
  {
    id: "2",
    category: "CRM",
    product: "Salesforce",
    vendor: "Salesforce",
    status: "Confirmado",
    confidence: 92,
    evidence: ["HTTP Headers", "DNS Records"],
    source: "BuiltWith",
    firstDetected: "2024-02-10",
    lastValidated: new Date().toISOString(),
    aiInsights: "CRM líder de mercado. Empresa investe em gestão de relacionamento com clientes.",
    recommendations: ["Propor integração TOTVS CRM", "Avaliar migração para soluções TOTVS"]
  },
  {
    id: "3",
    category: "Cloud",
    product: "Microsoft Azure",
    vendor: "Microsoft",
    status: "Confirmado",
    confidence: 98,
    evidence: ["DNS Records", "MX Records", "Job Postings"],
    source: "DNS Analysis + LinkedIn",
    firstDetected: "2023-11-20",
    lastValidated: new Date().toISOString(),
    aiInsights: "Infraestrutura cloud enterprise. Alta capacidade técnica e orçamento.",
    recommendations: ["Propor TOTVS Cloud", "Destacar benefícios de integração"]
  },
  {
    id: "4",
    category: "BI",
    product: "Power BI",
    vendor: "Microsoft",
    status: "Confirmado",
    confidence: 88,
    evidence: ["Job Postings", "HTTP Headers"],
    source: "LinkedIn Jobs",
    firstDetected: "2024-03-05",
    lastValidated: new Date().toISOString(),
    aiInsights: "Solução de BI moderna. Empresa data-driven com foco em analytics.",
    recommendations: ["Propor integração com TOTVS BI", "Oferecer consultoria em dados"]
  },
  {
    id: "5",
    category: "Database",
    product: "Oracle Database",
    vendor: "Oracle",
    status: "Em Avaliação",
    confidence: 75,
    evidence: ["Job Postings"],
    source: "LinkedIn Jobs",
    firstDetected: "2024-01-30",
    lastValidated: new Date().toISOString(),
    aiInsights: "Banco de dados empresarial robusto. Indica operações críticas.",
    recommendations: ["Validar com outras fontes", "Investigar versão e uso"]
  }
]

export const mockDecisionMakers = [
  {
    id: "1",
    name: "Carlos Eduardo Santos",
    title: "Diretor de Tecnologia (CTO)",
    department: "Tecnologia da Informação",
    email: "carlos.santos@empresa.com.br",
    phone: "+55 11 99999-9999",
    linkedin: "linkedin.com/in/carlos-santos-cto",
    score: 98,
    source: "Apollo.io + LinkedIn",
    influenceLevel: "Alto",
    verifiedAt: new Date().toISOString(),
    aiInsights: "Decisor técnico principal. Formação em Ciência da Computação, MBA em Gestão de TI. 15+ anos de experiência. Influenciador direto em decisões de tecnologia.",
    engagementStrategy: [
      "Abordagem técnica com ROI demonstrável",
      "Apresentar cases de sucesso similares",
      "Destacar integração e escalabilidade",
      "Propor POC técnico antes de proposta comercial"
    ]
  },
  {
    id: "2",
    name: "Maria Fernanda Oliveira",
    title: "Diretora Financeira (CFO)",
    department: "Financeiro",
    email: "maria.oliveira@empresa.com.br",
    phone: "+55 11 88888-8888",
    linkedin: "linkedin.com/in/maria-oliveira-cfo",
    score: 95,
    source: "ZoomInfo + Apollo.io",
    influenceLevel: "Alto",
    verifiedAt: new Date().toISOString(),
    aiInsights: "Decisor financeiro chave. Controla orçamento de TI. Foco em ROI e redução de custos operacionais. Formação em Economia, CFA.",
    engagementStrategy: [
      "Apresentar análise de TCO detalhada",
      "Demonstrar ROI em 12-18 meses",
      "Destacar redução de custos operacionais",
      "Comparar com soluções atuais (custo x benefício)"
    ]
  },
  {
    id: "3",
    name: "Roberto Alves Junior",
    title: "Gerente de Infraestrutura de TI",
    department: "Tecnologia da Informação",
    email: "roberto.alves@empresa.com.br",
    phone: "+55 11 77777-7777",
    linkedin: "linkedin.com/in/roberto-alves-ti",
    score: 85,
    source: "LinkedIn + Hunter.io",
    influenceLevel: "Médio",
    verifiedAt: new Date().toISOString(),
    aiInsights: "Influenciador técnico. Responsável pela operação diária. Pode acelerar ou bloquear implementações. Certificações AWS e Azure.",
    engagementStrategy: [
      "Envolver em discussões técnicas",
      "Demonstrar facilidade de implementação",
      "Destacar suporte técnico TOTVS",
      "Oferecer treinamento técnico"
    ]
  },
  {
    id: "4",
    name: "Ana Paula Rodrigues",
    title: "Diretora de Operações (COO)",
    department: "Operações",
    email: "ana.rodrigues@empresa.com.br",
    phone: "+55 11 66666-6666",
    linkedin: "linkedin.com/in/ana-rodrigues-coo",
    score: 92,
    source: "Apollo.io",
    influenceLevel: "Alto",
    verifiedAt: new Date().toISOString(),
    aiInsights: "Decisor operacional. Foco em eficiência e produtividade. Interessada em automação e otimização de processos.",
    engagementStrategy: [
      "Demonstrar ganhos de produtividade",
      "Apresentar automação de processos",
      "Destacar cases de eficiência operacional",
      "Propor análise de processos atuais"
    ]
  }
]

export const mockFinancialData = {
  capitalSocial: "R$ 1.000.000.000,00",
  faturamentoAnual: "R$ 850.000.000,00",
  porte: "Grande",
  funcionarios: 2500,
  risco: "Baixo",
  scoreSerasa: 850,
  situacao: "Ativa",
  dataAbertura: "01/01/2000",
  naturezaJuridica: "Sociedade Anônima",
  regimeTributario: "Lucro Real",
  indicadores: {
    liquidezCorrente: 2.5,
    endividamento: 35,
    margemLiquida: 12.5,
    roe: 18.5,
    crescimentoAnual: 15
  },
  aiInsights: "Empresa financeiramente saudável com excelente capacidade de investimento. Crescimento consistente nos últimos 5 anos. Baixo risco de crédito. Alto potencial para projetos de transformação digital."
}

export const mockMaturityData = {
  overall: calculateMaturityScore(mockTechStack),
  dimensions: [
    {
      name: "Infraestrutura Tecnológica",
      score: 92,
      description: "Cloud (Azure), servidores modernos, rede robusta",
      status: "Excelente",
      recommendations: ["Implementar monitoramento avançado", "Expandir uso de containers"]
    },
    {
      name: "Sistemas e Aplicações",
      score: 85,
      description: "ERP SAP, CRM Salesforce, BI Power BI",
      status: "Muito Bom",
      recommendations: ["Integrar sistemas legados", "Modernizar aplicações customizadas"]
    },
    {
      name: "Dados e Analytics",
      score: 88,
      description: "Data Lake, BI avançado, iniciativas de ML",
      status: "Muito Bom",
      recommendations: ["Implementar Data Governance", "Expandir uso de AI/ML"]
    },
    {
      name: "Segurança e Compliance",
      score: 90,
      description: "SOC, políticas LGPD, certificações ISO",
      status: "Excelente",
      recommendations: ["Implementar Zero Trust", "Expandir testes de segurança"]
    },
    {
      name: "Automação de Processos",
      score: 78,
      description: "RPA em áreas críticas, workflows automatizados",
      status: "Bom",
      recommendations: ["Expandir RPA para mais processos", "Implementar BPM completo"]
    },
    {
      name: "Cultura Digital",
      score: 82,
      description: "Equipe capacitada, investimento em inovação",
      status: "Muito Bom",
      recommendations: ["Aumentar programas de capacitação", "Criar cultura de experimentação"]
    }
  ],
  aiInsights: "Empresa com maturidade digital alta. Infraestrutura moderna e processos bem definidos. Principal gap: automação de processos. Excelente candidato para soluções TOTVS complementares.",
  evolutionTrend: "Crescente",
  industryComparison: "Acima da média do setor"
}

export const mockBenchmarkData = [
  {
    id: "1",
    metric: "Maturidade Digital",
    companyValue: 87,
    industryAverage: 65,
    topQuartile: 82,
    percentile: 85,
    trend: "up",
    aiInsights: "Empresa 34% acima da média do setor. Posicionamento competitivo forte."
  },
  {
    id: "2",
    metric: "Investimento em TI (% Receita)",
    companyValue: 8.5,
    industryAverage: 5.2,
    topQuartile: 7.8,
    percentile: 90,
    trend: "up",
    aiInsights: "Investimento significativo em tecnologia. Indica comprometimento com transformação digital."
  },
  {
    id: "3",
    metric: "Automação de Processos",
    companyValue: 78,
    industryAverage: 55,
    topQuartile: 75,
    percentile: 80,
    trend: "stable",
    aiInsights: "Boa automação mas com potencial de melhoria. Oportunidade para soluções TOTVS."
  },
  {
    id: "4",
    metric: "Adoção de Cloud",
    companyValue: 92,
    industryAverage: 60,
    topQuartile: 85,
    percentile: 95,
    trend: "up",
    aiInsights: "Líder em adoção de cloud. Infraestrutura moderna e escalável."
  },
  {
    id: "5",
    metric: "Segurança Cibernética",
    companyValue: 90,
    industryAverage: 70,
    topQuartile: 85,
    percentile: 88,
    trend: "up",
    aiInsights: "Excelente postura de segurança. Compliance e governança bem estabelecidos."
  }
]

export const mockFitTOTVS = {
  overall: Math.round((calculateMaturityScore(mockTechStack) + calculatePropensityScore(mockDecisionMakers, mockCompanies[0])) / 2),
  propensity: calculatePropensityScore(mockDecisionMakers, mockCompanies[0]),
  priority: calculatePriorityScore(calculateMaturityScore(mockTechStack), calculatePropensityScore(mockDecisionMakers, mockCompanies[0]), mockCompanies[0]),
  ticketEstimate: `R$ ${calculateTicketEstimado(mockCompanies[0], calculateMaturityScore(mockTechStack)).toLocaleString('pt-BR')} - R$ ${Math.round(calculateTicketEstimado(mockCompanies[0], calculateMaturityScore(mockTechStack)) * 1.6).toLocaleString('pt-BR')}`,
  roi: 285,
  paybackMonths: 18,
  factors: [
    {
      name: "Porte e Capacidade de Investimento",
      score: 95,
      weight: 0.25,
      description: "Empresa de grande porte com alto poder de investimento"
    },
    {
      name: "Maturidade Digital",
      score: 87,
      weight: 0.20,
      description: "Alta maturidade facilita adoção de novas soluções"
    },
    {
      name: "Stack Tecnológico Atual",
      score: 90,
      weight: 0.20,
      description: "Stack moderno e integrável com soluções TOTVS"
    },
    {
      name: "Decisores Identificados",
      score: 92,
      weight: 0.15,
      description: "Decisores chave mapeados com alto nível de influência"
    },
    {
      name: "Timing de Mercado",
      score: 88,
      weight: 0.10,
      description: "Momento favorável para investimento em TI"
    },
    {
      name: "Fit com Soluções TOTVS",
      score: 93,
      weight: 0.10,
      description: "Alto alinhamento com portfólio TOTVS"
    }
  ],
  opportunities: [
    {
      product: "TOTVS Protheus",
      fit: 95,
      priority: "Alta",
      reason: "Complementar ao SAP em processos específicos"
    },
    {
      product: "TOTVS Fluig",
      fit: 92,
      priority: "Alta",
      reason: "Automação de processos e BPM"
    },
    {
      product: "TOTVS BI",
      fit: 88,
      priority: "Média",
      reason: "Complementar ao Power BI para análises específicas"
    },
    {
      product: "TOTVS Carol",
      fit: 85,
      priority: "Média",
      reason: "Plataforma de IA e analytics avançado"
    }
  ],
  aiInsights: "Cliente ideal para TOTVS. Alto fit em múltiplas dimensões. Recomendação: abordagem consultiva com foco em Fluig (BPM/automação) como porta de entrada, seguido de Protheus para processos complementares. ROI atrativo e decisores identificados. Probabilidade de conversão: 75-85%."
}

export const mockPlaybooks = [
  {
    id: "1",
    name: "Abordagem Executiva Inicial",
    stage: "Prospecção",
    duration: "2-3 semanas",
    steps: [
      {
        step: 1,
        action: "Envio de email personalizado para CFO e CTO",
        owner: "SDR",
        timeline: "Dia 1",
        template: "Email_Exec_Initial",
        kpi: "Taxa de abertura > 40%"
      },
      {
        step: 2,
        action: "Follow-up telefônico",
        owner: "SDR",
        timeline: "Dia 3-5",
        template: "Script_Call_Exec",
        kpi: "Taxa de conexão > 25%"
      },
      {
        step: 3,
        action: "Envio de case de sucesso similar",
        owner: "SDR",
        timeline: "Dia 7",
        template: "Case_Study_Industria",
        kpi: "Engajamento com conteúdo"
      },
      {
        step: 4,
        action: "Agendamento de reunião executiva",
        owner: "AE",
        timeline: "Dia 10-15",
        template: "Meeting_Request",
        kpi: "Reunião agendada"
      }
    ],
    successRate: 65,
    aiInsights: "Playbook com alta taxa de sucesso para empresas de grande porte. Personalização é crítica."
  },
  {
    id: "2",
    name: "Apresentação Técnica e Demo",
    stage: "Qualificação",
    duration: "3-4 semanas",
    steps: [
      {
        step: 1,
        action: "Discovery call com equipe técnica",
        owner: "SE",
        timeline: "Semana 1",
        template: "Discovery_Tech",
        kpi: "Pain points identificados"
      },
      {
        step: 2,
        action: "Preparação de demo personalizada",
        owner: "SE + PM",
        timeline: "Semana 2",
        template: null,
        kpi: "Demo alinhada com pain points"
      },
      {
        step: 3,
        action: "Apresentação técnica e demo",
        owner: "SE + AE",
        timeline: "Semana 3",
        template: "Demo_Presentation",
        kpi: "Feedback positivo"
      },
      {
        step: 4,
        action: "Follow-up e próximos passos",
        owner: "AE",
        timeline: "Semana 4",
        template: "Post_Demo_Followup",
        kpi: "POC ou proposta solicitada"
      }
    ],
    successRate: 72,
    aiInsights: "Demo técnica bem preparada aumenta conversão em 40%. Envolver decisores técnicos é essencial."
  },
  {
    id: "3",
    name: "Proposta Comercial e Fechamento",
    stage: "Negociação",
    duration: "4-6 semanas",
    steps: [
      {
        step: 1,
        action: "Elaboração de proposta comercial detalhada",
        owner: "AE + Pricing",
        timeline: "Semana 1-2",
        template: "Proposta_Comercial",
        kpi: "Proposta enviada em até 7 dias"
      },
      {
        step: 2,
        action: "Apresentação de proposta para stakeholders",
        owner: "AE + Manager",
        timeline: "Semana 3",
        template: "Proposta_Presentation",
        kpi: "Todos stakeholders presentes"
      },
      {
        step: 3,
        action: "Negociação e ajustes",
        owner: "AE + Manager",
        timeline: "Semana 4-5",
        template: null,
        kpi: "Objeções tratadas"
      },
      {
        step: 4,
        action: "Fechamento e assinatura",
        owner: "AE + Legal",
        timeline: "Semana 6",
        template: "Contract",
        kpi: "Contrato assinado"
      }
    ],
    successRate: 58,
    aiInsights: "Fase crítica. ROI claro e envolvimento do CFO são essenciais para fechamento."
  }
]

export const mockAlerts = [
  {
    id: "1",
    type: "tech_change",
    title: "Nova tecnologia detectada: Microsoft Fabric",
    description: "Sistema identificou menção a Microsoft Fabric em vaga de emprego recente. Possível projeto de modernização de dados.",
    priority: "high",
    company: "COSAN LUBRIFICANTES",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    aiGenerated: true,
    actionable: true,
    suggestedActions: [
      "Contactar CTO sobre iniciativas de dados",
      "Propor integração TOTVS Carol com Microsoft Fabric",
      "Agendar reunião técnica sobre arquitetura de dados"
    ]
  },
  {
    id: "2",
    type: "contact_change",
    title: "Mudança de cargo: Carlos Santos promovido a VP de Tecnologia",
    description: "Decisor chave promovido. Maior poder de decisão e orçamento. Oportunidade para reengajamento.",
    priority: "critical",
    company: "COSAN LUBRIFICANTES",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    aiGenerated: true,
    actionable: true,
    suggestedActions: [
      "Enviar mensagem de congratulações",
      "Agendar reunião de atualização estratégica",
      "Apresentar visão de longo prazo para parceria TOTVS"
    ]
  },
  {
    id: "3",
    type: "opportunity",
    title: "Contrato SAP próximo do vencimento",
    description: "Análise preditiva indica possível renovação de contrato SAP nos próximos 6 meses. Janela de oportunidade para proposta TOTVS.",
    priority: "high",
    company: "COSAN LUBRIFICANTES",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "acknowledged",
    aiGenerated: true,
    actionable: true,
    suggestedActions: [
      "Preparar análise comparativa SAP vs TOTVS Protheus",
      "Calcular TCO e ROI de migração",
      "Agendar apresentação executiva sobre alternativas"
    ]
  },
  {
    id: "4",
    type: "revalidation",
    title: "Revalidação necessária: Stack Tecnológico",
    description: "Última validação do stack tecnológico há 90 dias. Recomendada nova varredura para manter dados atualizados.",
    priority: "medium",
    company: "COSAN LUBRIFICANTES",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
    aiGenerated: false,
    actionable: true,
    suggestedActions: [
      "Executar varredura automática de tecnologias",
      "Verificar vagas de emprego recentes",
      "Atualizar mapa de stack tecnológico"
    ]
  },
  {
    id: "5",
    type: "benchmark_update",
    title: "Empresa caiu no ranking de maturidade digital do setor",
    description: "Análise comparativa mostra queda de 5 posições no ranking setorial. Possível gap competitivo.",
    priority: "medium",
    company: "COSAN LUBRIFICANTES",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "resolved",
    aiGenerated: true,
    actionable: true,
    suggestedActions: [
      "Apresentar análise de gap competitivo",
      "Propor roadmap de modernização",
      "Destacar soluções TOTVS para recuperação"
    ]
  }
]
