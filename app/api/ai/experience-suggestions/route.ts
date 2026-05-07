import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, validateString } from '@/lib/security'
import { getPrimaryProvider } from '@/lib/ai/providers'

export const maxDuration = 10

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = rateLimit(`exp-suggest:${ip}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ suggestions: [] }, { status: 429 })

  const body = await request.json().catch(() => ({}))
  const query = validateString(body?.query, { maxLength: 100 })
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  try {
    const provider = getPrimaryProvider()
    const prompt = `You suggest Crete experience search terms. Given the partial query "${query}", return exactly 4 short suggestions (2-5 words each) that a tourist might type to find experiences, places, foods, or activities in Crete. Output ONLY a JSON array of strings, no other text. Example: ["olive oil tasting","gorge hiking","village cooking class","sea cave kayaking"]`
    const text = await provider.complete(prompt, {})
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    const clean = jsonStart !== -1 ? text.slice(jsonStart, jsonEnd + 1) : '[]'
    const suggestions = JSON.parse(clean) as string[]
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [] })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
