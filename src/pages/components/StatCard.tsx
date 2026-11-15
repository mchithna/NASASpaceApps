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
    <Card variant="standard" className="stat-card">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          {badge ? <div>{badge}</div> : null}
        </div>
        <div className="stat-card-value font-heading text-foreground">
          {value}
        </div>
        {detail ? <p className="text-xs text-secondary">{detail}</p> : null}
      </div>
    </Card>
  )
}
