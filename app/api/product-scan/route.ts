import { NextResponse } from 'next/server'
import { getPrimaryProvider } from '@/lib/ai/providers'
import { buildDataFileContext } from '@/lib/ai/data-context'
import { validateString } from '@/lib/security'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import { SCRAPED_PLACES } from '@/lib/data/scrapedPlaces'

export const maxDuration = 20

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const text = validateString(body?.text, { maxLength: 2000 })
  if (!text || text.length < 2) return NextResponse.json({ error: 'No text' }, { status: 400 })

  // Detect if it's a URL
  let sourceUrl: string | null = null
  let urlHost = ''
  try {
    const u = new URL(text)
    sourceUrl = text
    urlHost = u.hostname
  } catch { /* not a URL */ }

  // Try matching against local static data
  const q = text.toLowerCase().slice(0, 40)
  const allExp = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]
  const matchedExp = allExp.find(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      (sourceUrl && e.source?.url && sourceUrl.startsWith(e.source.url)) ||
      (sourceUrl && e.externalBookingUrl && sourceUrl.startsWith(e.externalBookingUrl)),
  )
  const matchedPlace = SCRAPED_PLACES.find(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (sourceUrl && p.source?.url && sourceUrl.startsWith(p.source.url)),
  )

  const staticData = buildDataFileContext()
  const provider = getPrimaryProvider()

  const prompt = `A user scanned this QR code: "${text}"

${urlHost ? `It appears to be from the website: ${urlHost}` : ''}

Return a JSON object with this exact structure (no markdown, no code blocks):
{
  "name": "product or place name (be specific)",
  "category": "olive oil | honey | cheese | wine | herb | bread | seafood | archaeological site | experience | tour | other",
  "description": "2-3 sentences describing this product/place",
  "healthBenefits": ["specific benefit 1", "specific benefit 2", "specific benefit 3"],
  "producer": "producer/farm/operator name if identifiable, else null",
  "price": "price if known, else null",
  "origin": "region of Crete or country of origin if known",
  "aiInfo": "2-3 paragraphs: (1) what this product/place is and why it matters in Cretan culture, (2) its health properties and role in the Mediterranean diet, (3) how to use or experience it best.",
  "isLocalProduct": true or false,
  "sourceUrl": ${sourceUrl ? `"${sourceUrl}"` : 'null'}
}

Output ONLY the JSON object.`

  try {
    const raw = await provider.complete(prompt, {
      staticData,
      maxTokens: 700,
    })

    const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const start = stripped.indexOf('{')
    const end = stripped.lastIndexOf('}')
    const clean = start !== -1 ? stripped.slice(start, end + 1) : '{}'
    const parsed = JSON.parse(clean) as Record<string, unknown>

    // Merge local data if we found a direct match
    if (matchedExp) {
      parsed.healthBenefits = matchedExp.healthBenefits
      if (matchedExp.price) parsed.price = matchedExp.price
      parsed.isLocalProduct = true
    }
    if (matchedPlace) {
      parsed.origin = matchedPlace.region
      parsed.isLocalProduct = true
    }
    if (sourceUrl && !parsed.sourceUrl) parsed.sourceUrl = sourceUrl

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      name: sourceUrl ? urlHost || 'Product Link' : 'Unknown Product',
      description: 'We could not fully identify this product. Search for it in our Explore section for more information.',
      healthBenefits: [],
      aiInfo: 'This product could not be identified automatically. If it is a Cretan local product, look it up in the Explore or Map sections of Valsamaki.',
      isLocalProduct: false,
      sourceUrl,
    })
  }
}
