'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Globe, Edit, Trash2 } from 'lucide-react'
import type { BusinessRow } from '@/types/database'

interface BusinessProfileProps {
  business: BusinessRow
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function BusinessProfile({ business, isOwner, onEdit, onDelete }: BusinessProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{business.name}</CardTitle>
            <Badge variant="default" className="mt-1">{business.category}</Badge>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {business.images?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {business.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${business.name} ${i + 1}`}
                className="h-32 w-48 object-cover rounded-[var(--radius)] shrink-0"
              />
            ))}
          </div>
        )}

        {business.description && (
          <p className="text-sm text-[var(--color-muted-foreground)]">{business.description}</p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          {business.address && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-primary)] shrink-0" /> {business.address}
            </span>
          )}
          {business.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center gap-2 hover:text-[var(--color-primary)]">
              <Phone className="h-4 w-4 text-[var(--color-primary)] shrink-0" /> {business.phone}
            </a>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--color-primary)]">
              <Globe className="h-4 w-4 text-[var(--color-primary)] shrink-0" /> {business.website}
            </a>
          )}
        </div>

        {business.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {business.tags.map((tag) => (
              <Badge key={tag} variant="muted">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
