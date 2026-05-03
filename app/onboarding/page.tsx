'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { UserPreferences } from '@/types/app'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    key: 'reason_for_visit',
    title: 'Why are you here?',
    description: 'Help us personalise your experience',
    options: [
      { value: 'tourist', label: '🗺️ Tourist exploring Crete' },
      { value: 'local', label: '🏘️ Local resident' },
      { value: 'business', label: '🤝 Business / Producer' },
      { value: 'researcher', label: '🔬 Researcher / Academic' },
    ],
  },
  {
    key: 'interests',
    title: 'What interests you most?',
    description: 'Select all that apply',
    multi: true,
    options: [
      { value: 'food', label: '🍽️ Local food & cuisine' },
      { value: 'olive_oil', label: '🫒 Olive oil & producers' },
      { value: 'hiking', label: '🥾 Hiking & outdoor' },
      { value: 'history', label: '🏛️ History & archaeology' },
      { value: 'wellness', label: '💆 Wellness & health' },
      { value: 'wine', label: '🍷 Wine & vineyards' },
    ],
  },
  {
    key: 'dietary_preference',
    title: 'Dietary preference',
    description: 'We use this to tailor food recommendations',
    options: [
      { value: 'omnivore', label: '🥩 Omnivore' },
      { value: 'vegetarian', label: '🥗 Vegetarian' },
      { value: 'vegan', label: '🌱 Vegan' },
      { value: 'pescatarian', label: '🐟 Pescatarian' },
      { value: 'gluten_free', label: '🌾 Gluten-free' },
    ],
  },
  {
    key: 'activity_level',
    title: 'Activity level',
    description: 'How active are you while visiting?',
    options: [
      { value: 'low', label: '🛋️ Relaxed — cafés and beaches' },
      { value: 'moderate', label: '🚶 Moderate — some hiking & walks' },
      { value: 'high', label: '🏃 Active — daily outdoor adventures' },
    ],
  },
  {
    key: 'travel_radius_km',
    title: 'How far will you travel?',
    description: 'Maximum distance for recommendations',
    options: [
      { value: 5, label: '📍 5 km — walking distance' },
      { value: 20, label: '🚗 20 km — short drive' },
      { value: 50, label: '🛣️ 50 km — day trip' },
      { value: 150, label: '🗺️ All of Crete' },
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserPreferences>>({})
  const [saving, setSaving] = useState(false)
  const { userId } = useRole()
  const router = useRouter()

  const current = STEPS[step]

  function selectOption(key: string, value: unknown) {
    if (current.multi) {
      const arr = ((answers as Record<string, unknown>)[key] as string[]) ?? []
      const exists = arr.includes(value as string)
      setAnswers((prev) => ({ ...prev, [key]: exists ? arr.filter((v) => v !== value) : [...arr, value as string] }))
    } else {
      setAnswers((prev) => ({ ...prev, [key]: value }))
    }
  }

  function isSelected(key: string, value: unknown): boolean {
    const stored = (answers as Record<string, unknown>)[key]
    if (current.multi) return (stored as unknown[])?.includes(value) ?? false
    return stored === value
  }

  async function finish() {
    if (!userId) return
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({ preferences: answers as Json }).eq('id', userId)
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const canAdvance = current.multi
    ? ((answers as Record<string, unknown>)[current.key] as unknown[])?.length > 0
    : (answers as Record<string, unknown>)[current.key] !== undefined

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <p className="text-sm text-[var(--color-muted-foreground)]">Step {step + 1} of {STEPS.length}</p>
                <CardTitle className="text-xl">{current.title}</CardTitle>
                <CardDescription>{current.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {current.options.map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => selectOption(current.key, opt.value)}
                    className={`w-full text-left p-3 rounded-[var(--radius)] border text-sm font-medium transition-colors ${isSelected(current.key, opt.value) ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-muted)]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
              Next
            </Button>
          ) : (
            <Button onClick={finish} disabled={!canAdvance || saving}>
              {saving ? <LoadingSpinner size="sm" /> : 'Explore Crete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
