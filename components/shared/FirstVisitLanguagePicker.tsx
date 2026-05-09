'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

// sessionStorage key — resets every new browser session so every visitor sees it
const SESSION_KEY = 'valsamaki_lang_chosen'

export function FirstVisitLanguagePicker() {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Locale | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true)
    } catch {}
  }, [])

  if (!visible) return null

  async function pick(locale: Locale) {
    if (loading) return
    setSelected(locale)
    setLoading(true)
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
    setVisible(false)
    startTransition(() => router.refresh())
  }

  function skip() {
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-5 sm:p-8 overflow-y-auto"
      style={{ background: 'linear-gradient(150deg, #0f1a0f 0%, #1c2a0e 40%, #1a1c0a 100%)' }}>

      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FCDA06 0%, transparent 70%)' }} />
      </div>

      {/* Logo + brand */}
      <div className="relative flex items-center gap-3 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v1.png" alt="Valsamaki" className="w-14 h-14 object-contain drop-shadow-lg" />
        <div>
          <p className="font-display font-bold text-white text-3xl tracking-tight leading-none">valsamaki</p>
          <p className="text-[#FCDA06] text-xs font-semibold mt-0.5 tracking-widest uppercase">Authentic Crete</p>
        </div>
      </div>

      {/* Welcome rows */}
      <div className="relative text-center mb-8 mt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Welcome — Choose your language</h2>
        <p className="text-white/50 text-sm">Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto</p>
      </div>

      {/* Language grid */}
      <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-sm sm:max-w-md">
        {SUPPORTED_LOCALES.map((loc) => {
          const isSelected = selected === loc
          return (
            <button
              key={loc}
              onClick={() => pick(loc)}
              disabled={loading}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl border-2 transition-all duration-200 select-none',
                'bg-white/8 hover:bg-white/15',
                isSelected
                  ? 'border-[#FCDA06] bg-[#FCDA06]/15 scale-[1.03] shadow-[0_0_20px_#FCDA0640]'
                  : 'border-white/15 hover:border-white/40',
                loading && !isSelected && 'opacity-30 pointer-events-none'
              )}
            >
              <span className="text-3xl leading-none">{LOCALE_FLAGS[loc]}</span>
              <span className="text-sm font-bold text-white leading-tight text-center">{LOCALE_LABELS[loc]}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-[#FCDA06] mt-0.5" />}
            </button>
          )
        })}
      </div>

      {/* Skip */}
      <button
        onClick={skip}
        className="relative mt-8 text-white/35 text-sm hover:text-white/65 transition-colors"
      >
        Continue without changing →
      </button>
    </div>
  )
}
