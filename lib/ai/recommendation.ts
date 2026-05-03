import { createClient } from '@/lib/supabase/server'
import { mcpBridge } from './mcp-bridge'
import type { RecommendationItem } from '@/types/ai'
import { logger } from '@/lib/logger'

export async function generateRecommendations(
  userId: string,
  location: { lat: number; lng: number }
): Promise<RecommendationItem[]> {
  try {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('score', { ascending: false })
      .limit(20)

    if (existing && existing.length >= 5) {
      return existing as RecommendationItem[]
    }

    const response = await mcpBridge({
      task: 'recommend',
      userId,
      input: `Generate recommendations for user near lat:${location.lat} lng:${location.lng}`,
      context: { userLocation: location },
    })

    let items: RecommendationItem[] = []
    try {
      const parsed = JSON.parse(response.output)
      items = Array.isArray(parsed) ? parsed : []
    } catch {
      logger.warn('Failed to parse recommendation JSON', { raw: response.output })
      return existing as RecommendationItem[] ?? []
    }

    if (items.length > 0) {
      const expiresAt = new Date(Date.now() + 3_600_000).toISOString()
      const insertRows = items.map((item) => ({
        user_id: userId,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        score: item.score,
        reason: item.reason,
        source: response.provider as 'deepseek' | 'hybrid',
        generated_at: new Date().toISOString(),
        expires_at: expiresAt,
      }))

      await supabase.from('recommendations').insert(insertRows)
    }

    return items
  } catch (err) {
    logger.error('generateRecommendations error', err)
    return []
  }
}
