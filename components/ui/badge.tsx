import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
        accent: 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-foreground)]',
        muted: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
