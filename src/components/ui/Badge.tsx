import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn.ts'

export type BadgeVariant =
  'neutral' | 'success' | 'warning' | 'science' | 'reward'

type BadgeProps = {
  variant?: BadgeVariant
  children: ReactNode
}

const variantClass: Record<BadgeVariant, string> = {
  neutral: 'bg-elevated text-foreground',
  success: 'bg-success text-on-bright',
  warning: 'border border-reward bg-elevated text-foreground',
  science: 'bg-science text-on-bright',
  reward: 'bg-reward text-on-bright',
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1 rounded-control px-2.5 py-1 text-sm font-medium',
        variantClass[variant],
      )}
    >
      {variant === 'warning' ? (
        <TriangleAlert className="size-3.5 text-reward" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  )
}
