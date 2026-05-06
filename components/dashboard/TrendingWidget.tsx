import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export async function TrendingWidget() {
  const supabase = await createClient()

  const [{ data: events }, { data: businesses }] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, category, event_date, address')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(4),
    supabase
      .from('businesses')
      .select('id, name, category')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
          Trending in Crete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events && events.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Upcoming Experiences
            </p>
            <div className="space-y-2">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{evt.title}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {formatDate(evt.event_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{evt.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {businesses && businesses.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide mb-2">
              New Producers
            </p>
            <div className="space-y-2">
              {businesses.map((biz) => (
                <div key={biz.id} className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{biz.name}</p>
                  <Badge variant="muted" className="shrink-0 text-xs">{biz.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!events?.length && !businesses?.length) && (
          <p className="text-sm text-[var(--color-muted-foreground)]">No trending content yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
