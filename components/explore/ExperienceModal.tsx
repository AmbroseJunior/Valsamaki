'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, MapPin, Star, Clock, DollarSign, ChevronLeft, ChevronRight, Navigation, MessageSquare, Heart, Leaf, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Experience } from '@/types/experience'

interface ExperienceModalProps {
  experience: Experience | null
  onClose: () => void
}

export function ExperienceModal({ experience, onClose }: ExperienceModalProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (experience) {
      setImgIndex(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [experience])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && experience) setImgIndex((i) => (i - 1 + experience.images.length) % experience.images.length)
      if (e.key === 'ArrowRight' && experience) setImgIndex((i) => (i + 1) % experience.images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [experience, onClose])

  if (!experience) return null

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${experience.coordinates.lat},${experience.coordinates.lng}`

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full sm:max-w-2xl bg-[var(--color-card)] overflow-hidden z-10',
          'rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]',
          'max-h-[95dvh] overflow-y-auto'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image carousel */}
        <div className="relative aspect-video bg-[var(--color-muted)] shrink-0">
          <Image
            src={experience.images[imgIndex]}
            alt={experience.title}
            fill
            className="object-cover"
            unoptimized
          />

          {/* Nav arrows */}
          {experience.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i - 1 + experience.images.length) % experience.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % experience.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Heart */}
          <button
            onClick={() => setLiked((v) => !v)}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart className={cn('h-4 w-4', liked ? 'fill-[var(--highlight)] stroke-[var(--highlight)]' : 'stroke-gray-600')} />
          </button>

          {/* Thumbnails */}
          {experience.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {experience.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={cn('rounded-full transition-all', i === imgIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/60')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {experience.images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-[var(--color-muted)]">
            {experience.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={cn('relative w-14 h-10 rounded-[var(--radius-sm)] overflow-hidden shrink-0 transition-all', i === imgIndex ? 'ring-2 ring-[var(--highlight)]' : 'opacity-60 hover:opacity-90')}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Title + rating */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display font-bold text-xl text-[var(--color-foreground)] leading-snug">
                {experience.title}
              </h2>
              <div className="flex items-center gap-1 shrink-0 bg-[var(--highlight)] px-2.5 py-1 rounded-[var(--radius-full)]">
                <Star className="h-3.5 w-3.5 fill-[var(--highlight-foreground)] stroke-[var(--highlight-foreground)]" />
                <span className="text-xs font-bold text-[var(--highlight-foreground)]">{experience.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[var(--color-muted-foreground)]">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{experience.location}</span>
              {experience.distance !== undefined && <span>· {experience.distance} km away</span>}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{experience.description}</p>

          {/* Health benefits */}
          <div>
            <h3 className="font-display font-bold text-sm mb-2 text-[var(--color-foreground)]">Health Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {experience.healthBenefits.map((b) => (
                <span key={b} className="flex items-center gap-1 bg-[var(--color-green-bg)] text-[var(--color-green)] text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-full)]">
                  <Leaf className="h-3 w-3" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {experience.hours && (
              <div className="flex items-start gap-2 p-3 bg-[var(--color-muted)] rounded-[var(--radius)]">
                <Clock className="h-4 w-4 text-[var(--color-muted-foreground)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.65rem] text-[var(--color-muted-foreground)] uppercase font-semibold tracking-wide">Hours</p>
                  <p className="text-xs font-semibold mt-0.5">{experience.hours}</p>
                </div>
              </div>
            )}
            {experience.price && (
              <div className="flex items-start gap-2 p-3 bg-[var(--color-muted)] rounded-[var(--radius)]">
                <DollarSign className="h-4 w-4 text-[var(--color-muted-foreground)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[0.65rem] text-[var(--color-muted-foreground)] uppercase font-semibold tracking-wide">Price</p>
                  <p className="text-xs font-semibold mt-0.5">{experience.price}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {experience.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-[var(--radius-full)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
            <a
              href={`/chatbot?q=${encodeURIComponent('Tell me more about ' + experience.title)}`}
              className="flex items-center justify-center gap-2 flex-1 py-3 border-2 border-[var(--color-border)] text-[var(--color-foreground)] font-bold rounded-[var(--radius-full)] hover:border-[var(--highlight)] hover:bg-[var(--highlight)]/10 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Ask Valsamaki
            </a>
          </div>

          {/* Plan Your Visit */}
          <div className="flex items-center gap-3 p-4 bg-[var(--highlight)]/10 rounded-[var(--radius-lg)] border border-[var(--highlight)]/30">
            <Calendar className="h-5 w-5 text-[var(--color-foreground)] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[var(--color-foreground)]">Plan Your Visit</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Save to your itinerary and get personalised tips</p>
            </div>
            <button className="ml-auto text-xs font-bold bg-[var(--highlight)] text-[var(--highlight-foreground)] px-3 py-1.5 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors shrink-0">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
