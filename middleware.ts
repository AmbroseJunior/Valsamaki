import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth', '/map', '/explore', '/events', '/info', '/onboarding', '/products']
const PRODUCER_ROUTES = ['/business', '/analytics']
const ADMIN_ROUTES = ['/admin']

// Routes accessible to everyone during the under-construction phase
const MAINTENANCE_BYPASS = ['/coming-soon', '/thank-you', '/login', '/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, role } = await updateSession(request)

  // OWASP A05 — apply security headers to every response
  applySecurityHeaders(response.headers)

  // API routes handle their own auth — never redirect them to login
  if (pathname.startsWith('/api/')) {
    return response
  }

  // ── Under-construction gate ──────────────────────────────────────────────
  // Only admin can access the full app. Everyone else sees /coming-soon.
  // Bypass routes (/coming-soon, /thank-you, /login, /auth) skip the gate
  // AND all remaining auth checks — they must be reachable by anyone.
  const isBypass = MAINTENANCE_BYPASS.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isBypass) {
    // Logged-in user on the login page → send them to the right place
    if (isAuthRoute && user) {
      const dest = role === 'admin' ? '/dashboard' : '/coming-soon'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    // All other bypass routes (/coming-soon, /thank-you, /auth) — let through
    return response
  }

  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/coming-soon', request.url))
  }
  // ─────────────────────────────────────────────────────────────────────────

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))

  if (!isPublicRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    // OWASP A01 — only pass relative paths as next param, never external URLs
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Only admins reach this point — producer/admin sub-route checks are for post-launch
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|woff|woff2|ttf|otf|eot)$).*)',
  ],
}
