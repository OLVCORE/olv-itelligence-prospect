"use client"

import { useModuleContext } from "@/lib/contexts/ModuleContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Layers,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  FileText,
  Palette,
  Bell,
  Search
} from "lucide-react"

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'tech-stack', name: 'Tech Stack', icon: Layers, color: 'text-purple-500' },
  { id: 'decision-makers', name: 'Decisores', icon: Users, color: 'text-green-500' },
  { id: 'financial', name: 'Financeiro', icon: TrendingUp, color: 'text-yellow-500' },
  { id: 'maturity', name: 'Maturidade', icon: BarChart3, color: 'text-orange-500' },
  { id: 'benchmark', name: 'Benchmark', icon: Target, color: 'text-red-500' },
  { id: 'fit-totvs', name: 'Fit TOTVS', icon: Target, color: 'text-green-600' },
  { id: 'playbooks', name: 'Playbooks', icon: FileText, color: 'text-indigo-500' },
  { id: 'canvas', name: 'Canvas', icon: Palette, color: 'text-pink-500' },
  { id: 'alerts', name: 'Alertas', icon: Bell, color: 'text-amber-500' },
  { id: 'company-search', name: 'Buscar Empresas', icon: Search, color: 'text-cyan-500' }
]

interface SidebarProps {
  open: boolean
}

export function Sidebar({ open }: SidebarProps) {
  const { activeModule, setActiveModule } = useModuleContext()

  if (!open) return null

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50 overflow-y-auto z-40">
      <div className="p-4 space-y-2">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Módulos Inteligentes
          </h2>
        </div>

        {modules.map((module) => {
          const Icon = module.icon
          const isActive = activeModule === module.id

          return (
            <Button
              key={module.id}
              variant={isActive ? "default" : "ghost"}
              className={`
                w-full justify-start gap-3 transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }
              `}
              onClick={() => setActiveModule(module.id)}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : module.color}`} />
              <span className="flex-1 text-left">{module.name}</span>
              {isActive && (
                <Badge className="bg-white/20 text-white text-[10px]">
                  Ativo
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-800/95">
        <div className="text-xs text-slate-400 text-center">
          <p>OLV Intelligence v2.0</p>
          <p className="text-[10px] text-slate-500 mt-1">Sistema de Prospecção B2B</p>
        </div>
      </div>
    </aside>
  )
}

