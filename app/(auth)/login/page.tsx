'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

// OWASP A01 — client-side safe redirect (mirrors server-side safeRedirectPath)
function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard'
  const decoded = decodeURIComponent(raw)
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\')) return '/dashboard'
  if (/javascript:/i.test(decoded) || /data:/i.test(decoded)) return '/dashboard'
  return decoded
}

function LoginForm() {
  const searchParams = useSearchParams()
  const t = useTranslations('auth')
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
  const next = safeNext(searchParams.get('next'))
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
      setError(err instanceof Error ? err.message : t('signInFailed'))
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
      if (!data.user) throw new Error(t('registrationFailed'))
      await supabase.from('profiles').upsert({ id: data.user.id, name, role, language: 'en' })
      router.push('/onboarding')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (oauthError) setError(oauthError.message)
  }

  async function handleApple() {
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center px-4 py-10 bg-[var(--color-background)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v1.png" alt="valsamaki" className="w-16 h-16 object-contain" />
            <span className="font-display font-semibold text-2xl text-[var(--color-foreground)]">valsamaki</span>
            <span className="text-sm text-[var(--color-muted-foreground)]">{t('discoverCrete')}</span>
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
            {(['login', 'register'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => { setTab(tabKey); setError('') }}
                className={cn(
                  'flex-1 py-4 text-sm font-bold transition-colors',
                  tab === tabKey
                    ? 'border-b-2 border-[var(--highlight)] text-[var(--color-foreground)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                )}
              >
                {tabKey === 'login' ? t('logIn') : t('signUp')}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {tab === 'login' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('email')}</label>
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
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('password')}</label>
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
                  {loading ? <LoadingSpinner size="sm" /> : t('logIn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('fullName')}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nikos Papadakis"
                    required
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('email')}</label>
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
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('password')}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t('minChars', { n: 8 })}
                      className="w-full px-4 py-3 pr-11 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-shadow"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wide">{t('iAmA')}</label>
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
                        {r === 'user' ? `🗺️ ${t('visitor')}` : `🧑‍🌾 ${t('producer')}`}
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
                  {loading ? <LoadingSpinner size="sm" /> : t('createAccountBtn')}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--color-card)] px-3 text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide">{t('continueWith')}</span>
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
                onClick={handleApple}
                className="flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] rounded-[var(--radius-full)] hover:bg-[var(--color-muted)] transition-colors text-sm font-semibold"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Guest access */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] underline-offset-2 hover:underline transition-colors"
              >
                {t('continueAsGuest')}
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-4">
          {t('agreeTos')}
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
