'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types/experience'
import type { ExperienceCategory } from '@/types/experience'

interface FilterBarProps {
  active: ExperienceCategory
  onChange: (cat: ExperienceCategory) => void
  className?: string
}

export function FilterBar({ active, onChange, className }: FilterBarProps) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      if (current < 60) {
        setVisible(true)
      } else if (current > lastScrollY.current + 4) {
        setVisible(false)
      } else if (current < lastScrollY.current - 4) {
        setVisible(true)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-[calc(var(--z-sticky)-1)] transition-transform duration-200 bg-[var(--color-background)] border-b border-[var(--color-border)]',
        visible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
      style={{ top: 'var(--nav-height)', height: 'var(--filter-bar-height)' }}
    >
      <div className="h-full flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide max-w-[var(--max-content-width)] mx-auto">
        {CATEGORIES.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-full)] text-sm font-semibold whitespace-nowrap transition-all shrink-0',
              active === value
                ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] shadow-sm'
                : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]'
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
