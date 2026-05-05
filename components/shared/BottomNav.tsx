'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Home, Map, Compass, Calendar, MessageSquare, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  const { role } = useRole()
  const t = useTranslations('nav')

  const isGuest = role === 'guest'
  const isProducer = role === 'producer' || role === 'admin'

  const guestLinks = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/map', label: t('map'), icon: Map },
  ]

  const userLinks = [
    { href: '/dashboard', label: t('home'), icon: Home },
    { href: '/map', label: t('map'), icon: Map },
    { href: '/explore', label: t('explore'), icon: Compass },
    { href: '/events', label: t('events'), icon: Calendar },
    { href: '/chatbot', label: t('aiChat'), icon: MessageSquare },
  ]

  const producerExtra = { href: '/business', label: t('business'), icon: User }

  const links = isGuest
    ? guestLinks
    : isProducer
      ? [...userLinks.slice(0, 4), producerExtra]
      : userLinks

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
