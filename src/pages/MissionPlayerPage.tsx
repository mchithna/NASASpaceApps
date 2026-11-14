import { Link } from 'react-router'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { readableMissionId } from '@/lib/missions.ts'

export function MissionPlayerPage() {
  const route = useMissionParam()

  if (route.status === 'unknown') {
    const readableId = readableMissionId(route.missionId)
    const description = readableId
      ? `The play screen cannot start. No NovaExplorer story uses the id "${readableId}".`
      : 'The play screen cannot start because this mission address is not recognized.'

    return (
      <PlaceholderPage
        title="Mission not available"
        description={description}
      />
    )
  }

  return (
    <PlaceholderPage
      title={`Play ${route.mission.title}`}
      description={`This screen will play the ${route.mission.title} story. There are no scenes yet.`}
    >
      <Link className={textLinkClass} to={`/missions/${route.mission.id}`}>
        Back to overview
      </Link>
    </PlaceholderPage>
  )
}
