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
import { useTranslations } from 'next-intl'

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserPreferences>>({})
  const [saving, setSaving] = useState(false)
  const { userId } = useRole()
  const router = useRouter()

  const STEPS = [
    {
      key: 'reason_for_visit',
      title: t('reasonForVisit.title'),
      description: t('reasonForVisit.description'),
      options: [
        { value: 'tourist', label: t('reasonForVisit.tourist') },
        { value: 'local', label: t('reasonForVisit.local') },
        { value: 'business', label: t('reasonForVisit.business') },
        { value: 'researcher', label: t('reasonForVisit.researcher') },
      ],
    },
    {
      key: 'interests',
      title: t('interests.title'),
      description: t('interests.description'),
      multi: true,
      options: [
        { value: 'food', label: t('interests.food') },
        { value: 'olive_oil', label: t('interests.olive_oil') },
        { value: 'hiking', label: t('interests.hiking') },
        { value: 'history', label: t('interests.history') },
        { value: 'wellness', label: t('interests.wellness') },
        { value: 'wine', label: t('interests.wine') },
      ],
    },
    {
      key: 'dietary_preference',
      title: t('dietaryPreference.title'),
      description: t('dietaryPreference.description'),
      options: [
        { value: 'omnivore', label: t('dietaryPreference.omnivore') },
        { value: 'vegetarian', label: t('dietaryPreference.vegetarian') },
        { value: 'vegan', label: t('dietaryPreference.vegan') },
        { value: 'pescatarian', label: t('dietaryPreference.pescatarian') },
        { value: 'gluten_free', label: t('dietaryPreference.gluten_free') },
      ],
    },
    {
      key: 'activity_level',
      title: t('activityLevel.title'),
      description: t('activityLevel.description'),
      options: [
        { value: 'low', label: t('activityLevel.low') },
        { value: 'moderate', label: t('activityLevel.moderate') },
        { value: 'high', label: t('activityLevel.high') },
      ],
    },
    {
      key: 'travel_radius_km',
      title: t('travelRadius.title'),
      description: t('travelRadius.description'),
      options: [
        { value: 5, label: t('travelRadius.km5') },
        { value: 20, label: t('travelRadius.km20') },
        { value: 50, label: t('travelRadius.km50') },
        { value: 150, label: t('travelRadius.kmAll') },
      ],
    },
  ]

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
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('stepOf', { step: step + 1, total: STEPS.length })}</p>
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
            {t('back')}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
              {t('next')}
            </Button>
          ) : (
            <Button onClick={finish} disabled={!canAdvance || saving}>
              {saving ? <LoadingSpinner size="sm" /> : t('exploreCrete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
