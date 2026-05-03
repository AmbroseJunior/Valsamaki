'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getOfflineDB, persistDB } from './sqlite'
import { getPendingActions, markActionSynced } from './queue'
import { logger } from '@/lib/logger'
import type { UserInteractionInsert, BusinessRow, EventRow } from '@/types/database'

// Use untyped client here — sync.ts deals with queue replay of runtime data
// that can't be statically typed at compile time. Explicit casts are used below.
function rawClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function syncOfflineQueue(): Promise<void> {
  const pending = await getPendingActions()
  if (pending.length === 0) return

  const supabase = rawClient()
  logger.info('Syncing offline queue', { count: pending.length })

  for (const entry of pending) {
    try {
      const { action, payload, id } = entry

      const row = payload as UserInteractionInsert

      if (action === 'rsvp_event') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('user_interactions') as any).insert({ ...row, action: 'rsvp' })
      } else if (action === 'save_favourite') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('user_interactions') as any).insert({ ...row, action: 'save' })
      } else if (action === 'log_interaction') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('user_interactions') as any).insert(row)
      }

      await markActionSynced(id)
    } catch (err) {
      logger.warn('Failed to sync offline action', { id: entry.id, err })
    }
  }
}

export async function cacheBusinessesOffline(
  userId: string,
  location: { lat: number; lng: number }
): Promise<void> {
  try {
    const supabase = rawClient()
    const latDelta = 0.5
    const lngDelta = 0.5

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawData } = await (supabase.from('businesses') as any)
      .select('id, name, description, lat, lng, category, tags, images')
      .eq('is_active', true)
      .gte('lat', location.lat - latDelta)
      .lte('lat', location.lat + latDelta)
      .gte('lng', location.lng - lngDelta)
      .lte('lng', location.lng + lngDelta)
      .limit(100)

    const data = (rawData ?? []) as BusinessRow[]
    if (!data.length) return

    const db = await getOfflineDB()
    const now = new Date().toISOString()

    db.run('DELETE FROM offline_businesses')
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO offline_businesses (id, name, description, lat, lng, category, tags, images, cached_at) VALUES (?,?,?,?,?,?,?,?,?)'
    )

    for (const biz of data) {
      stmt.run([
        biz.id,
        biz.name,
        biz.description ?? '',
        biz.lat,
        biz.lng,
        biz.category,
        JSON.stringify(biz.tags),
        JSON.stringify(biz.images),
        now,
      ])
    }

    stmt.free()
    persistDB(db)
    logger.info('Cached businesses offline', { count: data.length, userId })
  } catch (err) {
    logger.error('cacheBusinessesOffline failed', err)
  }
}

export async function cacheEventsOffline(): Promise<void> {
  try {
    const supabase = rawClient()
    const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawData } = await (supabase.from('events') as any)
      .select('id, title, description, event_date, lat, lng, category')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .lte('event_date', thirtyDaysOut)
      .limit(100)

    const data = (rawData ?? []) as EventRow[]
    if (!data.length) return

    const db = await getOfflineDB()
    const now = new Date().toISOString()

    db.run('DELETE FROM offline_events')
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO offline_events (id, title, description, event_date, lat, lng, category, cached_at) VALUES (?,?,?,?,?,?,?,?)'
    )

    for (const evt of data) {
      stmt.run([
        evt.id,
        evt.title,
        evt.description ?? '',
        evt.event_date,
        evt.lat,
        evt.lng,
        evt.category,
        now,
      ])
    }

    stmt.free()
    persistDB(db)
    logger.info('Cached events offline', { count: data.length })
  } catch (err) {
    logger.error('cacheEventsOffline failed', err)
  }
}
