import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

type ErrorStateProps = {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-surface border border-danger bg-surface p-6"
    >
      <CircleAlert className="size-6 text-danger" aria-hidden="true" />
      <p className="font-heading text-xl font-semibold text-foreground">
        {title}
      </p>
      <p className="max-w-[65ch] text-secondary">{message}</p>
      {action}
    </div>
  )
}
