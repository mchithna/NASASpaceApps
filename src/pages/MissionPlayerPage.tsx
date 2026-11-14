import { Link } from 'react-router'
import { MissionFacts } from '@/components/layout/MissionFacts.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'

export function MissionPlayerPage() {
  const route = useMissionParam()

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  return (
    <div className="flex flex-col gap-6">
      <MissionFacts mission={route.mission} />
      <Link className={textLinkClass} to={`/missions/${route.mission.id}`}>
        Back to overview
      </Link>
    </div>
  )
}
