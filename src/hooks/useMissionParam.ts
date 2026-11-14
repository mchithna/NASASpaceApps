import { useParams } from 'react-router'
import { lookupMission } from '@/missions/registry.ts'
import type { MissionLookupResult } from '@/missions/types.ts'

export function useMissionParam(): MissionLookupResult {
  const { missionId } = useParams()

  if (!missionId) {
    return { status: 'not-found' }
  }

  return lookupMission(missionId)
}
