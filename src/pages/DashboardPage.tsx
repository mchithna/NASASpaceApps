import { Link } from 'react-router'
import { listMissions } from '@/missions/registry.ts'
import { DashboardHero } from '@/pages/components/dashboard/DashboardHero.tsx'
import {
  DashboardMetrics,
  type DashboardMetric,
} from '@/pages/components/dashboard/DashboardMetrics.tsx'
import { MissionSpotlight } from '@/pages/components/dashboard/MissionSpotlight.tsx'
import { SpacecraftCard } from '@/pages/components/dashboard/SpacecraftCard.tsx'
import styles from '@/pages/components/dashboard/dashboard.module.css'
import {
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { useNovaServices } from '@/pages/context/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'
import { NovaMissionCommander } from '@/ai/surfaces/NovaMissionCommander.tsx'

export function DashboardPage() {
  const { isLive, isAcceptance } = useNovaServices()
  const {
    session,
    profile,
    progress,
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
  const metrics: DashboardMetric[] = [
    {
      label: 'Academy Rank',
      value: profile ? profile.rank.name : '—',
      detail: profile ? `Level ${profile.rank.level}` : 'Unranked',
    },
    {
      label: 'Accumulated XP',
      value: profile ? `${profile.totalXp} XP` : '0 XP',
      detail:
        profile?.rank.xpUntilNextRank !== null &&
        profile?.rank.xpUntilNextRank !== undefined
          ? `${profile.rank.xpUntilNextRank} XP to promotion`
          : 'Highest rank attained',
    },
    {
      label: 'Missions Completed',
      value: `${completedCount} / ${missions.length}`,
      detail:
        inProgressCount > 0
          ? '1 mission in progress'
          : completedCount === missions.length
            ? 'All five missions finished!'
            : 'Ready for new launch',
    },
    {
      label: 'Discoveries Logged',
      value: String(journalEntries.length),
      detail: 'Historical artifacts examined',
    },
  ]

  return (
    <PageShell
      title="Mission Control"
      description="Your rank, experience, and the spacecraft stories in one place."
      eyebrow="Academy Operations"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className={styles.stage}>
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
            message={isAcceptance ? 'Isolated training fixture saved in this browser tab. Synthetic rewards are separate from real account progress.' : isLive
              ? 'Guest progress and discoveries are saved in this browser tab. Closing the tab or clearing browser data can remove them. Guest progress is separate from account progress.'
              : 'Development mock visit. Guest progress is kept in memory and resets on refresh.'}
          />
        ) : null}

        {profile ? (
          <DashboardHero
            nickname={profile.nickname}
            rankName={profile.rank.name}
            resumeTo={
              inProgressMission ? `/missions/${inProgressMission.id}/play` : null
            }
          />
        ) : null}

        <NovaMissionCommander
          profile={profile}
          progress={progress}
          missions={missions}
          journalCount={journalEntries.length}
        />

        <section aria-labelledby="telemetry-heading" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="telemetry-heading" className={styles.sectionTitle}>
              Mission Telemetry
            </h2>
            <span className={styles.sectionNote}>
              {isLive ? 'Operational telemetry' : 'Live mock services telemetry'}
            </span>
          </div>
          <DashboardMetrics metrics={metrics} />
        </section>

        {/* Active In-Progress Mission Spotlight */}
        {inProgressMission && inProgressMissionProgress ? (
          <section aria-labelledby="active-mission-heading" className="flex flex-col gap-3">
            <h2 id="active-mission-heading" className={styles.sectionTitle}>
              Continue Active Mission
            </h2>
            <MissionSpotlight
              mission={inProgressMission}
              progress={inProgressMissionProgress}
            />
          </section>
        ) : null}

        {/* Stories & Spacecraft Grid */}
        <section id="stories" aria-labelledby="stories-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="stories-heading" className={styles.sectionTitle}>
                Stories
              </h2>
              <span className={styles.sectionNote}>
                {missions.length} NASA Spacecraft Dossiers
              </span>
            </div>
            <p className={`${styles.sectionNote} max-w-[70ch]`}>
              Select an abandoned NASA spacecraft to investigate its historical
              journey, artifacts, and final transmissions.
            </p>
          </div>

          <div className={styles.grid}>
            {missions.map((mission) => {
              const missionProgress = progress?.missions.find(
                (m) => m.missionId === mission.id,
              )

              return (
                <SpacecraftCard
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
