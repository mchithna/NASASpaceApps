import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { listMissions } from '@/missions/registry.ts'
import {
  MissionControlHero,
  PageShell,
  PersonaSwitcher,
  StatCard,
  StatusBanner,
} from '@/pages/components/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function DashboardPage() {
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

  const completedCount =
    progress?.missions.filter((m) => m.status === 'completed').length ?? 0
  const inProgressCount =
    progress?.missions.filter((m) => m.status === 'in_progress').length ?? 0

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
      <div className="flex flex-col gap-6">
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are currently exploring without an active session. Telemetry
                  and achievements will not be tracked until you authenticate.
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

        {isGuest ? (
          <StatusBanner
            variant="info"
            title="Guest Session Active"
            message="Your progress and journal entries are stored for this active session only. Sign up before leaving to preserve your academy legacy permanently."
          />
        ) : null}

        {profile ? (
          <MissionControlHero
            profile={profile}
            xpSummary={xpSummary}
            isGuest={isGuest}
          />
        ) : null}

        <section aria-labelledby="telemetry-heading" className="flex flex-col gap-3">
          <h2 id="telemetry-heading" className="text-xl font-heading text-foreground">
            Mission Telemetry
          </h2>
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
                  ? `${inProgressCount} mission currently active`
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

        <section aria-labelledby="stories-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="stories-heading" className="text-xl font-heading text-foreground">
              Stories
            </h2>
            <p className="max-w-[65ch] text-sm text-secondary">
              Select an abandoned NASA spacecraft to investigate its historical
              journey, artifacts, and final transmissions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission) => {
              const missionProgress = progress?.missions.find(
                (m) => m.missionId === mission.id,
              )
              const status = missionProgress?.status ?? 'not_started'

              return (
                <Card
                  key={mission.id}
                  variant="interactive"
                  className="flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {mission.destination}
                      </span>
                      {status === 'completed' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : status === 'in_progress' ? (
                        <Badge variant="science">In Progress</Badge>
                      ) : (
                        <Badge variant="neutral">Not Started</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        <Link
                          to={`/missions/${mission.id}`}
                          className="hover:text-science focus-visible:outline-focus"
                        >
                          {mission.displayName}
                        </Link>
                      </h3>
                      <p className="text-xs font-medium text-science">
                        {mission.chapterTitle}
                      </p>
                    </div>

                    <p className="line-clamp-3 text-xs text-secondary">
                      {mission.description}
                    </p>
                  </div>

                  <div className="border-t border-border bg-surface/50 px-5 py-3">
                    <Link
                      to={`/missions/${mission.id}`}
                      className="inline-flex text-xs font-medium text-science hover:underline"
                    >
                      Inspect mission files &rarr;
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
