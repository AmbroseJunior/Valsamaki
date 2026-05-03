'use client'

import { getOfflineDB, persistDB } from './sqlite'
import { logger } from '@/lib/logger'

interface QueueEntry {
  id: string
  action: string
  payload: Record<string, unknown>
  created_at: string
  synced: boolean
}

export async function enqueueOfflineAction(
  action: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const db = await getOfflineDB()
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    const now = new Date().toISOString()

    db.run('INSERT INTO offline_queue (id, action, payload, created_at, synced) VALUES (?,?,?,?,0)', [
      id,
      action,
      JSON.stringify(payload),
      now,
    ])

    persistDB(db)
    logger.debug('Enqueued offline action', { action, id })
  } catch (err) {
    logger.error('Failed to enqueue offline action', err)
  }
}

export async function getPendingActions(): Promise<QueueEntry[]> {
  try {
    const db = await getOfflineDB()
    const result = db.exec('SELECT * FROM offline_queue WHERE synced = 0 ORDER BY created_at ASC')

    if (!result.length || !result[0].values.length) return []

    return result[0].values.map(([id, action, payload, created_at, synced]) => ({
      id: id as string,
      action: action as string,
      payload: JSON.parse(payload as string),
      created_at: created_at as string,
      synced: Boolean(synced),
    }))
  } catch (err) {
    logger.error('Failed to get pending actions', err)
    return []
  }
}

export async function markActionSynced(id: string): Promise<void> {
  try {
    const db = await getOfflineDB()
    db.run('UPDATE offline_queue SET synced = 1 WHERE id = ?', [id])
    persistDB(db)
  } catch (err) {
    logger.warn('Failed to mark action synced', err)
  }
}
