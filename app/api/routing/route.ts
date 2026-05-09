import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const profile = searchParams.get('profile') ?? 'foot'
  const coords = searchParams.get('coords')

  if (!coords || !/^[-\d.,;]+$/.test(coords)) {
    return NextResponse.json({ error: 'Invalid coords' }, { status: 400 })
  }
  // transit uses the road network (car profile) — duration adjusted client-side
  const osrmProfile = profile === 'transit' ? 'car' : profile
  if (!['foot', 'car', 'transit'].includes(profile)) {
    return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
  }

  const osrmUrl =
    `https://router.project-osrm.org/route/v1/${osrmProfile}/${coords}` +
    `?overview=full&geometries=geojson`

  try {
    const res = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'ValsamakiApp/1.0 (crete-travel-guide)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'OSRM error', status: res.status }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  } catch {
    return NextResponse.json({ error: 'Routing service unavailable' }, { status: 502 })
  }
}
