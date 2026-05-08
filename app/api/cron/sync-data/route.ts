import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EXPERIENCES } from '@/lib/data/experiences'
import { SCRAPED_EXPERIENCES } from '@/lib/data/scrapedExperiences'
import { SCRAPED_PLACES } from '@/lib/data/scrapedPlaces'
import { FARMERS_MARKETS } from '@/lib/data/farmersMarkets'
import type { KnowledgeNode } from '@/types/ai'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const nodes: KnowledgeNode[] = [
    ...[...EXPERIENCES, ...SCRAPED_EXPERIENCES].map((e) => ({
      id: `exp_${e.id}`,
      label: e.category,
      category: 'activity' as const,
      description: `${e.title} in ${e.location}. ${e.shortDescription} Health benefits: ${e.healthBenefits.join(', ')}.${e.price ? ` Price: ${e.price}.` : ''}`,
      source_citations: e.source ? [e.source.url] : [],
    })),
    ...SCRAPED_PLACES.map((p) => ({
      id: `place_${p.id}`,
      label: p.category,
      category: 'activity' as const,
      description: `${p.title} in ${p.region}. ${p.description}`,
      source_citations: [],
    })),
    ...FARMERS_MARKETS.map((m) => ({
      id: `market_${m.id}`,
      label: 'market',
      category: 'food' as const,
      description: `${m.nameEn} farmers market in ${m.area}. Open every ${m.day}, ${m.hours}.`,
      source_citations: [],
    })),
  ]

  const { error } = await supabase
    .from('knowledge_nodes')
    .upsert(nodes, { onConflict: 'id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ synced: nodes.length, timestamp: new Date().toISOString() })
}
