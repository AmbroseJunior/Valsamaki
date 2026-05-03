import { Suspense } from 'react'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import { NewsPanel } from '@/components/dashboard/NewsPanel'
import { TrendingWidget } from '@/components/dashboard/TrendingWidget'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { MapView } from '@/components/map/MapView'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Discover Crete' }

export default function GuestHomePage() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-balance">
          Discover <span className="text-[var(--color-primary)]">Authentic Crete</span>
        </h1>
        <p className="text-lg text-[var(--color-muted-foreground)] max-w-xl mx-auto">
          Local producers, events, and AI-guided exploration of the Mediterranean diet — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg">
            <Link href="/register">Get Started — It&apos;s Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Map Preview */}
      <section>
        <h2 className="text-xl font-display font-semibold mb-3">Explore the Map</h2>
        <div className="h-72 md:h-96 rounded-[var(--radius-xl)] overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-md)]">
          <MapView zoom={10} />
        </div>
      </section>

      {/* Widgets Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Suspense fallback={<PageLoader />}>
          <WeatherWidget />
        </Suspense>
        <div className="md:col-span-2">
          <Suspense fallback={<PageLoader />}>
            <TrendingWidget />
          </Suspense>
        </div>
      </section>

      {/* News */}
      <section>
        <Suspense fallback={<PageLoader />}>
          <NewsPanel />
        </Suspense>
      </section>

      {/* Footer attribution */}
      <footer className="text-center text-xs text-[var(--color-muted-foreground)] py-4 border-t border-[var(--color-border)]">
        Powered By Valsamaki 2026
      </footer>
    </div>
  )
}
