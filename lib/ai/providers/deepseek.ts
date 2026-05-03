import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIContext } from '@/types/ai'
import { logger } from '@/lib/logger'

const TIMEOUT_MS = 8_000
const CRETAN_SYSTEM_PREAMBLE = `You are Valsamaki, an AI assistant specializing in Crete, Greece.
You have deep knowledge of Cretan cuisine, the Mediterranean diet, local producers, events,
and places. Always prioritize information from the provided local context before using your
general training knowledge. Respond helpfully, warmly, and concisely.`

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
      logger.error('DeepSeek chat error', err)
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`DeepSeek: ${msg}`)
    }
  }

  async complete(prompt: string, context: AIContext): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], context)
  }

  private buildSystemMessage(context: AIContext): string {
    const parts: string[] = [CRETAN_SYSTEM_PREAMBLE]

    if (context.nearbyBusinesses?.length) {
      parts.push(
        `\n## Nearby Businesses\n${JSON.stringify(context.nearbyBusinesses, null, 2)}`
      )
    }
    if (context.nearbyEvents?.length) {
      parts.push(
        `\n## Upcoming Events Nearby\n${JSON.stringify(context.nearbyEvents, null, 2)}`
      )
    }
    if (context.knowledgeNodes?.length) {
      parts.push(
        `\n## Mediterranean Diet Knowledge\n${context.knowledgeNodes
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
