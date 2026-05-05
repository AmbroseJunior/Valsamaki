import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mcpBridge } from '@/lib/ai/mcp-bridge'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, validateString } from '@/lib/security'

// OWASP A07 — 10 voice-setup calls per user per minute
const RATE_LIMIT = { limit: 10, windowMs: 60_000 }
// OWASP A03 — cap transcript length (roughly 10 minutes of speech)
const MAX_TRANSCRIPT_LEN = 5000

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = rateLimit(`voice-setup:${user.id}`, RATE_LIMIT.limit, RATE_LIMIT.windowMs)
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const body = await request.json()

    // OWASP A03 — validate transcript length
    const transcript = validateString(body?.transcript, { maxLength: MAX_TRANSCRIPT_LEN, minLength: 1 })
    if (!transcript) {
      return NextResponse.json({ error: 'transcript must be 1–5000 characters' }, { status: 400 })
    }

    const result = await mcpBridge({
      task: 'voice_setup',
      userId: user.id,
      input: `Extract a structured business listing from this description: "${transcript}"

Return valid JSON with fields: name (string), description (string), category (string), tags (array of strings).
Categories: olive_farm, herb_farm, winery, dairy, apiary, vegetable_farm, restaurant, market, other.
Only return the JSON object, no other text.`,
    })

    let listing: Record<string, unknown> = {}
    try {
      const match = result.output.match(/\{[\s\S]*\}/)
      if (match) listing = JSON.parse(match[0])
    } catch {
      // Return empty — user edits manually
    }

    return NextResponse.json({ listing })
  } catch {
    return NextResponse.json({ error: 'Processing failed', listing: {} }, { status: 500 })
  }
}
