'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['All', 'Culture', 'Outdoor', 'Music', 'Market', 'Workshop', 'Sports']

interface EventFilterProps {
  onFilterChange: (category: string) => void
  selected: string
}

export function EventFilter({ onFilterChange, selected }: EventFilterProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? CATEGORIES : CATEGORIES.slice(0, 5)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" />
      {visible.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat === 'All' ? '' : cat)}
          className="focus:outline-none"
        >
          <Badge
            variant={selected === (cat === 'All' ? '' : cat) ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {cat}
          </Badge>
        </button>
      ))}
      {CATEGORIES.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Less' : `+${CATEGORIES.length - 5} more`}
        </Button>
      )}
    </div>
  )
}
