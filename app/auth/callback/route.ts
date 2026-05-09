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
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Check whether this is a brand-new user or a returning one
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', authUser.id)
          .single()

        if (!existingProfile) {
          // Brand-new OAuth sign-in: create profile with the role they chose before clicking Google/Apple
          const rawRole = searchParams.get('role')
          const intendedRole = rawRole === 'producer' ? 'producer' : 'user'
          await supabase.from('profiles').insert({
            id: authUser.id,
            name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
            role: intendedRole,
            language: 'en',
          })
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Returning user — preserve their existing role
        // If they somehow never finished onboarding, send them back
        const destination = !existingProfile.preferences ? '/onboarding' : next
        return NextResponse.redirect(`${origin}${destination}`)
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
