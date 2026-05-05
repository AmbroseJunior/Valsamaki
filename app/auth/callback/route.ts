import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { safeRedirectPath } from '@/lib/security'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // OWASP A01 — validate next is a safe relative path before using it
  const next = safeRedirectPath(searchParams.get('next'), '/dashboard')

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
      // Ensure a profile row exists for OAuth sign-ins (Google, Facebook, etc.)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        await supabase.from('profiles').upsert(
          {
            id: authUser.id,
            name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
            role: 'user',
            language: 'en',
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(exchangeError.message)}`, origin)
    )
  }

  return NextResponse.redirect(
    new URL('/login?message=Authentication+failed.+Please+try+again.', origin)
  )
}
