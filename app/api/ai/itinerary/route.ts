import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/security'
import { getAvailableProviders } from '@/lib/ai/providers'

export const maxDuration = 60

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

const FALLBACK_ITINERARY = {
  title: "Cretan Wellness Escape",
  tagline: "Breathe in ancient olive groves, taste the sea, and heal your soul in the cradle of Mediterranean life.",
  days: [
    {
      day: 1,
      theme: "Arrival & Olive Oil Discovery",
      morning: { activity: "Olive oil tasting at traditional farm", location: "Rethymno", duration: "2h", tip: "Arrive early — the first cold press of the day is freshest.", emoji: "🫒" },
      afternoon: { activity: "Cretan cooking class with local family", location: "Heraklion", duration: "3h", tip: "Ask your host to teach you the horta (wild greens) technique.", emoji: "🍽️" },
      evening: { activity: "Cretan gastronomy taverna tour", location: "Heraklion old town", duration: "2h", tip: "Try the aged graviera cheese with thyme honey.", emoji: "🌿" }
    },
    {
      day: 2,
      theme: "Nature, Wellness & Ancient History",
      morning: { activity: "Sunrise yoga retreat", location: "Agios Nikolaos", duration: "2h", tip: "Bring a light layer — sea breeze is cool at sunrise.", emoji: "🧘" },
      afternoon: { activity: "Minoan Palace of Knossos", location: "Heraklion", duration: "3h", tip: "Hire a local guide — the myths come alive with storytelling.", emoji: "🏛️" },
      evening: { activity: "Village herb walk with local guide", location: "Zaros", duration: "2h", tip: "Pick fresh oregano and dittany — both are native to Crete.", emoji: "💆" }
    },
    {
      day: 3,
      theme: "Sea & Markets",
      morning: { activity: "Traditional Cretan market", location: "Heraklion", duration: "2h", tip: "Saturday morning is the best time — full stalls of local produce.", emoji: "🛒" },
      afternoon: { activity: "Sea kayaking Balos Lagoon", location: "Chania", duration: "4h", tip: "The lagoon water is turquoise and shallow — perfect for beginners.", emoji: "🚣" },
      evening: { activity: "Thyme honey farm visit", location: "Lasithi Plateau", duration: "2h", tip: "Buy raw thyme honey directly from the beekeeper for the purest quality.", emoji: "🍯" }
    }
  ],
  packingTips: [
    "Bring a refillable water bottle — Cretan tap water is clean and mountain-sourced in most areas",
    "Pack light linen clothes; Crete is warm even in spring and autumn",
    "Comfortable walking sandals are essential for cobblestone old towns and nature trails"
  ],
  localPhrase: { greek: "Καλή όρεξη", pronunciation: "Kali orexi", meaning: "Good appetite — said before every meal" }
}

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

CRITICAL: Return ONLY raw valid JSON — NO markdown, NO code fences, NO explanation text before or after.
The JSON must match this exact shape:
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

  const providers = getAvailableProviders()
  const ctx = { maxTokens: 3000 }

  for (const provider of providers) {
    try {
      const text = await provider.complete(prompt, ctx)
      let itinerary: unknown = null

      for (const cleaned of [extractJSON(text), aggressiveRepair(text)]) {
        try { itinerary = JSON.parse(cleaned); break } catch { /* try next */ }
      }

      if (itinerary) return NextResponse.json({ itinerary })
    } catch { /* try next provider */ }
  }

  // All providers failed or returned un-parseable JSON — return curated fallback
  return NextResponse.json({ itinerary: FALLBACK_ITINERARY })
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
  text = text.replace(/"([^"]*)"/g, (_, inner) =>
    `"${inner.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, ' ')}"`)
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  text = text.replace(/\.\.\.[\s,]*/g, '')
  text = text.replace(/…[\s,]*/g, '')
  text = text.replace(/,\s*([}\]])/g, '$1')
  return text.trim()
}
