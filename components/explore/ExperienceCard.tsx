'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Experience } from '@/types/experience'
import { useLikedExperiences } from '@/hooks/useLikedExperiences'

interface ExperienceCardProps {
  experience: Experience
  onClick?: (exp: Experience) => void
  className?: string
}

export function ExperienceCard({ experience, onClick, className }: ExperienceCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [imgHovered, setImgHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { isLiked, toggle: toggleLike } = useLikedExperiences()

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex((i) => (i - 1 + experience.images.length) % experience.images.length)
    setImgError(false)
  }, [experience.images.length])

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex((i) => (i + 1) % experience.images.length)
    setImgError(false)
  }, [experience.images.length])

  const handleToggleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(experience.id)
  }, [toggleLike, experience.id])

  return (
    <div
      className={cn(
        'bg-[var(--color-card)] rounded-[var(--radius-lg)] overflow-hidden cursor-pointer group card-hover',
        'border border-[var(--color-border)] shadow-[var(--shadow-card)]',
        className
      )}
      onClick={() => onClick?.(experience)}
    >
      {/* Image carousel */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-[var(--color-muted)]"
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-muted)]">
            <span className="text-4xl opacity-40">🏛️</span>
          </div>
        ) : (
          <Image
            src={experience.images[imgIndex]}
            alt={experience.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-[var(--radius-full)] uppercase tracking-wide">
            {experience.category.replace('_', ' ')}
          </span>
        </div>

        {/* New badge */}
        {experience.isNew && (
          <div className="absolute top-3 left-3 mt-7">
            <span className="bg-[var(--highlight)] text-[var(--highlight-foreground)] text-[0.65rem] font-bold px-2.5 py-1 rounded-[var(--radius-full)] uppercase tracking-wide">
              New
            </span>
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={handleToggleLike}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          aria-label={isLiked(experience.id) ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart className={cn('h-4 w-4 transition-colors', isLiked(experience.id) ? 'fill-[var(--highlight)] stroke-[var(--highlight)]' : 'stroke-gray-600')} />
        </button>

        {/* Image nav arrows */}
        {experience.images.length > 1 && imgHovered && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-700" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
              <ChevronRight className="h-3.5 w-3.5 text-gray-700" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {experience.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {experience.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                className={cn('rounded-full transition-all', i === imgIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 text-[var(--color-foreground)] flex-1">
            {experience.title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3.5 w-3.5 fill-[var(--highlight)] stroke-[var(--highlight)]" />
            <span className="text-xs font-bold text-[var(--color-foreground)]">{experience.rating}</span>
            <span className="text-xs text-[var(--color-muted-foreground)] ml-0.5">({experience.reviewCount})</span>
          </div>
        </div>

        {/* Location + distance */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] mb-3">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{experience.location}</span>
          {experience.distance !== undefined && (
            <span className="shrink-0 ml-auto text-[var(--color-muted-foreground)]">{experience.distance} km</span>
          )}
        </div>

        {/* Health benefit tags */}
        {experience.healthBenefits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {experience.healthBenefits.slice(0, 3).map((benefit) => (
              <span key={benefit} className="tag-health">
                🌿 {benefit}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
