import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Atualiza a sessão do Supabase (renova tokens se necessário)
  const { supabaseResponse, user, supabase } = await updateSession(request)
  
  const pathname = request.nextUrl.pathname

  // Define rotas baseadas na estrutura solicitada
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedRoute = pathname.startsWith('/social') || pathname.startsWith('/my-list') || pathname.startsWith('/profile')
  const isAdminRoute = pathname.startsWith('/admin')

  // Redireciona usuário não autenticado tentando acessar rota protegida
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redireciona usuário autenticado tentando acessar login/register
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Proteção de rotas admin
  if (user && isAdminRoute) {
    // Busca a role do usuário (em produção, é melhor armazenar a role nos claims do JWT via Custom Claims do Supabase para evitar query no middleware)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto arquivos estáticos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
