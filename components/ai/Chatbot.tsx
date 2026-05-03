'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { VoiceInput } from './VoiceInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  'What are the best olive oil farms near me?',
  'Tell me about the Cretan diet and longevity',
  'What events are happening this weekend?',
  'Recommend a traditional Cretan restaurant',
]

interface ChatbotProps {
  userId: string
}

export function Chatbot({ userId }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), userId }),
      })

      if (!res.ok) throw new Error('Chat API error')
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: data.reply ?? 'Sorry, I could not generate a response.',
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'I am temporarily offline. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-display font-semibold text-lg">Ask me anything about Crete</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                Local knowledge, food, events, and Mediterranean wellness
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-[var(--radius)] border border-[var(--color-border)] text-sm hover:bg-[var(--color-muted)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-muted)]'
              )}>
                {msg.role === 'user'
                  ? <User className="h-4 w-4 text-white" />
                  : <Bot className="h-4 w-4 text-[var(--color-primary)]" />
                }
              </div>
              <Card className={cn(
                'max-w-[75%] p-3 text-sm',
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : ''
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
              <Bot className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <Card className="p-3 flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-[var(--color-muted-foreground)]">Thinking…</span>
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="flex gap-2"
        >
          <VoiceInput onTranscript={(text) => { setInput(text); sendMessage(text) }} disabled={loading} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Crete…"
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
