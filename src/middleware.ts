import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = [
    '/dashboard',
    '/funcionarios',
    '/documentos',    
    '/folha-pagamento',
    '/relatorios',
    '/controle-ponto',
    '/configuracoes'
  ].some(path => request.nextUrl.pathname.startsWith(path))
  
  // Redirecionar usuários não autenticados para login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Redirecionar usuários autenticados de páginas de auth para dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/funcionarios/:path*', 
    '/folha-pagamento/:path*', 
    '/relatorios/:path*', 
    '/configuracoes/:path*',
    '/auth/:path*'
  ]
}