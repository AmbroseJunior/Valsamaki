'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import type { Experience, ExperienceCategory } from '@/types/experience'

const ALL_EXPERIENCES: Experience[] = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]
import { Sparkles, Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

type PriceFilter = 'all' | 'free' | 'under30' | 'under60'
type DistanceFilter = 'all' | '5' | '10' | '25'
type SortKey = 'default' | 'price_asc' | 'distance' | 'rating'

function parsePrice(p?: string): number | null {
  if (!p) return null
  if (p.toLowerCase().includes('free')) return 0
  const m = p.match(/€(\d+)/)
  return m ? parseInt(m[1]) : null
}

function filterAndSort(
  items: Experience[],
  category: ExperienceCategory,
  query: string,
  price: PriceFilter,
  distance: DistanceFilter,
  sort: SortKey,
): Experience[] {
  let list = category === 'all' ? items : items.filter((e) => e.category === category)

  if (query.trim()) {
    const term = query.toLowerCase().trim()
    list = list.filter((e) =>
      e.title.toLowerCase().includes(term) ||
      e.location.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      e.shortDescription.toLowerCase().includes(term) ||
      e.tags.some((t) => t.toLowerCase().includes(term)) ||
      e.healthBenefits.some((h) => h.toLowerCase().includes(term))
    )
  }

  if (price !== 'all') {
    list = list.filter((e) => {
      const p = parsePrice(e.price)
      if (price === 'free') return p === 0
      if (price === 'under30') return p !== null && p < 30
      if (price === 'under60') return p !== null && p < 60
      return true
    })
  }

  if (distance !== 'all') {
    const maxKm = parseInt(distance)
    list = list.filter((e) => e.distance == null || e.distance <= maxKm)
  }

  return [...list].sort((a, b) => {
    if (sort === 'price_asc') return (parsePrice(a.price) ?? 999) - (parsePrice(b.price) ?? 999)
    if (sort === 'distance') return (a.distance ?? 999) - (b.distance ?? 999)
    if (sort === 'rating') return b.rating - a.rating
    return 0
  })
}

export default function ExplorePage() {
  const params = useSearchParams()
  const t = useTranslations('explore')

  const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
    { value: 'all', label: t('priceAny') },
    { value: 'free', label: t('priceFree') },
    { value: 'under30', label: t('priceUnder30') },
    { value: 'under60', label: t('priceUnder60') },
  ]

  const DISTANCE_OPTIONS: { value: DistanceFilter; label: string }[] = [
    { value: 'all', label: t('distanceAny') },
    { value: '5', label: '≤ 5 km' },
    { value: '10', label: '≤ 10 km' },
    { value: '25', label: '≤ 25 km' },
  ]

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'default', label: t('filterSortDefault') },
    { value: 'rating', label: t('filterSortRated') },
    { value: 'price_asc', label: t('filterSortPrice') },
    { value: 'distance', label: t('filterSortNearest') },
  ]
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('all')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [showFilters, setShowFilters] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setAiSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/experience-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
        })
        const { suggestions } = await res.json()
        setAiSuggestions(Array.isArray(suggestions) ? suggestions : [])
        setShowSuggestions(true)
      } catch { /* ignore */ }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const filtered = useMemo(
    () => filterAndSort(ALL_EXPERIENCES, activeCategory, query, priceFilter, distanceFilter, sortKey),
    [activeCategory, query, priceFilter, distanceFilter, sortKey]
  )

  const hasActiveFilters = priceFilter !== 'all' || distanceFilter !== 'all' || sortKey !== 'default'

  const countLabel = query.trim()
    ? `${filtered.length === 1 ? t('result') : t('results')} ${t('forLabel')} "${query}"`
    : activeCategory === 'all'
      ? t('experiences')
      : activeCategory.replace('_', ' ')

  return (
    <>
      <FilterBar active={activeCategory} onChange={setActiveCategory} />

      <div style={{ paddingTop: 'var(--filter-bar-height)' }} className="max-w-[var(--max-content-width)] mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-[var(--highlight)] shrink-0" />
            <div>
              <h1 className="font-display font-bold text-2xl text-[var(--color-foreground)]">{t('title')}</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                {filtered.length} {countLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-full)] border text-sm font-semibold transition-colors',
                hasActiveFilters
                  ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                  : 'border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('filters')}
              {hasActiveFilters && <span className="ml-0.5 text-xs opacity-80">•</span>}
            </button>

            {/* Search */}
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
                onFocus={() => aiSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={t('searchExperiences')}
                className="w-full pl-9 pr-9 py-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
              />
              {query && (
                <button onClick={() => { setQuery(''); setAiSuggestions([]) }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                </button>
              )}
              {showSuggestions && aiSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden z-20">
                  <p className="px-3 pt-2 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[var(--highlight)]" /> {t('aiSuggestions')}
                  </p>
                  {aiSuggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={() => { setQuery(s); setShowSuggestions(false) }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-4 p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">{t('priceLabel')}</p>
              <div className="flex flex-wrap gap-1.5">
                {PRICE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPriceFilter(value)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                      priceFilter === value
                        ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">{t('distanceLabel')}</p>
              <div className="flex flex-wrap gap-1.5">
                {DISTANCE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDistanceFilter(value)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                      distanceFilter === value
                        ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">{t('sortBy')}</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSortKey(value)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                      sortKey === value
                        ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => { setPriceFilter('all'); setDistanceFilter('all'); setSortKey('default') }}
                className="self-end text-xs font-semibold text-[var(--color-destructive)] hover:underline"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[var(--color-muted-foreground)]">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-semibold">
              {query ? t('noResultsQuery', { query }) : t('noResultsCategory')}
            </p>
            <p className="text-sm mt-1">
              {query ? t('tryDifferent') : t('moreSoon')}
            </p>
            {(query || hasActiveFilters) && (
              <button
                onClick={() => { setQuery(''); setPriceFilter('all'); setDistanceFilter('all'); setSortKey('default') }}
                className="mt-3 text-sm text-[var(--highlight)] font-semibold hover:underline"
              >
                {t('clearSearch')}
              </button>
            )}
          </div>
        )}
      </div>

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  )
}
