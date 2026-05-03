'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { Map, LayoutDashboard, Calendar, Compass, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const GUEST_LINKS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/map', label: 'Map', icon: Map },
]

const USER_LINKS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/chatbot', label: 'AI', icon: MessageSquare },
]

export function BottomNav() {
  const pathname = usePathname()
  const { role } = useRole()

  const links = role === 'guest' ? GUEST_LINKS : USER_LINKS

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-[var(--color-card)] border-t border-[var(--color-border)] z-[var(--z-sticky)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-full">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)]'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
