import { RoleGate } from '@/components/shared/RoleGate'
import { EventFeed } from '@/components/events/EventFeed'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Events' }

export default async function EventsPage() {
  const t = await getTranslations('events')

  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t('nearYou')}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          {t('subtitle')}
        </p>
      </div>
      <RoleGate allow={['user', 'producer', 'admin']}>
        <EventFeed />
      </RoleGate>
    </div>
  )
}
