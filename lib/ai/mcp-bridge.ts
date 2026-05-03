import { getPrimaryProvider, getProvider } from './providers'
import { buildLocalContext } from './local-context'
import { createClient } from '@/lib/supabase/server'
import type { MCPRequest, MCPResponse, AIMessage } from '@/types/ai'
import { logger } from '@/lib/logger'

const CRETAN_ACCENT_PREAMBLE = `This audio may contain a Cretan Greek accent.
Common patterns include: 'ts' for 'ks', vowel dropping in unstressed syllables,
and Greek-English code-switching. Please transcribe accordingly and handle
Greek-English mixed speech gracefully.`

export async function mcpBridge(request: MCPRequest): Promise<MCPResponse> {
  const { task, userId, input, preferredProvider, context: extraContext } = request

  const location = extraContext?.userLocation ?? null

  const localContext = await buildLocalContext(
    userId,
    location,
    task === 'knowledge_query' || task === 'chat' ? input : undefined
  )

  const mergedContext = { ...localContext, ...extraContext }

  const provider =
    preferredProvider && preferredProvider !== 'auto'
      ? (getProvider(preferredProvider) ?? getPrimaryProvider())
      : getPrimaryProvider()

  logger.info('mcp-bridge routing', { task, provider: provider.name, userId })

  let output: string

  if (task === 'voice_setup') {
    const voicePrompt = `${CRETAN_ACCENT_PREAMBLE}\n\n${input}`
    output = await provider.complete(voicePrompt, mergedContext)
  } else if (task === 'recommend') {
    const recPrompt = buildRecommendationPrompt(input, mergedContext)
    output = await provider.complete(recPrompt, mergedContext)
  } else {
    const messages: AIMessage[] = [
      ...(mergedContext.conversationHistory ?? []),
      { role: 'user', content: input },
    ]
    output = await provider.chat(messages, mergedContext)
  }

  await saveMemory(userId, input, output)

  return { output, provider: provider.name }
}

async function saveMemory(userId: string, userInput: string, assistantOutput: string) {
  try {
    const supabase = await createClient()
    const sessionId = `session_${Date.now()}`

    await supabase.from('ai_memory').insert([
      { user_id: userId, session_id: sessionId, role: 'user', content: userInput },
      { user_id: userId, session_id: sessionId, role: 'assistant', content: assistantOutput },
    ])
  } catch (err) {
    logger.warn('Failed to save AI memory', err)
  }
}

function buildRecommendationPrompt(
  userContext: string,
  context: Awaited<ReturnType<typeof buildLocalContext>>
): string {
  return `Based on the following user context and nearby places, generate personalised recommendations for things to do, eat, and visit in Crete.

User context: ${userContext}

Nearby businesses: ${JSON.stringify(context.nearbyBusinesses?.slice(0, 10))}
Upcoming events: ${JSON.stringify(context.nearbyEvents?.slice(0, 10))}
User preferences: ${JSON.stringify(context.userPreferences)}

Return a JSON array of recommendations with fields: entity_id, entity_type, score (0-1), reason.
Only recommend from the provided data. Be specific and personal.`
}
