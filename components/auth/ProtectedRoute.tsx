"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "EDITOR" | "VIEWER"
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-slate-400 mb-6">
            Você não tem permissão para acessar esta área.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook para verificar permissões
export function usePermissions() {
  const { data: session } = useSession()
  
  const hasRole = (role: "ADMIN" | "EDITOR" | "VIEWER") => {
    return session?.user?.role === role
  }

  const hasPermission = (requiredRole: "ADMIN" | "EDITOR" | "VIEWER") => {
    if (!session?.user?.role) return false
    
    const roleHierarchy = {
      "VIEWER": 1,
      "EDITOR": 2,
      "ADMIN": 3
    }
    
    return roleHierarchy[session.user.role as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole]
  }

  const canAccess = (resource: string) => {
    if (!session?.user?.role) return false
    
    const permissions = {
      "VIEWER": ["dashboard", "companies", "reports"],
      "EDITOR": ["dashboard", "companies", "tech-stack", "decision-makers", "financial", "maturity", "benchmark", "reports", "canvas"],
      "ADMIN": ["dashboard", "companies", "tech-stack", "decision-makers", "financial", "maturity", "benchmark", "fit-totvs", "playbooks", "canvas", "reports", "monitoring", "settings", "users"]
    }
    
    return permissions[session.user.role as keyof typeof permissions]?.includes(resource) || false
  }

  return {
    user: session?.user,
    hasRole,
    hasPermission,
    canAccess,
    isAuthenticated: !!session
  }
}

