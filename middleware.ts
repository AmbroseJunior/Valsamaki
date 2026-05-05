import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth']
const PRODUCER_ROUTES = ['/business', '/advertise', '/analytics']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, role } = await updateSession(request)

  // OWASP A05 — apply security headers to every response
  applySecurityHeaders(response.headers)

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    // OWASP A01 — only pass relative paths as next param, never external URLs
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isProducerRoute = PRODUCER_ROUTES.some((r) => pathname.startsWith(r))
  if (isProducerRoute && role !== 'producer' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|woff|woff2|ttf|otf|eot)$).*)',
  ],
}
