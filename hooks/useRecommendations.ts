'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RecommendationItem } from '@/types/ai'

export function useRecommendations(userId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recommendations', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<RecommendationItem[]> => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(20)

      if (error) throw error
      return (data ?? []) as RecommendationItem[]
    },
  })
}
