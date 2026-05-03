'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { EventCard } from './EventCard'
import { EventFilter } from './EventFilter'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { enqueueOfflineAction } from '@/lib/offline/queue'
import { useOffline } from '@/hooks/useOffline'
import { useRole } from '@/hooks/useRole'
import type { EventRow } from '@/types/database'

export function EventFeed() {
  const [category, setCategory] = useState('')
  const { userId, role } = useRole()
  const { isOffline } = useOffline()
  const supabase = createClient()

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', category],
    queryFn: async (): Promise<EventRow[]> => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(20)

      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as EventRow[]
    },
  })

  async function handleRsvp(eventId: string) {
    if (!userId) return

    if (isOffline) {
      await enqueueOfflineAction('rsvp_event', {
        user_id: userId,
        entity_type: 'event',
        entity_id: eventId,
        created_at: new Date().toISOString(),
      })
      return
    }

    await supabase.from('user_interactions').insert({
      user_id: userId,
      entity_type: 'event',
      entity_id: eventId,
      action: 'rsvp',
      session_location: null,
    })
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <EventFilter onFilterChange={setCategory} selected={category} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onRsvp={role !== 'guest' ? handleRsvp : undefined}
          />
        ))}
        {events?.length === 0 && (
          <p className="col-span-full text-center text-[var(--color-muted-foreground)] py-12">
            No events found. Check back soon!
          </p>
        )}
      </div>
    </div>
  )
}
