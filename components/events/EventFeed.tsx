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
import { Search, X } from 'lucide-react'
import type { EventRow } from '@/types/database'
import { useTranslations } from 'next-intl'

export function EventFeed({ hideSearch }: { hideSearch?: boolean } = {}) {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const { userId, role } = useRole()
  const { isOffline } = useOffline()
  const supabase = createClient()
  const t = useTranslations('events')

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', category, search],
    queryFn: async (): Promise<EventRow[]> => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(20)

      if (category) query = query.eq('category', category)
      if (search.trim()) {
        const s = search.trim()
        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,address.ilike.%${s}%`)
      }

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
      {!hideSearch && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-9 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </button>
            )}
          </div>
          <EventFilter onFilterChange={setCategory} selected={category} />
        </>
      )}

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
            {search
              ? t('noEventsFound', { search })
              : t('noEventsSoon')}
          </p>
        )}
      </div>
    </div>
  )
}
