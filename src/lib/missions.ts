export const missionIds = [
  'surveyor-3',
  'opportunity',
  'ingenuity',
  'insight',
  'pioneer-10',
] as const

export type MissionId = (typeof missionIds)[number]

export type MissionSummary = {
  id: MissionId
  title: string
}

export const missions: readonly MissionSummary[] = [
  { id: 'surveyor-3', title: 'Surveyor 3' },
  { id: 'opportunity', title: 'Opportunity' },
  { id: 'ingenuity', title: 'Ingenuity' },
  { id: 'insight', title: 'InSight' },
  { id: 'pioneer-10', title: 'Pioneer 10' },
]

const safeMissionId = /^[a-z0-9-]{1,40}$/

function isMissionId(missionId: string): missionId is MissionId {
  return missionIds.some((id) => id === missionId)
}

export function getMission(missionId: string): MissionSummary | null {
  if (!isMissionId(missionId)) {
    return null
  }

  return missions.find((mission) => mission.id === missionId) ?? null
}

export function readableMissionId(missionId: string | null): string | null {
  if (!missionId || !safeMissionId.test(missionId)) {
    return null
  }

  return missionId
}
