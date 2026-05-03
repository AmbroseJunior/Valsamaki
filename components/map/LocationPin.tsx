'use client'

import { useLocation } from '@/hooks/useLocation'
import { useRole } from '@/hooks/useRole'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationPinProps {
  className?: string
}

export function LocationPin({ className }: LocationPinProps) {
  const { userId } = useRole()
  const { coords, isTracking } = useLocation(userId)

  if (!coords) return null

  return (
    <div className={cn('flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]', className)}>
      <MapPin className={cn('h-3.5 w-3.5', isTracking && 'text-[var(--color-primary)] animate-pulse')} />
      {isTracking ? 'Location active' : 'Location cached'}
    </div>
  )
}
