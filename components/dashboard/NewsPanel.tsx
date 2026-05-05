import { getCretanNews } from '@/lib/api/external'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Newspaper, ArrowRight } from 'lucide-react'
import type { NewsArticle } from '@/types/app'

const RELEVANT_KEYWORDS = [
  'crete', 'cretan', 'heraklion', 'chania', 'rethymno', 'lasithi',
  'olive', 'olive oil', 'wine', 'food', 'cuisine', 'producer',
  'agriculture', 'culture', 'festival', 'tradition', 'mediterranean',
  'organic', 'harvest', 'gastronomy', 'herb', 'honey', 'cheese',
]

const MIN_SCORE = 2

function scoreArticle(article: NewsArticle): number {
  let score = 0
  if (article.image_url) score += 4
  const text = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase()
  for (const kw of RELEVANT_KEYWORDS) {
    if (text.includes(kw)) score += 1
  }
  return score
}

export async function NewsPanel() {
  const t = await getTranslations('dashboard')
  const articles = await getCretanNews()

  const top3 = [...articles]
    .sort((a, b) => scoreArticle(b) - scoreArticle(a))
    .filter((a) => scoreArticle(a) >= MIN_SCORE)
    .slice(0, 3)

  if (top3.length === 0) {
    return null
  }

  const [featured, ...rest] = top3

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-[var(--highlight)]" />
        <h2 className="font-display font-bold text-xl">{t('newsTitle')}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Featured card — spans 3/5 on desktop */}
        <NewsCard article={featured} size="large" readMore={t('readMore')} className="lg:col-span-3" />

        {/* Two smaller cards stacked — span 2/5 on desktop */}
        {rest.length > 0 && (
          <div className="lg:col-span-2 flex flex-col gap-4">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} size="small" readMore={t('readMore')} className="flex-1" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function NewsCard({
  article,
  size,
  readMore,
  className = '',
}: {
  article: NewsArticle
  size: 'large' | 'small'
  readMore: string
  className?: string
}) {
  const keywords = (article.title ?? 'Crete').split(' ').slice(0, 4).join(' ')
  const exploreLink = `/explore?q=${encodeURIComponent(keywords)}`

  if (size === 'large') {
    return (
      <article className={`relative rounded-[var(--radius-2xl)] overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] flex flex-col group ${className}`}>
        {/* Hero image */}
        <div className="relative aspect-[16/9] shrink-0">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title ?? ''}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--highlight)]/30 to-[var(--color-muted)] flex items-center justify-center">
              <span className="text-7xl">🫒</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {article.source && (
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[var(--highlight)] text-[var(--highlight-foreground)] px-2 py-1 rounded-full">
              {article.source}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-bold text-base leading-snug line-clamp-2 mb-2">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4 flex-1">
              {article.description}
            </p>
          )}
          <Link
            href={exploreLink}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--highlight)] hover:underline mt-auto"
          >
            {readMore} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    )
  }

  // Small card — horizontal layout with image on left
  return (
    <article className={`rounded-[var(--radius-2xl)] overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] flex group hover:shadow-[var(--shadow-md)] transition-shadow ${className}`}>
      {/* Thumbnail */}
      <div className="relative w-28 shrink-0">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title ?? ''}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--highlight)]/20 to-[var(--color-muted)] flex items-center justify-center">
            <span className="text-3xl">🏛️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 min-w-0">
        {article.source && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--highlight)] mb-1 truncate">
            {article.source}
          </span>
        )}
        <h3 className="font-semibold text-sm leading-snug line-clamp-3 mb-2 flex-1">
          {article.title}
        </h3>
        <Link
          href={exploreLink}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--highlight)] hover:underline mt-auto"
        >
          {readMore} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  )
}
