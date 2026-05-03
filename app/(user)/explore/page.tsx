'use client'

import { useState } from 'react'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { EXPERIENCES, getExperiencesByCategory } from '@/lib/data/experiences'
import type { Experience, ExperienceCategory } from '@/types/experience'
import { Sparkles } from 'lucide-react'

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('all')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)

  const filtered = getExperiencesByCategory(activeCategory)

  return (
    <>
      <FilterBar active={activeCategory} onChange={setActiveCategory} />

      <div style={{ paddingTop: 'var(--filter-bar-height)' }} className="max-w-[var(--max-content-width)] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-[var(--highlight)]" />
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--color-foreground)]">Explore Crete</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              {filtered.length} {activeCategory === 'all' ? 'experiences' : activeCategory.replace('_', ' ')} found
            </p>
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
            <p className="mt-3 font-semibold">No experiences in this category yet.</p>
            <p className="text-sm mt-1">More coming soon!</p>
          </div>
        )}

        {/* All static data + Supabase recommendations note */}
        {EXPERIENCES.length > 0 && (
          <div className="mt-8 p-4 bg-[var(--highlight)]/10 border border-[var(--highlight)]/30 rounded-[var(--radius-lg)] text-sm text-center">
            <Sparkles className="h-4 w-4 inline mr-1.5 text-[var(--color-foreground)]" />
            <strong>Sign in</strong> to get AI-powered recommendations personalised to your preferences.
          </div>
        )}
      </div>

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  )
}
