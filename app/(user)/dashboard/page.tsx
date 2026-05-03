import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { NewsPanel } from '@/components/dashboard/NewsPanel'
import { TrendingWidget } from '@/components/dashboard/TrendingWidget'
import { PageLoader } from '@/components/shared/LoadingSpinner'
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

  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Your Dashboard'}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Personalised for your location and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Suspense fallback={<PageLoader />}>
          <WeatherWidget lat={lat} lng={lng} />
        </Suspense>
        <div className="md:col-span-2">
          <Suspense fallback={<PageLoader />}>
            <TrendingWidget />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<PageLoader />}>
        <NewsPanel />
      </Suspense>

      <footer className="text-center text-xs text-[var(--color-muted-foreground)] pt-4 border-t border-[var(--color-border)]">
        Powered By Valsamaki 2026
      </footer>
    </div>
  )
}
