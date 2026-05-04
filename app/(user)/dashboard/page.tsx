import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { NewsPanel } from '@/components/dashboard/NewsPanel'
import { PersonalizedSection } from '@/components/dashboard/PersonalizedSection'
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

  const lat = profile?.location_lat ?? 35.3387
  const lng = profile?.location_lng ?? 25.1442
  const preferences = (profile?.preferences ?? null) as UserPreferences | null
  const firstName = profile?.name ? profile.name.split(' ')[0] : null

  const greetingContext = preferences?.reason_for_visit === 'tourist'
    ? 'Discover authentic Crete — personalised for you'
    : preferences?.reason_for_visit === 'local'
    ? 'Your local guide to the best of Crete'
    : preferences?.reason_for_visit === 'researcher'
    ? 'Explore Cretan food culture, producers & traditions'
    : 'Personalised for your location and preferences'

  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {firstName ? `Welcome back, ${firstName}` : 'Your Dashboard'}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{greetingContext}</p>
      </div>

      <Suspense fallback={<PageLoader />}>
        <WeatherWidget lat={lat} lng={lng} />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <PersonalizedSection preferences={preferences} />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <NewsPanel />
      </Suspense>

      <footer className="text-center text-xs text-[var(--color-muted-foreground)] pt-4 border-t border-[var(--color-border)]">
        Powered By Valsamaki 2026
      </footer>
    </div>
  )
}
