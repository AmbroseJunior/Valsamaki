'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'valsamaki_liked_experiences'

export function useLikedExperiences() {
  const [liked, setLiked] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setLiked(new Set(JSON.parse(stored) as string[]))
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(KEY, JSON.stringify(Array.from(next))) } catch { /* ignore */ }
      return next
    })
  }, [])

  const isLiked = useCallback((id: string) => liked.has(id), [liked])

  return { liked, toggle, isLiked }
}
