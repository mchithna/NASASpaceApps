import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn.ts'

export type CardVariant = 'standard' | 'elevated' | 'interactive'

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant
  children: ReactNode
}

const variantClass: Record<CardVariant, string> = {
  standard: 'border border-border bg-surface shadow-surface',
  elevated: 'border border-border bg-elevated shadow-elevated',
  interactive:
    'border border-border bg-surface shadow-surface motion-safe:transition-colors motion-safe:duration-150 hover:border-science',
}

export function Card({
  variant = 'standard',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <article
      className={cn(
        'nova-card overflow-hidden rounded-surface',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {children}
    </article>
  )
}

type CardHeaderProps = {
  title?: string
  description?: string
  children?: ReactNode
}

export function CardHeader({ title, description, children }: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-border px-5 py-4">
      {title ? (
        <p className="font-heading text-lg font-semibold text-foreground">
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="max-w-[65ch] text-sm text-secondary">{description}</p>
      ) : null}
      {children}
    </div>
  )
}

type CardBodyProps = {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

type CardFooterProps = {
  children: ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
      {children}
    </div>
  )
}
