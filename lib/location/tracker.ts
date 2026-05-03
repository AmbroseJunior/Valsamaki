'use client'

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const LOCATION_KEY = 'valsamaki_last_location'
const UPDATE_INTERVAL_MS = 5 * 60 * 1000
const DRIFT_THRESHOLD_M = 500

interface LocationState {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

let watchId: number | null = null
let lastPushed: LocationState | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null

export function getLastKnownLocation(): LocationState | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    return raw ? (JSON.parse(raw) as LocationState) : null
  } catch {
    return null
  }
}

function saveLocation(state: LocationState) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(state))
  } catch {
    // Storage quota exceeded — ignore
  }
}

function distanceMetres(a: LocationState, b: LocationState): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

export function startLocationTracking(
  userId: string,
  onUpdate: (state: LocationState) => void
): () => void {
  const supabase = createClient()

  async function pushToSupabase(state: LocationState) {
    try {
      await supabase.from('profiles')
        .update({ location_lat: state.lat, location_lng: state.lng, last_seen_at: new Date().toISOString() })
        .eq('id', userId)
      lastPushed = state
    } catch (err) {
      logger.warn('Failed to push location to Supabase', err)
    }
  }

  function handlePosition(pos: GeolocationPosition) {
    const state: LocationState = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    }

    saveLocation(state)
    onUpdate(state)

    const shouldPushNow =
      !lastPushed || distanceMetres(lastPushed, state) > DRIFT_THRESHOLD_M

    if (shouldPushNow) {
      if (pushTimer) clearTimeout(pushTimer)
      pushToSupabase(state)
    } else {
      if (!pushTimer) {
        pushTimer = setTimeout(() => {
          pushToSupabase(state)
          pushTimer = null
        }, UPDATE_INTERVAL_MS)
      }
    }
  }

  function handleError(err: GeolocationPositionError) {
    logger.warn('Geolocation error, falling back to IP', { code: err.code })
    fetchIPLocation().then((state) => {
      if (state) {
        saveLocation(state)
        onUpdate(state)
      }
    })
  }

  if (typeof window !== 'undefined' && navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 30_000,
      timeout: 10_000,
    })
  } else {
    fetchIPLocation().then((state) => {
      if (state) { saveLocation(state); onUpdate(state) }
    })
  }

  return () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    if (pushTimer) {
      clearTimeout(pushTimer)
      pushTimer = null
    }
  }
}

async function fetchIPLocation(): Promise<LocationState | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    return {
      lat: data.latitude,
      lng: data.longitude,
      accuracy: 10_000,
      timestamp: Date.now(),
    }
  } catch {
    return null
  }
}
