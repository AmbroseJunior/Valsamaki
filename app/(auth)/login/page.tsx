'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'user' | 'producer'>('user')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const next = searchParams.get('next') ?? '/dashboard'
  const message = searchParams.get('message')

  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push(next)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      })
      if (authError) throw authError
      if (!data.user) throw new Error('Registration failed')
      await supabase.from('profiles').upsert({ id: data.user.id, name, role, language: 'en' })
      router.push('/onboarding')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  async function handleFacebook() {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center px-4 py-10 bg-[var(--color-background)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="valsamaki" className="w-14 h-14" />
            <span className="font-display font-semibold text-2xl text-[var(--color-foreground)]">valsamaki</span>
            <span className="text-sm text-[var(--color-muted-foreground)]">Discover authentic Crete</span>
          </Link>
        </div>

        {message && (
          <div className="mb-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {/* Card */}
        <div className="bg-[var(--color-card)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[var(--color-border)]">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={cn(
                  'flex-1 py-4 text-sm font-bold transition-colors',
                  tab === t
                    ? 'border-b-2 border-[var(--highlight)] text-[var(--color-foreground)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                )}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {tab === 'login' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-11 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nikos Papadakis"
                    required
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">I am a…</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['user', 'producer'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={cn(
                          'py-3 rounded-[var(--radius)] border text-sm font-semibold transition-colors',
                          role === r
                            ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)] border-[var(--highlight)]'
                            : 'border-[var(--color-border)] hover:bg-[var(--color-muted)] text-[var(--color-foreground)]'
                        )}
                      >
                        {r === 'user' ? '🗺️ Visitor' : '🧑‍🌾 Producer'}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--highlight)] text-[var(--highlight-foreground)] font-bold rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--color-card)] px-3 text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide">or continue with</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogle}
                className="flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] rounded-[var(--radius-full)] hover:bg-[var(--color-muted)] transition-colors text-sm font-semibold"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                onClick={handleFacebook}
                className="flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] rounded-[var(--radius-full)] hover:bg-[var(--color-muted)] transition-colors text-sm font-semibold"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden fill="#1877F2">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Guest access */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] underline-offset-2 hover:underline transition-colors"
              >
                Continue as guest →
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-4">
          By signing up you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <LoginForm />
    </Suspense>
  )
}
