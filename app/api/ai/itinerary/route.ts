import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/security'

export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

const CRETE_CONTEXT = `
Real experiences available in the app:
- Gorge of Samaria hike (Chania) — full-day trek, 16 km
- Minoan Palace of Knossos (Heraklion) — archaeological site, 2-3 hrs
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

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

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
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '{}'
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    const clean = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text
    const itinerary = JSON.parse(clean)
    return NextResponse.json({ itinerary })
  } catch {
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 })
  }
}
