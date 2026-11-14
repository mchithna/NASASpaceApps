import { useParams } from 'react-router'
import { getMission, type MissionSummary } from '@/lib/missions.ts'

export type MissionRouteState =
  | { status: 'ready'; mission: MissionSummary }
  | { status: 'unknown'; missionId: string | null }

export function useMissionParam(): MissionRouteState {
  const { missionId } = useParams()

  if (!missionId) {
    return { status: 'unknown', missionId: null }
  }

  const mission = getMission(missionId)

  if (!mission) {
    return { status: 'unknown', missionId }
  }

  return { status: 'ready', mission }
}
