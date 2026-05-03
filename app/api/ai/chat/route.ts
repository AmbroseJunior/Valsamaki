import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mcpBridge } from '@/lib/ai/mcp-bridge'
import { createClient } from '@/lib/supabase/server'

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
  } catch {
    return NextResponse.json(
      { error: 'Internal server error', reply: 'I am temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
