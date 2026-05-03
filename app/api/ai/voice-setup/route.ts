import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mcpBridge } from '@/lib/ai/mcp-bridge'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { transcript } = await request.json() as { transcript: string }
    if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 })

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
