'use client'

import { useState } from 'react'
import { Mail, X } from 'lucide-react'

interface WaitlistModalProps {
  locale?: string
  onDismiss: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function WaitlistModal({ locale, onDismiss }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale, source: 'language_picker' }),
      })
      const data = await res.json() as { ok?: boolean; already?: boolean; error?: string }
      if (data.already) setStatus('duplicate')
      else if (data.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const done = status === 'success' || status === 'duplicate'

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center p-5 sm:p-8 overflow-y-auto"
      style={{ background: 'linear-gradient(150deg, #0f1a0f 0%, #1c2a0e 40%, #1a1c0a 100%)' }}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FCDA06 0%, transparent 70%)' }}
        />
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        aria-label="Close"
        className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-sm space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(252,218,6,0.12)', border: '1.5px solid rgba(252,218,6,0.3)' }}
          >
            <Mail className="h-8 w-8" style={{ color: '#FCDA06' }} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Be the first to know</h2>
          <p className="text-white/55 text-sm leading-relaxed">
            Valsamaki is coming soon. Join the waitlist and we&apos;ll reach out the moment we launch.
          </p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="text-5xl">{status === 'success' ? '🎉' : '✅'}</div>
            <p className="text-white font-semibold text-lg">
              {status === 'success' ? "You're on the list!" : "You're already on the list!"}
            </p>
            <p className="text-white/50 text-sm">We&apos;ll reach out when Valsamaki goes live.</p>
            <button
              onClick={onDismiss}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: '#FCDA06', color: '#1a1c0a' }}
            >
              Explore Crete →
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all placeholder:text-white/30"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                color: 'white',
                caretColor: '#FCDA06',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(252,218,6,0.6)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            />

            {status === 'error' && (
              <p className="text-red-400 text-xs">Something went wrong — please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !EMAIL_RE.test(email.trim())}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#FCDA06', color: '#1a1c0a' }}
            >
              {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
