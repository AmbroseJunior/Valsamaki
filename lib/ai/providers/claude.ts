import type { AIProvider, AIMessage, AIContext } from '@/types/ai'

// STUB — activate by setting ANTHROPIC_API_KEY in .env.local
// Replace this file's body with the Anthropic SDK implementation when ready.
export class ClaudeProvider implements AIProvider {
  name = 'claude'

  isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY)
  }

  async chat(_messages: AIMessage[], _context: AIContext): Promise<string> {
    throw new Error('Claude provider not yet active. Set ANTHROPIC_API_KEY to enable.')
  }

  async complete(_prompt: string, _context: AIContext): Promise<string> {
    throw new Error('Claude provider not yet active. Set ANTHROPIC_API_KEY to enable.')
  }
}
