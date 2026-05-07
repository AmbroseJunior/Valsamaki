import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/security'
import { getPrimaryProvider } from '@/lib/ai/providers'

export const maxDuration = 30

const CRETE_CONTEXT = `
Real experiences available:
- Gorge of Samaria hike (Chania) — full-day 16 km trek
- Minoan Palace of Knossos (Heraklion) — 2-3 hrs archaeological site
- Olive oil tasting at traditional farm (Rethymno) — 2 hrs
- Cretan cooking class with local family (Heraklion) — 3 hrs
- Sea kayaking Balos Lagoon (Chania) — half-day
- Thyme honey farm visit (Lasithi Plateau) — 2 hrs
- Wine tasting at Lyrarakis Winery (Peza) — 2 hrs
- Elafonisi beach sunset walk (Chania) — 2 hrs
- Traditional Cretan market (various towns) — Sat/Sun mornings
- Village herb walk with local guide (Zaros) — 3 hrs
- Spinalonga island boat tour (Elounda) — half-day
- Cave of Zeus Dikteon Antron (Lasithi) — 1-2 hrs
- Seitan Limania cliff cove (Akrotiri) — 2 hrs
- Cretan gastronomy taverna tour (Heraklion old town) — evening
- Sunrise yoga retreat (Agios Nikolaos) — morning
`

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = rateLimit(`itinerary:${ip}`, 10, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await request.json().catch(() => ({}))
  const days = Math.min(Math.max(parseInt(body?.days) || 3, 1), 7)
  const interests: string[] = Array.isArray(body?.interests) ? body.interests.slice(0, 6) : []
  const diet: string = body?.diet ?? 'none'
  const style: string = body?.style ?? 'balanced'

  const prompt = `Create a ${days}-day Crete itinerary for a traveler with these preferences:
Interests: ${interests.length ? interests.join(', ') : 'general sightseeing'}
Dietary preference: ${diet}
Travel style: ${style}

${CRETE_CONTEXT}

Return ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "title": "short catchy trip title",
  "tagline": "one evocative sentence",
  "days": [
    {
      "day": 1,
      "theme": "theme name",
      "morning": { "activity": "name", "location": "place", "duration": "Xh", "tip": "short insider tip", "emoji": "one emoji" },
      "afternoon": { "activity": "name", "location": "place", "duration": "Xh", "tip": "short insider tip", "emoji": "one emoji" },
      "evening": { "activity": "name", "location": "place", "duration": "Xh", "tip": "short insider tip", "emoji": "one emoji" }
    }
  ],
  "packingTips": ["tip1", "tip2", "tip3"],
  "localPhrase": { "greek": "Greek phrase", "pronunciation": "phonetic", "meaning": "English meaning" }
}`

  try {
    const provider = getPrimaryProvider()
    const text = await provider.complete(prompt, {})
    let itinerary: unknown = null
    let lastErr: unknown = null

    // Two-pass parse: first pass clean, second pass aggressive repair
    for (const cleaned of [extractJSON(text), aggressiveRepair(text)]) {
      try { itinerary = JSON.parse(cleaned); break } catch (e) { lastErr = e }
    }

    if (!itinerary) throw lastErr
    return NextResponse.json({ itinerary })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to generate itinerary'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function extractJSON(raw: string): string {
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1)
  text = text.replace(/,\s*([}\]])/g, '$1')
  text = text.replace(/\/\/[^\n]*/g, '')
  return text.trim()
}

function aggressiveRepair(raw: string): string {
  let text = extractJSON(raw)
  // Replace literal (unescaped) newlines inside quoted strings
  text = text.replace(/"([^"]*)"/g, (_, inner) =>
    `"${inner.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, ' ')}"`)
  // Remove any remaining control characters
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  // Fix common AI mistake: ... or … inside arrays
  text = text.replace(/\.\.\.[\s,]*/g, '')
  text = text.replace(/…[\s,]*/g, '')
  // Fix trailing commas again after other replacements
  text = text.replace(/,\s*([}\]])/g, '$1')
  return text.trim()
}
