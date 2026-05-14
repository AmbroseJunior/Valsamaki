import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, validateString } from '@/lib/security'

const RATE_LIMIT = { limit: 3, windowMs: 60_000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // OWASP A07 — burst protection per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`waitlist:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json() as { email?: unknown; locale?: unknown; source?: unknown }

  // OWASP A03 — strict input validation
  const email = validateString(body?.email, { maxLength: 254, minLength: 5 })
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const locale = validateString(body?.locale, { maxLength: 10 }) ?? null
  const source = validateString(body?.source, { maxLength: 50 }) ?? 'language_picker'

  const supabase = await createServiceClient()
  const { error } = await supabase.from('waitlist').insert({ email, locale, source })

  if (error) {
    // Unique constraint — email already registered
    if (error.code === '23505') {
      return NextResponse.json({ already: true })
    }
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
