'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`rounded-full p-2 transition-colors hover:bg-[var(--color-muted)] ${className ?? ''}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-[var(--color-honey)]" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      )}
    </button>
  )
}
