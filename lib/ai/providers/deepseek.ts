import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIContext } from '@/types/ai'
import { logger } from '@/lib/logger'
import { buildCretanKnowledgeBlock } from '@/lib/ai/cretan-knowledge'

const TIMEOUT_MS = 20_000

const STRICT_GROUNDING_RULES = `
## STRICT RESPONSE RULES
1. Health and nutrition claims: ONLY assert facts that appear in the CRETAN FOOD KNOWLEDGE BASE below. Always state the evidence level (in vitro, animal, small RCT, or large RCT/meta-analysis).
2. If asked about a health topic not covered in the knowledge base, say: "I don't have verified scientific data on that specific question — I'd recommend consulting a nutritionist or checking peer-reviewed sources."
3. Never invent study names, DOIs, dosages, or health outcomes. If you are uncertain, say so.
4. For local places, businesses, and events: ONLY recommend entities listed in the Local Context below. If nothing matches, say "I don't have that information for your area right now."
5. Be warm and helpful, but accuracy comes before enthusiasm. Never hallucinate.
`

const CRETAN_SYSTEM_PREAMBLE = `You are Valsamaki, an AI guide to authentic Crete. You specialize in Cretan cuisine, the Mediterranean diet, local producers, health science, events, and places.
${STRICT_GROUNDING_RULES}`

export class DeepSeekProvider implements AIProvider {
  name = 'deepseek'
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? '',
      baseURL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/v1',
    })
  }

  isAvailable(): boolean {
    return Boolean(process.env.DEEPSEEK_API_KEY)
  }

  async chat(messages: AIMessage[], context: AIContext): Promise<string> {
    if (!this.isAvailable()) throw new Error('DeepSeek API key not configured')

    const systemMessage = this.buildSystemMessage(context)
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await this.client.chat.completions.create(
        {
          model: 'deepseek-chat',
          messages: openaiMessages,
          temperature: 0.7,
          max_tokens: 512,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeout)
      return response.choices[0]?.message?.content ?? 'I could not generate a response.'
    } catch (err) {
      clearTimeout(timeout)
      const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('aborted'))
      if (isAbort) throw new Error('Request timed out — try again')
      logger.error('DeepSeek chat error', err)
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(msg)
    }
  }

  async complete(prompt: string, context: AIContext): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], context)
  }

  private buildSystemMessage(context: AIContext): string {
    const parts: string[] = [CRETAN_SYSTEM_PREAMBLE]

    // Always inject the verified food/health knowledge base
    try {
      parts.push(`\n${buildCretanKnowledgeBlock()}`)
    } catch (err) {
      logger.warn('Could not load Cretan knowledge block', err)
    }

    if (context.nearbyBusinesses?.length) {
      parts.push(
        `\n## Local Context — Nearby Businesses\n${JSON.stringify(context.nearbyBusinesses, null, 2)}`
      )
    }
    if (context.nearbyEvents?.length) {
      parts.push(
        `\n## Local Context — Upcoming Events\n${JSON.stringify(context.nearbyEvents, null, 2)}`
      )
    }
    if (context.knowledgeNodes?.length) {
      parts.push(
        `\n## Additional Knowledge Graph Nodes\n${context.knowledgeNodes
          .map((n) => `- ${n.label}: ${n.description}`)
          .join('\n')}`
      )
    }
    if (context.userPreferences) {
      parts.push(`\n## User Preferences\n${JSON.stringify(context.userPreferences, null, 2)}`)
    }

    return parts.join('\n')
  }
}
