import Image from 'next/image'
import Link from 'next/link'
import { validateUrl } from '@/lib/security'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe, Navigation } from 'lucide-react'
import type { BusinessRow } from '@/types/database'

interface ProducerCardProps {
  business: BusinessRow
  distanceKm?: number
}

export function ProducerCard({ business, distanceKm }: ProducerCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
      {business.images?.[0] ? (
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={business.images[0]}
            alt={business.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-[var(--color-muted)] flex items-center justify-center">
          <span className="text-4xl">🫒</span>
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold">{business.name}</h3>
          {distanceKm !== undefined && (
            <span className="text-xs text-[var(--color-muted-foreground)] shrink-0">
              {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
          {business.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{business.address}</span>
            </span>
          )}
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 hover:text-[var(--color-primary)]">
              <Phone className="h-3.5 w-3.5 shrink-0" /> {business.phone}
            </a>
          )}
          {business.website && validateUrl(business.website) && (
            <a href={validateUrl(business.website)!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--color-primary)] truncate">
              <Globe className="h-3.5 w-3.5 shrink-0" /> {business.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-1 pt-1 items-center">
          <Badge variant="default">{business.category}</Badge>
          {business.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="muted">{tag}</Badge>
          ))}
          {(business.lat && business.lng) ? (
            <Link
              href={`/map?lat=${business.lat}&lng=${business.lng}&label=${encodeURIComponent(business.name)}`}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[var(--highlight)] hover:underline"
            >
              <Navigation className="h-3 w-3" /> Directions
            </Link>
          ) : business.address ? (
            <Link
              href={`/map?q=${encodeURIComponent(business.address)}`}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[var(--highlight)] hover:underline"
            >
              <Navigation className="h-3 w-3" /> Directions
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
