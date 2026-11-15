import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { MissionDossier } from '@/pages/components/mission-presentation/MissionDossier.tsx'

export function MissionOverviewPage() {
  const route = useMissionParam()

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  return <MissionDossier key={route.mission.id} mission={route.mission} />
}
