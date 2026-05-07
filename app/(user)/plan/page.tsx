'use client'

import { useState } from 'react'
import { Sparkles, MapPin, Clock, Loader2, RotateCcw, Share2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DaySlot {
  activity: string
  location: string
  duration: string
  tip: string
  emoji: string
}

interface DayPlan {
  day: number
  theme: string
  morning: DaySlot
  afternoon: DaySlot
  evening: DaySlot
}

interface Itinerary {
  title: string
  tagline: string
  days: DayPlan[]
  packingTips: string[]
  localPhrase: { greek: string; pronunciation: string; meaning: string }
}

// ── Static config (ids + emojis only — labels come from translations) ─────────

const INTEREST_IDS = [
  { id: 'food',      emoji: '🍽️' },
  { id: 'olive_oil', emoji: '🫒' },
  { id: 'hiking',    emoji: '🥾' },
  { id: 'history',   emoji: '🏛️' },
  { id: 'wellness',  emoji: '💆' },
  { id: 'markets',   emoji: '🛒' },
  { id: 'sea',       emoji: '🚣' },
]

const DIET_IDS = ['none', 'vegetarian', 'vegan', 'gluten_free', 'pescatarian']

const STYLE_IDS = [
  { id: 'relaxed',  emoji: '🌊' },
  { id: 'balanced', emoji: '⚖️' },
  { id: 'active',   emoji: '🏃' },
  { id: 'cultural', emoji: '🏛️' },
]

// ── Slot card ─────────────────────────────────────────────────────────────────

function SlotCard({ slot, label, color }: { slot: DaySlot; label: string; color: string }) {
  return (
    <div className={`rounded-[var(--radius-xl)] border-l-4 ${color} bg-[var(--color-card)] p-4 space-y-1.5`}>
      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">{label}</p>
      <div className="flex items-start gap-2">
        <span className="text-2xl leading-none mt-0.5 shrink-0">{slot.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-foreground)] leading-snug">{slot.activity}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
              <MapPin className="h-3 w-3 shrink-0" />{slot.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
              <Clock className="h-3 w-3 shrink-0" />{slot.duration}
            </span>
          </div>
          {slot.tip && (
            <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)] italic bg-[var(--color-muted)] rounded-[var(--radius)] px-2 py-1">
              💡 {slot.tip}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Day card ──────────────────────────────────────────────────────────────────

function DayCard({ plan, index, labels }: { plan: DayPlan; index: number; labels: { morning: string; afternoon: string; evening: string } }) {
  const [open, setOpen] = useState(index === 0)

  const GRADIENTS = [
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-yellow-500 to-amber-600',
  ]

  return (
    <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] overflow-hidden bg-[var(--color-card)] shadow-[var(--shadow-sm)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-muted)] transition-colors"
      >
        <div className={`shrink-0 w-12 h-12 rounded-[var(--radius-xl)] bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} flex flex-col items-center justify-center`}>
          <span className="text-[0.5rem] font-bold uppercase tracking-wider text-white/70">Day</span>
          <span className="text-xl font-bold text-white leading-none">{plan.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[var(--color-foreground)]">{plan.theme}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 truncate">
            {plan.morning.activity} · {plan.afternoon.activity} · {plan.evening.activity}
          </p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
          <SlotCard slot={plan.morning}   label={labels.morning}   color="border-amber-400" />
          <SlotCard slot={plan.afternoon} label={labels.afternoon} color="border-blue-400" />
          <SlotCard slot={plan.evening}   label={labels.evening}   color="border-purple-400" />
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const t = useTranslations('plan')

  const [days, setDays] = useState(3)
  const [interests, setInterests] = useState<string[]>([])
  const [diet, setDiet] = useState('none')
  const [style, setStyle] = useState('balanced')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const slotLabels = { morning: t('morning'), afternoon: t('afternoon'), evening: t('evening') }

  function toggleInterest(id: string) {
    setInterests((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  async function generate() {
    setLoading(true)
    setError('')
    setItinerary(null)
    setSaved(false)
    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, interests, diet, style }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setItinerary(data.itinerary)
      // Save to user account + send email (fire and forget)
      fetch('/api/user/save-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: data.itinerary, days, interests, diet, style }),
      }).then((r) => { if (r.ok) setSaved(true) }).catch(() => {})
    } catch (e) {
      const raw = e instanceof Error ? e.message : ''
      const isParseErr = /json|unexpected|position|\btoken\b/i.test(raw)
      setError(isParseErr ? t('errorFormat') : (raw || 'Failed to generate itinerary'))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setItinerary(null)
    setError('')
    setSaved(false)
  }

  async function share() {
    if (!itinerary) return
    const text = `🌿 My Crete Itinerary: ${itinerary.title}\n${itinerary.tagline}\n\nGenerated by Valsamaki`
    if (navigator.share) {
      await navigator.share({ title: itinerary.title, text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--highlight)]/10 text-[var(--highlight)] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" /> {t('badge')}
        </div>
        <h1 className="font-display text-3xl font-bold">{t('title')}</h1>
        <p className="text-[var(--color-muted-foreground)]">{t('subtitle')}</p>
      </div>

      {!itinerary ? (
        <div className="space-y-6">
          {/* Days */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{t('daysLabel')}</p>
              <span className="text-2xl font-display font-bold text-[var(--highlight)]">{days}</span>
            </div>
            <input
              type="range" min={1} max={7} value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full accent-[var(--highlight)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
              <span>{t('daysMin')}</span><span>{t('daysMax')}</span>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 space-y-3">
            <p className="font-semibold">{t('interestsLabel')} <span className="text-xs font-normal text-[var(--color-muted-foreground)]">{t('interestsPick')}</span></p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_IDS.map(({ id, emoji }) => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all',
                    interests.includes(id)
                      ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)] scale-105'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
                  )}
                >
                  <span>{emoji}</span> {t(`interests.${id}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {/* Travel style */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 space-y-3">
            <p className="font-semibold">{t('styleLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_IDS.map(({ id, emoji }) => (
                <button
                  key={id}
                  onClick={() => setStyle(id)}
                  className={cn(
                    'text-left p-3 rounded-[var(--radius-xl)] border transition-all',
                    style === id
                      ? 'border-[var(--highlight)] bg-[var(--highlight)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--highlight)]/50'
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <p className="font-semibold text-sm mt-1">{t(`styles.${id}` as Parameters<typeof t>[0])}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{t(`styles.${id}Desc` as Parameters<typeof t>[0])}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 space-y-3">
            <p className="font-semibold">{t('dietLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {DIET_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setDiet(id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors',
                    diet === id
                      ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--highlight)]'
                  )}
                >
                  {t(`diets.${id}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-destructive)] text-center">{error}</p>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold text-lg rounded-[var(--radius-2xl)] hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t('generate')}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Itinerary header */}
          <div className="bg-gradient-to-br from-[var(--highlight)] to-amber-500 rounded-[var(--radius-2xl)] p-6 text-center space-y-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 text-6xl select-none pointer-events-none flex flex-wrap gap-4 p-4">
              {['🏛️','🫒','🌊','🏖️','🍷','🥾','🎭','🛒'].map((e, i) => <span key={i}>{e}</span>)}
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold text-white">{itinerary.title}</h2>
              <p className="text-white/80 mt-1">{itinerary.tagline}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
                  {days} {t('day')}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full capitalize">
                  {style}
                </span>
              </div>
            </div>
          </div>

          {/* Saved indicator */}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-[var(--radius-xl)] text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              <span>Saved to your account & emailed to you</span>
            </div>
          )}

          {/* Day cards */}
          <div className="space-y-3">
            {itinerary.days.map((plan, i) => (
              <DayCard key={plan.day} plan={plan} index={i} labels={slotLabels} />
            ))}
          </div>

          {/* Local phrase */}
          {itinerary.localPhrase && (
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">{t('greekPhrase')}</p>
              <p className="font-display text-2xl font-bold text-[var(--highlight)]">{itinerary.localPhrase.greek}</p>
              <p className="text-sm text-[var(--color-muted-foreground)] italic">&quot;{itinerary.localPhrase.pronunciation}&quot;</p>
              <p className="text-sm text-[var(--color-foreground)] font-medium">{itinerary.localPhrase.meaning}</p>
            </div>
          )}

          {/* Packing tips */}
          {itinerary.packingTips?.length > 0 && (
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">{t('packingTips')}</p>
              <ul className="space-y-1.5">
                {itinerary.packingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                    <span className="text-[var(--highlight)] font-bold shrink-0">·</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[var(--color-border)] rounded-[var(--radius-full)] font-semibold hover:border-[var(--highlight)] transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> {t('startOver')}
            </button>
            <button
              onClick={share}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] font-semibold hover:opacity-90 transition-opacity"
            >
              <Share2 className="h-4 w-4" /> {t('shareTrip')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
