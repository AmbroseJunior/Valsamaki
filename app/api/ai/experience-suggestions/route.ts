import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, validateString } from '@/lib/security'

export const maxDuration = 10

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = rateLimit(`exp-suggest:${ip}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ suggestions: [] }, { status: 429 })

  const body = await request.json().catch(() => ({}))
  const query = validateString(body?.query, { maxLength: 100 })
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ suggestions: [] })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: `You suggest search terms for a Crete experience discovery app.
Given a partial query, return exactly 4 short search suggestions (2-5 words each)
that a tourist might type to find experiences, places, foods, or activities in Crete.
Output ONLY a JSON array of strings, no other text. Example: ["olive oil tasting","gorge hiking","village cooking class","sea cave kayaking"]`,
      messages: [{ role: 'user', content: query }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '[]'
    const suggestions = JSON.parse(text) as string[]
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [] })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
