'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { UserPreferences, Motivation, Improvement, Feeling, DietChoice } from '@/types/app'
import type { Json } from '@/types/database'

// ── Customer questionnaire ────────────────────────────────────────────────────

type MultiKey = 'motivations' | 'improvements' | 'current_feelings' | 'diet'
type CustomerAnswers = Partial<UserPreferences> & { diet_other?: string }

const CUSTOMER_STEPS = [
  {
    key: 'motivations' as MultiKey,
    q: 'Q1 — What brings you here?',
    hint: 'Pick up to 2',
    max: 2,
    options: [
      { value: 'eat_well', label: 'I want to eat well and enjoy local food' },
      { value: 'health_science', label: "I'm focused on my health and want science-backed guidance" },
      { value: 'recovering', label: "I'm recovering and want to support my body" },
      { value: 'better_habits', label: 'I want to build better long-term habits' },
      { value: 'cretan_diet', label: 'I\'m curious about the Cretan diet and its benefits' },
    ] as { value: Motivation; label: string }[],
  },
  {
    key: 'improvements' as MultiKey,
    q: 'Q2 — What would you most like to improve?',
    hint: 'Pick up to 3',
    max: 3,
    options: [
      { value: 'energy', label: 'Energy and vitality' },
      { value: 'digestion', label: 'Digestion and gut health' },
      { value: 'inflammation', label: 'Inflammation' },
      { value: 'heart_health', label: 'Heart health and circulation' },
      { value: 'mental_clarity', label: 'Mental clarity and stress' },
      { value: 'healthy_ageing', label: 'Healthy ageing and longevity' },
      { value: 'therapy', label: 'Relief/therapy for a specific health condition' },
    ] as { value: Improvement; label: string }[],
  },
  {
    key: 'current_feelings' as MultiKey,
    q: 'Q3 — How have you been feeling recently?',
    hint: 'Select all that apply',
    max: Infinity,
    options: [
      { value: 'tired', label: 'Tired or low-energy' },
      { value: 'bloated', label: 'Bloated or digestive discomfort' },
      { value: 'frequent_colds', label: 'Frequent colds or slow recovery' },
      { value: 'stressed', label: 'Stressed, anxious or mentally foggy' },
      { value: 'joint_pain', label: 'Stiff joints or general inflammation or pain' },
      { value: 'feeling_good', label: "I've been feeling pretty good overall" },
    ] as { value: Feeling; label: string }[],
  },
  {
    key: 'diet' as MultiKey,
    q: 'Q4 — How would you describe your current diet?',
    hint: 'Select all that apply',
    max: Infinity,
    options: [
      { value: 'plant_based', label: 'Plant-based' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'pescetarian', label: 'Pescetarian' },
      { value: 'keto', label: 'Keto' },
      { value: 'omnivore', label: 'Everything including meat and dairy' },
      { value: 'avoid_dairy', label: 'I avoid dairy' },
      { value: 'avoid_gluten', label: 'I avoid gluten' },
      { value: 'other', label: 'Other' },
    ] as { value: DietChoice; label: string }[],
  },
]

function CustomerOnboarding({ userId }: { userId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<CustomerAnswers>({})
  const [saving, setSaving] = useState(false)

  const current = CUSTOMER_STEPS[step]

  function toggle(value: string) {
    const arr = (answers[current.key] as string[] | undefined) ?? []
    const exists = arr.includes(value)
    if (!exists && arr.length >= current.max) return
    setAnswers((p) => ({ ...p, [current.key]: exists ? arr.filter((v) => v !== value) : [...arr, value] }))
  }

  function isSelected(value: string) {
    return ((answers[current.key] as string[] | undefined) ?? []).includes(value)
  }

  const atMax = ((answers[current.key] as string[] | undefined) ?? []).length >= current.max

  async function finish() {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({ preferences: answers as Json }).eq('id', userId)
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const canAdvance = ((answers[current.key] as string[] | undefined) ?? []).length > 0

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {CUSTOMER_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn('h-1.5 rounded-full transition-all', i <= step ? 'bg-[var(--highlight)] flex-[2]' : 'bg-[var(--color-border)] flex-1')}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[var(--color-card)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
                <p className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Step {step + 1} of {CUSTOMER_STEPS.length}</p>
                <h2 className="font-display font-bold text-xl text-[var(--color-foreground)] leading-snug">{current.q}</h2>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{current.hint}</p>
              </div>

              <div className="p-4 space-y-2">
                {current.options.map((opt) => {
                  const selected = isSelected(opt.value)
                  const disabled = !selected && atMax
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      disabled={disabled}
                      className={cn(
                        'w-full text-left px-4 py-3.5 rounded-[var(--radius-xl)] border-2 text-sm font-medium transition-all',
                        selected
                          ? 'bg-[var(--highlight)]/10 border-[var(--highlight)] text-[var(--color-foreground)]'
                          : disabled
                          ? 'border-[var(--color-border)] text-[var(--color-muted-foreground)] opacity-40'
                          : 'border-[var(--color-border)] hover:border-[var(--highlight)]/50 hover:bg-[var(--color-muted)] text-[var(--color-foreground)]'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                          selected ? 'bg-[var(--highlight)] border-[var(--highlight)]' : 'border-[var(--color-border)]'
                        )}>
                          {selected && <svg className="w-3 h-3 text-[var(--highlight-foreground)]" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}

                {/* "Other" text field for diet step */}
                {current.key === 'diet' && isSelected('other') && (
                  <input
                    type="text"
                    placeholder="Please describe your diet…"
                    value={answers.diet_other ?? ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, diet_other: e.target.value }))}
                    className="w-full mt-1 px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] text-sm font-semibold disabled:opacity-30 hover:bg-[var(--color-muted)] transition-colors"
          >
            ← Back
          </button>
          {step < CUSTOMER_STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="flex-1 py-2.5 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] text-sm font-bold disabled:opacity-40 hover:bg-[var(--highlight-dark)] transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canAdvance || saving}
              className="flex-1 py-2.5 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] text-sm font-bold disabled:opacity-40 hover:bg-[var(--highlight-dark)] transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Explore Crete 🫒'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Producer questionnaire ────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'olive_farm', label: 'Olive oil producer' },
  { value: 'apiary', label: 'Honey producer' },
  { value: 'dairy', label: 'Dairy farm / cheese maker' },
  { value: 'herb_farm', label: 'Herb & tea grower' },
  { value: 'vegetable_farm', label: 'Vegetable / fruit grower' },
  { value: 'farmers_market', label: 'Farmers market / marketplace' },
  { value: 'wellness', label: 'Wellness centre / spa' },
  { value: 'restaurant', label: 'Restaurant / taverna' },
  { value: 'food_tour', label: 'Food tour / experience operator' },
  { value: 'other', label: 'Other' },
]

const PRODUCT_TAGS = [
  'Extra virgin olive oil', 'Raw / thyme honey', 'Sheep or goat dairy',
  'Wild greens / herbs', 'Mountain tea', 'Organic certified', 'PDO / PGI certified',
  'Vegetarian', 'Vegan', 'Gluten free',
]

const EXPERIENCE_OPTIONS = [
  { value: 'farm_tours', label: 'Farm tours / tastings' },
  { value: 'cooking_classes', label: 'Cooking classes' },
  { value: 'harvest_experiences', label: 'Harvest experiences' },
  { value: 'on_site_shop', label: 'Pickup / on-site shop' },
  { value: 'delivery', label: 'Delivery to accommodation' },
  { value: 'none', label: 'None — products only' },
]

const PRICE_RANGES = [
  { value: 'free', label: 'Free' },
  { value: 'under10', label: 'Under €10' },
  { value: 'ten_30', label: '€10–€30' },
  { value: 'thirty_60', label: '€30–€60' },
  { value: 'over60', label: '€60+' },
]

interface Product {
  name: string
  why: string
  tags: string[]
}

interface ProducerAnswers {
  name: string
  category: string
  category_other: string
  address: string
  phone: string
  website: string
  instagram: string
  hours: string
  products: Product[]
  experiences: string[]
  price_range: string
  notes: string
}

function ProducerOnboarding({ userId }: { userId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [a, setA] = useState<ProducerAnswers>({
    name: '', category: '', category_other: '', address: '',
    phone: '', website: '', instagram: '', hours: '',
    products: [{ name: '', why: '', tags: [] }],
    experiences: [], price_range: '', notes: '',
  })

  function updateProduct(i: number, field: keyof Product, val: string | string[]) {
    setA((p) => {
      const prods = [...p.products]
      prods[i] = { ...prods[i], [field]: val }
      return { ...p, products: prods }
    })
  }

  function toggleProductTag(i: number, tag: string) {
    const tags = a.products[i].tags
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    updateProduct(i, 'tags', next)
  }

  function toggleExperience(val: string) {
    setA((p) => ({
      ...p,
      experiences: p.experiences.includes(val)
        ? p.experiences.filter((e) => e !== val)
        : [...p.experiences, val],
    }))
  }

  const TOTAL_STEPS = 9

  function canAdvanceStep() {
    switch (step) {
      case 0: return a.name.trim().length > 0
      case 1: return a.category.length > 0
      case 2: return a.address.trim().length > 0
      case 3: return a.phone.trim().length > 0 && a.hours.trim().length > 0
      case 4: return a.products[0].name.trim().length > 0 && a.products[0].why.trim().length > 0
      case 5: return a.experiences.length > 0
      case 6: return a.price_range.length > 0
      case 7: return true
      case 8: return true
      default: return true
    }
  }

  async function finish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const validProds = a.products.filter((p) => p.name.trim())
      const description = [
        ...validProds.map((p) => `${p.name}: ${p.why}`),
        a.instagram ? `Instagram: ${a.instagram}` : null,
        a.hours ? `Hours: ${a.hours}` : null,
        a.notes ? a.notes : null,
      ].filter(Boolean).join('\n\n')

      const tags: string[] = [
        ...validProds.flatMap((p) => p.tags),
        ...a.experiences.map((e) => `experience:${e}`),
        a.price_range ? `price:${a.price_range}` : null,
      ].filter(Boolean) as string[]

      await supabase.from('businesses').insert({
        owner_id: userId,
        name: a.name.trim(),
        category: a.category === 'other' ? (a.category_other || 'other') : a.category,
        address: a.address.trim() || null,
        phone: a.phone.trim() || null,
        website: a.website.trim() || null,
        description: description || null,
        tags,
        images: [],
        is_active: false,
      })

      router.push('/business')
    } finally {
      setSaving(false)
    }
  }

  const STEP_TITLES = [
    'Q1. What is your business name?',
    'Q2. What is the primary type of producer/business you run?',
    'Q3. Where are you located?',
    'Q4. How can visitors contact or find you?',
    'Q5. Tell us about your products',
    'Q6. Do you offer any experiences for visitors?',
    'Q7. Approximate price range per person or per product?',
    'Q8. Do you have any photos you\'d like to upload?',
    'Q9. Anything else you want visitors to know?',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-[var(--highlight)]' : 'bg-[var(--color-border)]')}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[var(--color-card)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)]">
                <p className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">Step {step + 1} of {TOTAL_STEPS}</p>
                <h2 className="font-display font-bold text-xl text-[var(--color-foreground)] leading-snug">{STEP_TITLES[step]}</h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Q1: Business name */}
                {step === 0 && (
                  <input
                    type="text"
                    placeholder="e.g. Manolis Olive Farm"
                    value={a.name}
                    onChange={(e) => setA((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                )}

                {/* Q2: Business type */}
                {step === 1 && (
                  <div className="space-y-2">
                    {BUSINESS_TYPES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setA((p) => ({ ...p, category: value }))}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-[var(--radius-xl)] border-2 text-sm font-medium transition-all',
                          a.category === value
                            ? 'bg-[var(--highlight)]/10 border-[var(--highlight)]'
                            : 'border-[var(--color-border)] hover:border-[var(--highlight)]/50'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                    {a.category === 'other' && (
                      <input
                        type="text"
                        placeholder="Describe your business type…"
                        value={a.category_other}
                        onChange={(e) => setA((p) => ({ ...p, category_other: e.target.value }))}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                      />
                    )}
                  </div>
                )}

                {/* Q3: Location */}
                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--color-muted-foreground)]">Map pin drop + optional address text — so it appears correctly on the Valsamaki map</p>
                    <input
                      type="text"
                      placeholder="e.g. 25 Eleftheriou Venizelou, Heraklion, Crete"
                      value={a.address}
                      onChange={(e) => setA((p) => ({ ...p, address: e.target.value }))}
                      className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                    />
                  </div>
                )}

                {/* Q4: Contact info */}
                {step === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1 block">Phone number *</label>
                      <input type="tel" placeholder="+30 281 000 0000" value={a.phone} onChange={(e) => setA((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1 block">Website (optional)</label>
                      <input type="url" placeholder="https://..." value={a.website} onChange={(e) => setA((p) => ({ ...p, website: e.target.value }))}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1 block">Instagram handle (optional)</label>
                      <input type="text" placeholder="@yourhandle" value={a.instagram} onChange={(e) => setA((p) => ({ ...p, instagram: e.target.value }))}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] mb-1 block">Opening hours *</label>
                      <input type="text" placeholder="e.g. Mon–Sat 09:00–18:00" value={a.hours} onChange={(e) => setA((p) => ({ ...p, hours: e.target.value }))}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow" />
                    </div>
                  </div>
                )}

                {/* Q5: Products */}
                {step === 4 && (
                  <div className="space-y-6">
                    <p className="text-sm text-[var(--color-muted-foreground)]">Add each product separately (up to 3).</p>
                    {a.products.map((prod, i) => (
                      <div key={i} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 space-y-3">
                        <p className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase">Product {i + 1}</p>
                        <input type="text" placeholder="Product name" value={prod.name} onChange={(e) => updateProduct(i, 'name', e.target.value)}
                          className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow" />
                        <textarea placeholder='Why it belongs on Valsamaki — e.g. "Our raw thyme honey is harvested from wild Cretan hillsides..."'
                          value={prod.why} onChange={(e) => updateProduct(i, 'why', e.target.value)} rows={3}
                          className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow resize-none" />
                        <div>
                          <p className="text-xs font-bold text-[var(--color-muted-foreground)] mb-2">Tags — select all that apply:</p>
                          <div className="flex flex-wrap gap-2">
                            {PRODUCT_TAGS.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleProductTag(i, tag)}
                                className={cn(
                                  'text-xs px-3 py-1.5 rounded-full border transition-colors',
                                  prod.tags.includes(tag)
                                    ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                                    : 'border-[var(--color-border)] hover:border-[var(--highlight)] text-[var(--color-muted-foreground)]'
                                )}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {a.products.length < 3 && (
                      <button
                        type="button"
                        onClick={() => setA((p) => ({ ...p, products: [...p.products, { name: '', why: '', tags: [] }] }))}
                        className="w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] text-sm font-semibold text-[var(--color-muted-foreground)] hover:border-[var(--highlight)] hover:text-[var(--highlight)] transition-colors"
                      >
                        + Add product {a.products.length + 1}
                      </button>
                    )}
                  </div>
                )}

                {/* Q6: Experiences */}
                {step === 5 && (
                  <div className="space-y-2">
                    {EXPERIENCE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleExperience(value)}
                        className={cn(
                          'w-full text-left px-4 py-3.5 rounded-[var(--radius-xl)] border-2 text-sm font-medium transition-all flex items-center gap-3',
                          a.experiences.includes(value)
                            ? 'bg-[var(--highlight)]/10 border-[var(--highlight)]'
                            : 'border-[var(--color-border)] hover:border-[var(--highlight)]/50'
                        )}
                      >
                        <span className={cn('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0', a.experiences.includes(value) ? 'bg-[var(--highlight)] border-[var(--highlight)]' : 'border-[var(--color-border)]')}>
                          {a.experiences.includes(value) && <svg className="w-3 h-3 text-[var(--highlight-foreground)]" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Q7: Price range */}
                {step === 6 && (
                  <div className="space-y-2">
                    {PRICE_RANGES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setA((p) => ({ ...p, price_range: value }))}
                        className={cn(
                          'w-full text-left px-4 py-3.5 rounded-[var(--radius-xl)] border-2 text-sm font-medium transition-all',
                          a.price_range === value
                            ? 'bg-[var(--highlight)]/10 border-[var(--highlight)]'
                            : 'border-[var(--color-border)] hover:border-[var(--highlight)]/50'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Q8: Photos */}
                {step === 7 && (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 rounded-[var(--radius-2xl)] bg-[var(--color-muted)] flex items-center justify-center mx-auto text-3xl">📷</div>
                    <p className="text-sm text-[var(--color-foreground)] font-semibold">Upload up to 5 photos</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">You can add photos after registration from your business dashboard.</p>
                  </div>
                )}

                {/* Q9: Notes */}
                {step === 8 && (
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-muted-foreground)]">Optional — seasonal availability, booking required, family-friendly, etc.</p>
                    <textarea
                      placeholder="e.g. Open April–October. Booking required for tastings."
                      value={a.notes}
                      onChange={(e) => setA((p) => ({ ...p, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] text-sm font-semibold disabled:opacity-30 hover:bg-[var(--color-muted)] transition-colors"
          >
            ← Back
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvanceStep()}
              className="flex-1 py-2.5 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] text-sm font-bold disabled:opacity-40 hover:bg-[var(--highlight-dark)] transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="flex-1 py-2.5 bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius-full)] text-sm font-bold disabled:opacity-40 hover:bg-[var(--highlight-dark)] transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Submit listing 🫒'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root — detect role and branch ─────────────────────────────────────────────

export default function OnboardingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      setRole(profile?.role ?? 'user')
    })
  }, [])

  if (!userId || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return role === 'producer'
    ? <ProducerOnboarding userId={userId} />
    : <CustomerOnboarding userId={userId} />
}
