"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, TrendingUp, Users } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentQuota: {
    total: number
    used: number
    available: number
  }
}

export function UpgradeModal({ isOpen, onClose, currentQuota }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-slate-800 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quota de Análises Esgotada
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Você atingiu o limite do seu plano atual. Faça upgrade para continuar analisando empresas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Status Atual */}
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium dark:text-gray-300">Plano Atual</span>
              <Badge variant="outline" className="dark:border-yellow-500 dark:text-yellow-500">
                Básico
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold dark:text-white">
              <span>{currentQuota.used}</span>
              <span className="text-slate-400 dark:text-slate-500">/</span>
              <span>{currentQuota.total}</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">análises utilizadas</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(currentQuota.used / currentQuota.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Planos Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plano Profissional */}
            <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg p-6 bg-white dark:bg-slate-900 relative">
              <Badge className="absolute -top-2 right-4 bg-blue-500 text-white">
                Recomendado
              </Badge>
              <div className="mb-4">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Profissional
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold dark:text-white">500</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">análises/mês</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Análises ilimitadas de empresas</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Perfil digital de decisores</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Playbooks personalizados</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Export PDF e CSV</span>
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Fazer Upgrade
              </Button>
            </div>

            {/* Plano Enterprise */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-900">
              <div className="mb-4">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Enterprise
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold dark:text-white">∞</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">sem limites</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tudo do Profissional</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Análises ilimitadas</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multi-usuários (equipe)</span>
                </li>
                <li className="flex items-start gap-2 text-sm dark:text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-800">
                Falar com Vendas
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Precisa de mais informações?{" "}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Entre em contato
              </a>
            </p>
            <Button variant="ghost" onClick={onClose} className="dark:text-gray-300">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

