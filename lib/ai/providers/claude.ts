import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIMessage, AIContext } from '@/types/ai'
import { logger } from '@/lib/logger'

const SYSTEM_PROMPT = `You are Ask Valsamaki, an AI assistant specializing in Crete, Greece.
You have deep knowledge of Cretan cuisine, the Mediterranean diet, local producers, olive oil,
thyme honey, traditional herbs, local events, wellness practices, and places to visit.
Always prioritize information from the provided local context before using your general knowledge.
Respond helpfully, warmly, and concisely. Keep answers focused and practical.
When recommending places or products, be specific about Cretan origins and health benefits.`

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    })
  }

  isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY)
  }

  async chat(messages: AIMessage[], context: AIContext): Promise<string> {
    if (!this.isAvailable()) throw new Error('Anthropic API key not configured')

    const systemWithContext = this.buildSystem(context)

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: context.maxTokens ?? 1024,
        system: systemWithContext,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      const block = response.content[0]
      return block.type === 'text' ? block.text : 'I could not generate a response.'
    } catch (err) {
      logger.error('Claude chat error', err)
      return 'I am temporarily unavailable. Please try again in a moment.'
    }
  }

  async complete(prompt: string, context: AIContext): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], context)
  }

  private buildSystem(context: AIContext): string {
    const parts: string[] = [SYSTEM_PROMPT]

    if (context.nearbyBusinesses?.length) {
      parts.push(`\n## Nearby Businesses\n${JSON.stringify(context.nearbyBusinesses, null, 2)}`)
    }
    if (context.nearbyEvents?.length) {
      parts.push(`\n## Upcoming Events Nearby\n${JSON.stringify(context.nearbyEvents, null, 2)}`)
    }
    if (context.knowledgeNodes?.length) {
      parts.push(`\n## Mediterranean Diet Knowledge\n${context.knowledgeNodes.map((n) => `- ${n.label}: ${n.description}`).join('\n')}`)
    }
    if (context.userPreferences) {
      parts.push(`\n## User Preferences\n${JSON.stringify(context.userPreferences, null, 2)}`)
    }

    return parts.join('\n')
  }
}
