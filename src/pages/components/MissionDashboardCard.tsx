import { SpaceArtwork } from './SpaceArtwork.tsx'
import { Link } from 'react-router'
import { ArrowRight, RotateCcw, Play } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import type { MissionProgress } from '@/contracts/progress.ts'
import type { MissionDefinition } from '@/missions/types.ts'

export type MissionDashboardCardProps = {
  mission: MissionDefinition
  progress?: MissionProgress
}

export function MissionDashboardCard({
  mission,
  progress,
}: MissionDashboardCardProps) {
  const status = progress?.status ?? 'not_started'

  const getActionConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Replay Story',
          to: `/missions/${mission.id}/play`,
          icon: RotateCcw,
          badgeVariant: 'success' as const,
          badgeLabel: 'Completed',
          actionClass:
            'bg-surface border border-border text-foreground hover:bg-elevated hover:border-science',
        }
      case 'in_progress':
        return {
          label: 'Continue Mission',
          to: `/missions/${mission.id}/play`,
          icon: ArrowRight,
          badgeVariant: 'science' as const,
          badgeLabel: 'In Progress',
          actionClass: 'bg-accent text-on-bright hover:brightness-110',
        }
      case 'not_started':
      default:
        return {
          label: 'Begin Story',
          to: `/missions/${mission.id}`,
          icon: Play,
          badgeVariant: 'neutral' as const,
          badgeLabel: 'Not Started',
          actionClass:
            'bg-elevated border border-border text-foreground hover:bg-surface hover:border-science',
        }
    }
  }

  const action = getActionConfig()
  const ActionIcon = action.icon

  return (
    <Card
      variant="interactive"
      className="mission-card flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Cover Preview Thumbnail */}
        <div className="relative w-full overflow-hidden bg-background">
          <SpaceArtwork visual={mission.id} className="mission-card-image" />
          <div className="absolute top-3 left-3">
            <Badge variant="neutral">{mission.destination}</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={action.badgeVariant}>{action.badgeLabel}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="mission-card-content flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="mission-card-chapter">{mission.chapterTitle}</span>
            <h3 className="font-heading text-xl font-bold text-foreground">
              <Link
                to={`/missions/${mission.id}`}
                className="hover:text-science focus-visible:outline-focus"
              >
                {mission.displayName}
              </Link>
            </h3>
          </div>

          <p className="line-clamp-3 text-xs leading-relaxed text-secondary">
            {mission.description}
          </p>

          {/* Telemetry Checkpoint Note */}
          <div className="mt-1 text-xs text-muted">
            {status === 'completed' ? (
              <span className="text-success font-medium">
                All milestones verified · 100 XP awarded
              </span>
            ) : status === 'in_progress' ? (
              <span>
                Resume at:{' '}
                <strong className="text-science">
                  {progress?.currentCheckpointId ?? 'Opening'}
                </strong>
              </span>
            ) : (
              <span>Awaiting explorer launch</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mission-card-footer flex items-center justify-between border-t border-border bg-surface/50 text-xs">
        <Link
          to={`/missions/${mission.id}`}
          className="text-secondary hover:text-foreground hover:underline focus-visible:outline-focus"
        >
          Mission Files
        </Link>

        <Link
          to={action.to}
          className={`inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 font-medium transition-all focus-visible:outline-2 focus-visible:outline-focus ${action.actionClass}`}
          aria-label={`${action.label} for ${mission.displayName}`}
        >
          <span>{action.label}</span>
          <ActionIcon className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
