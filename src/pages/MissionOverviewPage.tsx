import { Link } from 'react-router'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { readableMissionId } from '@/lib/missions.ts'

export function MissionOverviewPage() {
  const route = useMissionParam()

  if (route.status === 'unknown') {
    return (
      <PlaceholderPage
        title="Mission not available"
        description={unknownMissionDescription(route.missionId)}
      />
    )
  }

  return (
    <PlaceholderPage
      title={route.mission.title}
      description={`${route.mission.title} will have an overview here before the story begins. The chapter is not written yet.`}
    >
      <Link className={textLinkClass} to={`/missions/${route.mission.id}/play`}>
        Open the play placeholder
      </Link>
    </PlaceholderPage>
  )
}

function unknownMissionDescription(missionId: string | null): string {
  const readableId = readableMissionId(missionId)

  if (!readableId) {
    return 'This mission address is not recognized. Nothing here can be played yet.'
  }

  return `No NovaExplorer story uses the id "${readableId}". Nothing here can be played yet.`
}
