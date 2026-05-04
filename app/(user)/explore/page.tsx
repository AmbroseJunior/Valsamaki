'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { EXPERIENCES } from '@/lib/data/experiences'
import type { Experience, ExperienceCategory } from '@/types/experience'
import { Sparkles, Search, X } from 'lucide-react'

function searchExperiences(items: Experience[], category: ExperienceCategory, q: string): Experience[] {
  const list = category === 'all' ? items : items.filter((e) => e.category === category)
  if (!q.trim()) return list
  const term = q.toLowerCase().trim()
  return list.filter((e) =>
    e.title.toLowerCase().includes(term) ||
    e.location.toLowerCase().includes(term) ||
    e.description.toLowerCase().includes(term) ||
    e.shortDescription.toLowerCase().includes(term) ||
    e.tags.some((t) => t.toLowerCase().includes(term)) ||
    e.healthBenefits.some((h) => h.toLowerCase().includes(term))
  )
}

export default function ExplorePage() {
  const params = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('all')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)

  const filtered = searchExperiences(EXPERIENCES, activeCategory, query)

  return (
    <>
      <FilterBar active={activeCategory} onChange={setActiveCategory} />

      <div style={{ paddingTop: 'var(--filter-bar-height)' }} className="max-w-[var(--max-content-width)] mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-[var(--highlight)] shrink-0" />
            <div>
              <h1 className="font-display font-bold text-2xl text-[var(--color-foreground)]">Explore Crete</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                {filtered.length} {query.trim() ? `result${filtered.length !== 1 ? 's' : ''} for "${query}"` : activeCategory === 'all' ? 'experiences' : activeCategory.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiences, places, tags…"
              className="w-full pl-9 pr-9 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--color-muted-foreground)]">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-semibold">
              {query ? `No results for "${query}"` : 'No experiences in this category yet.'}
            </p>
            <p className="text-sm mt-1">
              {query ? 'Try a different keyword or clear the search.' : 'More coming soon!'}
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-sm text-[var(--highlight)] font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  )
}
