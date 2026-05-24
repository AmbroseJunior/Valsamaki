'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Mail, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from '@/lib/i18n/locales'
import type { Locale } from '@/lib/i18n/locales'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SESSION_KEY = 'valsamaki_lang_chosen'

export default function ComingSoonPage() {
  const t = useTranslations('comingSoon')
  const locale = useLocale()
  const router = useRouter()

  const [step, setStep] = useState<'loading' | 'language' | 'waitlist'>('loading')
  const [selected, setSelected] = useState<Locale | null>(null)
  const [picking, setPicking] = useState(false)
  const [email, setEmail] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    setStep(sessionStorage.getItem(SESSION_KEY) ? 'waitlist' : 'language')
  }, [])

  useEffect(() => {
    if (step !== 'waitlist') return
    fetch('/api/waitlist/count')
      .then((r) => r.json())
      .then((d: { count?: number }) => setCount(d.count ?? 0))
      .catch(() => {})
  }, [step])

  async function pickLanguage(loc: Locale) {
    if (picking) return
    setSelected(loc)
    setPicking(true)
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: loc }),
    })
    setStep('waitlist')
    setPicking(false)
    startTransition(() => router.refresh())
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) return
    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale, source: 'coming_soon' }),
      })
      const data = await res.json() as { ok?: boolean; already?: boolean; position?: number }
      if (data.ok || data.already) {
        router.push(`/thank-you?p=${data.position ?? 1}`)
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    }
  }

  const bg = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #FCDA06 0%, transparent 70%)' }}
      />
    </div>
  )

  const logo = (
    <div className="flex items-center justify-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v1.png" alt="Valsamaki" className="w-14 h-14 object-contain drop-shadow-lg" />
      <div className="text-left">
        <p className="font-display font-bold text-white text-3xl tracking-tight leading-none">valsamaki</p>
        <p className="text-[#FCDA06] text-xs font-semibold mt-0.5 tracking-widest uppercase">Authentic Crete</p>
      </div>
    </div>
  )

  const shell = 'fixed inset-0 z-[9000] flex flex-col items-center justify-center p-5 sm:p-8 overflow-y-auto'
  const shellStyle = { background: 'linear-gradient(150deg, #0f1a0f 0%, #1c2a0e 40%, #1a1c0a 100%)' }

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (step === 'loading') return <div className={shell} style={shellStyle}>{bg}</div>

  /* ── STEP 1: Language picker ─────────────────────────────────────────────── */
  if (step === 'language') return (
    <div className={shell} style={shellStyle}>
      {bg}
      <div className="relative w-full max-w-md space-y-8 text-center py-8">
        {logo}

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome — Choose your language</h2>
          <p className="text-white/50 text-sm">Καλώς ήρθες · Bienvenido · Bienvenue · Benvenuto</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => pickLanguage(loc)}
              disabled={picking}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl border-2 transition-all duration-200',
                'bg-white/5 hover:bg-white/12',
                selected === loc
                  ? 'border-[#FCDA06] bg-[#FCDA06]/15 scale-[1.03] shadow-[0_0_20px_#FCDA0640]'
                  : 'border-white/15 hover:border-white/35',
                picking && selected !== loc && 'opacity-30 pointer-events-none'
              )}
            >
              <span className="text-3xl leading-none">{LOCALE_FLAGS[loc]}</span>
              <span className="text-sm font-bold text-white leading-tight text-center">{LOCALE_LABELS[loc]}</span>
              {selected === loc && <Check className="h-3.5 w-3.5 text-[#FCDA06] mt-0.5" />}
            </button>
          ))}
        </div>

        <p className="text-white/15 text-xs">
          © {new Date().getFullYear()} Valsamaki · Heraklion, Crete, Greece
        </p>
      </div>
    </div>
  )

  /* ── STEP 2: Waitlist ────────────────────────────────────────────────────── */
  const perks = [
    { emoji: t('perk1Emoji'), label: t('perk1Label'), desc: t('perk1Desc') },
    { emoji: t('perk2Emoji'), label: t('perk2Label'), desc: t('perk2Desc') },
    { emoji: t('perk3Emoji'), label: t('perk3Label'), desc: t('perk3Desc') },
  ]

  return (
    <div className={shell} style={shellStyle}>
      {bg}
      <div className="relative w-full max-w-sm space-y-7 text-center py-8">
        {logo}

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(252,218,6,0.12)', border: '1px solid rgba(252,218,6,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FCDA06] animate-pulse" />
          <span className="text-[#FCDA06] text-xs font-bold tracking-widest uppercase">{t('badge')}</span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">{t('headline')}</h1>
          <p className="text-white/50 text-sm leading-relaxed">{t('description')}</p>
        </div>

        {/* Social proof */}
        {count !== null && count > 0 && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full mx-auto w-fit"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex -space-x-1.5">
              {['🇬🇷', '🇩🇪', '🇫🇷'].map((flag, i) => (
                <span key={i} className="text-base">{flag}</span>
              ))}
            </div>
            <span className="text-white/60 text-xs font-medium">{t('joinCount', { count })}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={submitEmail} className="space-y-3 text-left">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)' }}
            onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(252,218,6,0.6)' }}
            onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
          >
            <Mail className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitStatus === 'loading'}
              autoComplete="email"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
              style={{ color: 'white', caretColor: '#FCDA06' }}
            />
          </div>

          {submitStatus === 'error' && (
            <p className="text-red-400 text-xs pl-1">{t('error')}</p>
          )}

          <button
            type="submit"
            disabled={submitStatus === 'loading' || !EMAIL_RE.test(email.trim())}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#FCDA06', color: '#1a1c0a' }}
          >
            {submitStatus === 'loading' ? t('loading') : t('button')}
          </button>
        </form>

        {/* Perks */}
        <div className="pt-1">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">{t('perkTitle')}</p>
          <div className="grid grid-cols-3 gap-3">
            {perks.map((perk, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 px-2 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-2xl">{perk.emoji}</span>
                <p className="text-white text-xs font-bold leading-tight">{perk.label}</p>
                <p className="text-white/40 text-[10px] leading-tight">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — admin link is the 🔑, invisible to regular users */}
        <div className="flex items-center justify-center gap-3 text-white/15 text-xs">
          <span>© {new Date().getFullYear()} Valsamaki · Heraklion, Crete, Greece</span>
          <span>·</span>
          <a href="/login" className="hover:text-white/40 transition-colors">🔑</a>
        </div>
      </div>
    </div>
  )
}
