"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Building2, Shield, Users, BarChart3 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simular autenticação (para demo)
      const validCredentials = [
        { email: "admin@olv.com", password: "admin123", role: "ADMIN" },
        { email: "editor@olv.com", password: "editor123", role: "EDITOR" },
        { email: "viewer@olv.com", password: "viewer123", role: "VIEWER" }
      ]

      const user = validCredentials.find(
        cred => cred.email === email && cred.password === password
      )

      if (user) {
        // Salvar no localStorage para demo
        localStorage.setItem("user", JSON.stringify({
          email: user.email,
          role: user.role,
          name: user.role === "ADMIN" ? "Administrador OLV" : 
                user.role === "EDITOR" ? "Editor OLV" : "Visualizador OLV"
        }))
        
        // Redirecionar para dashboard
        router.push("/dashboard")
      } else {
        setError("Email ou senha inválidos")
      }
    } catch (error) {
      setError("Erro interno do servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const demoCredentials = [
    { role: "Admin", email: "admin@olv.com", password: "admin123", color: "text-red-400" },
    { role: "Editor", email: "editor@olv.com", password: "editor123", color: "text-blue-400" },
    { role: "Viewer", email: "viewer@olv.com", password: "viewer123", color: "text-green-400" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border-slate-700/50">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-slate-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">OLV Intelligence</CardTitle>
              <CardDescription className="text-slate-400 text-sm sm:text-base">
                Sistema de Prospecção Inteligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="seu@email.com"
                    autoComplete="username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-slate-600 text-white font-medium hover:from-blue-700 hover:to-slate-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Credenciais de Demonstração:</h3>
                <div className="space-y-2">
                  {demoCredentials.map((cred) => (
                    <div key={cred.role} className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${cred.color}`}>{cred.role}:</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                          onClick={() => setEmail(cred.email)}
                        >
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                          onClick={() => setPassword(cred.password)}
                        >
                          Senha
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Features */}
        <div className="flex items-center justify-center px-4">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Inteligência Empresarial
                <span className="block text-blue-400">de Nova Geração</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-md mx-auto">
                Plataforma completa para prospecção, análise e relatórios executivos com IA
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Segurança Total</h3>
                  <p className="text-slate-400 text-sm">
                    RBAC, auditoria completa e conformidade LGPD
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Colaboração Real</h3>
                  <p className="text-slate-400 text-sm">
                    Canvas estratégico com sincronização em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">IA Avançada</h3>
                  <p className="text-slate-400 text-sm">
                    Análise preditiva e insights automáticos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Dados Reais</h3>
                  <p className="text-slate-400 text-sm">
                    Integração com Receita Federal e APIs externas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}