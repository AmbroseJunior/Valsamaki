import { RoleGate } from '@/components/shared/RoleGate'
import { EventFeed } from '@/components/events/EventFeed'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Events Near You</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Discover festivals, markets, tastings, and more across Crete
        </p>
      </div>
      <RoleGate allow={['user', 'producer', 'admin']}>
        <EventFeed />
      </RoleGate>
    </div>
  )
}
