import { createClient } from '@/lib/supabase/server'
import { EXPERIENCES, getFeaturedExperiences } from '@/lib/data/experiences'
import type { UserPreferences } from '@/types/app'
import type { ExperienceCategory } from '@/types/experience'
import { Sparkles, Calendar, MapPin, ArrowRight, Utensils } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const INTEREST_EXP_CATS: Record<string, ExperienceCategory[]> = {
  local_food:  ['food_tour', 'market'],
  olive_oil:   ['organic'],
  hiking:      ['active'],
  history:     ['cultural'],
  wellness:    ['wellness'],
  wine:        ['winery'],
}

const INTEREST_BIZ_CATS: Record<string, string> = {
  local_food: 'restaurant',
  olive_oil:  'olive_farm',
  wine:       'winery',
  wellness:   'herb_farm',
}

const INTEREST_EVENT_CATS: Record<string, string[]> = {
  local_food: ['food_wine', 'market', 'workshop'],
  olive_oil:  ['food_wine', 'market'],
  hiking:     ['outdoor', 'sports'],
  history:    ['culture'],
  wellness:   ['workshop'],
  wine:       ['food_wine'],
}

const DIET_NOTE: Record<string, string> = {
  vegetarian:  'vegetarian-friendly',
  vegan:       'plant-based',
  pescatarian: 'seafood-inclusive',
  gluten_free: 'gluten-free',
}

function getRecommendedExperiences(prefs: UserPreferences | null) {
  if (!prefs?.interests?.length) return getFeaturedExperiences().slice(0, 4)

  const catsSet = new Set(prefs.interests.flatMap((i) => INTEREST_EXP_CATS[i] ?? []))
  let matches = EXPERIENCES.filter((e) => catsSet.has(e.category as ExperienceCategory))

  // Sort active experiences first/last based on activity level
  if (prefs.activity_level === 'high') {
    matches = [...matches.filter((e) => e.category === 'active'), ...matches.filter((e) => e.category !== 'active')]
  } else if (prefs.activity_level === 'low') {
    matches = [...matches.filter((e) => e.category !== 'active'), ...matches.filter((e) => e.category === 'active')]
  }

  // Fill with featured if not enough matches
  if (matches.length < 4) {
    const seen = new Set(matches.map((e) => e.id))
    const extras = getFeaturedExperiences().filter((e) => !seen.has(e.id))
    matches = [...matches, ...extras]
  }

  return matches.slice(0, 4)
}

function getEventCategories(prefs: UserPreferences | null): string[] {
  if (!prefs?.interests?.length) return []
  return Array.from(new Set(prefs.interests.flatMap((i) => INTEREST_EVENT_CATS[i] ?? [])))
}

function getBizCategories(prefs: UserPreferences | null): string[] {
  if (!prefs?.interests?.length) return []
  return Array.from(new Set(prefs.interests.map((i) => INTEREST_BIZ_CATS[i]).filter(Boolean) as string[]))
}

function buildContextLabel(prefs: UserPreferences | null): string {
  if (!prefs?.interests?.length) return 'Popular experiences across Crete'
  const parts: string[] = []
  const pretty: Record<string, string> = {
    local_food: 'local food', olive_oil: 'olive oil', hiking: 'hiking',
    history: 'history', wellness: 'wellness', wine: 'wine',
  }
  const top = prefs.interests.slice(0, 2).map((i) => pretty[i] ?? i)
  parts.push(`Based on your interest in ${top.join(' & ')}`)
  if (prefs.dietary_preference && DIET_NOTE[prefs.dietary_preference]) {
    parts.push(`${DIET_NOTE[prefs.dietary_preference]} options highlighted`)
  }
  return parts.join(' · ')
}

export async function PersonalizedSection({ preferences }: { preferences: UserPreferences | null }) {
  const supabase = await createClient()
  const recExps = getRecommendedExperiences(preferences)
  const eventCats = getEventCategories(preferences)
  const bizCats = getBizCategories(preferences)
  const hasPrefs = !!preferences?.interests?.length

  const [eventsResult, bizResult] = await Promise.all([
    eventCats.length
      ? supabase
          .from('events')
          .select('id, title, category, event_date, address, price')
          .eq('is_active', true)
          .gte('event_date', new Date().toISOString())
          .in('category', eventCats)
          .order('event_date', { ascending: true })
          .limit(4)
      : supabase
          .from('events')
          .select('id, title, category, event_date, address, price')
          .eq('is_active', true)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(4),
    bizCats.length
      ? supabase
          .from('businesses')
          .select('id, name, category, address, description')
          .eq('is_active', true)
          .in('category', bizCats)
          .limit(4)
      : supabase
          .from('businesses')
          .select('id, name, category, address, description')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4),
  ])

  const events = (eventsResult.data ?? []) as Array<{
    id: string; title: string; category: string | null
    event_date: string; address: string | null; price: number | null
  }>
  const businesses = (bizResult.data ?? []) as Array<{
    id: string; name: string; category: string | null; address: string | null; description: string | null
  }>

  const categoryEmoji: Record<string, string> = {
    food_tour: '🍽️', market: '🛒', organic: '🫒', active: '🥾',
    cultural: '🏛️', wellness: '💆', winery: '🍷',
  }

  const bizEmoji: Record<string, string> = {
    restaurant: '🍽️', olive_farm: '🫒', winery: '🍷',
    herb_farm: '🌿', dairy: '🧀', apiary: '🍯', market: '🛒',
  }

  return (
    <div className="space-y-6">
      {/* Recommended Experiences */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--highlight)]" />
              {hasPrefs ? 'For You' : 'Featured Experiences'}
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {buildContextLabel(preferences)}
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recExps.map((exp) => (
            <Link
              key={exp.id}
              href={`/explore?q=${encodeURIComponent(exp.title)}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-muted)]">
                {exp.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={exp.images[0]}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="text-lg">{categoryEmoji[exp.category] ?? '✨'}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{exp.title}</p>
                  <p className="text-white/70 text-[10px] mt-0.5 flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />{exp.location}
                  </p>
                </div>
              </div>
              {exp.price && (
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1 px-0.5 truncate">
                  {exp.price}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Events + Local Producers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Events */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--highlight)]" />
              {hasPrefs ? "Events You'll Love" : 'Upcoming Events'}
            </h2>
            <Link href="/events" className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {events.length > 0 ? (
            <ul className="divide-y divide-[var(--color-border)]">
              {events.map((evt) => (
                <li key={evt.id}>
                  <Link href="/events" className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--color-muted)] transition-colors">
                    <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--highlight)]/10 flex items-center justify-center text-base">
                      🎉
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{evt.title}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {formatDate(evt.event_date)}
                        {evt.address ? ` · ${evt.address}` : ''}
                      </p>
                      {evt.price !== null && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-[var(--highlight)]/10 text-[var(--highlight)] px-1.5 py-0.5 rounded-full">
                          {evt.price === 0 ? 'Free' : `€${evt.price}`}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <span className="text-2xl">🗓️</span>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No upcoming events yet.</p>
              <Link href="/events" className="mt-2 block text-xs text-[var(--highlight)] font-semibold hover:underline">
                Browse all events
              </Link>
            </div>
          )}
        </div>

        {/* Local Producers */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-[var(--highlight)]" />
              Local Producers
            </h2>
            <Link href="/map" className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1">
              View map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {businesses.length > 0 ? (
            <ul className="divide-y divide-[var(--color-border)]">
              {businesses.map((biz) => (
                <li key={biz.id}>
                  <Link href="/map" className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--color-muted)] transition-colors">
                    <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--highlight)]/10 flex items-center justify-center text-base">
                      {bizEmoji[biz.category ?? ''] ?? '🏪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{biz.name}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 capitalize">
                        {biz.category?.replace('_', ' ')}
                        {biz.address ? ` · ${biz.address}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <span className="text-2xl">🏪</span>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No producers listed yet.</p>
              <Link href="/explore" className="mt-2 block text-xs text-[var(--highlight)] font-semibold hover:underline">
                Explore experiences
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
