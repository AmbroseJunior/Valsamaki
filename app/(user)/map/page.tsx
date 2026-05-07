'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Search, X, MapPin, Phone, Globe, Calendar, Ticket, Star, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/hooks/useLocation'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency } from '@/lib/utils'
import { validateUrl } from '@/lib/security'
import type { BusinessRow, EventRow } from '@/types/database'
import type { MapMarker, RouteTarget, RouteInfo } from '@/components/map/MapView'
import { FARMERS_MARKETS } from '@/lib/data/farmersMarkets'
import type { FarmersMarket } from '@/lib/data/farmersMarkets'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import type { Experience } from '@/types/experience'
import { SCRAPED_PLACES } from '@/lib/data/scrapedPlaces'
import type { CretePlace } from '@/lib/data/scrapedPlaces'

const ALL_MAP_EXPERIENCES: Experience[] = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]

const MapView = dynamic(
  () => import('@/components/map/MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-full bg-[var(--color-muted)] animate-pulse rounded-[var(--radius)]" /> }
)

type TabType = 'all' | 'events' | 'markets' | 'sights' | 'experiences'
type RouteMode = 'walking' | 'transit' | 'driving'

type BusinessWithOwner = BusinessRow & {
  profiles?: { role: string; name: string | null } | null
}

// ── Shared direction panel props ──────────────────────────────────────────────

interface RoutePanelProps {
  activeRouteMode: RouteMode | null
  onRouteMode: (mode: RouteMode | null) => void
  routeInfo: RouteInfo | null
  routeLoading: boolean
  hasCoords: boolean
}

// ── Route metrics card ────────────────────────────────────────────────────────

function fmtMins(s: number) {
  const m = Math.round(s / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`
}

function RouteMetricsCard({ mode, info }: { mode: RouteMode; info: RouteInfo }) {
  const { distanceM, durationS } = info

  // Derived metrics
  const steps      = Math.round(distanceM / 0.762)
  const calories   = Math.round(distanceM * 0.065)          // ~65 kcal/km walking
  const co2g       = Math.round(distanceM * 0.12)           // 120 g CO₂/km avg car
  const fuelEur    = ((distanceM / 1000) * 7 / 100 * 1.85).toFixed(2) // 7 L/100 km @ €1.85

  // Estimated times for all 3 modes (ratios from the known mode)
  const walkS  = mode === 'walking'  ? durationS : mode === 'driving' ? durationS * 4.2 : durationS * 1.8
  const busS   = mode === 'transit'  ? durationS : mode === 'driving' ? durationS * 2.4 : durationS * 0.55
  const driveS = mode === 'driving'  ? durationS : mode === 'walking' ? durationS * 0.24 : durationS * 0.42
  const maxS   = Math.max(walkS, busS, driveS)

  const modeConfig = {
    walking: {
      color: 'text-green-700 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/40',
      border: 'border-green-300 dark:border-green-700',
      barColor: 'bg-green-500',
      metrics: [
        { icon: '👣', label: 'Steps',    value: steps.toLocaleString() },
        { icon: '🔥', label: 'Calories', value: `~${calories} kcal` },
        { icon: '🌱', label: 'CO₂',      value: 'Zero' },
      ],
    },
    transit: {
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-300 dark:border-blue-700',
      barColor: 'bg-blue-500',
      metrics: [
        { icon: '🪙', label: 'Est. fare',   value: '~€1.20' },
        { icon: '🌱', label: 'CO₂ saved',   value: `−${Math.round(co2g * 0.7)} g` },
        { icon: '♿', label: 'Accessible',  value: 'Most stops' },
      ],
    },
    driving: {
      color: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-300 dark:border-red-700',
      barColor: 'bg-red-500',
      metrics: [
        { icon: '⛽', label: 'Fuel est.', value: `~€${fuelEur}` },
        { icon: '💨', label: 'CO₂',       value: `~${co2g} g` },
        { icon: '🅿️', label: 'Parking',   value: 'Plan ahead' },
      ],
    },
  }

  const cfg = modeConfig[mode]
  const bars = [
    { icon: '🚶', label: 'Walk',  s: walkS,  barCls: 'bg-green-400', active: mode === 'walking' },
    { icon: '🚌', label: 'Bus',   s: busS,   barCls: 'bg-blue-400',  active: mode === 'transit' },
    { icon: '🚕', label: 'Drive', s: driveS, barCls: 'bg-red-400',   active: mode === 'driving' },
  ]

  return (
    <div className={`rounded-[var(--radius-xl)] border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Header — duration + distance */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
        <div>
          <p className={`text-2xl font-bold leading-tight ${cfg.color}`}>{info.duration}</p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
            {info.distance} from your location
          </p>
        </div>
        <span className="text-3xl leading-none">
          {mode === 'walking' ? '🚶' : mode === 'transit' ? '🚌' : '🚕'}
        </span>
      </div>

      {/* Metrics row — 3 columns */}
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
        {cfg.metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-0.5 px-2 py-3 text-center">
            <span className="text-base leading-none">{m.icon}</span>
            <p className="text-[11px] font-bold text-[var(--color-foreground)] mt-1 leading-tight">{m.value}</p>
            <p className="text-[9px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Mode comparison bars */}
      <div className="px-3 pb-3 pt-2 border-t border-inherit space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
          Mode comparison
        </p>
        {bars.map(({ icon, label, s, barCls, active }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-4 shrink-0">{icon}</span>
            <div className="flex-1 bg-[var(--color-border)] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barCls} ${active ? 'opacity-100' : 'opacity-40'}`}
                style={{ width: `${Math.max(6, (s / maxS) * 100)}%` }}
              />
            </div>
            <span className={cn(
              'text-[10px] font-semibold w-12 text-right shrink-0',
              active ? cfg.color : 'text-[var(--color-muted-foreground)]'
            )}>
              {fmtMins(s)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Direction buttons ─────────────────────────────────────────────────────────

function DirectionButtons({ activeRouteMode, onRouteMode, routeInfo, routeLoading, hasCoords }: RoutePanelProps) {
  const t = useTranslations('map')
  const isCalculating = routeLoading && activeRouteMode !== null

  const modes: { label: string; icon: string; mode: RouteMode }[] = [
    { label: t('walk'), icon: '🚶', mode: 'walking' },
    { label: t('bus'),  icon: '🚌', mode: 'transit' },
    { label: t('drive'),icon: '🚕', mode: 'driving' },
  ]
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">
        {t('getDirections')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {modes.map(({ label, icon, mode }) => (
          <button
            key={mode}
            onClick={() => onRouteMode(activeRouteMode === mode ? null : mode)}
            disabled={!hasCoords}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 rounded-[var(--radius-lg)] border transition-colors text-center',
              activeRouteMode === mode
                ? 'border-[var(--highlight)] bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                : 'border-[var(--color-border)] hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/5',
              !hasCoords && 'opacity-40 cursor-not-allowed'
            )}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Loading skeleton while OSRM calculates */}
      {isCalculating && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 animate-pulse space-y-2">
          <div className="flex justify-between">
            <div className="h-6 w-16 bg-[var(--color-muted)] rounded" />
            <div className="h-8 w-8 bg-[var(--color-muted)] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0,1,2].map(i => <div key={i} className="h-10 bg-[var(--color-muted)] rounded" />)}
          </div>
          <div className="space-y-1.5">
            {[0,1,2].map(i => <div key={i} className="h-2.5 bg-[var(--color-muted)] rounded-full" />)}
          </div>
        </div>
      )}

      {/* Rich metrics card */}
      {routeInfo && activeRouteMode && !isCalculating && (
        <RouteMetricsCard mode={activeRouteMode} info={routeInfo} />
      )}

      {!hasCoords && (
        <p className="text-[10px] text-[var(--color-muted-foreground)] text-center italic">
          No map coordinates — directions unavailable
        </p>
      )}
    </div>
  )
}

// ── Detail panels ─────────────────────────────────────────────────────────────

function BusinessPanel({
  business,
  isProducer = false,
  onClose,
  routeProps,
}: {
  business: BusinessWithOwner
  isProducer?: boolean
  onClose: () => void
  routeProps: RoutePanelProps
}) {
  const t = useTranslations('map')
  const headerBg = isProducer ? 'bg-[var(--color-primary)]' : 'bg-[var(--highlight)]'

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      <div className={`relative ${headerBg} p-4`}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className="font-display font-bold text-lg text-white leading-snug">{business.name}</h3>
          <span className="text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
            {isProducer ? `🫒 ${t('producer')}` : (business.category?.replace(/_/g, ' ') ?? 'Business')}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {business.description && (
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed line-clamp-3">{business.description}</p>
        )}
        <div className="space-y-2">
          {business.address && (
            <div className="flex items-start gap-2 text-sm text-[var(--color-muted-foreground)]">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[var(--highlight)]" />
              <span>{business.address}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Phone className="h-4 w-4 shrink-0 text-[var(--highlight)]" />
              <a href={`tel:${business.phone}`} className="hover:text-[var(--color-foreground)] transition-colors">{business.phone}</a>
            </div>
          )}
          {business.website && validateUrl(business.website) && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Globe className="h-4 w-4 shrink-0 text-[var(--highlight)]" />
              <a href={validateUrl(business.website)!} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-foreground)] transition-colors truncate">
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        <DirectionButtons {...routeProps} />

        <a
          href={`/chatbot?q=${encodeURIComponent('Tell me about ' + business.name)}`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:border-[var(--highlight)] transition-colors text-sm"
        >
          💬 {t('askAboutPlace')}
        </a>
      </div>
    </div>
  )
}

function EventPanel({
  event,
  onClose,
  routeProps,
}: {
  event: EventRow
  onClose: () => void
  routeProps: RoutePanelProps
}) {
  const t = useTranslations('map')

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      <div className="relative bg-[var(--color-primary)] p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className="font-display font-bold text-lg text-white leading-snug">{event.title}</h3>
          <span className="text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
            {event.category?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {event.description && (
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed line-clamp-3">{event.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Calendar className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          {event.address && (
            <div className="flex items-start gap-2 text-sm text-[var(--color-muted-foreground)]">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-primary)]" />
              <span>{event.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Ticket className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <span>{event.price === 0 ? t('freeEntry') : formatCurrency(event.price)}</span>
          </div>
        </div>

        <DirectionButtons {...routeProps} />

        <a
          href={`/chatbot?q=${encodeURIComponent('Tell me about the event: ' + event.title)}`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:border-[var(--color-primary)] transition-colors text-sm"
        >
          💬 {t('askAboutEvent')}
        </a>
      </div>
    </div>
  )
}

function FarmersMarketPanel({
  market,
  onClose,
  routeProps,
}: {
  market: FarmersMarket
  onClose: () => void
  routeProps: RoutePanelProps
}) {
  const t = useTranslations('map')
  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      <div className="relative bg-green-700 p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className="font-display font-bold text-lg text-white leading-snug">{market.nameEn}</h3>
          <span className="text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
            🌿 {t('farmersMarket')}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-2 text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
            <span>{market.streets}<br /><span className="text-xs">{market.area}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-green-600" />
            <span>{market.hours}</span>
          </div>
        </div>

        <DirectionButtons {...routeProps} />
      </div>
    </div>
  )
}

// ── Experience + Place panels ─────────────────────────────────────────────────

const PLACE_CATEGORY_ICONS: Record<string, string> = {
  archaeological: '🏛️', beach: '🏖️', gorge: '🌲', cave: '🕳️', museum: '🏺', nature: '🌿',
}

function ExperiencePanel({
  experience, onClose, routeProps,
}: { experience: Experience; onClose: () => void; routeProps: RoutePanelProps }) {
  const t = useTranslations('map')
  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className="font-display font-bold text-lg text-white leading-snug">{experience.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 text-white px-2 py-0.5 rounded-full">
              ✨ {experience.category.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-white/90">
              <Star className="h-3 w-3 fill-white stroke-white" />{experience.rating} ({experience.reviewCount})
            </span>
          </div>
        </div>
      </div>
      {experience.images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={experience.images[0]} alt={experience.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-4 space-y-3">
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed line-clamp-3">{experience.shortDescription}</p>
        <div className="space-y-1.5 text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-amber-500" /><span>{experience.location}</span></div>
          {experience.hours && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0 text-amber-500" /><span>{experience.hours}</span></div>}
          {experience.price && <div className="flex items-center gap-2"><Ticket className="h-4 w-4 shrink-0 text-amber-500" /><span>{experience.price}</span></div>}
        </div>
        <DirectionButtons {...routeProps} />
        <a href={`/explore?q=${encodeURIComponent(experience.title)}`} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-amber-400 text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm">
          <ExternalLink className="h-4 w-4" /> {t('viewDetails')}
        </a>
      </div>
    </div>
  )
}

function PlacePanel({
  place, onClose, routeProps,
}: { place: CretePlace; onClose: () => void; routeProps: RoutePanelProps }) {
  const t = useTranslations('map')
  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      {place.image && (
        <div className="relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.image} alt={place.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-display font-bold text-white text-base leading-snug">{place.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[0.6rem] font-bold uppercase tracking-wide bg-white/20 text-white px-2 py-0.5 rounded-full">{place.region}</span>
              <span className="text-[0.6rem] text-white/80">{PLACE_CATEGORY_ICONS[place.category] ?? '📍'} {place.category}</span>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 space-y-3">
        <p className="text-sm text-[var(--color-foreground)] leading-relaxed line-clamp-3">{place.description}</p>
        {place.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {place.highlights.slice(0, 4).map((h) => (
              <span key={h} className="text-[0.6rem] font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">{h}</span>
            ))}
          </div>
        )}
        <div className="space-y-1.5 text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" /><span>{place.location}</span></div>
          {place.hours && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0 text-[var(--color-primary)]" /><span>{place.hours}</span></div>}
          {place.price && <div className="flex items-center gap-2"><Ticket className="h-4 w-4 shrink-0 text-[var(--color-primary)]" /><span>{place.price}</span></div>}
        </div>
        <DirectionButtons {...routeProps} />
        <a href={`/chatbot?q=${encodeURIComponent('Tell me about ' + place.title + ' in Crete')}`} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:border-[var(--color-primary)] transition-colors text-sm">
          💬 {t('askAboutPlace')}
        </a>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MapPage() {
  const t = useTranslations('map')
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [tab, setTab] = useState<TabType>('all')
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null)
  const [selectedEvtId, setSelectedEvtId] = useState<string | null>(null)
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null)
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeRouteMode, setActiveRouteMode] = useState<RouteMode | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const { userId } = useRole()
  const { coords } = useLocation(userId)
  const supabase = createClient()

  // Sync URL param changes (e.g. navbar search)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  const s = search.trim().slice(0, 100)

  const { data: rawBusinesses = [] } = useQuery({
    queryKey: ['businesses-map', s],
    queryFn: async (): Promise<BusinessWithOwner[]> => {
      let q = supabase
        .from('businesses')
        .select('*, profiles!owner_id(role, name)')
        .eq('is_active', true)
        .limit(100)
      if (s) q = q.or(`name.ilike.%${s}%,description.ilike.%${s}%,address.ilike.%${s}%,category.ilike.%${s}%`)
      const { data } = await q
      return (data ?? []) as unknown as BusinessWithOwner[]
    },
  })

  const { data: events = [] } = useQuery({
    queryKey: ['events-map', s],
    queryFn: async (): Promise<EventRow[]> => {
      let q = supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(50)
      if (s) q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%,address.ilike.%${s}%`)
      const { data } = await q
      return (data ?? []) as EventRow[]
    },
  })

  const filteredMarkets = useMemo(() => {
    if (!s) return FARMERS_MARKETS
    const term = s.toLowerCase()
    return FARMERS_MARKETS.filter(
      (m) =>
        m.nameEn.toLowerCase().includes(term) ||
        m.name.toLowerCase().includes(term) ||
        m.area.toLowerCase().includes(term) ||
        m.streets.toLowerCase().includes(term) ||
        m.day.toLowerCase().includes(term)
    )
  }, [s])

  const filteredExperiences = useMemo(() => {
    if (!s) return ALL_MAP_EXPERIENCES
    const term = s.toLowerCase()
    return ALL_MAP_EXPERIENCES.filter(
      (e) => e.title.toLowerCase().includes(term) || e.location.toLowerCase().includes(term) || e.tags.some((tg) => tg.toLowerCase().includes(term))
    )
  }, [s])

  const filteredPlaces = useMemo(() => {
    if (!s) return SCRAPED_PLACES
    const term = s.toLowerCase()
    return SCRAPED_PLACES.filter(
      (p) => p.title.toLowerCase().includes(term) || p.region.toLowerCase().includes(term) || p.tags.some((tg) => tg.toLowerCase().includes(term))
    )
  }, [s])

  const selectedBiz = useMemo(
    () => (selectedBizId ? (rawBusinesses.find((b) => b.id === selectedBizId) ?? null) : null),
    [selectedBizId, rawBusinesses]
  )
  const selectedEvt = useMemo(
    () => (selectedEvtId ? (events.find((e) => e.id === selectedEvtId) ?? null) : null),
    [selectedEvtId, events]
  )
  const selectedMarket = useMemo(
    () => (selectedMarketId ? (filteredMarkets.find((m) => m.id === selectedMarketId) ?? null) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMarketId, s]
  )
  const selectedExp = useMemo(
    () => (selectedExpId ? (ALL_MAP_EXPERIENCES.find((e) => e.id === selectedExpId) ?? null) : null),
    [selectedExpId]
  )
  const selectedPlace = useMemo(
    () => (selectedPlaceId ? (SCRAPED_PLACES.find((p) => p.id === selectedPlaceId) ?? null) : null),
    [selectedPlaceId]
  )
  const hasSelection = selectedBiz !== null || selectedEvt !== null || selectedMarket !== null || selectedExp !== null || selectedPlace !== null

  function clearSelection() {
    setSelectedBizId(null); setSelectedEvtId(null); setSelectedMarketId(null)
    setSelectedExpId(null); setSelectedPlaceId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false)
  }

  function selectBiz(biz: BusinessWithOwner) {
    setSelectedBizId(biz.id); setSelectedEvtId(null); setSelectedMarketId(null); setSelectedExpId(null); setSelectedPlaceId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false); setSidebarOpen(true)
  }

  function selectEvt(evt: EventRow) {
    setSelectedEvtId(evt.id); setSelectedBizId(null); setSelectedMarketId(null); setSelectedExpId(null); setSelectedPlaceId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false); setSidebarOpen(true)
  }

  function selectMarket(mkt: FarmersMarket) {
    setSelectedMarketId(mkt.id); setSelectedBizId(null); setSelectedEvtId(null); setSelectedExpId(null); setSelectedPlaceId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false); setSidebarOpen(true)
  }

  function selectExp(exp: Experience) {
    setSelectedExpId(exp.id); setSelectedBizId(null); setSelectedEvtId(null); setSelectedMarketId(null); setSelectedPlaceId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false); setSidebarOpen(true)
  }

  function selectPlace(place: CretePlace) {
    setSelectedPlaceId(place.id); setSelectedBizId(null); setSelectedEvtId(null); setSelectedMarketId(null); setSelectedExpId(null)
    setActiveRouteMode(null); setRouteInfo(null); setRouteLoading(false); setSidebarOpen(true)
  }

  const routeTarget = useMemo<RouteTarget | undefined>(() => {
    if (!activeRouteMode) return undefined
    if (selectedBiz?.lat && selectedBiz?.lng) return { lat: selectedBiz.lat, lng: selectedBiz.lng, mode: activeRouteMode }
    if (selectedEvt?.lat && selectedEvt?.lng) return { lat: selectedEvt.lat, lng: selectedEvt.lng, mode: activeRouteMode }
    if (selectedMarket) return { lat: selectedMarket.lat, lng: selectedMarket.lng, mode: activeRouteMode }
    if (selectedExp?.coordinates) return { lat: selectedExp.coordinates.lat, lng: selectedExp.coordinates.lng, mode: activeRouteMode }
    if (selectedPlace) return { lat: selectedPlace.coordinates.lat, lng: selectedPlace.coordinates.lng, mode: activeRouteMode }
    return undefined
  }, [activeRouteMode, selectedBiz, selectedEvt, selectedMarket, selectedExp, selectedPlace])

  const routeProps: RoutePanelProps = {
    activeRouteMode,
    onRouteMode: (mode) => { setActiveRouteMode(mode); setRouteInfo(null); setRouteLoading(mode !== null) },
    routeInfo,
    routeLoading,
    hasCoords: !!(
      (selectedBiz?.lat && selectedBiz?.lng) ||
      (selectedEvt?.lat && selectedEvt?.lng) ||
      selectedMarket ||
      selectedExp?.coordinates ||
      selectedPlace
    ),
  }

  const markers: MapMarker[] = useMemo(() => {
    const showBiz = tab === 'all'
    const showEvt = tab === 'all' || tab === 'events'
    const showMkt = tab === 'all' || tab === 'markets'
    const showExp = tab === 'all' || tab === 'experiences'
    const showPl  = tab === 'all' || tab === 'sights'
    const bMarkers: MapMarker[] = (showBiz ? rawBusinesses : [])
      .filter((b) => b.lat && b.lng)
      .map((b) => ({ id: `b:${b.id}`, lat: b.lat!, lng: b.lng!, type: b.profiles?.role === 'producer' ? 'producer' : 'business', label: b.name, category: b.category }))
    const eMarkers: MapMarker[] = (showEvt ? events : [])
      .filter((e) => e.lat && e.lng)
      .map((e) => ({ id: `e:${e.id}`, lat: e.lat!, lng: e.lng!, type: 'event' as const, label: e.title, category: e.category }))
    const mMarkers: MapMarker[] = (showMkt ? filteredMarkets : [])
      .map((m) => ({ id: `m:${m.id}`, lat: m.lat, lng: m.lng, type: 'farmers_market' as const, label: m.nameEn }))
    const expMarkers: MapMarker[] = (showExp ? filteredExperiences : [])
      .filter((ex) => ex.coordinates)
      .map((ex) => ({ id: `exp:${ex.id}`, lat: ex.coordinates.lat, lng: ex.coordinates.lng, type: 'experience' as const, label: ex.title }))
    const plMarkers: MapMarker[] = (showPl ? filteredPlaces : [])
      .map((p) => ({ id: `pl:${p.id}`, lat: p.coordinates.lat, lng: p.coordinates.lng, type: 'place' as const, label: p.title }))
    return [...bMarkers, ...eMarkers, ...mMarkers, ...expMarkers, ...plMarkers]
  }, [rawBusinesses, events, filteredMarkets, filteredExperiences, filteredPlaces, tab])

  const flyTo = useMemo<{ lat: number; lng: number; zoom?: number } | undefined>(() => {
    const item = selectedBiz ?? selectedEvt
    if (item?.lat && item?.lng) return { lat: item.lat, lng: item.lng, zoom: 16 }
    if (selectedMarket) return { lat: selectedMarket.lat, lng: selectedMarket.lng, zoom: 16 }
    if (selectedExp?.coordinates) return { lat: selectedExp.coordinates.lat, lng: selectedExp.coordinates.lng, zoom: 15 }
    if (selectedPlace) return { lat: selectedPlace.coordinates.lat, lng: selectedPlace.coordinates.lng, zoom: 15 }
    return undefined
  }, [selectedBiz, selectedEvt, selectedMarket, selectedExp, selectedPlace])

  function handleMarkerClick(markerId: string) {
    if (markerId.startsWith('b:')) {
      const biz = rawBusinesses.find((b) => b.id === markerId.slice(2))
      if (biz) selectBiz(biz)
    } else if (markerId.startsWith('e:')) {
      const evt = events.find((e) => e.id === markerId.slice(2))
      if (evt) selectEvt(evt)
    } else if (markerId.startsWith('m:')) {
      const mkt = filteredMarkets.find((m) => m.id === markerId.slice(2))
      if (mkt) selectMarket(mkt)
    } else if (markerId.startsWith('exp:')) {
      const exp = ALL_MAP_EXPERIENCES.find((ex) => ex.id === markerId.slice(4))
      if (exp) selectExp(exp)
    } else if (markerId.startsWith('pl:')) {
      const pl = SCRAPED_PLACES.find((p) => p.id === markerId.slice(3))
      if (pl) selectPlace(pl)
    }
  }

  const visibleBusinesses = tab === 'all' ? rawBusinesses : []
  const visibleEvents = tab === 'all' || tab === 'events' ? events : []
  const visibleFarmersMarkets = tab === 'all' || tab === 'markets' ? filteredMarkets : []
  const visibleExperiences = tab === 'all' || tab === 'experiences' ? filteredExperiences : []
  const visiblePlaces = tab === 'all' || tab === 'sights' ? filteredPlaces : []
  const totalCount = visibleBusinesses.length + visibleEvents.length + visibleFarmersMarkets.length + visibleExperiences.length + visiblePlaces.length

  const TABS = [
    { key: 'all' as const,         label: `🌍 ${t('all')}` },
    { key: 'events' as const,      label: `🎉 ${t('events')}` },
    { key: 'markets' as const,     label: `🌿 ${t('farmersMarkets')}` },
    { key: 'sights' as const,      label: `🏛️ ${t('sights')}` },
    { key: 'experiences' as const, label: `✨ ${t('experiences')}` },
  ]

  const userOrigin = coords?.lat && coords?.lng ? { lat: coords.lat, lng: coords.lng } : undefined

  return (
    <div className="flex flex-col md:flex-row" style={{ height: 'calc(100dvh - var(--nav-height) - var(--bottom-nav-height))' }}>
      {/* Sidebar */}
      <div className={cn(
        'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] transition-all duration-200',
        'md:w-[var(--sidebar-width)] md:flex',
        sidebarOpen ? 'flex' : 'hidden md:flex',
        'w-full md:w-auto'
      )}>
        {/* Search + tabs */}
        <div className="p-3 space-y-2.5 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); clearSelection() }}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-9 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
            />
            {search && (
              <button onClick={() => { setSearch(''); clearSelection() }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'py-1.5 rounded-[var(--radius-full)] text-xs font-semibold transition-colors truncate px-2',
                  tab === key
                    ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                    : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List / detail */}
        <div className="flex-1 overflow-y-auto">
          {hasSelection ? (
            <div className="p-3">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3 transition-colors"
              >
                ← {t('backToList')}
              </button>
              {selectedBiz && (
                <BusinessPanel
                  business={selectedBiz}
                  isProducer={selectedBiz.profiles?.role === 'producer'}
                  onClose={clearSelection}
                  routeProps={routeProps}
                />
              )}
              {selectedEvt && <EventPanel event={selectedEvt} onClose={clearSelection} routeProps={routeProps} />}
              {selectedMarket && <FarmersMarketPanel market={selectedMarket} onClose={clearSelection} routeProps={routeProps} />}
              {selectedExp && <ExperiencePanel experience={selectedExp} onClose={clearSelection} routeProps={routeProps} />}
              {selectedPlace && <PlacePanel place={selectedPlace} onClose={clearSelection} routeProps={routeProps} />}
            </div>
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {totalCount} {totalCount === 1 ? t('resultFound') : t('resultsFound')}
                </p>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {/* Businesses */}
                {visibleBusinesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => selectBiz(biz)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedBizId === biz.id && 'bg-[var(--highlight)]/10 border-l-2 border-[var(--highlight)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--highlight)] flex items-center justify-center text-sm">
                        {biz.profiles?.role === 'producer' ? '🫒' : '🏪'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{biz.name}</p>
                        {biz.address && (
                          <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />{biz.address}
                          </span>
                        )}
                        {!biz.lat && !biz.address && (
                          <span className="text-[0.6rem] text-[var(--color-muted-foreground)] italic mt-0.5 block">{t('noMapPin')}</span>
                        )}
                        {biz.category && (
                          <span className="inline-block mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-0.5 rounded-full">
                            {biz.category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Events */}
                {visibleEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => selectEvt(evt)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedEvtId === evt.id && 'bg-[var(--color-primary)]/10 border-l-2 border-[var(--color-primary)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--color-primary)] flex items-center justify-center text-sm">🎉</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{evt.title}</p>
                        <span className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-0.5 mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />{formatDate(evt.event_date)}
                        </span>
                        {evt.address && (
                          <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />{evt.address}
                          </span>
                        )}
                        {!evt.lat && !evt.address && (
                          <span className="text-[0.6rem] text-[var(--color-muted-foreground)] italic mt-0.5 block">{t('noMapPin')}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}


                {/* Farmers Markets */}
                {visibleFarmersMarkets.map((mkt) => (
                  <button
                    key={mkt.id}
                    onClick={() => selectMarket(mkt)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedMarketId === mkt.id && 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-sm">🌿</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{mkt.nameEn}</p>
                        <span className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-0.5 mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />{mkt.hours}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />{mkt.area}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* ✨ Experiences */}
                {visibleExperiences.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => selectExp(exp)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedExpId === exp.id && 'bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-500'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm">✨</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{exp.title}</p>
                        <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />{exp.location}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400 shrink-0" />
                          <span className="text-[0.65rem] font-bold text-amber-600">{exp.rating}</span>
                          {exp.price && <span className="text-[0.65rem] text-[var(--color-muted-foreground)]">· {exp.price}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* 🏛️ Tourist Sights */}
                {visiblePlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => selectPlace(place)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedPlaceId === place.id && 'bg-[var(--highlight)]/10 border-l-2 border-[var(--highlight)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-cover bg-center overflow-hidden flex items-end justify-end p-0.5"
                        style={{ backgroundImage: `url(${place.image})` }}
                      >
                        <span className="text-sm leading-none drop-shadow">{PLACE_CATEGORY_ICONS[place.category] ?? '📍'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{place.title}</p>
                        <p className="text-[0.65rem] text-[var(--color-muted-foreground)] truncate">{place.subtitle}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[0.6rem] font-bold uppercase tracking-wide text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-1.5 py-0.5 rounded-full border border-[var(--color-border)]">{place.region}</span>
                          {place.price && <span className="text-[0.6rem] text-[var(--color-muted-foreground)]">{place.price}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {totalCount === 0 && (
                  <div className="py-16 text-center">
                    <span className="text-3xl">🗺️</span>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-2">{t('noResults')}</p>
                    <button onClick={() => { setSearch(''); setTab('all') }} className="mt-2 text-xs text-[var(--highlight)] font-semibold hover:underline">
                      {t('clearSearch')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-[var(--color-card)] rounded-[var(--radius-full)] shadow-[var(--shadow-md)] text-xs font-semibold border border-[var(--color-border)]"
        >
          {sidebarOpen ? t('hideList') : t('showList')}
        </button>

        <MapView
          lat={coords?.lat ?? 35.3387}
          lng={coords?.lng ?? 25.1442}
          zoom={12}
          markers={markers}
          flyTo={flyTo}
          onMarkerClick={handleMarkerClick}
          routeTarget={routeTarget}
          userOrigin={userOrigin}
          onRouteInfo={(info) => { setRouteInfo(info); setRouteLoading(false) }}
          className="w-full h-full rounded-none"
        />

        {hasSelection && !sidebarOpen && (
          <div className="md:hidden absolute bottom-4 left-3 right-3 z-10 max-h-[65vh] overflow-y-auto rounded-[var(--radius-xl)]">
            {selectedBiz && (
              <BusinessPanel
                business={selectedBiz}
                isProducer={selectedBiz.profiles?.role === 'producer'}
                onClose={clearSelection}
                routeProps={routeProps}
              />
            )}
            {selectedEvt && <EventPanel event={selectedEvt} onClose={clearSelection} routeProps={routeProps} />}
            {selectedMarket && <FarmersMarketPanel market={selectedMarket} onClose={clearSelection} routeProps={routeProps} />}
            {selectedExp && <ExperiencePanel experience={selectedExp} onClose={clearSelection} routeProps={routeProps} />}
            {selectedPlace && <PlacePanel place={selectedPlace} onClose={clearSelection} routeProps={routeProps} />}
          </div>
        )}
      </div>
    </div>
  )
}
