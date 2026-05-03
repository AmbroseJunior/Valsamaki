'use client'

import { useState } from 'react'
import { MapView } from '@/components/map/MapView'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProducerCard } from '@/components/producers/ProducerCard'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useLocation } from '@/hooks/useLocation'
import { useRole } from '@/hooks/useRole'
import { Search, Filter, X } from 'lucide-react'
import type { BusinessRow } from '@/types/database'
import type { MapMarker } from '@/components/map/MapView'

const CATEGORIES = ['All', 'olive_farm', 'herb_farm', 'winery', 'dairy', 'apiary', 'vegetable_farm', 'restaurant', 'market']

export default function MapPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--nav-height)-var(--bottom-nav-height))] md:h-[calc(100vh-var(--nav-height))]">
      {/* Sidebar */}
      <div className="w-full md:w-80 flex flex-col border-r border-[var(--color-border)] overflow-hidden">
        <div className="p-3 space-y-2 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses…"
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <Filter className="h-4 w-4 text-[var(--color-muted-foreground)] shrink-0 mt-0.5" />
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}>
                <Badge variant={category === (cat === 'All' ? '' : cat) ? 'default' : 'outline'} className="cursor-pointer whitespace-nowrap">
                  {cat === 'All' ? 'All' : cat.replace('_', ' ')}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {selected && (
            <div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="mb-2">
                ← Back to list
              </Button>
              <ProducerCard business={selected} />
            </div>
          )}
          {!selected && (businesses ?? []).map((biz) => (
            <div key={biz.id} onClick={() => setSelectedId(biz.id)} className="cursor-pointer">
              <ProducerCard business={biz} />
            </div>
          ))}
          {!selected && businesses?.length === 0 && (
            <p className="text-sm text-center text-[var(--color-muted-foreground)] py-8">No businesses found</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          lat={coords?.lat ?? 35.3387}
          lng={coords?.lng ?? 25.1442}
          zoom={12}
          markers={markers}
          onMarkerClick={setSelectedId}
          className="w-full h-full rounded-none"
        />
      </div>
    </div>
  )
}
