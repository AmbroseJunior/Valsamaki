import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, validateString } from '@/lib/security'

const RATE_LIMIT = { limit: 3, windowMs: 60_000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`waitlist:${ip}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json() as { email?: unknown; locale?: unknown; source?: unknown }

  const email = validateString(body?.email, { maxLength: 254, minLength: 5 })
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const locale = validateString(body?.locale, { maxLength: 10 }) ?? null
  const source = validateString(body?.source, { maxLength: 50 }) ?? 'coming_soon'

  const supabase = await createClient()
  const { error } = await supabase.from('waitlist').insert({ email, locale, source })

  if (error) {
    if (error.code === '23505') {
      const { data: countData } = await supabase.rpc('get_waitlist_count')
      return NextResponse.json({ already: true, position: Number(countData ?? 1) })
    }
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  const { data: countData } = await supabase.rpc('get_waitlist_count')
  return NextResponse.json({ ok: true, position: Number(countData ?? 1) })
}
