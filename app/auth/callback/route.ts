import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // OAuth error from provider
  if (error) {
    const msg = errorDescription ?? error
    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(msg)}`, origin)
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Redirect to intended page — use absolute URL to stay on correct domain
      const redirectTo = next.startsWith('/') ? `${origin}${next}` : next
      return NextResponse.redirect(redirectTo)
    }

    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(exchangeError.message)}`, origin)
    )
  }

  return NextResponse.redirect(
    new URL('/login?message=Authentication+failed.+Please+try+again.', origin)
  )
}
