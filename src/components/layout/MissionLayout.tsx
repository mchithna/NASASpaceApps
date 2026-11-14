import { useParams } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
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
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
            <p className="text-sm font-medium tracking-wide text-muted">
              {route.mission.displayName}
            </p>
            <TextNav label="Mission" items={missionItems} />
          </div>
        </header>
      }
    />
  )
}
