import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware simplificado - autenticação será tratada no client-side
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso a rotas públicas
  const publicRoutes = ["/login", "/api/auth"]
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Para demo, permitir acesso a todas as rotas
  // Em produção, você pode adicionar verificação de token JWT aqui
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

