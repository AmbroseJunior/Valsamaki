'use client'

import { useState, useEffect, useCallback } from 'react'
import { startLocationTracking, getLastKnownLocation } from '@/lib/location/tracker'
import type { NearbyEntity } from '@/types/app'

interface LocationState {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

interface UseLocationResult {
  coords: LocationState | null
  isTracking: boolean
  lastUpdated: Date | null
  nearbyEntities: NearbyEntity[]
  error: string | null
}

export function useLocation(userId: string | null): UseLocationResult {
  const [coords, setCoords] = useState<LocationState | null>(() => getLastKnownLocation())
  const [isTracking, setIsTracking] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nearbyEntities] = useState<NearbyEntity[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleUpdate = useCallback((state: LocationState) => {
    setCoords(state)
    setLastUpdated(new Date())
    setError(null)
  }, [])

  useEffect(() => {
    if (!userId) return

    setIsTracking(true)
    const stop = startLocationTracking(userId, handleUpdate)

    return () => {
      stop()
      setIsTracking(false)
    }
  }, [userId, handleUpdate])

  return { coords, isTracking, lastUpdated, nearbyEntities, error }
}
