import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessPath, getHomePathForRole, normalizeRole } from '@/utils/rbac'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Verificar si hay una sesión activa
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname === '/login'
  const isOnboardingPage = url.pathname === '/onboarding'
  const isDebugPage = url.pathname === '/debug'
  const isPrivatePage = url.pathname.startsWith('/admin') || url.pathname.startsWith('/pos') || url.pathname.startsWith('/kitchen')

  // 2. Si no hay usuario y trata de acceder a rutas privadas, al Login
  if (!user && isPrivatePage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Permitir acceso a debug sin redirecciones
  if (isDebugPage) {
    return supabaseResponse
  }

  // 3. Lógica de Onboarding (Solo si hay usuario)
  if (user) {
    // Consultamos el perfil del usuario para ver si tiene restaurante
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('restaurante_id, rol')
      .eq('id', user.id)
      .maybeSingle()

    const tieneRestaurante = !!perfil?.restaurante_id
    const rol = normalizeRole(perfil?.rol)

    // CASO A: No tiene restaurante y no está en onboarding -> Mandar a onboarding
    if (!tieneRestaurante && isPrivatePage && !isOnboardingPage) {
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // CASO B: Ya tiene restaurante pero intenta entrar a onboarding -> Mandar al admin
    if (tieneRestaurante && isOnboardingPage) {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    if (tieneRestaurante && isPrivatePage && !canAccessPath(rol, url.pathname)) {
      url.pathname = '/access-denied'
      url.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del sitio)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}