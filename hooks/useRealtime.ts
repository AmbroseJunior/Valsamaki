'use client'

import { useEffect, useRef } from 'react'
import { subscribeToAppFeed, subscribeToUserFeed } from '@/lib/websocket/realtime'

export function useAppFeed(onEvent: (payload: Record<string, unknown>) => void) {
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent

  useEffect(() => {
    const unsub = subscribeToAppFeed((p) => cbRef.current(p))
    return unsub
  }, [])
}

export function useUserFeed(
  userId: string | null,
  onEvent: (payload: Record<string, unknown>) => void
) {
  const cbRef = useRef(onEvent)
  cbRef.current = onEvent

  useEffect(() => {
    if (!userId) return
    const unsub = subscribeToUserFeed(userId, (p) => cbRef.current(p))
    return unsub
  }, [userId])
}
