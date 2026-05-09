'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Category = { key: string; value: string }

interface EventFilterProps {
  onFilterChange: (category: string) => void
  selected: string
}

export function EventFilter({ onFilterChange, selected }: EventFilterProps) {
  const [showAll, setShowAll] = useState(false)
  const t = useTranslations('events')

  const CATEGORIES: Category[] = [
    { key: 'all', value: '' },
    { key: 'culture', value: 'Culture' },
    { key: 'outdoor', value: 'Outdoor' },
    { key: 'music', value: 'Music' },
    { key: 'market', value: 'Market' },
    { key: 'workshop', value: 'Workshop' },
    { key: 'sports', value: 'Sports' },
  ]

  const visible = showAll ? CATEGORIES : CATEGORIES.slice(0, 5)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" />
      {visible.map(({ key, value }) => (
        <button
          key={key}
          onClick={() => onFilterChange(value)}
          className="focus:outline-none"
        >
          <Badge
            variant={selected === value ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {t(key as 'all')}
          </Badge>
        </button>
      ))}
      {CATEGORIES.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? t('showLess') : t('showMore', { count: CATEGORIES.length - 5 })}
        </Button>
      )}
    </div>
  )
}
