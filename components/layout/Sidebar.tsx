"use client"

import { useModuleContext } from "@/lib/contexts/ModuleContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] 
      bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50 
      overflow-y-auto z-40 transition-all duration-300 ease-in-out group
      ${open ? 'w-64' : 'w-16 hover:w-64'}
    `}>
      <div className="p-4 space-y-2">
        <div className="mb-4">
          <h2 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            Módulos Inteligentes
          </h2>
        </div>

        {modules.map((module) => {
          const Icon = module.icon
          const isActive = activeModule === module.id

          return (
            <div key={module.id} className="relative group">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`
                  w-full justify-start gap-3 transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                  ${!open ? 'justify-center px-2' : ''}
                `}
                onClick={() => {
                  console.log(`[Sidebar] 🔄 Mudando para módulo: ${module.id}`)
                  setActiveModule(module.id)
                }}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : module.color} ${!open ? 'mx-auto' : ''}`} />
                <span className={`flex-1 text-left transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{module.name}</span>
                {isActive && (
                  <Badge className={`bg-white/20 text-white text-[10px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    Ativo
                  </Badge>
                )}
              </Button>
              
              {/* Tooltip para quando sidebar está fechada */}
              {!open && (
                <div className="absolute left-16 top-0 bg-slate-700 text-white px-3 py-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  {module.name}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-800/95">
        <div className={`text-xs text-slate-400 text-center transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <p>OLV Intelligence v2.0</p>
          <p className="text-[10px] text-slate-500 mt-1">Sistema de Prospecção B2B</p>
        </div>
      </div>
    </aside>
  )
}

