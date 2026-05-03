'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/roles'

export function useRole() {
  const [role, setRole] = useState<UserRole>('guest')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setRole('guest'); setLoading(false); return }

      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const profile = data as { role: UserRole } | null
      setRole(profile?.role ?? 'user')
      setLoading(false)
    }

    loadRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadRole() })
    return () => { subscription.unsubscribe() }
  }, [])

  return { role, userId, loading }
}
