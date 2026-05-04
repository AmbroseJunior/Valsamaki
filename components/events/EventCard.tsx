'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Ticket } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { EventRow } from '@/types/database'

interface EventCardProps {
  event: EventRow
  onRsvp?: (id: string) => void
  compact?: boolean
}

export function EventCard({ event, onRsvp, compact = false }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
      {event.images?.[0] && (
        <div className={`relative w-full ${compact ? 'h-32' : 'h-48'}`}>
          <Image
            src={event.images[0]}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold leading-tight">{event.title}</h3>
          <Badge variant={event.price === 0 ? 'default' : 'accent'} className="shrink-0">
            {event.price === 0 ? 'Free' : formatCurrency(event.price)}
          </Badge>
        </div>

        {!compact && event.description && (
          <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(event.event_date)}
          </span>
          {event.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.address}</span>
            </span>
          )}
          {event.max_attendees && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              Up to {event.max_attendees} attendees
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Badge variant="muted">{event.category}</Badge>
          {onRsvp && (
            <Button size="sm" className="ml-auto gap-1.5" onClick={() => onRsvp(event.id)}>
              <Ticket className="h-3.5 w-3.5" /> RSVP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
