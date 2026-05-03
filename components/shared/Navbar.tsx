'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Map, LayoutDashboard, Calendar, Compass, MessageSquare, Building2, BarChart3, Megaphone, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'

const USER_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/chatbot', label: 'AI Chat', icon: MessageSquare },
]

const PRODUCER_NAV = [
  { href: '/business', label: 'My Business', icon: Building2 },
  { href: '/advertise', label: 'Advertise', icon: Megaphone },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const { role } = useRole()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = role === 'guest' ? [] : role === 'producer' || role === 'admin'
    ? [...USER_NAV, ...PRODUCER_NAV]
    : USER_NAV

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 h-[var(--nav-height)] bg-[var(--color-card)] border-b border-[var(--color-border)] z-[var(--z-sticky)] px-6 items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-[var(--color-primary)]">
        <span className="text-2xl">🫒</span>
        Valsamaki
      </Link>

      <div className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
        {role === 'guest' ? (
          <>
            <Link href="/login" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-[var(--color-primary)] text-white px-4 py-2 rounded-[var(--radius)] hover:bg-[var(--color-olive-dark)] transition-colors">
              Get Started
            </Link>
          </>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] transition-colors px-3 py-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
      </div>
    </nav>
  )
}
