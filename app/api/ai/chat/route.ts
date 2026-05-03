import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mcpBridge } from '@/lib/ai/mcp-bridge'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { message, userId } = body as { message: string; userId: string }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('location_lat, location_lng')
      .eq('id', user.id)
      .single()

    const location = profile?.location_lat && profile?.location_lng
      ? { lat: profile.location_lat, lng: profile.location_lng }
      : null

    const result = await mcpBridge({
      task: 'chat',
      userId: user.id,
      input: message,
      context: { userLocation: location ?? undefined },
    })

    return NextResponse.json({ reply: result.output, provider: result.provider })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''

    // No AI provider configured — return 200 with a helpful setup message
    if (msg.includes('No AI providers configured') || msg.includes('API key not configured')) {
      return NextResponse.json({
        reply: '⚙️ Ask Valsamaki is not yet configured. To activate it, add `ANTHROPIC_API_KEY` (or `DEEPSEEK_API_KEY`) to your Vercel environment variables and redeploy.',
        provider: 'none',
      })
    }

    return NextResponse.json(
      { reply: 'I am temporarily unavailable. Please try again in a moment.', error: msg },
      { status: 500 }
    )
  }
}
