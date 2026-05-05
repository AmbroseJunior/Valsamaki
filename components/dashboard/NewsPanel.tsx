import { getCretanNews } from '@/lib/api/external'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ArrowRight } from 'lucide-react'
import type { NewsArticle } from '@/types/app'

const CRETAN_KEYWORDS = [
  'crete', 'cretan', 'heraklion', 'chania', 'rethymno',
  'olive', 'wine', 'food', 'producer', 'culture', 'greece',
  'mediterranean', 'agricultural', 'organic', 'harvest',
]

function scoreArticle(article: NewsArticle): number {
  let score = 0
  if (article.image_url) score += 4
  const text = `${article.title ?? ''} ${article.description ?? ''}`.toLowerCase()
  for (const kw of CRETAN_KEYWORDS) {
    if (text.includes(kw)) score += 1
  }
  return score
}

export async function NewsPanel() {
  const t = await getTranslations('dashboard')
  const articles = await getCretanNews()

  const top3 = [...articles]
    .sort((a, b) => scoreArticle(b) - scoreArticle(a))
    .slice(0, 3)

  if (top3.length === 0) {
    return (
      <section>
        <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
          <Newspaper className="h-4 w-4 text-[var(--highlight)]" />
          {t('newsTitle')}
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">{t('noNews')}</p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-4 w-4 text-[var(--highlight)]" />
        <h2 className="font-display font-bold text-lg">{t('newsTitle')}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {top3.map((article) => {
          const keywords = (article.title ?? 'Crete').split(' ').slice(0, 4).join(' ')
          const exploreLink = `/explore?q=${encodeURIComponent(keywords)}`

          return (
            <article
              key={article.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden flex flex-col hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              {/* Photo */}
              <div className="relative aspect-video shrink-0">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title ?? ''}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--highlight)]/20 to-[var(--color-muted)] flex items-center justify-center">
                    <span className="text-5xl">🏛️</span>
                  </div>
                )}
                {article.source && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0.5 bg-black/60 border-0 text-white">
                      {article.source}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold leading-snug line-clamp-3 mb-2 flex-1">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 mb-3">
                    {article.description}
                  </p>
                )}
                <Link
                  href={exploreLink}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--highlight)] hover:underline mt-auto"
                >
                  {t('readMore')} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
