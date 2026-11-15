import { Link } from 'react-router'
import { ArrowRight, RotateCcw, Play, ArrowUpRight } from 'lucide-react'
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
            'bg-white/[0.08] text-white border border-white/15 hover:border-[#d4ff9a] hover:text-[#d4ff9a]',
        }
      case 'in_progress':
        return {
          label: 'Continue Mission',
          to: `/missions/${mission.id}/play`,
          icon: ArrowRight,
          badgeVariant: 'science' as const,
          badgeLabel: 'In Progress',
          actionClass:
            'bg-[#d4ff9a] text-[#050a14] font-semibold shadow-[0_0_16px_rgba(212,255,154,0.35)] hover:bg-[#e4ffb8]',
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
            'bg-white/[0.08] text-white border border-white/15 hover:border-[#d4ff9a] hover:text-[#d4ff9a]',
        }
    }
  }

  const action = getActionConfig()
  const ActionIcon = action.icon

  return (
    <Card
      variant="interactive"
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md transition-all duration-300 hover:border-[#d4ff9a]/40 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.4),0_0_20px_rgba(212,255,154,0.12)]"
    >
      <div>
        {/* Cover Preview Thumbnail with Hover Zoom */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#050a14]">
          <img
            src={mission.coverImage}
            alt={`Cover illustration representing the ${mission.displayName} mission`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1421] via-transparent to-transparent opacity-60" />

          <div className="absolute top-3 left-3">
            <span className="text-[11px] font-medium text-white/90 bg-[#0b1421]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
              {mission.destination}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={action.badgeVariant}>{action.badgeLabel}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5 p-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#d4ff9a]">
              {mission.chapterTitle}
            </span>
            <h3 className="font-heading text-xl font-bold text-white group-hover:text-[#d4ff9a] transition-colors">
              <Link
                to={`/missions/${mission.id}`}
                className="focus-visible:outline-focus"
              >
                {mission.displayName}
              </Link>
            </h3>
          </div>

          <p className="line-clamp-3 text-xs leading-relaxed text-[#9aa7bd]">
            {mission.description}
          </p>

          {/* Telemetry Checkpoint Note */}
          <div className="mt-1 text-xs text-[#8c9bb3]">
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
      <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-6 py-3.5 text-xs">
        <Link
          to={`/missions/${mission.id}`}
          className="inline-flex items-center gap-1 text-[#9aa7bd] hover:text-white transition-colors"
        >
          <span>Mission Dossier</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>

        <Link
          to={action.to}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-all ${action.actionClass}`}
          aria-label={`${action.label} for ${mission.displayName}`}
        >
          <span>{action.label}</span>
          <ActionIcon className="size-3.5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
