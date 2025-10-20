"use client"

import { useState } from 'react'
import { useProject } from '@/lib/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, ChevronDown, CheckCircle2 } from 'lucide-react'

export function ProjectSwitcher() {
  const { currentProject, setCurrentProject } = useProject()
  const [projects] = useState([
    // Mock: em produção, carregar do Supabase
    {
      id: '1',
      name: 'Projeto Principal',
      vendor: 'TOTVS' as const,
      cnpjQuota: 100,
      cnpjQuotaUsed: 45
    },
    {
      id: '2',
      name: 'Projeto OLV',
      vendor: 'OLV' as const,
      cnpjQuota: 50,
      cnpjQuotaUsed: 12
    }
  ])

  // Se não há projeto selecionado, selecionar o primeiro
  if (!currentProject && projects.length > 0) {
    setCurrentProject(projects[0])
  }

  const quotaPercentage = currentProject 
    ? (currentProject.cnpjQuotaUsed / currentProject.cnpjQuota) * 100
    : 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto py-2 px-3 dark:text-white dark:hover:bg-slate-700">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {currentProject?.name || 'Selecionar Projeto'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
              {currentProject && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentProject.cnpjQuotaUsed}/{currentProject.cnpjQuota} análises
                </span>
              )}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 dark:bg-slate-800 dark:border-slate-700">
        <DropdownMenuLabel className="dark:text-gray-300">Projetos</DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => setCurrentProject(project)}
            className="cursor-pointer dark:text-gray-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {project.cnpjQuotaUsed}/{project.cnpjQuota} análises
                  </span>
                </div>
              </div>
              {currentProject?.id === project.id && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

