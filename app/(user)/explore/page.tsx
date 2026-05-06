'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExperienceCard } from '@/components/explore/ExperienceCard'
import { ExperienceModal } from '@/components/explore/ExperienceModal'
import { EXPERIENCES } from '@/lib/data/experiences'
import type { Experience, ExperienceCategory } from '@/types/experience'
import type { NewsArticle } from '@/types/app'
import { Sparkles, Search, X, Newspaper, ExternalLink } from 'lucide-react'
import Image from 'next/image'

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

function filterNews(articles: NewsArticle[], q: string): NewsArticle[] {
  if (!q.trim()) return []
  const term = q.toLowerCase().trim()
  return articles.filter((a) =>
    a.title.toLowerCase().includes(term) ||
    a.description.toLowerCase().includes(term) ||
    a.source.toLowerCase().includes(term)
  )
}

export default function ExplorePage() {
  const params = useSearchParams()
  const t = useTranslations('explore')
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('all')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null)
  const [allNews, setAllNews] = useState<NewsArticle[]>([])
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetch('/api/news')
      .then((r) => r.ok ? r.json() : [])
      .then(setAllNews)
      .catch(() => {})
  }, [])

  const filtered = searchExperiences(EXPERIENCES, activeCategory, query)
  const newsResults = filterNews(allNews, query)

  const countLabel = query.trim()
    ? `${filtered.length === 1 ? t('result') : t('results')} ${t('forLabel')} "${query}"`
    : activeCategory === 'all'
      ? t('experiences')
      : activeCategory.replace('_', ' ')

  return (
    <>
      <FilterBar active={activeCategory} onChange={setActiveCategory} />

      <div style={{ paddingTop: 'var(--filter-bar-height)' }} className="max-w-[var(--max-content-width)] mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-[var(--highlight)] shrink-0" />
            <div>
              <h1 className="font-display font-bold text-2xl text-[var(--color-foreground)]">{t('title')}</h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                {filtered.length} {countLabel}
              </p>
            </div>
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchExperiences')}
              className="w-full pl-9 pr-9 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </button>
            )}
          </div>
        </div>

        {/* Experience results */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onClick={setSelectedExp} />
            ))}
          </div>
        )}

        {/* No experience results */}
        {filtered.length === 0 && newsResults.length === 0 && (
          <div className="text-center py-20 text-[var(--color-muted-foreground)]">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-semibold">
              {query ? t('noResultsQuery', { query }) : t('noResultsCategory')}
            </p>
            <p className="text-sm mt-1">
              {query ? t('tryDifferent') : t('moreSoon')}
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-sm text-[var(--highlight)] font-semibold hover:underline"
              >
                {t('clearSearch')}
              </button>
            )}
          </div>
        )}

        {/* News results — shown whenever search matches articles */}
        {newsResults.length > 0 && (
          <section className={filtered.length > 0 ? 'mt-10' : 'mt-2'}>
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="h-5 w-5 text-[var(--highlight)]" />
              <h2 className="font-display font-bold text-lg">
                News — {newsResults.length} {newsResults.length === 1 ? 'article' : 'articles'} for &ldquo;{query}&rdquo;
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {newsResults.map((article) => (
                <NewsResultCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>

      <ExperienceModal experience={selectedExp} onClose={() => setSelectedExp(null)} />
    </>
  )
}

function NewsResultCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 hover:shadow-[var(--shadow-md)] transition-shadow group"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-20 shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-muted)]">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🫒</div>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--highlight)]">
            {article.source}
          </span>
          {article.published_at && (
            <span className="text-[10px] text-[var(--color-muted-foreground)]">
              {new Date(article.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
            {article.description}
          </p>
        )}
      </div>

      <ExternalLink className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] self-center group-hover:text-[var(--highlight)] transition-colors" />
    </a>
  )
}
