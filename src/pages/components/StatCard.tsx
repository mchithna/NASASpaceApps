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
    <Card variant="standard" className="p-5 sm:p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 size-24 bg-[radial-gradient(circle_at_100%_0%,rgba(212,255,154,0.08)_0%,transparent_70%)] pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9aa7bd]">
            {label}
          </p>
          {badge ? <div>{badge}</div> : null}
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight group-hover:text-[#d4ff9a] transition-colors">
          {value}
        </div>
        {detail ? (
          <p className="text-xs text-[#9aa7bd] leading-relaxed">{detail}</p>
        ) : null}
      </div>
    </Card>
  )
}
