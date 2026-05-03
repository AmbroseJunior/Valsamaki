'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useRole } from '@/hooks/useRole'
import type { UserRole } from '@/types/roles'
import { ROLE_HIERARCHY } from '@/types/roles'

interface RoleGateProps {
  allow: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGate({ allow, children, fallback, redirectTo = '/login' }: RoleGateProps) {
  const { role, loading } = useRole()
  const router = useRouter()

  const allowed = allow.some((r) => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[r])

  useEffect(() => {
    if (!loading && !allowed && !fallback) {
      router.push(`${redirectTo}?message=Sign+up+to+access+this+feature`)
    }
  }, [loading, allowed, fallback, redirectTo, router])

  if (loading) return null
  if (!allowed) return fallback ? <>{fallback}</> : null
  return <>{children}</>
}
