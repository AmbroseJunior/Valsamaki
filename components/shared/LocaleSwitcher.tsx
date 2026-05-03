'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function switchLocale(next: Locale) {
    if (next === locale) { setOpen(false); return }
    setOpen(false)
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    })
    window.location.reload()
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 p-2 rounded-[var(--radius)] hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        aria-label="Change language"
        title="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:block text-xs font-semibold uppercase">{locale}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 z-[var(--z-dropdown)] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[var(--color-border)] mb-1">
            <p className="text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">Language</p>
          </div>
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors',
                l === locale ? 'font-bold text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]'
              )}
            >
              <span>{LOCALE_LABELS[l]}</span>
              {l === locale && <Check className="h-3.5 w-3.5 text-[var(--highlight)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
