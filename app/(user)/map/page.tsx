'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, MapPin, Phone, Globe, Calendar, Ticket } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/hooks/useLocation'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency } from '@/lib/utils'
import { validateUrl } from '@/lib/security'
import type { BusinessRow, EventRow } from '@/types/database'
import type { MapMarker } from '@/components/map/MapView'
import { FARMERS_MARKETS } from '@/lib/data/farmersMarkets'
import type { FarmersMarket } from '@/lib/data/farmersMarkets'

const MapView = dynamic(
  () => import('@/components/map/MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-full bg-[var(--color-muted)] animate-pulse rounded-[var(--radius)]" /> }
)

type TabType = 'all' | 'businesses' | 'events' | 'producers' | 'markets'

type BusinessWithOwner = BusinessRow & {
  profiles?: { role: string; name: string | null } | null
}

// ── Directions helper ─────────────────────────────────────────────────────────
// Falls back to address-based Google Maps search when lat/lng are absent.
function directionsUrl(
  lat: number | null | undefined,
  lng: number | null | undefined,
  address: string | null | undefined,
  mode: string
): string | null {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`
  }
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, Crete, Greece`)}&travelmode=${mode}`
  }
  return null
}

// ── Detail panels ────────────────────────────────────────────────────────────

function BusinessPanel({ business, isProducer = false, onClose }: { business: BusinessWithOwner; isProducer?: boolean; onClose: () => void }) {
  const t = useTranslations('map')
  const headerBg = isProducer ? 'bg-[var(--color-primary)]' : 'bg-[var(--highlight)]'
  const headerText = 'text-[var(--highlight-foreground)]'

  const directionModes = [
    { label: t('walk'), icon: '🚶', mode: 'walking' },
    { label: t('bus'), icon: '🚌', mode: 'transit' },
    { label: t('drive'), icon: '🚕', mode: 'driving' },
  ]
  const hasDirections = business.lat || business.lng || business.address

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      <div className={`relative ${headerBg} p-4`}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className={`font-display font-bold text-lg ${headerText} leading-snug`}>{business.name}</h3>
          <span className={`text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 ${headerText} px-2 py-0.5 rounded-full mt-1 inline-block`}>
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

        {hasDirections && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">{t('getDirections')}</p>
            <div className="grid grid-cols-3 gap-2">
              {directionModes.map(({ label, icon, mode }) => {
                const url = directionsUrl(business.lat, business.lng, business.address, mode)
                if (!url) return null
                return (
                  <a
                    key={mode}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/5 transition-colors text-center"
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-[10px] font-semibold text-[var(--color-muted-foreground)]">{label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        )}

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

function EventPanel({ event, onClose }: { event: EventRow; onClose: () => void }) {
  const t = useTranslations('map')
  const hasDirections = event.lat || event.lng || event.address

  const directionModes = [
    { label: t('walk'), icon: '🚶', mode: 'walking' },
    { label: t('bus'), icon: '🚌', mode: 'transit' },
    { label: t('drive'), icon: '🚕', mode: 'driving' },
  ]

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

        {hasDirections && (
          <div className="grid grid-cols-3 gap-2">
            {directionModes.map(({ label, icon, mode }) => {
              const url = directionsUrl(event.lat, event.lng, event.address, mode)
              if (!url) return null
              return (
                <a
                  key={mode}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-center"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10px] font-semibold text-[var(--color-muted-foreground)]">{label}</span>
                </a>
              )
            })}
          </div>
        )}

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

function FarmersMarketPanel({ market, onClose }: { market: FarmersMarket; onClose: () => void }) {
  const t = useTranslations('map')
  const directionModes = [
    { label: t('walk'), icon: '🚶', mode: 'walking' },
    { label: t('bus'), icon: '🚌', mode: 'transit' },
    { label: t('drive'), icon: '🚕', mode: 'driving' },
  ]
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
        <div className="grid grid-cols-3 gap-2">
          {directionModes.map(({ label, icon, mode }) => (
            <a
              key={mode}
              href={`https://www.google.com/maps/dir/?api=1&destination=${market.lat},${market.lng}&travelmode=${mode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-center"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-semibold text-[var(--color-muted-foreground)]">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const t = useTranslations('map')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabType>('all')
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null)
  const [selectedEvtId, setSelectedEvtId] = useState<string | null>(null)
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { userId } = useRole()
  const { coords } = useLocation(userId)
  const supabase = createClient()

  const s = search.trim().slice(0, 100)

  // Join profiles to identify producer-owned businesses
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

  // Farmers markets — filter static list by search term
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

  // Producers = businesses whose owner has role 'producer'
  const producers = useMemo(
    () => rawBusinesses.filter((b) => b.profiles?.role === 'producer'),
    [rawBusinesses]
  )

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

  const hasSelection = selectedBiz !== null || selectedEvt !== null || selectedMarket !== null

  function clearSelection() {
    setSelectedBizId(null)
    setSelectedEvtId(null)
    setSelectedMarketId(null)
  }

  function selectBiz(biz: BusinessWithOwner) {
    setSelectedBizId(biz.id)
    setSelectedEvtId(null)
    setSidebarOpen(true)
  }

  function selectEvt(evt: EventRow) {
    setSelectedEvtId(evt.id)
    setSelectedBizId(null)
    setSidebarOpen(true)
  }

  const markers: MapMarker[] = useMemo(() => {
    const bMarkers: MapMarker[] = rawBusinesses
      .filter((b) => b.lat && b.lng)
      .map((b) => ({
        id: `b:${b.id}`,
        lat: b.lat!,
        lng: b.lng!,
        type: b.profiles?.role === 'producer' ? 'producer' : 'business',
        label: b.name,
        category: b.category,
      }))
    const eMarkers: MapMarker[] = events
      .filter((e) => e.lat && e.lng)
      .map((e) => ({ id: `e:${e.id}`, lat: e.lat!, lng: e.lng!, type: 'event' as const, label: e.title, category: e.category }))
    const mMarkers: MapMarker[] = (tab === 'all' || tab === 'markets' ? filteredMarkets : [])
      .map((m) => ({ id: `m:${m.id}`, lat: m.lat, lng: m.lng, type: 'farmers_market' as const, label: m.nameEn }))
    return [...bMarkers, ...eMarkers, ...mMarkers]
  }, [rawBusinesses, events, filteredMarkets, tab])

  const flyTo = useMemo<{ lat: number; lng: number; zoom?: number } | undefined>(() => {
    const item = selectedBiz ?? selectedEvt
    if (!item?.lat || !item?.lng) return undefined
    return { lat: item.lat, lng: item.lng, zoom: 16 }
  }, [selectedBiz, selectedEvt])

  function handleMarkerClick(markerId: string) {
    if (markerId.startsWith('b:')) {
      const biz = rawBusinesses.find((b) => b.id === markerId.slice(2))
      if (biz) selectBiz(biz)
    } else if (markerId.startsWith('e:')) {
      const evt = events.find((e) => e.id === markerId.slice(2))
      if (evt) selectEvt(evt)
    } else if (markerId.startsWith('m:')) {
      const mkt = filteredMarkets.find((m) => m.id === markerId.slice(2))
      if (mkt) { setSelectedMarketId(mkt.id); setSelectedBizId(null); setSelectedEvtId(null); setSidebarOpen(true) }
    }
  }

  const visibleBusinesses = tab === 'events' || tab === 'producers' || tab === 'markets' ? [] : rawBusinesses
  const visibleEvents = tab === 'businesses' || tab === 'producers' || tab === 'markets' ? [] : events
  const visibleProducers = tab === 'producers' ? producers : []
  const visibleFarmersMarkets = tab === 'all' || tab === 'markets' ? filteredMarkets : []
  const totalCount = visibleBusinesses.length + visibleEvents.length + visibleProducers.length + visibleFarmersMarkets.length

  const TABS = [
    { key: 'all' as const,        label: `🌿 ${t('all')}` },
    { key: 'businesses' as const, label: `🏪 ${t('places')}` },
    { key: 'events' as const,     label: `🎉 ${t('events')}` },
    { key: 'producers' as const,  label: `🫒 ${t('producers')}` },
    { key: 'markets' as const,    label: `🌿 ${t('farmersMarkets')}` },
  ]

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
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
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
                />
              )}
              {selectedEvt && <EventPanel event={selectedEvt} onClose={clearSelection} />}
              {selectedMarket && <FarmersMarketPanel market={selectedMarket} onClose={clearSelection} />}
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

                {/* Producers tab */}
                {visibleProducers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectBiz(p)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedBizId === p.id && 'bg-[var(--highlight)]/10 border-l-2 border-[var(--highlight)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--color-primary)] flex items-center justify-center text-sm">🫒</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{p.name}</p>
                        {p.address && (
                          <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />{p.address}
                          </span>
                        )}
                        {!p.lat && !p.address && (
                          <span className="text-[0.6rem] text-[var(--color-muted-foreground)] italic mt-0.5 block">{t('noMapPin')}</span>
                        )}
                        <span className="inline-block mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-0.5 rounded-full">
                          {t('producer')}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Farmers Markets */}
                {visibleFarmersMarkets.map((mkt) => (
                  <button
                    key={mkt.id}
                    onClick={() => { setSelectedMarketId(mkt.id); setSelectedBizId(null); setSelectedEvtId(null); setSidebarOpen(true) }}
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
          className="w-full h-full rounded-none"
        />

        {hasSelection && !sidebarOpen && (
          <div className="md:hidden absolute bottom-4 left-3 right-3 z-10">
            {selectedBiz && (
              <BusinessPanel
                business={selectedBiz}
                isProducer={selectedBiz.profiles?.role === 'producer'}
                onClose={clearSelection}
              />
            )}
            {selectedEvt && <EventPanel event={selectedEvt} onClose={clearSelection} />}
            {selectedMarket && <FarmersMarketPanel market={selectedMarket} onClose={clearSelection} />}
          </div>
        )}
      </div>
    </div>
  )
}
