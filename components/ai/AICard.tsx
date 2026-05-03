import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import type { RecommendationItem } from '@/types/ai'

interface AICardProps {
  recommendation: RecommendationItem
  entityName?: string
}

export function AICard({ recommendation, entityName }: AICardProps) {
  return (
    <Card className="border-l-4 border-l-[var(--color-primary)]">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-honey)]" />
          <span className="text-sm font-semibold">{entityName ?? recommendation.entity_id}</span>
          <Badge variant="muted" className="ml-auto text-xs">
            {Math.round(recommendation.score * 100)}% match
          </Badge>
        </div>
        {recommendation.reason && (
          <p className="text-sm text-[var(--color-muted-foreground)]">{recommendation.reason}</p>
        )}
        <p className="text-xs text-[var(--color-muted-foreground)]">
          via {recommendation.source}
        </p>
      </CardContent>
    </Card>
  )
}
