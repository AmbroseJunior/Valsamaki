'use client'

import { Heart, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLikedExperiences } from '@/hooks/useLikedExperiences'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'

const ALL_EXPERIENCES = [...EXPERIENCES, ...SCRAPED_EXPERIENCES]

export function LikedExperiencesSection() {
  const { liked } = useLikedExperiences()

  if (liked.size === 0) return null

  const likedExps = ALL_EXPERIENCES.filter((exp) => liked.has(exp.id))
  if (likedExps.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Heart className="h-4 w-4 fill-[var(--highlight)] stroke-[var(--highlight)]" />
          Liked Experiences
        </h2>
        <Link
          href="/explore"
          className="text-xs font-semibold text-[var(--highlight)] hover:underline flex items-center gap-1"
        >
          Explore all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {likedExps.map((exp) => (
          <Link
            key={exp.id}
            href={`/explore?q=${encodeURIComponent(exp.title)}`}
            className="group block"
          >
            <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--color-muted)]">
              {exp.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exp.images[0]}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-2 right-2 p-1 rounded-full bg-white/80">
                <Heart className="h-3 w-3 fill-[var(--highlight)] stroke-[var(--highlight)]" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{exp.title}</p>
                <p className="text-white/70 text-[10px] mt-0.5 flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />{exp.location}
                </p>
              </div>
            </div>
            {exp.price && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1 px-0.5 truncate">{exp.price}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
