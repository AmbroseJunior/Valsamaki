'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'producer'>('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      })

      if (authError) throw authError
      if (!data.user) throw new Error('Registration failed')

      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        role,
        language: 'en',
      })

      router.push('/onboarding')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <span className="text-4xl">🫒</span>
          <h1 className="font-display text-2xl font-bold mt-2">Join Valsamaki</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Your gateway to authentic Crete</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create account</CardTitle>
            <CardDescription>Discover Crete like a local</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nikos Papadakis" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label>I am a…</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['user', 'producer'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-[var(--radius)] border text-sm font-medium transition-colors ${role === r ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:bg-[var(--color-muted)]'}`}
                    >
                      {r === 'user' ? '🗺️ Visitor / Local' : '🧑‍🌾 Producer / Business'}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-center text-[var(--color-muted-foreground)] w-full">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-xs text-center text-[var(--color-muted-foreground)]">
          By signing up you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}
