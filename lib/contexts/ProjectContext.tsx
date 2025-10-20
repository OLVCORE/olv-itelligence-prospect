"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Vendor = 'TOTVS' | 'OLV' | 'CUSTOM'

interface Project {
  id: string
  name: string
  vendor: Vendor
  cnpjQuota: number
  cnpjQuotaUsed: number
}

interface ProjectContextType {
  currentProject: Project | null
  vendor: Vendor
  setCurrentProject: (project: Project) => void
  setVendor: (vendor: Vendor) => void
  refreshProject: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [vendor, setVendor] = useState<Vendor>('TOTVS')

  // Carregar projeto atual do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProject = localStorage.getItem('olv-current-project')
      const savedVendor = localStorage.getItem('olv-vendor')
      
      if (savedProject) {
        try {
          const project = JSON.parse(savedProject)
          setCurrentProject(project)
          setVendor(project.vendor || 'TOTVS')
        } catch (error) {
          console.error('[ProjectContext] Erro ao carregar projeto:', error)
        }
      }
      
      if (savedVendor) {
        setVendor(savedVendor as Vendor)
      }
    }
  }, [])

  // Salvar projeto atual no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentProject) {
        localStorage.setItem('olv-current-project', JSON.stringify(currentProject))
      }
      localStorage.setItem('olv-vendor', vendor)
    }
  }, [currentProject, vendor])

  // Atualizar vendor do projeto quando mudar
  useEffect(() => {
    if (currentProject && vendor !== currentProject.vendor) {
      setCurrentProject({
        ...currentProject,
        vendor
      })
    }
  }, [vendor])

  // Função para recarregar dados do projeto (quota, etc)
  const refreshProject = async () => {
    if (!currentProject) return

    try {
      const response = await fetch(`/api/projects/${currentProject.id}`)
      if (response.ok) {
        const project = await response.json()
        setCurrentProject(project)
        console.log('[ProjectContext] ✅ Projeto atualizado:', project)
      }
    } catch (error) {
      console.error('[ProjectContext] Erro ao atualizar projeto:', error)
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        vendor,
        setCurrentProject,
        setVendor,
        refreshProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}

