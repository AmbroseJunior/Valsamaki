export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIContext {
  userPreferences?: Record<string, unknown>
  recentInteractions?: unknown[]
  nearbyBusinesses?: unknown[]
  nearbyEvents?: unknown[]
  knowledgeNodes?: KnowledgeNode[]
  conversationHistory?: AIMessage[]
  userLocation?: { lat: number; lng: number }
  maxTokens?: number
}

export interface AIProvider {
  name: string
  isAvailable(): boolean
  chat(messages: AIMessage[], context: AIContext): Promise<string>
  complete(prompt: string, context: AIContext): Promise<string>
}

export interface MCPRequest {
  task: 'chat' | 'recommend' | 'voice_setup' | 'knowledge_query' | 'trend_analysis'
  userId: string
  input: string
  preferredProvider?: 'deepseek' | 'claude' | 'gemini' | 'auto'
  context?: Partial<AIContext>
}

export interface MCPResponse {
  output: string
  provider: string
  tokensUsed?: number
  cached?: boolean
}

export interface KnowledgeNode {
  id: string
  label: string
  category: 'food' | 'activity' | 'health_outcome' | 'recipe' | 'tradition'
  description: string
  source_citations: string[]
}

export interface KnowledgeEdge {
  from_node: string
  to_node: string
  relationship: string
  weight: number
}

export interface RecommendationItem {
  id: string
  entity_type: 'business' | 'event'
  entity_id: string
  score: number
  reason: string
  source: 'deepseek' | 'hybrid'
  generated_at: string
  expires_at: string
}
