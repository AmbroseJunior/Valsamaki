'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, X, Bot, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('chatbot')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading || !userId) return
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: trimmed }
    setMessages((p) => [...p, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, userId }),
      })
      const data = await res.json() as { reply?: string }
      setMessages((p) => [...p, { id: `a_${Date.now()}`, role: 'assistant', content: data.reply ?? t('errorResponse') }])
    } catch {
      setMessages((p) => [...p, { id: `e_${Date.now()}`, role: 'assistant', content: t('offlineError') }])
    } finally {
      setLoading(false)
    }
  }

  const isGuest = userId === null
  const isLoading = userId === undefined

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        'bottom-[calc(var(--bottom-nav-height)+12px)] right-3',
        'md:bottom-6 md:right-5',
      )}
    >
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-[340px] sm:w-[380px] rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden"
          style={{ height: '460px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)] shrink-0">
            <div className="w-7 h-7 rounded-full bg-[var(--highlight)] flex items-center justify-center text-sm">🫒</div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">{t('headerTitle')}</p>
              <p className="text-[10px] text-[var(--color-muted-foreground)]">{t('headerSubtitle')}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-[var(--color-muted-foreground)] text-sm">{t('loading')}</div>
          ) : isGuest ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--highlight)]/20 flex items-center justify-center text-2xl">🫒</div>
              <div>
                <p className="font-bold text-base">{t('guestTitle')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('guestSubtitle')}</p>
              </div>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-full bg-[var(--highlight)] text-[var(--highlight-foreground)] text-sm font-bold hover:bg-[var(--highlight-dark)] transition-colors"
              >
                {t('guestSignIn')}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-4">
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{t('promptTitle')}</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      {[t('quickSuggestion1'), t('quickSuggestion2'), t('quickSuggestion3')].map((s) => (
                        <button key={s} onClick={() => send(s)} className="text-left text-xs p-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:bg-[var(--highlight)]/10 hover:border-[var(--highlight)] transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs', msg.role === 'user' ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]' : 'bg-[var(--color-muted)]')}>
                      {msg.role === 'user' ? '👤' : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={cn('max-w-[82%] px-3 py-2 rounded-[var(--radius-xl)] text-xs leading-relaxed', msg.role === 'user' ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-tr-sm' : 'bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-tl-sm')}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-muted)] flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-[var(--color-muted)] rounded-[var(--radius-xl)] rounded-tl-sm px-3 py-2 flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted-foreground)] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[var(--color-border)] p-2 shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border border-[var(--color-border)] rounded-full px-3 py-1.5 bg-[var(--color-card)] focus-within:ring-2 focus-within:ring-[var(--highlight)]">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('inputPlaceholder')}
                    disabled={loading}
                    className="flex-1 bg-transparent outline-none text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
                  />
                  <button type="submit" disabled={loading || !input.trim()} className="p-1 rounded-full bg-[var(--highlight)] text-[var(--highlight-foreground)] disabled:opacity-40">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'ml-auto flex items-center justify-center w-12 h-12 rounded-full shadow-[var(--shadow-lg)] transition-all duration-200',
          open
            ? 'bg-[var(--color-muted)] text-[var(--color-foreground)]'
            : 'bg-[var(--highlight)] text-[var(--highlight-foreground)] hover:scale-105'
        )}
        aria-label={t('openAriaLabel')}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  )
}
