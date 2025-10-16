"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Building2, 
  MapPin, 
  Activity, 
  Eye, 
  Play,
  Info,
  TrendingUp,
  Users
} from "lucide-react"

interface CompanyCardProps {
  company: any
  isSelected: boolean
  isLoading: boolean
  onSelect: () => void
  onAnalyze: () => void
  onViewPreview: () => void
}

export function CompanyCard({ 
  company, 
  isSelected, 
  isLoading, 
  onSelect, 
  onAnalyze,
  onViewPreview 
}: CompanyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "ATIVA": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Inativo": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Pendente": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`
              bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 hover:border-blue-500/50 
              transition-all cursor-pointer
              ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}
            `}
            onClick={onViewPreview}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">
                    {company.fantasia || company.razao}
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-mono text-xs">
                    {company.cnpj}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {company.cidade}/{company.uf}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  Porte: {company.porte}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity className="h-4 w-4 text-green-400" />
                  {new Date(company.lastAnalyzed).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewPreview()
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAnalyze()
                  }}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Analisar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        
        <TooltipContent 
          side="right" 
          className="max-w-sm bg-slate-800 border-slate-700 p-4"
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-white mb-1">{company.fantasia || company.razao}</h4>
              <p className="text-xs text-slate-400">{company.razao}</p>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">CNPJ:</span>
                <span className="text-white font-mono">{company.cnpj}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Localização:</span>
                <span className="text-white">{company.cidade}/{company.uf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Porte:</span>
                <span className="text-white">{company.porte}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capital Social:</span>
                <span className="text-white">{company.capitalSocial}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-blue-400 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Clique para ver relatório completo
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
