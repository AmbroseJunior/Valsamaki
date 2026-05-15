'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ComingSoonPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'coming_soon' }),
      })
      const data = await res.json() as { ok?: boolean; already?: boolean }
      if (data.ok || data.already) {
        router.push('/thank-you')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex flex-col items-center justify-center p-5 sm:p-8 overflow-y-auto"
      style={{ background: 'linear-gradient(150deg, #0f1a0f 0%, #1c2a0e 40%, #1a1c0a 100%)' }}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FCDA06 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v1.png" alt="Valsamaki" className="w-14 h-14 object-contain drop-shadow-lg" />
          <div className="text-left">
            <p className="font-display font-bold text-white text-3xl tracking-tight leading-none">valsamaki</p>
            <p className="text-[#FCDA06] text-xs font-semibold mt-0.5 tracking-widest uppercase">Authentic Crete</p>
          </div>
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(252,218,6,0.12)', border: '1px solid rgba(252,218,6,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FCDA06] animate-pulse" />
          <span className="text-[#FCDA06] text-xs font-bold tracking-widest uppercase">Coming Soon</span>
        </div>

        {/* Headline */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Something special<br />is brewing in Crete.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Valsamaki connects you with authentic Cretan producers, local experiences,
            and the real Mediterranean diet. Leave your email — we&apos;ll reach out
            the moment we go live.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-3 text-left">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)' }}
            onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(252,218,6,0.6)' }}
            onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
          >
            <Mail className="h-4 w-4 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              autoComplete="email"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/25"
              style={{ color: 'white', caretColor: '#FCDA06' }}
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs pl-1">Something went wrong — please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !EMAIL_RE.test(email.trim())}
            className="w-full py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#FCDA06', color: '#1a1c0a' }}
          >
            {status === 'loading' ? 'Joining…' : 'Notify me at launch 🫒'}
          </button>
        </form>

        <p className="text-white/15 text-xs">
          © {new Date().getFullYear()} Valsamaki · Heraklion, Crete, Greece
        </p>
      </div>
    </div>
  )
}
