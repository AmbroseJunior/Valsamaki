'use client'

import dynamic from 'next/dynamic'
import { PageLoader } from '@/components/shared/LoadingSpinner'

// Leaflet must only render client-side
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <PageLoader />,
})

interface MapViewProps {
  lat?: number
  lng?: number
  zoom?: number
  markers?: MapMarker[]
  onMarkerClick?: (id: string) => void
  className?: string
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  type: 'business' | 'event' | 'user'
  label: string
  category?: string
}

export function MapView(props: MapViewProps) {
  return <MapInner {...props} />
}
