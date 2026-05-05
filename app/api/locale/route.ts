import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales'
import { rateLimit } from '@/lib/security'

// OWASP A07 — prevent locale-switching spam
const RATE_LIMIT = { limit: 10, windowMs: 60_000 }

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`locale:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json() as { locale?: unknown }
  const locale = body?.locale

  // OWASP A03 — strict allowlist, reject anything not in the supported set
  if (
    typeof locale !== 'string' ||
    locale.length > 10 ||
    !SUPPORTED_LOCALES.includes(locale as typeof SUPPORTED_LOCALES[number])
  ) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const res = NextResponse.json({ locale })
  res.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    // next-intl reads this cookie server-side in middleware — httpOnly is safe
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
