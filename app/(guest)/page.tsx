'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { getExperiencesByCategory, getNearbyExperiences } from '@/lib/data/experiences'
import type { Experience, ExperienceCategory } from '@/types/experience'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'

export default function GuestHomePage() {
  const t = useTranslations('home')
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('all')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)

  const filtered = getExperiencesByCategory(activeCategory)
  const nearby = getNearbyExperiences(4)

  return (
    <>
      <FilterBar active={activeCategory} onChange={setActiveCategory} />

      {/* Offset for filter bar */}
      <div style={{ paddingTop: 'var(--filter-bar-height)' }}>

        {/* Hero section */}
        <section className="max-w-[var(--max-content-width)] mx-auto px-4 pt-6 pb-2">
          <div className="mb-5">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-foreground)]">
              {t('hero')}
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              {t('heroSub')}
            </p>
          </div>

          {/* Hero cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Map View card */}
            <Link
              href="/map"
              className="relative bg-[var(--highlight)] rounded-[var(--radius-xl)] p-5 overflow-hidden group hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="relative z-10">
                <span className="text-3xl">🗺️</span>
                <h2 className="font-display font-bold text-base mt-2 text-[var(--highlight-foreground)]">{t('mapView')}</h2>
                <p className="text-xs text-[var(--highlight-foreground)]/80 mt-0.5">{t('mapSub')}</p>
              </div>
              <div className="absolute -bottom-3 -right-3 text-6xl opacity-20">🗺️</div>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-[var(--highlight-foreground)] group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Local Products card */}
            <Link
              href="/products"
              className="relative bg-[var(--color-green)] rounded-[var(--radius-xl)] p-5 overflow-hidden group hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="relative z-10">
                <span className="text-3xl">🫒</span>
                <h2 className="font-display font-bold text-base mt-2 text-white">{t('products')}</h2>
                <p className="text-xs text-white/80 mt-0.5">{t('productsSub')}</p>
              </div>
              <div className="absolute -bottom-3 -right-3 text-6xl opacity-20">🫒</div>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quiz CTA banner */}
          <div className="bg-[var(--color-foreground)] text-white rounded-[var(--radius-xl)] p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-4 w-4 text-[var(--highlight)]" />
                <span className="text-xs font-bold text-[var(--highlight)] uppercase tracking-wide">{t('personalised')}</span>
              </div>
              <h2 className="font-display font-bold text-base leading-snug">{t('quizTitle')}</h2>
              <p className="text-xs text-white/70 mt-0.5">{t('quizSub')}</p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 bg-[var(--highlight)] text-[var(--highlight-foreground)] text-sm font-bold px-4 py-2 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors"
            >
              {t('startQuiz')}
            </Link>
          </div>
        </section>

        {/* Near You section */}
        <section className="max-w-[var(--max-content-width)] mx-auto px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              <h2 className="font-display font-bold text-lg text-[var(--color-foreground)]">{t('nearYou')}</h2>
            </div>
            <Link href="/map" className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] flex items-center gap-1">
              {t('viewMap')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nearby.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
            ))}
          </div>
        </section>

        {/* All Experiences section */}
        <section className="max-w-[var(--max-content-width)] mx-auto px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-[var(--color-foreground)]">
              {activeCategory === 'all' ? t('allExperiences') : `${activeCategory.replace('_', ' ')} experiences`}
              <span className="text-sm font-normal text-[var(--color-muted-foreground)] ml-2">({filtered.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
            ))}
          </div>
        </section>

        {/* Sign-up CTA */}
        <section className="max-w-[var(--max-content-width)] mx-auto px-4 mb-10">
          <div className="bg-[var(--highlight)]/10 border border-[var(--highlight)]/30 rounded-[var(--radius-xl)] p-6 text-center">
            <h2 className="font-display font-bold text-xl text-[var(--color-foreground)] mb-2">
              {t('ctaTitle')}
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              {t('ctaSub')}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold px-6 py-2.5 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors"
              >
                {t('signUpFree')}
              </Link>
              <Link
                href="/login"
                className="border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold px-6 py-2.5 rounded-[var(--radius-full)] hover:border-[var(--highlight)] transition-colors"
              >
                {t('signIn')}
              </Link>
            </div>
          </div>
        </section>

        {/* Producer CTA */}
        <section className="max-w-[var(--max-content-width)] mx-auto px-4 mb-10">
          <div className="bg-[var(--color-foreground)] rounded-[var(--radius-xl)] p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <span className="text-3xl">🏪</span>
              <h2 className="font-display font-bold text-lg text-white mt-2">{t('producerTitle')}</h2>
              <p className="text-sm text-white/70 mt-1">{t('producerSub')}</p>
            </div>
            <Link
              href="/register?role=producer"
              className="shrink-0 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold px-5 py-2.5 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors text-sm"
            >
              {t('listBusiness')}
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-[var(--color-muted-foreground)] py-6 border-t border-[var(--color-border)]">
          <p>{t('footer')}</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/info" className="hover:text-[var(--color-foreground)] transition-colors">{t('footerMedDiet')}</Link>
            <Link href="/map" className="hover:text-[var(--color-foreground)] transition-colors">{t('footerMap')}</Link>
            <Link href="/events" className="hover:text-[var(--color-foreground)] transition-colors">{t('footerExperiences')}</Link>
          </div>
        </footer>
      </div>

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  )
}
