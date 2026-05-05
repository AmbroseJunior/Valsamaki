'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { default as L_type } from 'leaflet'
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
  flyTo?: { lat: number; lng: number; zoom?: number }
  onMarkerClick?: (id: string) => void
  className?: string
}

export default function MapInner({
  lat = HERAKLION.lat,
  lng = HERAKLION.lng,
  zoom = 13,
  markers = [],
  flyTo,
  onMarkerClick,
  className,
}: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const LRef = useRef<typeof L_type | null>(null)
  const markerLayersRef = useRef<Marker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !containerRef.current || mapRef.current) return

      LRef.current = L
      const map = L.map(containerRef.current, { center: [lat, lng], zoom, zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      if (!cancelled) setMapReady(true)
    }

    initMap()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      LRef.current = null
      setMapReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-draw markers whenever data changes
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    // Remove old markers
    markerLayersRef.current.forEach((m) => m.remove())
    markerLayersRef.current = []

    for (const marker of markers) {
      const icon = L.divIcon({
        html: `<span style="font-size:1.25rem;line-height:1">${MARKER_ICONS[marker.type] ?? '📌'}</span>`,
        className: 'bg-transparent border-0',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
      const m = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${marker.label}</strong>`)
        .on('click', () => onMarkerClick?.(marker.id))
      markerLayersRef.current.push(m)
    }
  }, [markers, onMarkerClick, mapReady])

  // Fly to selected business
  useEffect(() => {
    if (!mapReady || !flyTo) return
    mapRef.current?.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1 })
  }, [flyTo, mapReady])

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full min-h-[300px] rounded-[var(--radius-lg)] overflow-hidden', className)}
    />
  )
}
