import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { PersonalizedSection } from '@/components/dashboard/PersonalizedSection'
import { LikedExperiencesSection } from '@/components/dashboard/LikedExperiencesSection'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { UserPreferences } from '@/types/app'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, preferences, location_lat, location_lng')
    .eq('id', user.id)
    .single()

  const t = await getTranslations('dashboard')

  const preferences = (profile?.preferences ?? null) as UserPreferences | null
  const firstName = profile?.name ? profile.name.split(' ')[0] : null

  const greetingContext = t('contextDefault')

  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {firstName ? t('welcomeBack', { name: firstName }) : t('yourDashboard')}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{greetingContext}</p>
      </div>

      <LikedExperiencesSection />

      <Suspense fallback={<PageLoader />}>
        <PersonalizedSection preferences={preferences} />
      </Suspense>

      <footer className="text-center text-xs text-[var(--color-muted-foreground)] pt-4 border-t border-[var(--color-border)]">
        {t('poweredBy')}
      </footer>
    </div>
  )
}
