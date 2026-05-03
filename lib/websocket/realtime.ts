'use client'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

type AppFeedCallback = (payload: Record<string, unknown>) => void
type UserFeedCallback = (payload: Record<string, unknown>) => void

let appChannel: RealtimeChannel | null = null
let userChannel: RealtimeChannel | null = null

export function subscribeToAppFeed(onEvent: AppFeedCallback): () => void {
  const supabase = createClient()

  appChannel = supabase
    .channel('public:events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
      onEvent(payload as Record<string, unknown>)
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, (payload) => {
      onEvent(payload as Record<string, unknown>)
    })
    .subscribe((status) => {
      logger.debug('App feed channel status', { status })
    })

  return () => {
    if (appChannel) {
      supabase.removeChannel(appChannel)
      appChannel = null
    }
  }
}

export function subscribeToUserFeed(userId: string, onEvent: UserFeedCallback): () => void {
  const supabase = createClient()

  userChannel = supabase
    .channel(`user:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'recommendations',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      onEvent(payload as Record<string, unknown>)
    })
    .subscribe((status) => {
      logger.debug('User feed channel status', { status, userId })
    })

  return () => {
    if (userChannel) {
      supabase.removeChannel(userChannel)
      userChannel = null
    }
  }
}

export function setupWebRTCLocationChannel(
  _onPing: (lat: number, lng: number) => void
): (() => void) | null {
  // WebRTC DataChannel for rapid location pings during active map navigation
  // Falls back gracefully if WebRTC unavailable
  if (typeof window === 'undefined' || !window.RTCPeerConnection) return null

  logger.debug('WebRTC DataChannel not yet paired with a remote peer — location pings use polling fallback')
  return null
}
