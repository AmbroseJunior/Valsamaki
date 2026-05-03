import { getCretanNews } from '@/lib/api/external'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export async function NewsPanel() {
  const articles = await getCretanNews()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Cretan News</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)] px-6 pb-6">
            No news available right now.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {articles.slice(0, 6).map((article) => (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-4 hover:bg-[var(--color-muted)] transition-colors group"
                >
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-16 h-16 rounded-[var(--radius)] object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="muted" className="text-xs">{article.source}</Badge>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
