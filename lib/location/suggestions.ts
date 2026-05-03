import { createClient } from '@/lib/supabase/server'
import type { NearbyEntity } from '@/types/app'

export async function getNearbyEntities(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<NearbyEntity[]> {
  const supabase = await createClient()
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

  const [bizResult, evtResult] = await Promise.allSettled([
    supabase
      .from('businesses')
      .select('id, name, lat, lng, category')
      .eq('is_active', true)
      .gte('lat', lat - latDelta)
      .lte('lat', lat + latDelta)
      .gte('lng', lng - lngDelta)
      .lte('lng', lng + lngDelta)
      .limit(50),
    supabase
      .from('events')
      .select('id, title, lat, lng, category')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .gte('lat', lat - latDelta)
      .lte('lat', lat + latDelta)
      .gte('lng', lng - lngDelta)
      .lte('lng', lng + lngDelta)
      .limit(50),
  ])

  const entities: NearbyEntity[] = []

  if (bizResult.status === 'fulfilled' && bizResult.value.data) {
    for (const b of bizResult.value.data) {
      if (!b.lat || !b.lng) continue
      entities.push({
        id: b.id,
        type: 'business',
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        distance_km: haversineKm(lat, lng, b.lat, b.lng),
        category: b.category,
      })
    }
  }

  if (evtResult.status === 'fulfilled' && evtResult.value.data) {
    for (const e of evtResult.value.data) {
      if (!e.lat || !e.lng) continue
      entities.push({
        id: e.id,
        type: 'event',
        name: e.title,
        lat: e.lat,
        lng: e.lng,
        distance_km: haversineKm(lat, lng, e.lat, e.lng),
        category: e.category,
      })
    }
  }

  return entities.sort((a, b) => a.distance_km - b.distance_km)
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
