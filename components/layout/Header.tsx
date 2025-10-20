"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRoleColor } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Bell,
  Menu,
  X
} from "lucide-react"
import { ModeToggle } from "@/components/ModeToggle"

interface HeaderProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function Header({ onToggleSidebar, sidebarOpen = true }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
    router.push("/login")
  }

  if (!user) {
    return null
  }

  const userInitials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Side - Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 p-2"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-lg flex items-center justify-center">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-lg font-semibold text-white">OLV Intelligence</h1>
              <p className="text-[10px] sm:text-xs text-slate-400">Sistema de Prospecção</p>
            </div>
          </div>
        </div>

        {/* Right Side - User Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <ModeToggle />
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 relative p-2"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* User Role Badge */}
          <Badge className={`${getRoleColor(user.role)} text-[10px] sm:text-xs px-1.5 sm:px-2 hidden sm:inline-flex`}>
            {getRoleDisplayName(user.role)}
          </Badge>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src="" alt={user.name || ""} />
                  <AvatarFallback className="bg-slate-600 text-white text-xs sm:text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-slate-400">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-4 top-16 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Notificações</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-white font-medium">Nova análise concluída</p>
                  <p className="text-xs text-slate-400">TechCorp - Análise de maturidade disponível</p>
                  <p className="text-xs text-slate-500">há 5 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-white font-medium">Relatório gerado</p>
                  <p className="text-xs text-slate-400">Relatório executivo InovDigital pronto</p>
                  <p className="text-xs text-slate-500">há 1 hora</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-white font-medium">Revalidação necessária</p>
                  <p className="text-xs text-slate-400">ConsultEmp - Dados desatualizados</p>
                  <p className="text-xs text-slate-500">há 2 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}