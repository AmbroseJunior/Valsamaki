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

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/map', label: 'Map' },
  { href: '/events', label: 'Events' },
  { href: '/chatbot', label: 'Ask Valsamaki' },
]

export function Navbar() {
  const pathname = usePathname()
  const { role } = useRole()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
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
          className="flex items-center gap-1.5 shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <span className="text-2xl">🫒</span>
          <span className="font-display font-bold text-lg text-[var(--color-foreground)] hidden sm:block">
            Valsamaki
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isGuest && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(({ href, label }) => {
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
                  {label}
                </Link>
              )
            })}
            {isProducer && (
              <Link
                href="/business"
                className={cn(
                  'px-3 py-1.5 rounded-[var(--radius)] text-sm font-semibold transition-colors',
                  pathname.startsWith('/business') || pathname.startsWith('/advertise') || pathname.startsWith('/analytics')
                    ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]'
                )}
              >
                My Business
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
                placeholder="Search Crete…"
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
            <span className="hidden md:block">Search Crete…</span>
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
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-[var(--highlight)] text-[var(--highlight-foreground)] px-4 py-2 rounded-[var(--radius-full)] hover:bg-[var(--highlight-dark)] transition-colors"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 p-2 rounded-[var(--radius)] hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)]"
              >
                <User className="h-5 w-5" />
                <ChevronDown className={cn('h-3 w-3 transition-transform', menuOpen && 'rotate-180')} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 z-[var(--z-dropdown)]">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  {isProducer && (
                    <>
                      <Link href="/business" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setMenuOpen(false)}>My Business</Link>
                      <Link href="/analytics" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--color-muted)] transition-colors" onClick={() => setMenuOpen(false)}>Analytics</Link>
                    </>
                  )}
                  <div className="border-t border-[var(--color-border)] my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut() }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--color-destructive)] hover:bg-[var(--color-muted)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-[var(--radius)] hover:bg-[var(--color-muted)] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--color-card)] border-t border-[var(--color-border)] shadow-[var(--shadow-lg)]">
          <div className="px-4 py-3 space-y-1">
            {/* Search on mobile */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Crete…"
                className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] text-[var(--color-foreground)]"
              />
            </form>

            {isGuest ? (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--color-muted)]">Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-bold bg-[var(--highlight)] text-[var(--highlight-foreground)] rounded-[var(--radius)] text-center">Get Started</Link>
              </>
            ) : (
              <>
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={cn('block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] transition-colors', pathname.startsWith(href) ? 'bg-[var(--highlight)] text-[var(--highlight-foreground)]' : 'hover:bg-[var(--color-muted)]')}>
                    {label}
                  </Link>
                ))}
                {isProducer && (
                  <>
                    <Link href="/business" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--color-muted)]">My Business</Link>
                    <Link href="/advertise" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--color-muted)]">Advertise</Link>
                  </>
                )}
                <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <button onClick={() => { setMenuOpen(false); handleSignOut() }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-destructive)] rounded-[var(--radius)] hover:bg-[var(--color-muted)]">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
