'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, SlidersHorizontal, MapPin, Phone, Globe, Navigation } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/hooks/useLocation'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import type { BusinessRow } from '@/types/database'
import type { MapMarker } from '@/components/map/MapView'

const MapView = dynamic(
  () => import('@/components/map/MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-full bg-[var(--color-muted)] animate-pulse rounded-[var(--radius)]" /> }
)

const CATEGORY_FILTERS = [
  { value: '', label: '🌿 All' },
  { value: 'olive_farm', label: '🫒 Olive Farms' },
  { value: 'herb_farm', label: '🌿 Herbs' },
  { value: 'winery', label: '🍷 Wineries' },
  { value: 'dairy', label: '🧀 Dairy' },
  { value: 'apiary', label: '🍯 Apiaries' },
  { value: 'restaurant', label: '🍽️ Food' },
  { value: 'market', label: '🛒 Markets' },
]

function BusinessPanel({ business, onClose }: { business: BusinessRow; onClose: () => void }) {
  const mapsUrl = business.lat && business.lng
    ? `https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`
    : undefined

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="relative bg-[var(--highlight)] p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
        <div className="pr-8">
          <h3 className="font-display font-bold text-lg text-[var(--highlight-foreground)] leading-snug">{business.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-wide bg-black/20 text-[var(--highlight-foreground)] px-2 py-0.5 rounded-full">
              {business.category?.replace('_', ' ') ?? 'Business'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
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
          {business.website && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <Globe className="h-4 w-4 shrink-0 text-[var(--highlight)]" />
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-foreground)] transition-colors truncate">{business.website.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
        </div>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors text-sm"
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </a>
        )}

        <a
          href={`/chatbot?q=${encodeURIComponent('Tell me about ' + business.name)}`}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:border-[var(--highlight)] transition-colors text-sm"
        >
          💬 Ask Valsamaki about this place
        </a>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { userId } = useRole()
  const { coords } = useLocation(userId)
  const supabase = createClient()

  const { data: businesses } = useQuery({
    queryKey: ['businesses-map', category, search],
    queryFn: async (): Promise<BusinessRow[]> => {
      let q = supabase.from('businesses').select('*').eq('is_active', true).limit(100)
      if (category) q = q.eq('category', category)
      if (search) q = q.ilike('name', `%${search}%`)
      const { data } = await q
      return (data ?? []) as BusinessRow[]
    },
  })

  const markers: MapMarker[] = (businesses ?? [])
    .filter((b) => b.lat && b.lng)
    .map((b) => ({
      id: b.id,
      lat: b.lat!,
      lng: b.lng!,
      type: 'business',
      label: b.name,
      category: b.category,
    }))

  const selected = businesses?.find((b) => b.id === selectedId)

  return (
    <div className="flex flex-col md:flex-row" style={{ height: 'calc(100dvh - var(--nav-height) - var(--bottom-nav-height))' }}>
      {/* Sidebar — desktop always visible, mobile: bottom sheet on selection */}
      <div className={cn(
        'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] transition-all duration-200',
        'md:w-[var(--sidebar-width)] md:flex',
        sidebarOpen ? 'flex' : 'hidden md:flex',
        'w-full md:w-auto'
      )}>
        {/* Search + filters */}
        <div className="p-3 space-y-2.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses…"
                className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                </button>
              )}
            </div>
            <button className="p-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-input)] hover:bg-[var(--color-muted)] transition-colors">
              <SlidersHorizontal className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {CATEGORY_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={cn(
                  'px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold whitespace-nowrap transition-colors shrink-0',
                  category === value
                    ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                    : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-border)]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-3">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3 transition-colors"
              >
                ← Back to list
              </button>
              <BusinessPanel business={selected} onClose={() => setSelectedId(null)} />
            </div>
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                <p className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {businesses?.length ?? 0} businesses found
                </p>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {(businesses ?? []).map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => setSelectedId(biz.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 hover:bg-[var(--color-muted)] transition-colors',
                      selectedId === biz.id && 'bg-[var(--highlight)]/10 border-l-2 border-[var(--highlight)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-[var(--radius)] bg-[var(--highlight)] flex items-center justify-center text-sm">
                        🏪
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-foreground)] truncate">{biz.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {biz.address && (
                            <span className="text-xs text-[var(--color-muted-foreground)] truncate flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {biz.address}
                            </span>
                          )}
                        </div>
                        {biz.category && (
                          <span className="inline-block mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-0.5 rounded-full">
                            {biz.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {businesses?.length === 0 && (
                  <div className="py-16 text-center">
                    <span className="text-3xl">🗺️</span>
                    <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No businesses found</p>
                    <button onClick={() => { setSearch(''); setCategory('') }} className="mt-2 text-xs text-[var(--highlight)] font-semibold hover:underline">
                      Clear filters
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
        {/* Mobile: toggle sidebar */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 bg-[var(--color-card)] rounded-[var(--radius-full)] shadow-[var(--shadow-md)] text-xs font-semibold border border-[var(--color-border)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {sidebarOpen ? 'Hide list' : 'Show list'}
        </button>

        <MapView
          lat={coords?.lat ?? 35.3387}
          lng={coords?.lng ?? 25.1442}
          zoom={12}
          markers={markers}
          onMarkerClick={(id) => {
            setSelectedId(id)
            setSidebarOpen(true)
          }}
          className="w-full h-full rounded-none"
        />

        {/* Mobile: selected business bottom sheet */}
        {selected && !sidebarOpen && (
          <div className="md:hidden absolute bottom-4 left-3 right-3 z-10">
            <BusinessPanel business={selected} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
