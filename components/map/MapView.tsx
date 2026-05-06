'use client'

import dynamic from 'next/dynamic'
import { PageLoader } from '@/components/shared/LoadingSpinner'

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <PageLoader />,
})

export interface RouteTarget {
  lat: number
  lng: number
  mode: 'walking' | 'driving' | 'transit'
}

export interface RouteInfo {
  distance: string   // formatted "2.3 km"
  duration: string   // formatted "28 min"
  distanceM: number  // raw metres from OSRM
  durationS: number  // raw seconds from OSRM
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  type: 'business' | 'event' | 'user' | 'producer' | 'farmers_market'
  label: string
  category?: string
}

interface MapViewProps {
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

export function MapView(props: MapViewProps) {
  return <MapInner {...props} />
}
