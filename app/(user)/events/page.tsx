import { RoleGate } from '@/components/shared/RoleGate'
import { EventFeed } from '@/components/events/EventFeed'
import { getTranslations } from 'next-intl/server'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import Link from 'next/link'
import { MapPin, Star, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Experiences' }

const FEATURED = [
  ...EXPERIENCES.filter((e) => e.isFeatured),
  ...SCRAPED_EXPERIENCES.filter((e) => e.isFeatured),
].slice(0, 6)

export default async function EventsPage() {
  const t = await getTranslations('events')

  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">{t('nearYou')}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Featured experiences from data */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">✨ Featured Experiences</h2>
          <Link href="/explore" className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1">
            See all <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FEATURED.map((exp) => (
            <Link
              key={exp.id}
              href={`/explore?q=${encodeURIComponent(exp.title)}`}
              className="group block rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="relative aspect-[4/3] bg-[var(--color-muted)]">
                {exp.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={exp.images[0]}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-[0.65rem] font-bold line-clamp-2 leading-tight">{exp.title}</p>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                <div className="flex items-center gap-1 text-[0.6rem] text-[var(--color-muted-foreground)]">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{exp.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-amber-400 stroke-amber-400" />
                    <span className="text-[0.6rem] font-bold text-amber-600">{exp.rating}</span>
                  </div>
                  {exp.price && (
                    <span className="text-[0.6rem] text-[var(--color-muted-foreground)] truncate">{exp.price}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live DB events */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">🎉 Upcoming Events</h2>
        <RoleGate allow={['user', 'producer', 'admin']}>
          <EventFeed />
        </RoleGate>
      </section>
    </div>
  )
}
