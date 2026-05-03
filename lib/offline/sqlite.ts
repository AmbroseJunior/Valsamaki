'use client'

import type { SqlJsStatic, Database as SQLiteDB } from 'sql.js'
import { logger } from '@/lib/logger'

let SQL: SqlJsStatic | null = null
let db: SQLiteDB | null = null

const DB_KEY = 'valsamaki_offline_db'

export async function getOfflineDB(): Promise<SQLiteDB> {
  if (db) return db

  if (!SQL) {
    const initSqlJs = (await import('sql.js')).default
    SQL = await initSqlJs({ locateFile: (file: string) => `/sql-js/${file}` })
  }

  const saved = localStorage.getItem(DB_KEY)
  if (saved) {
    const buffer = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0))
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
    initSchema(db)
  }

  return db
}

function initSchema(database: SQLiteDB) {
  database.run(`
    CREATE TABLE IF NOT EXISTS offline_businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      lat REAL,
      lng REAL,
      category TEXT,
      tags TEXT,
      images TEXT,
      cached_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT,
      lat REAL,
      lng REAL,
      category TEXT,
      cached_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_offline_businesses_lat_lng
      ON offline_businesses(lat, lng);
    CREATE INDEX IF NOT EXISTS idx_offline_queue_synced
      ON offline_queue(synced);
  `)
}

export function persistDB(database: SQLiteDB) {
  try {
    const data = database.export()
    const base64 = btoa(Array.from(data).map(b => String.fromCharCode(b)).join(''))
    localStorage.setItem(DB_KEY, base64)
  } catch (err) {
    logger.warn('Failed to persist offline DB', err)
  }
}
