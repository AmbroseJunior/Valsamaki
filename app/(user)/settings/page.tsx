'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    if (confirmText !== 'DELETE') return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to delete account')
      }

      // Sign out globally, clear all local Supabase storage, then hard-redirect
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'global' })

      // Wipe any remaining Supabase keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key)
      })

      // Hard redirect — clears React/Next.js client cache entirely
      window.location.href = '/login?message=Account+deleted+successfully'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)]">Settings</h1>

      {/* Account actions */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm text-[var(--color-foreground)]">Account</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-5 py-4 text-sm hover:bg-[var(--color-muted)] transition-colors text-left"
          >
            <LogOut className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[var(--color-card)] border border-[var(--color-destructive)]/30 rounded-[var(--radius-2xl)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5">
          <h2 className="font-semibold text-sm text-[var(--color-destructive)]">Danger Zone</h2>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">Delete your account</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Permanently removes your account, profile, and all data. This cannot be undone.
            </p>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] border border-[var(--color-destructive)] text-[var(--color-destructive)] text-sm font-semibold hover:bg-[var(--color-destructive)] hover:text-white transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2 p-3 rounded-[var(--radius)] bg-[var(--color-destructive)]/8 border border-[var(--color-destructive)]/20">
                <AlertTriangle className="h-4 w-4 text-[var(--color-destructive)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-destructive)]">
                  Type <strong>DELETE</strong> to confirm. This action is permanent.
                </p>
              </div>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-destructive)] transition-shadow"
              />
              {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                  className="flex-1 py-2.5 rounded-[var(--radius-full)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-muted)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className={cn(
                    'flex-1 py-2.5 rounded-[var(--radius-full)] text-sm font-bold transition-colors',
                    confirmText === 'DELETE' && !deleting
                      ? 'bg-[var(--color-destructive)] text-white hover:opacity-90'
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] cursor-not-allowed'
                  )}
                >
                  {deleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
