import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn.ts'

export type CardVariant = 'standard' | 'elevated' | 'interactive'

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant
  children: ReactNode
}

const variantClass: Record<CardVariant, string> = {
  standard:
    'border border-white/[0.08] bg-white/[0.04] backdrop-blur-md shadow-surface transition-all duration-300 hover:border-[#d4ff9a]/30 hover:shadow-[0_16px_36px_rgba(0,0,0,0.4),0_0_20px_rgba(212,255,154,0.08)]',
  elevated:
    'border border-white/[0.12] bg-white/[0.06] backdrop-blur-lg shadow-elevated transition-all duration-300 hover:border-[#d4ff9a]/40 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.45),0_0_24px_rgba(212,255,154,0.12)]',
  interactive:
    'border border-white/[0.08] bg-white/[0.04] backdrop-blur-md shadow-surface transition-all duration-300 hover:border-[#d4ff9a]/50 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.45),0_0_24px_rgba(212,255,154,0.15)] cursor-pointer',
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
        'overflow-hidden rounded-2xl',
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
    <div className="flex flex-col gap-1 border-b border-white/[0.08] px-6 py-4">
      {title ? (
        <p className="font-heading text-lg font-semibold text-foreground">
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="max-w-[65ch] text-sm text-[#9aa7bd]">{description}</p>
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
  return <div className={cn('px-6 py-5', className)}>{children}</div>
}

type CardFooterProps = {
  children: ReactNode
}

export function CardFooter({ children }: CardFooterProps) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-white/[0.08] px-6 py-4">
      {children}
    </div>
  )
}
