import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        'animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]',
        SIZE_MAP[size],
        className
      )}
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
