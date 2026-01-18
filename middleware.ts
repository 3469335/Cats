import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Временное решение: проверяем cookie без использования auth() напрямую
// так как auth() использует Prisma, который не работает в Edge Runtime
// Для production рекомендуется использовать Prisma Accelerate
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Проверяем cookie для сессии - пробуем разные возможные имена
  const sessionCookie = 
    req.cookies.get('authjs.session-token') || 
    req.cookies.get('__Secure-authjs.session-token') ||
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token')
  const hasSessionCookie = !!sessionCookie
  
  // В Edge Runtime мы не можем использовать Prisma напрямую
  // Поэтому проверяем только наличие cookie
  // Для полноценной проверки сессии используем API route
  const isLoggedIn = hasSessionCookie
  
  // Логируем все cookies для отладки
  const allCookies = req.cookies.getAll()
  const cookieNames = allCookies.map(c => c.name)
  
  // Логирование для отладки (только для важных маршрутов)
  if (pathname === '/login' || pathname === '/dashboard' || pathname === '/') {
    console.log('[MIDDLEWARE] ========== Request ==========', {
      pathname,
      isLoggedIn,
      hasSessionCookie,
      sessionCookieName: sessionCookie?.name || 'none',
      sessionCookieValue: sessionCookie?.value?.substring(0, 30) + '...' || 'none',
      sessionCookieLength: sessionCookie?.value?.length || 0,
      allCookieNames: cookieNames,
      totalCookies: allCookies.length,
      note: 'Using cookie-based auth check (Prisma not available in Edge Runtime)',
    })
    
    if (!hasSessionCookie) {
      console.log('[MIDDLEWARE] No session cookie - user is not logged in')
    }
  }

  // Публичные маршруты (не требуют авторизации)
  const publicRoutes = ['/login']
  
  // Исключаем API маршруты NextAuth из middleware (они обрабатываются отдельно)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  
  // Если это публичный маршрут, пропускаем
  if (publicRoutes.includes(pathname)) {
    // Если пользователь авторизован и пытается зайти на /login, перенаправляем на главную
    if (pathname === '/login' && isLoggedIn) {
      console.log('[MIDDLEWARE] User is logged in, redirecting from /login to /')
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Защищенные маршруты (все остальные, включая главную страницу)
  // Если пользователь не авторизован, перенаправляем на /login
  if (!isLoggedIn) {
    console.log('[MIDDLEWARE] User not logged in, redirecting to /login from', pathname)
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
