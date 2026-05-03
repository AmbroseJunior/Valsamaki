import type { AIProvider, AIMessage, AIContext } from '@/types/ai'

// STUB — activate by setting GEMINI_API_KEY in .env.local
// Replace this file's body with the Google Generative AI SDK implementation when ready.
export class GeminiProvider implements AIProvider {
  name = 'gemini'

  isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY)
  }

  async chat(_messages: AIMessage[], _context: AIContext): Promise<string> {
    throw new Error('Gemini provider not yet active. Set GEMINI_API_KEY to enable.')
  }

  async complete(_prompt: string, _context: AIContext): Promise<string> {
    throw new Error('Gemini provider not yet active. Set GEMINI_API_KEY to enable.')
  }
}
