import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIContext } from '@/types/ai'
import { logger } from '@/lib/logger'

const TIMEOUT_MS = 8_000

// Gemini via its OpenAI-compatible REST endpoint — no extra SDK needed
export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY ?? '',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    })
  }

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY)
  }

  async chat(messages: AIMessage[], context: AIContext): Promise<string> {
    if (!this.isAvailable()) throw new Error('Gemini API key not configured')

    const systemParts: string[] = [
      'You are Valsamaki, an AI guide to authentic Crete. Specialise in Cretan cuisine, the Mediterranean diet, local producers, health science, events, and places.',
      'Only make health claims supported by verified scientific evidence. Always state evidence quality.',
    ]
    if (context.nearbyBusinesses?.length) {
      systemParts.push(`Nearby businesses: ${JSON.stringify(context.nearbyBusinesses.slice(0, 5))}`)
    }
    if (context.userPreferences) {
      systemParts.push(`User preferences: ${JSON.stringify(context.userPreferences)}`)
    }

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemParts.join('\n') },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await this.client.chat.completions.create(
        {
          model: 'gemini-2.0-flash',
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
      logger.error('Gemini chat error', err)
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`Gemini: ${msg}`)
    }
  }

  async complete(prompt: string, context: AIContext): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }], context)
  }
}
