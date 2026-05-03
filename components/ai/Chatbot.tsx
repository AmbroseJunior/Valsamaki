'use client'

import { useState, useRef, useEffect } from 'react'
import { VoiceInput } from './VoiceInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Send, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'What are the best olive oil farms near me?',
  'Tell me about the Cretan diet and longevity',
  'What events are happening this weekend?',
  'Recommend a traditional Cretan restaurant',
]

export function Chatbot({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, userId }),
      })

      const data = await res.json() as { reply?: string }
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', content: data.reply ?? 'Sorry, I could not respond.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, role: 'assistant', content: 'I am temporarily offline. Please try again.' },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-5 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-[var(--highlight)] flex items-center justify-center shadow-[var(--shadow-md)]">
              <span className="text-2xl">🫒</span>
            </div>
            <div>
              <p className="font-display font-bold text-xl text-[var(--color-foreground)]">Ask me anything about Crete</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                Local food, producers, wellness, events, and the Mediterranean diet
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="text-left p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-sm hover:bg-[var(--highlight)]/10 hover:border-[var(--highlight)] transition-colors text-[var(--color-foreground)]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
              msg.role === 'user'
                ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                : 'bg-[var(--color-muted)]'
            )}>
              {msg.role === 'user' ? '👤' : <Bot className="h-4 w-4 text-[var(--color-foreground)]" />}
            </div>
            <div className={cn(
              'max-w-[78%] px-4 py-3 rounded-[var(--radius-xl)] text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-tr-[var(--radius-sm)]'
                : 'bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-tl-[var(--radius-sm)]'
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-muted)] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-[var(--color-foreground)]" />
            </div>
            <div className="bg-[var(--color-muted)] rounded-[var(--radius-xl)] rounded-tl-[var(--radius-sm)] px-4 py-3 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-muted-foreground)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-background)]">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="flex items-center gap-2 border border-[var(--color-border)] rounded-[var(--radius-full)] px-4 py-2 bg-[var(--color-card)] focus-within:ring-2 focus-within:ring-[var(--highlight)] transition-shadow"
        >
          <VoiceInput onTranscript={(text) => { setInput(text); send(text) }} disabled={loading} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Crete…"
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-full bg-[var(--highlight)] text-[var(--highlight-foreground)] hover:bg-[var(--highlight-dark)] transition-colors disabled:opacity-40"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
