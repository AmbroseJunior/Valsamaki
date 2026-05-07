import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mcpBridge } from '@/lib/ai/mcp-bridge'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, validateString } from '@/lib/security'

export const maxDuration = 30

// OWASP A07 — 20 requests per user per minute
const RATE_LIMIT = { limit: 20, windowMs: 60_000 }
// OWASP A03 — message length cap
const MAX_MESSAGE_LEN = 2000

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // OWASP A07 — rate limit per authenticated user
    const rl = rateLimit(`chat:${user.id}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const body = await request.json()

    // OWASP A03 — validate + cap input length
    const message = validateString(body?.message, { maxLength: MAX_MESSAGE_LEN, minLength: 1 })
    if (!message) {
      return NextResponse.json({ error: 'message must be 1–2000 characters' }, { status: 400 })
    }

    // OWASP A01 — userId from session only, never trust client-supplied value
    const { data: profile } = await supabase
      .from('profiles')
      .select('location_lat, location_lng, language')
      .eq('id', user.id)
      .single()

    const location = profile?.location_lat && profile?.location_lng
      ? { lat: profile.location_lat, lng: profile.location_lng }
      : null

    const locale = (body?.locale as string | undefined) ?? profile?.language ?? 'en'

    const result = await mcpBridge({
      task: 'chat',
      userId: user.id,
      input: message,
      context: { userLocation: location ?? undefined, locale },
    })

    return NextResponse.json({ reply: result.output, provider: result.provider })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''

    if (msg.includes('No AI providers configured') || msg.includes('API key not configured')) {
      return NextResponse.json({
        reply: '⚙️ Ask Valsamaki is not yet configured. Add `DEEPSEEK_API_KEY` to your environment variables.',
        provider: 'none',
      })
    }

    return NextResponse.json({ reply: `⚠️ Error: ${msg || 'Unknown error'}`, error: msg })
  }
}
