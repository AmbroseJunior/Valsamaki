'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import { SCRAPED_PLACES } from '@/lib/data/scrapedPlaces'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { EventCard } from '@/components/events/EventCard'
import { EventFeed } from '@/components/events/EventFeed'
import { Search, X, Sparkles, MapPin, Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Experience } from '@/types/experience'
import type { CretePlace } from '@/lib/data/scrapedPlaces'
import type { EventRow } from '@/types/database'

const ALL_EXPERIENCES: Experience[] = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]

function matchesQuery(text: string | undefined | null, q: string): boolean {
  if (!text) return false
  return text.toLowerCase().includes(q)
}

export function UnifiedExperienceSearch() {
  const [query, setQuery] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const q = query.trim().toLowerCase()
  const isSearching = q.length >= 2

  // AI suggestions (debounced 400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!isSearching) { setAiSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/experience-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        })
        const { suggestions } = await res.json()
        if (Array.isArray(suggestions) && suggestions.length) {
          setAiSuggestions(suggestions)
          setShowSuggestions(true)
        }
      } catch { /* silent */ }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q, isSearching])

  // Static experience filter (in-memory — instant)
  const expResults = useMemo(() => {
    if (!isSearching) return []
    return ALL_EXPERIENCES.filter((e) =>
      matchesQuery(e.title, q) ||
      matchesQuery(e.location, q) ||
      matchesQuery(e.shortDescription, q) ||
      matchesQuery(e.description, q) ||
      matchesQuery(e.category, q) ||
      (e.tags ?? []).some((t) => matchesQuery(t, q)) ||
      (e.healthBenefits ?? []).some((h) => matchesQuery(h, q))
    ).slice(0, 12)
  }, [q, isSearching])

  // Static places filter (in-memory — instant)
  const placeResults = useMemo(() => {
    if (!isSearching) return []
    return SCRAPED_PLACES.filter((p) =>
      matchesQuery(p.title, q) ||
      matchesQuery(p.region, q) ||
      matchesQuery(p.description, q) ||
      matchesQuery(p.subtitle, q) ||
      matchesQuery(p.category, q) ||
      (p.tags ?? []).some((t) => matchesQuery(t, q))
    ).slice(0, 6)
  }, [q, isSearching])

  // DB events search
  const { data: eventResults = [], isFetching: eventsLoading } = useQuery({
    queryKey: ['events-unified-search', q],
    queryFn: async (): Promise<EventRow[]> => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%,category.ilike.%${q}%`)
        .order('event_date', { ascending: true })
        .limit(10)
      return (data ?? []) as EventRow[]
    },
    enabled: isSearching,
  })

  // DB businesses search
  const { data: bizResults = [] } = useQuery({
    queryKey: ['biz-unified-search', q],
    queryFn: async () => {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, category, address, description, tags')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,address.ilike.%${q}%`)
        .limit(6)
      return data ?? []
    },
    enabled: isSearching,
  })

  const totalCount = expResults.length + placeResults.length + eventResults.length + bizResults.length

  return (
    <div className="space-y-5">
      {/* ── Unified search bar ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted-foreground)]" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => aiSuggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search anything — olive oil, hiking, honey, wellness, Knossos…"
          className="w-full pl-11 pr-10 py-3.5 rounded-[var(--radius-full)] border-2 border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:border-[var(--highlight)] focus:ring-2 focus:ring-[var(--highlight)]/20 transition-all placeholder:text-[var(--color-muted-foreground)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setAiSuggestions([]) }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-muted)] transition-colors"
          >
            <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
        )}

        {/* AI suggestions dropdown */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] z-30 overflow-hidden">
            <p className="px-3 pt-2.5 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[var(--highlight)]" /> AI Suggestions
            </p>
            {aiSuggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => { setQuery(s); setShowSuggestions(false) }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors border-t border-[var(--color-border)] first:border-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Search results ── */}
      {isSearching ? (
        <div className="space-y-7">
          {/* Result count bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {eventsLoading
                ? 'Searching…'
                : totalCount > 0
                  ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${query}"`
                  : `No results for "${query}"`}
            </p>
            {totalCount === 0 && !eventsLoading && (
              <button
                onClick={() => setQuery('')}
                className="text-xs font-semibold text-[var(--highlight)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {totalCount === 0 && !eventsLoading && (
            <div className="text-center py-10 space-y-2">
              <p className="text-3xl">🔍</p>
              <p className="text-[var(--color-muted-foreground)] text-sm">
                Try searching for <em>olive oil</em>, <em>wellness</em>, <em>Knossos</em>, or <em>honey</em>
              </p>
            </div>
          )}

          {/* ✨ Experiences & Activities */}
          {expResults.length > 0 && (
            <section>
              <SectionHeader emoji="✨" label="Experiences & Activities" count={expResults.length} href="/explore" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {expResults.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
                ))}
              </div>
            </section>
          )}

          {/* 🏛️ Sights & Places */}
          {placeResults.length > 0 && (
            <section>
              <SectionHeader emoji="🏛️" label="Sights & Places" count={placeResults.length} href="/map?tab=sights" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {placeResults.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </section>
          )}

          {/* 🎉 Events */}
          {eventResults.length > 0 && (
            <section>
              <SectionHeader emoji="🎉" label="Events" count={eventResults.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventResults.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </section>
          )}

          {/* 🏪 Local Producers */}
          {bizResults.length > 0 && (
            <section>
              <SectionHeader emoji="🏪" label="Local Producers & Businesses" count={bizResults.length} href="/map" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(bizResults as Array<{ id: string; name: string; category: string | null; address: string | null; description: string | null }>).map((biz) => (
                  <BizCard key={biz.id} biz={biz} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ── Default view: live events feed ── */
        <EventFeed hideSearch />
      )}

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </div>
  )
}

// ── Small reusable sub-components ────────────────────────────────────────────

function SectionHeader({ emoji, label, count, href }: { emoji: string; label: string; count: number; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display font-semibold text-base flex items-center gap-2">
        {emoji} {label}
        <span className="text-[0.6rem] font-bold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] px-1.5 py-0.5 rounded-full border border-[var(--color-border)]">
          {count}
        </span>
      </h3>
      {href && (
        <Link href={href} className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1">
          See all <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

function PlaceCard({ place }: { place: CretePlace }) {
  return (
    <Link
      href={`/map?q=${encodeURIComponent(place.title)}`}
      className="group block rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-all bg-[var(--color-card)]"
    >
      {place.image && (
        <div className="relative aspect-video overflow-hidden bg-[var(--color-muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.image} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-2 text-[0.6rem] font-bold uppercase tracking-wide bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
            {place.region}
          </span>
        </div>
      )}
      <div className="p-2.5 space-y-0.5">
        <p className="font-semibold text-sm line-clamp-1">{place.title}</p>
        <p className="text-[0.65rem] text-[var(--color-muted-foreground)] line-clamp-1">{place.subtitle}</p>
        <div className="flex items-center gap-1 text-[0.6rem] text-[var(--color-muted-foreground)]">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="capitalize">{place.category}</span>
          {place.price && <span>· {place.price}</span>}
        </div>
      </div>
    </Link>
  )
}

function BizCard({ biz }: { biz: { id: string; name: string; category: string | null; address: string | null; description: string | null } }) {
  return (
    <Link
      href={`/map?q=${encodeURIComponent(biz.name)}`}
      className="flex items-start gap-3 p-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] hover:shadow-[var(--shadow-sm)] transition-all bg-[var(--color-card)]"
    >
      <div className="shrink-0 w-10 h-10 rounded-[var(--radius)] bg-[var(--highlight)]/15 flex items-center justify-center text-xl">
        {biz.category?.includes('farm') ? '🫒' : biz.category?.includes('honey') || biz.category?.includes('apiary') ? '🍯' : biz.category?.includes('dairy') ? '🧀' : '🏪'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{biz.name}</p>
        {biz.category && (
          <p className="text-[0.65rem] font-medium text-[var(--highlight)] capitalize">{biz.category.replace(/_/g, ' ')}</p>
        )}
        {biz.address && (
          <p className="text-[0.65rem] text-[var(--color-muted-foreground)] flex items-center gap-0.5 mt-0.5 truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0" />{biz.address}
          </p>
        )}
      </div>
    </Link>
  )
}
