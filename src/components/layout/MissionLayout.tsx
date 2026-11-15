import { useParams } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { PlatformHeader } from '@/components/layout/PlatformHeader.tsx'
import { lookupMission } from '@/missions/registry.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'

export function MissionLayout() {
  const { missionId } = useParams()
  const route = missionId
    ? lookupMission(missionId)
    : { status: 'not-found' as const }

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  const missionItems = [
    { to: `/missions/${route.mission.id}`, label: 'Overview', end: true },
    { to: `/missions/${route.mission.id}/play`, label: 'Play' },
    { to: '/dashboard', label: 'Exit mission' },
  ]

  return (
    <LayoutFrame
      header={
        <PlatformHeader
          items={missionItems}
          label="Mission"
          mission={route.mission.displayName}
        />
      }
    />
  )
}
