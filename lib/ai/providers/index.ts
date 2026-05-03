export type { AIProvider } from '@/types/ai'
export { ClaudeProvider } from './claude'
export { DeepSeekProvider } from './deepseek'
export { GeminiProvider } from './gemini'

import { ClaudeProvider } from './claude'
import { DeepSeekProvider } from './deepseek'
import { GeminiProvider } from './gemini'
import type { AIProvider } from '@/types/ai'

const providers: AIProvider[] = [
  new ClaudeProvider(),   // preferred: claude-haiku, fast + cheap
  new DeepSeekProvider(), // fallback: deepseek-chat
  new GeminiProvider(),   // fallback: gemini
]

export function getAvailableProviders(): AIProvider[] {
  return providers.filter((p) => p.isAvailable())
}

export function getProvider(name: string): AIProvider | undefined {
  return providers.find((p) => p.name === name && p.isAvailable())
}

export function getPrimaryProvider(): AIProvider {
  const available = getAvailableProviders()
  if (available.length === 0) throw new Error('No AI providers configured. Add ANTHROPIC_API_KEY or DEEPSEEK_API_KEY to your environment variables.')
  return available[0]
}
