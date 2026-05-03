import { createClient } from '@/lib/supabase/server'
import type { KnowledgeNode } from '@/types/ai'
import { logger } from '@/lib/logger'

const TOPIC_KEYWORDS: Record<string, string[]> = {
  olive_oil: ['olive', 'evoo', 'olives', 'oil'],
  legumes: ['beans', 'lentils', 'chickpeas', 'legumes', 'pulses'],
  fish: ['fish', 'seafood', 'sardines', 'anchovy', 'octopus'],
  vegetables: ['vegetables', 'greens', 'salad', 'horta', 'purslane'],
  whole_grains: ['grain', 'bread', 'barley', 'wheat', 'pasta'],
  wine: ['wine', 'retsina', 'cretan wine'],
  herbs: ['oregano', 'thyme', 'sage', 'herbs', 'mountain tea'],
  dairy: ['cheese', 'graviera', 'mizithra', 'yogurt', 'dairy'],
  honey: ['honey', 'thyme honey', 'apiary'],
  cardiovascular: ['heart', 'cardiovascular', 'cholesterol', 'blood pressure'],
  longevity: ['longevity', 'aging', 'lifespan', 'centenarian'],
  diet: ['diet', 'nutrition', 'healthy', 'mediterranean', 'food'],
}

export async function traverseKnowledgeGraph(
  query: string,
  depth: number = 2
): Promise<KnowledgeNode[]> {
  try {
    const supabase = await createClient()
    const queryLower = query.toLowerCase()

    const seedLabels = Object.entries(TOPIC_KEYWORDS)
      .filter(([, keywords]) => keywords.some((kw) => queryLower.includes(kw)))
      .map(([label]) => label)

    if (seedLabels.length === 0) {
      const { data } = await supabase
        .from('knowledge_nodes')
        .select('*')
        .textSearch('description', query)
        .limit(5)
      return (data as KnowledgeNode[]) ?? []
    }

    const visitedIds = new Set<string>()
    const nodes: KnowledgeNode[] = []

    const { data: seedNodes } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .in('label', seedLabels)

    if (!seedNodes?.length) return []

    for (const node of seedNodes) {
      visitedIds.add(node.id)
      nodes.push(node as KnowledgeNode)
    }

    let frontier = seedNodes.map((n) => n.id)

    for (let d = 1; d < depth; d++) {
      if (frontier.length === 0) break

      const { data: edges } = await supabase
        .from('knowledge_edges')
        .select('to_node')
        .in('from_node', frontier)
        .order('weight', { ascending: false })
        .limit(20)

      const nextIds = (edges ?? []).map((e) => e.to_node).filter((id) => !visitedIds.has(id))
      if (nextIds.length === 0) break

      const { data: nextNodes } = await supabase
        .from('knowledge_nodes')
        .select('*')
        .in('id', nextIds)

      for (const node of nextNodes ?? []) {
        visitedIds.add(node.id)
        nodes.push(node as KnowledgeNode)
      }

      frontier = nextIds
    }

    return nodes
  } catch (err) {
    logger.error('traverseKnowledgeGraph error', err)
    return []
  }
}
