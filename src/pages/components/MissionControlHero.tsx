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
          <p className="eyebrow-label">
            <span className="eyebrow-dot" /> MISSION CONTROL STATUS
          </p>
          <p className="text-xl font-heading text-white">
            Unauthenticated Explorer
          </p>
          <p className="text-sm text-[#9aa7bd]">
            Sign in or continue as guest to start logging discoveries and earning ranks.
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
    <Card variant="elevated" className="p-6 sm:p-7 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_100%_0%,rgba(212,255,154,0.1)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow-label">
              <span className="eyebrow-dot" /> ACADEMY CALL SIGN
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

          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight">
            {profile.nickname}
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Badge variant="science">Level {rank.level}</Badge>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#d4ff9a]/15 text-[#d4ff9a] border border-[#d4ff9a]/30">
              {rank.name}
            </span>
            <span className="text-sm font-medium text-[#9aa7bd]">
              Total XP: <strong className="text-white">{totalXp}</strong>
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:max-w-md">
          <div className="flex items-center justify-between text-xs font-medium text-[#9aa7bd]">
            <span className="uppercase tracking-wider">Rank Progression</span>
            <span className="text-white font-medium">{rank.nextRankName ?? 'Max Rank'}</span>
          </div>

          <ProgressBar
            value={currentLevelProgress}
            max={bracketSpan}
            valueLabel={progressLabel}
          />

          {rank.xpUntilNextRank !== null ? (
            <p className="text-right text-xs text-[#9aa7bd]">
              <strong className="text-[#d4ff9a]">{rank.xpUntilNextRank} XP</strong> remaining until{' '}
              {rank.nextRankName}
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
