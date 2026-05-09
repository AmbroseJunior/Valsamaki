import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, validateString } from '@/lib/security'
import { getPrimaryProvider } from '@/lib/ai/providers'
import { buildDataFileContext } from '@/lib/ai/data-context'

export const maxDuration = 10

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = rateLimit(`exp-suggest:${ip}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ suggestions: [] }, { status: 429 })

  const body = await request.json().catch(() => ({}))
  const query = validateString(body?.query, { maxLength: 100 })
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  try {
    const staticData = buildDataFileContext()
    const provider = getPrimaryProvider()
    const prompt = `The user is typing "${query}" into the Valsamaki Crete app search bar. Using the app directory in your context, suggest exactly 5 short, specific search completions (2-5 words each) that match real content — actual experience names, ingredients, locations, health benefits, or activities. Be specific to what's in the directory. Output ONLY a JSON array of strings with no extra text. Example: ["olive oil tasting","Samaria Gorge hike","herb foraging walk","Minoan palace tour","thyme honey tasting"]`
    const text = await provider.complete(prompt, { staticData, maxTokens: 150 })
    const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
    const jsonStart = stripped.indexOf('[')
    const jsonEnd = stripped.lastIndexOf(']')
    const clean = jsonStart !== -1 ? stripped.slice(jsonStart, jsonEnd + 1).replace(/,\s*]/g, ']') : '[]'
    const suggestions = JSON.parse(clean) as string[]
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 5) : [] })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
