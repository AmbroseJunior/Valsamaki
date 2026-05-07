'use client'

import { useState, useRef, useEffect, startTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

export function LocaleSwitcher({ className, dropUp = false }: { className?: string; dropUp?: boolean }) {
  const locale = useLocale() as Locale
  const router = useRouter()
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
    startTransition(() => router.refresh())
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/5 transition-all text-[var(--color-foreground)]"
        aria-label="Change language"
        title="Change language"
      >
        <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
        <span className="text-xs font-bold uppercase tracking-wide hidden sm:block">{locale}</span>
        <ChevronDown className={cn('h-3 w-3 text-[var(--color-muted-foreground)] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 w-48 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 z-[var(--z-dropdown)] overflow-hidden',
          dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
        )}>
          <div className="px-3 py-1.5 border-b border-[var(--color-border)] mb-1">
            <p className="text-[0.65rem] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">🌐 Language</p>
          </div>
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors',
                l === locale ? 'font-bold text-[var(--color-foreground)] bg-[var(--highlight)]/8' : 'text-[var(--color-muted-foreground)]'
              )}
            >
              <span className="text-base leading-none">{LOCALE_FLAGS[l]}</span>
              <span className="flex-1 text-left">{LOCALE_LABELS[l]}</span>
              {l === locale && <Check className="h-3.5 w-3.5 text-[var(--highlight)] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
