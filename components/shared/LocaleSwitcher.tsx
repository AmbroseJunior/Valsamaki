'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter()
  const locale = useLocale()

  async function switchLocale(next: string) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    })
    router.refresh()
  }

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${className ?? ''}`}>
      <button
        onClick={() => switchLocale('el')}
        className={`px-2 py-1 rounded transition-colors ${locale === 'el' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]'}`}
        aria-label="Switch to Greek"
      >
        EL
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 rounded transition-colors ${locale === 'en' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  )
}
