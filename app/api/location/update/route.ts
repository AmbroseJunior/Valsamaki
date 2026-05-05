import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/ai/recommendation'
import { rateLimit, validateLatLng } from '@/lib/security'

// OWASP A07 — location can update at most once per 30 seconds per user
const RATE_LIMIT = { limit: 2, windowMs: 30_000 }

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`location:${user.id}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const body = await request.json()

    // OWASP A03 — validate real geographic bounds, reject non-finite / out-of-range values
    const coords = validateLatLng(body?.lat, body?.lng)
    if (!coords) {
      return NextResponse.json(
        { error: 'lat must be −90…90 and lng must be −180…180' },
        { status: 400 }
      )
    }

    await supabase
      .from('profiles')
      .update({ location_lat: coords.lat, location_lng: coords.lng, last_seen_at: new Date().toISOString() })
      .eq('id', user.id)

    generateRecommendations(user.id, coords).catch(() => null)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
