import { Link } from 'react-router'
import { Radio, ArrowRight, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import type { MissionProgress } from '@/contracts/progress.ts'
import type { MissionDefinition } from '@/missions/types.ts'

export type ActiveMissionSpotlightProps = {
  mission: MissionDefinition
  progress: MissionProgress
}

export function ActiveMissionSpotlight({
  mission,
  progress,
}: ActiveMissionSpotlightProps) {
  const completedCount = progress.completedCheckpointIds.length

  return (
    <Card
      variant="elevated"
      className="border-science/50 bg-gradient-to-br from-surface to-elevated p-6 shadow-elevated"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-science">
              <Radio className="size-3.5 animate-pulse text-science" aria-hidden="true" />
              Active Telemetry Downlink
            </span>
            <Badge variant="science">{mission.destination}</Badge>
            <Badge variant="warning">In Progress</Badge>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {mission.displayName}
            </h3>
            <p className="text-sm font-medium text-reward">
              {mission.chapterTitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
            {progress.currentCheckpointId ? (
              <span>
                Current Checkpoint:{' '}
                <strong className="font-semibold text-foreground">
                  {progress.currentCheckpointId}
                </strong>
              </span>
            ) : null}
            <span>
              {completedCount} checkpoint{completedCount === 1 ? '' : 's'} logged
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to={`/missions/${mission.id}/play`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-5 py-2.5 font-semibold text-on-bright shadow-surface transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-focus"
          >
            <span>Continue Mission</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <Link
            to={`/missions/${mission.id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-medium text-secondary transition-all hover:bg-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            <span>Mission Files</span>
          </Link>
        </div>
      </div>
    </Card>
  )
}
