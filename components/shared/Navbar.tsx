'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Search, Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const NAV_LINKS = [
  { href: '/dashboard', key: 'dashboard' },
  { href: '/explore', key: 'explore' },
  { href: '/plan', key: 'plan' },
  { href: '/map', key: 'map' },
  { href: '/events', key: 'experiences' },
]

export function Navbar() {
  const pathname = usePathname()
  const { role } = useRole()
  const router = useRouter()
  const t = useTranslations('nav')

  const [modulesOpen, setModulesOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [profileOpen])

  // Close both menus when route changes
  useEffect(() => {
    setModulesOpen(false)
    setProfileOpen(false)
  }, [pathname])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/map?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isGuest = role === 'guest'
  const isProducer = role === 'producer' || role === 'admin'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-sticky)] transition-all duration-200',
        'bg-[var(--color-background)] border-b border-[var(--color-border)]',
        scrolled ? 'shadow-[var(--shadow-md)]' : ''
      )}
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="max-w-[var(--max-content-width)] mx-auto h-full flex items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link
          href={isGuest ? '/' : '/dashboard'}
          className="flex items-center gap-2 shrink-0"
          onClick={() => { setModulesOpen(false); setProfileOpen(false) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v1.png" alt="valsamaki" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
          <span className="font-display font-semibold text-xl text-[var(--color-foreground)] hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
            valsamaki
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isGuest && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(({ href, key }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-[var(--radius)] text-sm font-semibold transition-colors whitespace-nowrap',
                    active
                      ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
                  )}
                >
                  {t(key)}
                </Link>
              )
            })}
            {isProducer && (
              <Link
                href="/business"
                className={cn(
                  'px-3 py-1.5 rounded-[var(--radius)] text-sm font-semibold transition-colors',
                  pathname.startsWith('/business') || pathname.startsWith('/analytics')
                    ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
                )}
              >
                {t('business')}
              </Link>
            )}
          </nav>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search pill */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-xs md:max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--color-foreground)]"
              />
            </div>
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-muted)] text-sm text-[var(--color-muted-foreground)] hover:border-[var(--highlight)] transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:block">{t('searchPlaceholder')}</span>
            <span className="hidden md:flex items-center gap-0.5 ml-2 bg-[var(--highlight)] text-[var(--highlight-foreground)] text-xs font-bold px-2 py-0.5 rounded-[var(--radius-full)]">
              🔍
            </span>
          </button>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <LocaleSwitcher />
          <ThemeToggle />

          {isGuest ? (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 transition-colors"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-[var(--highlight)] text-[var(--highlight-foreground)] px-4 py-2 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors"
              >
                {t('getStarted')}
              </Link>
            </>
          ) : (
            <>
              {/* Profile dropdown — works on both mobile and desktop */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen((v) => !v); setModulesOpen(false) }}
                  className="flex items-center gap-1.5 p-2 rounded-[var(--radius)] hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)]"
                  aria-label="Profile menu"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className={cn('h-3 w-3 transition-transform', profileOpen && 'rotate-180')} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 z-[var(--z-dropdown)]">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setProfileOpen(false)}>
                      {t('dashboard')}
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setProfileOpen(false)}>
                      {t('settings')}
                    </Link>
                    <Link href="/explore?liked=1" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setProfileOpen(false)}>
                      ❤️ {t('likedExperiences')}
                    </Link>
                    {isProducer && (
                      <>
                        <Link href="/business" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setProfileOpen(false)}>{t('business')}</Link>
                        <Link href="/analytics" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setProfileOpen(false)}>{t('analytics')}</Link>
                      </>
                    )}
                    <div className="border-t border-[var(--color-border)] my-1" />
                    <button
                      onClick={() => { setProfileOpen(false); handleSignOut() }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--color-destructive)] hover:bg-[var(--color-muted)] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger — modules only */}
              <button
                className="md:hidden p-2 rounded-[var(--radius)] hover:bg-[var(--color-muted)] transition-colors"
                onClick={() => { setModulesOpen((v) => !v); setProfileOpen(false) }}
                aria-label="Navigation menu"
              >
                {modulesOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile modules drawer — nav links only */}
      {modulesOpen && (
        <div className="md:hidden bg-[var(--color-card)] border-t border-[var(--color-border)] shadow-[var(--shadow-lg)]">
          <div className="px-4 py-3 space-y-1">
            {/* Search on mobile */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--color-foreground)]"
              />
            </form>

            {/* Language switcher */}
            <div className="flex items-center justify-between px-3 py-2 rounded-[var(--radius)] bg-[var(--color-muted)]">
              <span className="text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wide">{t('language')}</span>
              <LocaleSwitcher />
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setModulesOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] transition-colors',
                  pathname.startsWith(href) ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]' : 'hover:bg-[var(--color-muted)]'
                )}
              >
                {t(key)}
              </Link>
            ))}

            {isProducer && (
              <>
                <Link href="/business" onClick={() => setModulesOpen(false)} className="block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--color-muted)]">{t('business')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
