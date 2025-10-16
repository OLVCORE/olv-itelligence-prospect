import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Configuração simplificada do NextAuth para demo
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Demo: aceitar qualquer email/senha
        if (credentials?.email && credentials?.password) {
          return {
            id: "demo-user",
            email: credentials.email,
            name: "Usuário Demo",
            role: "ADMIN"
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: "/login",
    error: "/login?error=AuthenticationError"
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)

// Funções utilitárias para RBAC
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    "VIEWER": 1,
    "EDITOR": 2,
    "ADMIN": 3
  }
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

export const canAccess = (userRole: string, resource: string): boolean => {
  const permissions = {
    "VIEWER": ["dashboard", "companies", "reports"],
    "EDITOR": ["dashboard", "companies", "tech-stack", "decision-makers", "financial", "maturity", "benchmark", "reports", "canvas"],
    "ADMIN": ["dashboard", "companies", "tech-stack", "decision-makers", "financial", "maturity", "benchmark", "fit-totvs", "playbooks", "canvas", "reports", "monitoring", "settings", "users"]
  }
  
  return permissions[userRole as keyof typeof permissions]?.includes(resource) || false
}

export const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    "ADMIN": "Administrador",
    "EDITOR": "Editor",
    "VIEWER": "Visualizador"
  }
  
  return roleNames[role as keyof typeof roleNames] || role
}

export const getRoleColor = (role: string): string => {
  const roleColors = {
    "ADMIN": "bg-red-500/20 text-red-400 border-red-500/30",
    "EDITOR": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "VIEWER": "bg-green-500/20 text-green-400 border-green-500/30"
  }
  
  return roleColors[role as keyof typeof roleColors] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
}