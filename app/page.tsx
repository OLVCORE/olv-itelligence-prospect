"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 🔓 AUTENTICAÇÃO DESABILITADA - Acesso direto ao dashboard
    // Criar usuário fake automaticamente
    localStorage.setItem("user", JSON.stringify({
      email: "admin@olv.com",
      role: "ADMIN",
      name: "Administrador OLV"
    }))
    
    // Redirecionar direto para dashboard
    router.push("/dashboard")
    setIsLoading(false)
    
    /* CÓDIGO ORIGINAL (reativar quando sistema estiver pronto):
    const user = localStorage.getItem("user")
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
    setIsLoading(false)
    */
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return null
}