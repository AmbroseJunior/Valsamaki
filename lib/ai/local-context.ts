import { createClient } from '@/lib/supabase/server'
import type { AIContext } from '@/types/ai'
import { logger } from '@/lib/logger'
import { traverseKnowledgeGraph } from './knowledge-graph'
import { buildDataFileContext } from './data-context'

const INTERACTION_LIMIT = 20
const MEMORY_LIMIT = 20
const NEARBY_RADIUS_KM = 10

export async function buildLocalContext(
  userId: string,
  location: { lat: number; lng: number } | null,
  queryTopic?: string
): Promise<AIContext> {
  const context: AIContext = {
    userLocation: location ?? undefined,
    staticData: buildDataFileContext(),
  }

  try {
    const supabase = await createClient()

    const [profileResult, interactionsResult, memoryResult] = await Promise.allSettled([
      supabase.from('profiles').select('preferences').eq('id', userId).single(),
      supabase
        .from('user_interactions')
        .select('entity_type, entity_id, action, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(INTERACTION_LIMIT),
      supabase
        .from('ai_memory')
        .select('role, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MEMORY_LIMIT),
    ])

    if (profileResult.status === 'fulfilled' && profileResult.value.data) {
      context.userPreferences = profileResult.value.data.preferences as Record<string, unknown> | undefined ?? undefined
    }
    if (interactionsResult.status === 'fulfilled') {
      context.recentInteractions = interactionsResult.value.data ?? []
    }
    if (memoryResult.status === 'fulfilled' && memoryResult.value.data) {
      context.conversationHistory = memoryResult.value.data
        .reverse()
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    }

    if (location) {
      const [bizResult, evtResult] = await Promise.allSettled([
        fetchNearby(supabase, 'businesses', location, NEARBY_RADIUS_KM),
        fetchNearby(supabase, 'events', location, NEARBY_RADIUS_KM),
      ])

      if (bizResult.status === 'fulfilled') context.nearbyBusinesses = bizResult.value
      if (evtResult.status === 'fulfilled') context.nearbyEvents = evtResult.value
    }

    if (queryTopic) {
      try {
        context.knowledgeNodes = await traverseKnowledgeGraph(queryTopic, 2)
      } catch (e) {
        logger.warn('Knowledge graph traversal failed', e)
      }
    }
  } catch (err) {
    logger.error('buildLocalContext failed', err)
  }

  return context
}

async function fetchNearby(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'businesses' | 'events',
  location: { lat: number; lng: number },
  radiusKm: number
): Promise<unknown[]> {
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((location.lat * Math.PI) / 180))

  const { data } = await supabase
    .from(table)
    .select('id, name, description, category, lat, lng, tags')
    .eq('is_active', true)
    .gte('lat', location.lat - latDelta)
    .lte('lat', location.lat + latDelta)
    .gte('lng', location.lng - lngDelta)
    .lte('lng', location.lng + lngDelta)
    .limit(20)

  return data ?? []
}
