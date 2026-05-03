export type { AIProvider } from '@/types/ai'
export { DeepSeekProvider } from './deepseek'
export { ClaudeProvider } from './claude'
export { GeminiProvider } from './gemini'

import { DeepSeekProvider } from './deepseek'
import { ClaudeProvider } from './claude'
import { GeminiProvider } from './gemini'
import type { AIProvider } from '@/types/ai'

const providers: AIProvider[] = [
  new DeepSeekProvider(),
  new ClaudeProvider(),
  new GeminiProvider(),
]

export function getAvailableProviders(): AIProvider[] {
  return providers.filter((p) => p.isAvailable())
}

export function getProvider(name: string): AIProvider | undefined {
  return providers.find((p) => p.name === name && p.isAvailable())
}

export function getPrimaryProvider(): AIProvider {
  const deepseek = providers.find((p) => p.name === 'deepseek')
  if (deepseek?.isAvailable()) return deepseek
  const available = getAvailableProviders()
  if (available.length === 0) throw new Error('No AI providers available')
  return available[0]
}
