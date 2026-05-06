'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet'
import type { default as L_type } from 'leaflet'
import { cn } from '@/lib/utils'
import type { MapMarker, RouteTarget, RouteInfo } from './MapView'

const HERAKLION = { lat: 35.3387, lng: 25.1442 }

const MARKER_ICONS: Record<string, string> = {
  business: '🏪',
  event: '🎉',
  user: '📍',
  producer: '🫒',
  farmers_market: '🌿',
  experience: '✨',
  place: '🏛️',
}

interface MapInnerProps {
  lat?: number
  lng?: number
  zoom?: number
  markers?: MapMarker[]
  flyTo?: { lat: number; lng: number; zoom?: number }
  onMarkerClick?: (id: string) => void
  className?: string
  routeTarget?: RouteTarget
  userOrigin?: { lat: number; lng: number }
  onRouteInfo?: (info: RouteInfo | null) => void
}

export default function MapInner({
  lat = HERAKLION.lat,
  lng = HERAKLION.lng,
  zoom = 13,
  markers = [],
  flyTo,
  onMarkerClick,
  className,
  routeTarget,
  userOrigin,
  onRouteInfo,
}: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const LRef = useRef<typeof L_type | null>(null)
  const markerLayersRef = useRef<Marker[]>([])
  const routeLayerRef = useRef<Polyline | null>(null)
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

  // Fly to selected item
  useEffect(() => {
    if (!mapReady || !flyTo) return
    mapRef.current?.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1 })
  }, [flyTo, mapReady])

  // Draw in-app route via OSRM
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    const L = LRef.current
    if (!map || !L) return

    routeLayerRef.current?.remove()
    routeLayerRef.current = null

    if (!routeTarget) {
      onRouteInfo?.(null)
      return
    }

    let cancelled = false
    const origin = userOrigin ?? HERAKLION
    // OSRM supports foot and car; transit approximated as foot
    const profile = routeTarget.mode === 'driving' ? 'car' : 'foot'
    const osrmUrl =
      `https://router.project-osrm.org/route/v1/${profile}/` +
      `${origin.lng},${origin.lat};${routeTarget.lng},${routeTarget.lat}` +
      `?overview=full&geometries=geojson`

    fetch(osrmUrl)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.routes?.[0] || !mapRef.current || !LRef.current) return
        const route = data.routes[0]
        const latlngs: [number, number][] = route.geometry.coordinates.map(
          ([routeLng, routeLat]: [number, number]) => [routeLat, routeLng]
        )
        const colors: Record<string, string> = {
          walking: '#22c55e',
          transit: '#3b82f6',
          driving: '#ef4444',
        }
        routeLayerRef.current = LRef.current
          .polyline(latlngs, {
            color: colors[routeTarget.mode] ?? '#3b82f6',
            weight: 5,
            opacity: 0.85,
          })
          .addTo(mapRef.current)
        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] })

        const distKm = (route.distance / 1000).toFixed(1)
        const durMin = Math.round(route.duration / 60)
        onRouteInfo?.({
          distance: `${distKm} km`,
          duration: durMin < 60 ? `${durMin} min` : `${Math.floor(durMin / 60)}h ${durMin % 60}m`,
          distanceM: route.distance,
          durationS: route.duration,
        })
      })
      .catch(() => {
        if (!cancelled) onRouteInfo?.(null)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTarget, userOrigin, mapReady])

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full min-h-[300px] rounded-[var(--radius-lg)] overflow-hidden', className)}
    />
  )
}
