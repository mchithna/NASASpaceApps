import { useParams } from 'react-router'
import { LayoutFrame } from '@/components/layout/LayoutFrame.tsx'
import { TextNav } from '@/components/layout/TextNav.tsx'
import { getMission } from '@/lib/missions.ts'

export function MissionLayout() {
  const { missionId } = useParams()
  const mission = missionId ? getMission(missionId) : null
  const missionItems = missionId
    ? [
        { to: `/missions/${missionId}`, label: 'Overview', end: true },
        { to: `/missions/${missionId}/play`, label: 'Play' },
        { to: '/dashboard', label: 'Exit mission' },
      ]
    : [{ to: '/dashboard', label: 'Exit mission' }]

  return (
    <LayoutFrame
      header={
        <header className="border-b border-slate-800">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
            <p className="text-sm font-medium tracking-wide text-slate-300">
              {mission ? mission.title : 'Mission'}
            </p>
            <TextNav label="Mission" items={missionItems} />
          </div>
        </header>
      }
    />
  )
}
