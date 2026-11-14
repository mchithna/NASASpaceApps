import { mission as ingenuity } from '@/missions/ingenuity/index.ts'
import { mission as insight } from '@/missions/insight/index.ts'
import { mission as opportunity } from '@/missions/opportunity/index.ts'
import { mission as pioneer10 } from '@/missions/pioneer-10/index.ts'
import { mission as surveyor3 } from '@/missions/surveyor-3/index.ts'
import {
  missionIds,
  type MissionDefinition,
  type MissionId,
  type MissionLookupResult,
} from '@/missions/types.ts'

/**
 * The five mission packages are registered here by import.
 * Change a story's metadata in that mission's `mission.ts`.
 * Do not copy titles or descriptions into this file.
 */

const registeredPackages = [
  surveyor3,
  opportunity,
  ingenuity,
  insight,
  pioneer10,
] as const

function registerMissions(
  packages: readonly MissionDefinition[],
): readonly MissionDefinition[] {
  const seen = new Set<MissionId>()

  for (const mission of packages) {
    if (seen.has(mission.id)) {
      throw new Error(`Duplicate mission id: ${mission.id}`)
    }
    seen.add(mission.id)
  }

  return missionIds.map((id) => {
    const mission = packages.find((item) => item.id === id)
    if (!mission) {
      throw new Error(`Missing mission id: ${id}`)
    }
    return mission
  })
}

const missions = registerMissions(registeredPackages)
const missionsById = new Map<MissionId, MissionDefinition>(
  missions.map((mission) => [mission.id, mission]),
)

export function listMissions(): readonly MissionDefinition[] {
  return missions
}

export function isMissionId(missionId: string): missionId is MissionId {
  return missionIds.some((id) => id === missionId)
}

/** Unknown ids return `not-found`. They do not throw or echo the raw id. */
export function lookupMission(missionId: string): MissionLookupResult {
  if (!isMissionId(missionId)) {
    return { status: 'not-found' }
  }

  const mission = missionsById.get(missionId)
  if (!mission) {
    return { status: 'not-found' }
  }

  return { status: 'found', mission }
}
