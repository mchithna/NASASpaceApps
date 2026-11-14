import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge.tsx'
import { listMissions } from '@/missions/registry.ts'
import {
  ActiveMissionSpotlight,
  MissionControlHero,
  MissionDashboardCard,
  PageShell,
  PersonaSwitcher,
  StatCard,
  StatusBanner,
} from '@/pages/components/index.ts'
import { useNovaServices } from '@/pages/context/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function DashboardPage() {
  const { isLive } = useNovaServices()
  const {
    session,
    profile,
    progress,
    xpSummary,
    journalEntries,
    isLoading,
    error,
    refresh,
  } = usePlatformData()

  const isGuest = session?.status === 'guest'
  const isSignedOut = session?.status === 'signed-out'

  const missions = listMissions()

  // Telemetry counts
  const completedMissions =
    progress?.missions.filter((m) => m.status === 'completed') ?? []
  const inProgressMissionProgress = progress?.missions.find(
    (m) => m.status === 'in_progress',
  )
  const inProgressMission = inProgressMissionProgress
    ? missions.find((m) => m.id === inProgressMissionProgress.missionId)
    : undefined

  const completedCount = completedMissions.length
  const inProgressCount = inProgressMissionProgress ? 1 : 0

  return (
    <PageShell
      title="Mission Control"
      description="Command headquarters for tracking deep space discoveries, mission telemetry, and academy ranks."
      eyebrow="Academy Operations"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className="flex flex-col gap-8">
        {/* Signed Out Warning */}
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are currently viewing Mission Control without an active
                  session. Progress and achievements will not be recorded.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/auth"
                    className="font-semibold text-science hover:underline"
                  >
                    Sign in to account
                  </Link>
                  <Link
                    to="/onboarding"
                    className="font-semibold text-secondary hover:underline"
                  >
                    Set up guest explorer
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {/* Guest Session Advisory */}
        {isGuest ? (
          <StatusBanner
            variant="info"
            title="Guest Session Active"
            message={isLive
              ? 'Guest progress and discoveries are saved in this browser tab. Closing the tab or clearing browser data can remove them. Guest progress is separate from account progress.'
              : 'Development mock visit. Guest progress is kept in memory and resets on refresh.'}
          />
        ) : null}

        {/* Explorer Hero Banner */}
        {profile ? (
          <MissionControlHero
            profile={profile}
            xpSummary={xpSummary}
            isGuest={isGuest}
          />
        ) : null}

        {/* Telemetry Metrics Row */}
        <section aria-labelledby="telemetry-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="telemetry-heading" className="text-xl font-heading text-foreground">
              Mission Telemetry
            </h2>
            <span className="text-xs text-muted">
              {isLive ? 'Operational telemetry' : 'Live mock services telemetry'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Academy Rank"
              value={profile ? profile.rank.name : '—'}
              detail={profile ? `Level ${profile.rank.level}` : 'Unranked'}
              badge={
                profile ? (
                  <Badge variant="science">Lvl {profile.rank.level}</Badge>
                ) : undefined
              }
            />
            <StatCard
              label="Accumulated XP"
              value={profile ? `${profile.totalXp} XP` : '0 XP'}
              detail={
                profile?.rank.xpUntilNextRank !== null && profile?.rank.xpUntilNextRank !== undefined
                  ? `${profile.rank.xpUntilNextRank} XP to promotion`
                  : 'Highest rank attained'
              }
              badge={<Badge variant="reward">XP</Badge>}
            />
            <StatCard
              label="Missions Completed"
              value={`${completedCount} / ${missions.length}`}
              detail={
                inProgressCount > 0
                  ? '1 mission in progress'
                  : completedCount === missions.length
                    ? 'All five missions finished!'
                    : 'Ready for new launch'
              }
            />
            <StatCard
              label="Discoveries Logged"
              value={journalEntries.length}
              detail="Historical artifacts examined"
              badge={<Badge variant="neutral">Journal</Badge>}
            />
          </div>
        </section>

        {/* Active In-Progress Mission Spotlight */}
        {inProgressMission && inProgressMissionProgress ? (
          <section aria-labelledby="active-mission-heading" className="flex flex-col gap-3">
            <h2 id="active-mission-heading" className="text-xl font-heading text-foreground">
              Continue Active Mission
            </h2>
            <ActiveMissionSpotlight
              mission={inProgressMission}
              progress={inProgressMissionProgress}
            />
          </section>
        ) : null}

        {/* Stories & Spacecraft Grid */}
        <section aria-labelledby="stories-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 id="stories-heading" className="text-xl font-heading text-foreground">
                Stories
              </h2>
              <span className="text-xs text-muted">
                {missions.length} NASA Spacecraft Dossiers
              </span>
            </div>
            <p className="max-w-[70ch] text-sm text-secondary">
              Select an abandoned NASA spacecraft to investigate its historical
              journey, artifacts, and final transmissions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission) => {
              const missionProgress = progress?.missions.find(
                (m) => m.missionId === mission.id,
              )

              return (
                <MissionDashboardCard
                  key={mission.id}
                  mission={mission}
                  progress={missionProgress}
                />
              )
            })}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
