'use client'

import { RoleGate } from '@/components/shared/RoleGate'
import { AICard } from '@/components/ai/AICard'
import { ProducerCard } from '@/components/producers/ProducerCard'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useRole } from '@/hooks/useRole'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'
import type { BusinessRow } from '@/types/database'

function ExploreContent() {
  const { userId } = useRole()
  const { data: recommendations, isLoading } = useRecommendations(userId)
  const supabase = createClient()

  const entityIds = (recommendations ?? [])
    .filter((r) => r.entity_type === 'business')
    .map((r) => r.entity_id)

  const { data: businesses } = useQuery({
    queryKey: ['rec-businesses', entityIds],
    enabled: entityIds.length > 0,
    queryFn: async (): Promise<BusinessRow[]> => {
      const { data } = await supabase.from('businesses').select('*').in('id', entityIds)
      return (data ?? []) as BusinessRow[]
    },
  })

  if (isLoading) return <PageLoader />

  const bizMap = Object.fromEntries((businesses ?? []).map((b) => [b.id, b]))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--color-honey)]" />
        <h2 className="font-display font-semibold text-lg">Recommended for You</h2>
      </div>

      {!recommendations?.length && (
        <div className="text-center py-16 text-[var(--color-muted-foreground)]">
          <p>Complete your onboarding to get personalised recommendations.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(recommendations ?? []).map((rec) => (
          <div key={rec.id} className="space-y-2">
            <AICard recommendation={rec} entityName={bizMap[rec.entity_id]?.name} />
            {rec.entity_type === 'business' && bizMap[rec.entity_id] && (
              <ProducerCard business={bizMap[rec.entity_id]} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <div className="max-w-[var(--max-content-width)] mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Explore Crete</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          AI-powered discoveries tailored to your preferences
        </p>
      </div>
      <RoleGate allow={['user', 'producer', 'admin']}>
        <ExploreContent />
      </RoleGate>
    </div>
  )
}
