import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import type { ExplorerProfile } from '@/contracts/explorer.ts'
import type { XpSummary } from '@/contracts/rewards.ts'

export type MissionControlHeroProps = {
  profile: ExplorerProfile | null
  xpSummary?: XpSummary | null
  isGuest?: boolean
}

export function MissionControlHero({
  profile,
  xpSummary,
  isGuest = false,
}: MissionControlHeroProps) {
  if (!profile) {
    return (
      <Card variant="standard" className="p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Mission Control Status
          </p>
          <p className="text-xl font-heading text-foreground">
            Unauthenticated Explorer
          </p>
          <p className="text-sm text-secondary">
            Sign in or continue as guest to start logging discoveries and
            earning ranks.
          </p>
        </div>
      </Card>
    )
  }

  const rank = profile.rank
  const totalXp = profile.totalXp
  const milestoneCount = xpSummary?.events.length ?? 0

  // Calculate progress within current rank bracket
  const bracketSpan =
    rank.nextRankMinXp !== null ? rank.nextRankMinXp - rank.minXp : 100
  const currentLevelProgress =
    rank.nextRankMinXp !== null ? totalXp - rank.minXp : 100
  const progressLabel =
    rank.nextRankMinXp !== null
      ? `${currentLevelProgress} / ${bracketSpan} XP to ${rank.nextRankName}`
      : `${totalXp} XP (Maximum Rank Reached)`

  return (
    <Card variant="elevated" className="profile-summary p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-science">
              Academy Call Sign
            </span>
            {isGuest ? (
              <Badge variant="warning">Guest Session</Badge>
            ) : (
              <Badge variant="neutral">Verified Explorer</Badge>
            )}
            {milestoneCount > 0 ? (
              <Badge variant="reward">
                {milestoneCount} Milestone{milestoneCount === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>

          <h2 className="text-2xl font-bold font-heading text-foreground sm:text-3xl">
            {profile.nickname}
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Badge variant="science">Level {rank.level}</Badge>
            <Badge variant="reward">{rank.name}</Badge>
            <span className="text-sm font-medium text-secondary">
              Total XP: <strong className="text-foreground">{totalXp}</strong>
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-md">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Rank Progression</span>
            <span>{rank.nextRankName ?? 'Max Rank'}</span>
          </div>

          <ProgressBar
            value={currentLevelProgress}
            max={bracketSpan}
            valueLabel={progressLabel}
          />

          {rank.xpUntilNextRank !== null ? (
            <p className="text-right text-xs text-secondary">
              <strong className="text-science">
                {rank.xpUntilNextRank} XP
              </strong>{' '}
              remaining until {rank.nextRankName}
            </p>
          ) : (
            <p className="text-right text-xs text-reward">
              Legacy Guardian achieved — Deep space archivist
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
