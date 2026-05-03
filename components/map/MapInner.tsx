'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { cn } from '@/lib/utils'
import type { MapMarker } from './MapView'

const HERAKLION = { lat: 35.3387, lng: 25.1442 }

const MARKER_ICONS: Record<string, string> = {
  business: '🏪',
  event: '🎉',
  user: '📍',
}

interface MapInnerProps {
  lat?: number
  lng?: number
  zoom?: number
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  className?: string
}

export default function MapInner({
  lat = HERAKLION.lat,
  lng = HERAKLION.lng,
  zoom = 13,
  markers = [],
  onMarkerClick,
  className,
}: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      for (const marker of markers) {
        const icon = L.divIcon({
          html: `<span class="text-xl">${MARKER_ICONS[marker.type] ?? '📌'}</span>`,
          className: 'bg-transparent border-0',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(marker.label)
          .on('click', () => onMarkerClick?.(marker.id))
      }
    }

    initMap()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full min-h-[300px] rounded-[var(--radius-lg)] overflow-hidden', className)}
    />
  )
}
