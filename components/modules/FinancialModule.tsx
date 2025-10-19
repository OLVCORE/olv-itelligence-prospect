"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatNumber, formatDate, formatPercent } from "@/lib/utils/format"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  Shield,
  AlertTriangle,
  Building,
  Users as UsersIcon,
  Calendar,
  BarChart3
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FinancialData {
  capitalSocial: string
  faturamentoAnual: string
  porte: string
  funcionarios: number
  risco: string
  scoreSerasa: number
  situacao: string
  dataAbertura: string
  naturezaJuridica: string
  regimeTributario: string
  indicadores: {
    liquidezCorrente: number
    endividamento: number
    margemLiquida: number
    roe: number
    crescimentoAnual: number
  }
  aiInsights: string
}

interface FinancialModuleProps {
  data: FinancialData
}

export function FinancialModule({ data }: FinancialModuleProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Baixo": return "text-emerald-500"
      case "Médio": return "text-yellow-500"
      case "Alto": return "text-red-500"
      default: return "text-slate-400"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-emerald-500"
    if (score >= 600) return "text-blue-500"
    if (score >= 400) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header com Explicação */}
      <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800/30 border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                Situação Financeira e Fiscal
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-emerald-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-md">
                      <p className="font-semibold mb-2">O que é Análise Financeira?</p>
                      <p className="text-sm">
                        Avalia a saúde financeira, capacidade de investimento e risco de crédito da empresa. 
                        Utiliza dados da Receita Federal, Serasa e análises de balanços públicos.
                      </p>
                      <p className="text-sm mt-2 font-semibold">Para que serve?</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li>Avaliar capacidade de investimento em tecnologia</li>
                        <li>Estimar ticket médio de venda viável</li>
                        <li>Identificar riscos de inadimplência</li>
                        <li>Priorizar prospects com maior poder aquisitivo</li>
                      </ul>
                      <p className="text-sm mt-2 font-semibold">Correlação com outros módulos:</p>
                      <ul className="text-sm list-disc pl-4 mt-1">
                        <li><strong>Fit TOTVS:</strong> Peso crucial no cálculo de propensão</li>
                        <li><strong>Playbooks:</strong> Define abordagem financeira (CFO)</li>
                        <li><strong>Relatórios:</strong> Seção de viabilidade comercial</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                Análise financeira através de <strong>ReceitaWS</strong>, <strong>Serasa</strong> e 
                <strong> dados públicos</strong>. Indicadores de liquidez, endividamento e crescimento 
                para avaliar capacidade de investimento.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={`border-emerald-500 ${getRiskColor(data.risco)} bg-emerald-500/10`}>
                <Shield className="h-3 w-3 mr-1" />
                Risco {data.risco}
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                {data.porte}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs Financeiros Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              Capital Social
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Valor investido pelos sócios na empresa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.capitalSocial)}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              Faturamento Anual
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Receita bruta anual estimada</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(data.faturamentoAnual)}</div>
            <div className="flex items-center gap-1 mt-1 text-emerald-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              +{formatPercent(data.indicadores.crescimentoAnual)} a.a.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              Score Serasa
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Score de crédito (0-1000)</p>
                    <p className="text-xs mt-1">800+: Excelente | 600-799: Bom | 400-599: Regular</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.scoreSerasa)}`}>
              {data.scoreSerasa}
            </div>
            <Progress value={(data.scoreSerasa / 1000) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              Funcionários
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Número estimado de funcionários</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.funcionarios.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-slate-500 mt-1">{data.porte} porte</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores Financeiros Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicadores de Liquidez e Solvência */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Indicadores de Liquidez e Solvência
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      Medem a capacidade da empresa de pagar suas dívidas 
                      e honrar compromissos financeiros.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Liquidez Corrente */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Liquidez Corrente</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Ativo Circulante ÷ Passivo Circulante</p>
                        <p className="text-xs mt-1">Ideal: &gt; 1.5 | Bom: 1.0-1.5 | Ruim: &lt; 1.0</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-lg font-bold text-emerald-500">
                  {data.indicadores.liquidezCorrente.toFixed(2)}
                </span>
              </div>
              <Progress value={(data.indicadores.liquidezCorrente / 3) * 100} />
              <p className="text-xs text-slate-500 mt-1">
                Empresa pode pagar {data.indicadores.liquidezCorrente.toFixed(2)}x suas dívidas de curto prazo
              </p>
            </div>

            {/* Endividamento */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Endividamento</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Passivo Total ÷ Ativo Total × 100</p>
                        <p className="text-xs mt-1">Bom: &lt; 50% | Moderado: 50-70% | Alto: &gt; 70%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`text-lg font-bold ${data.indicadores.endividamento < 50 ? 'text-emerald-500' : data.indicadores.endividamento < 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {data.indicadores.endividamento}%
                </span>
              </div>
              <Progress value={data.indicadores.endividamento} />
              <p className="text-xs text-slate-500 mt-1">
                {data.indicadores.endividamento < 50 ? 'Endividamento saudável' : data.indicadores.endividamento < 70 ? 'Endividamento moderado' : 'Endividamento elevado'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores de Rentabilidade */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Indicadores de Rentabilidade
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      Medem a eficiência da empresa em gerar lucros 
                      e retorno sobre investimentos.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Margem Líquida */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Margem Líquida</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Lucro Líquido ÷ Receita Total × 100</p>
                        <p className="text-xs mt-1">Excelente: &gt; 15% | Bom: 10-15% | Regular: &lt; 10%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-lg font-bold text-emerald-500">
                  {data.indicadores.margemLiquida}%
                </span>
              </div>
              <Progress value={data.indicadores.margemLiquida * 5} />
              <p className="text-xs text-slate-500 mt-1">
                Para cada R$ 100 de receita, R$ {data.indicadores.margemLiquida} é lucro líquido
              </p>
            </div>

            {/* ROE */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">ROE (Retorno sobre Patrimônio)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Lucro Líquido ÷ Patrimônio Líquido × 100</p>
                        <p className="text-xs mt-1">Excelente: &gt; 20% | Bom: 15-20% | Regular: &lt; 15%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-lg font-bold text-emerald-500">
                  {data.indicadores.roe}%
                </span>
              </div>
              <Progress value={data.indicadores.roe * 3} />
              <p className="text-xs text-slate-500 mt-1">
                Retorno anual de {data.indicadores.roe}% sobre capital investido pelos sócios
              </p>
            </div>

            {/* Crescimento */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Crescimento Anual</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Taxa de crescimento da receita ano a ano</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {data.indicadores.crescimentoAnual}%
                </span>
              </div>
              <Progress value={data.indicadores.crescimentoAnual * 5} />
              <p className="text-xs text-slate-500 mt-1">
                Crescimento consistente indica empresa em expansão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Cadastrais */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Dados Cadastrais e Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Situação</p>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {data.situacao}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Data de Abertura</p>
              <p className="text-sm text-white">{formatDate(data.dataAbertura)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Natureza Jurídica</p>
              <p className="text-sm text-white">{data.naturezaJuridica}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Regime Tributário</p>
              <p className="text-sm text-white">{data.regimeTributario}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de IA */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Análise Preditiva de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed">{data.aiInsights}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-400 mb-1">Capacidade de Investimento</p>
              <p className="text-lg font-bold text-white">Alta</p>
              <p className="text-xs text-slate-400 mt-1">Empresa tem recursos para projetos grandes</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-400 mb-1">Ticket Estimado</p>
              <p className="text-lg font-bold text-white">R$ 2-4M</p>
              <p className="text-xs text-slate-400 mt-1">Baseado em porte e saúde financeira</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-400 mb-1">Risco de Crédito</p>
              <p className="text-lg font-bold text-white">Baixo</p>
              <p className="text-xs text-slate-400 mt-1">Excelente histórico e indicadores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

