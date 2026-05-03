'use client'

import { useState, useEffect } from 'react'
import { syncOfflineQueue } from '@/lib/offline/sync'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    function handleOffline() { setIsOffline(true) }
    function handleOnline() {
      setIsOffline(false)
      syncOfflineQueue().catch(() => null)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return { isOffline }
}
