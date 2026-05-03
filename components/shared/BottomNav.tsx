'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import { Home, Map, Compass, Calendar, MessageSquare, User } from 'lucide-react'

const GUEST_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/map', label: 'Map', icon: Map },
]

const USER_LINKS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/chatbot', label: 'AI Chat', icon: MessageSquare },
]

const PRODUCER_EXTRA = { href: '/business', label: 'Business', icon: User }

export function BottomNav() {
  const pathname = usePathname()
  const { role } = useRole()

  const isGuest = role === 'guest'
  const isProducer = role === 'producer' || role === 'admin'

  const links = isGuest
    ? GUEST_LINKS
    : isProducer
      ? [...USER_LINKS.slice(0, 4), PRODUCER_EXTRA]
      : USER_LINKS

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] z-[var(--z-sticky)]" style={{ height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex h-[var(--bottom-nav-height)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                active
                  ? 'text-[var(--color-foreground)]'
                  : 'text-[var(--color-muted-foreground)]'
              )}
            >
              <div className={cn('p-1.5 rounded-[var(--radius)]', active && 'bg-[var(--highlight)]')}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
