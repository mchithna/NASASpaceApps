import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card.tsx'

export type StatCardProps = {
  label: string
  value: ReactNode
  detail?: string
  badge?: ReactNode
}

export function StatCard({ label, value, detail, badge }: StatCardProps) {
  return (
    <Card variant="standard" className="p-4 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          {badge ? <div>{badge}</div> : null}
        </div>
        <div className="text-2xl font-bold font-heading text-foreground sm:text-3xl">
          {value}
        </div>
        {detail ? (
          <p className="text-xs text-secondary">{detail}</p>
        ) : null}
      </div>
    </Card>
  )
}
