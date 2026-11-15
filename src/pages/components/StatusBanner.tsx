import type { ReactNode } from 'react'
import { Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/cn.ts'

export type StatusBannerVariant = 'info' | 'warning' | 'success'

export type StatusBannerProps = {
  variant?: StatusBannerVariant
  title?: string
  message: ReactNode
  className?: string
}

const variantStyles: Record<
  StatusBannerVariant,
  {
    container: string
    icon: typeof Info
    iconColor: string
    titleColor: string
  }
> = {
  info: {
    container: 'border-science/30 bg-surface text-foreground',
    icon: Info,
    iconColor: 'text-science',
    titleColor: 'text-science',
  },
  warning: {
    container: 'border-reward/30 bg-surface text-foreground',
    icon: AlertTriangle,
    iconColor: 'text-reward',
    titleColor: 'text-reward',
  },
  success: {
    container: 'border-success/30 bg-surface text-foreground',
    icon: CheckCircle2,
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
}

export function StatusBanner({
  variant = 'info',
  title,
  message,
  className,
}: StatusBannerProps) {
  const style = variantStyles[variant]
  const IconComponent = style.icon

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-surface border p-4 shadow-surface',
        style.container,
        className,
      )}
    >
      <IconComponent
        className={cn('mt-0.5 size-5 shrink-0', style.iconColor)}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5 text-sm">
        {title ? (
          <p className={cn('font-semibold font-heading', style.titleColor)}>
            {title}
          </p>
        ) : null}
        <div className="text-secondary">{message}</div>
      </div>
    </div>
  )
}
