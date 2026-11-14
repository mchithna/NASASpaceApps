import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-surface border border-border bg-surface p-6 shadow-surface">
      <Icon className="size-6 text-science" aria-hidden="true" />
      <p className="font-heading text-xl font-semibold text-foreground">
        {title}
      </p>
      <p className="max-w-[65ch] text-secondary">{description}</p>
      {action}
    </div>
  )
}
