import { Link } from 'react-router'
import { MissionFacts } from '@/components/layout/MissionFacts.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { useMissionProgress } from '@/pages/hooks/usePlatformData.ts'
import type { MissionDefinition } from '@/missions/types.ts'

export function MissionOverviewPage() {
  const route = useMissionParam()

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  return <MissionOverview key={route.mission.id} mission={route.mission} />
}

function MissionOverview({ mission }: { mission: MissionDefinition }) {
  const { progress, isLoading, error } = useMissionProgress(mission.id)
  const action =
    progress?.status === 'completed'
      ? 'Replay mission'
      : progress?.status === 'in_progress'
        ? 'Continue mission'
        : 'Start mission'
  return (
    <div className="flex flex-col gap-6">
      <MissionFacts mission={mission} />
      {isLoading ? <p role="status">Loading your progress</p> : null}
      {error ? <p role="alert">{error.message}</p> : null}
      <Link className={textLinkClass} to={`/missions/${mission.id}/play`}>
        {action}
      </Link>
      <Link className={textLinkClass} to="/dashboard">
        Mission Control
      </Link>
    </div>
  )
}
