import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/ai/recommendation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lat, lng } = await request.json() as { lat: number; lng: number }
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
    }

    await supabase
      .from('profiles')
      .update({ location_lat: lat, location_lng: lng, last_seen_at: new Date().toISOString() })
      .eq('id', user.id)

    generateRecommendations(user.id, { lat, lng }).catch(() => null)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
