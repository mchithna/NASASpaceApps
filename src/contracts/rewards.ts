/**
 * XP milestones, achievements, and Discovery Journal entries.
 * XP amounts come from this catalog. Callers cannot submit an amount.
 */

import type { ExplorerRankSummary } from '@/contracts/explorer.ts'
import { missionIds, type MissionId } from '@/missions/types.ts'

export const missionMilestoneIds = [
  'introduction',
  'activity',
  'discovery',
  'legacy',
] as const

export type MissionMilestoneId = (typeof missionMilestoneIds)[number]

export const milestoneXp = {
  introduction: 20,
  activity: 40,
  discovery: 25,
  legacy: 15,
} as const

export type MilestoneXpAmount = (typeof milestoneXp)[MissionMilestoneId]

export const missionXpCap = missionMilestoneIds.reduce(
  (sum, milestoneId) => sum + milestoneXp[milestoneId],
  0,
)

export type RewardKey = `${MissionId}:${MissionMilestoneId}`

/** One granted milestone. The key is unique per explorer and mission. */
export type XpRewardEvent = {
  rewardKey: RewardKey
  missionId: MissionId
  milestoneId: MissionMilestoneId
  xp: MilestoneXpAmount
  awardedAt: string
}

export type XpSummary = {
  totalXp: number
  rank: ExplorerRankSummary
  events: readonly XpRewardEvent[]
}

export function isMissionMilestoneId(
  value: string,
): value is MissionMilestoneId {
  return (missionMilestoneIds as readonly string[]).includes(value)
}

export function rewardKeyFor(
  missionId: MissionId,
  milestoneId: MissionMilestoneId,
): RewardKey {
  return `${missionId}:${milestoneId}`
}

export function listMissionRewardKeys(): readonly RewardKey[] {
  return missionIds.flatMap((missionId) =>
    missionMilestoneIds.map((milestoneId) =>
      rewardKeyFor(missionId, milestoneId),
    ),
  )
}

export function sumXp(events: readonly XpRewardEvent[]): number {
  return events.reduce((sum, event) => sum + event.xp, 0)
}

export type MilestoneGrant = {
  awarded: boolean
  rewardKey: RewardKey
  xpAwarded: number
  event: XpRewardEvent
  totalXp: number
  rank: ExplorerRankSummary
}

/**
 * Engine request for a predefined milestone.
 * `checkpointId` is context for the engine. It does not change the XP amount.
 */
export type MilestoneCompletionRequest = {
  missionId: string
  milestoneId: string
  checkpointId: string
}

export const achievementCatalog = [
  {
    id: 'surveyor-3-story',
    missionId: 'surveyor-3',
    title: 'Lunar Archaeologist',
    description: 'Finish the Surveyor 3 chapter.',
  },
  {
    id: 'opportunity-story',
    missionId: 'opportunity',
    title: 'Martian Trailblazer',
    description: 'Finish the Opportunity chapter.',
  },
  {
    id: 'ingenuity-story',
    missionId: 'ingenuity',
    title: 'Ingenuity story',
    description: 'Finish the Ingenuity chapter.',
  },
  {
    id: 'insight-story',
    missionId: 'insight',
    title: 'InSight story',
    description: 'Finish the InSight chapter.',
  },
  {
    id: 'pioneer-10-story',
    missionId: 'pioneer-10',
    title: 'Pioneer 10 story',
    description: 'Finish the Pioneer 10 chapter.',
  },
] as const

export type AchievementId = (typeof achievementCatalog)[number]['id']

export type AchievementUnlock = {
  achievementId: AchievementId
  unlockedAt: string
}

export type AchievementUnlockResult = {
  awarded: boolean
  unlock: AchievementUnlock
}

export type AchievementRecord = {
  id: AchievementId
  missionId: MissionId
  title: string
  description: string
  unlockedAt: string | null
}

export function isAchievementId(value: string): value is AchievementId {
  return achievementCatalog.some((achievement) => achievement.id === value)
}

export function storyAchievementId(missionId: MissionId): AchievementId {
  const achievement = achievementCatalog.find(
    (item) => item.missionId === missionId,
  )

  if (!achievement) {
    throw new Error(`Missing story achievement for ${missionId}.`)
  }

  return achievement.id
}

export const journalPlaceholderSummary =
  'Development placeholder for the Discovery Journal. This is not a NASA finding or measurement.'

export const discoveryCatalog = [
  {
    discoveryId: 'surveyor-3-notes',
    missionId: 'surveyor-3',
    title: 'Surveyor 3: returned lunar hardware',
    summary:
      'Surveyor 3’s returned camera and scoop helped scientists study prolonged exposure to the lunar environment.',
    contentStatus: 'sourced',
    sourceUrl:
      'https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/',
  },
  {
    discoveryId: 'opportunity-notes',
    missionId: 'opportunity',
    title: 'The Ancient Water of Mars',
    summary:
      'Hematite-rich spheres point to groundwater activity; gypsum veins record minerals deposited by water in fractures; clay-bearing rocks preserve evidence of a less acidic ancient watery environment. These findings concern past habitability, not proof of life. NASA source: https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/',
    contentStatus: 'sourced',
    sourceUrl:
      'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/',
  },
  {
    discoveryId: 'ingenuity-notes',
    missionId: 'ingenuity',
    title: 'The Final Flight of Ingenuity',
    summary:
      'January 18, 2024: Flight 72 ended with a hard landing and rotor damage. Terrain images, navigation analysis and a damaged rotor shadow informed NASA’s investigation. Insufficient visual-navigation information over relatively featureless terrain was the likely beginning of the accident sequence. Reliable autonomous navigation and safe landing conditions are essential. NASA source: https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/',
    contentStatus: 'sourced',
    sourceUrl:
      'https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/',
  },
  {
    discoveryId: 'insight-notes',
    missionId: 'insight',
    title: 'Placeholder: InSight',
  },
  {
    discoveryId: 'pioneer-10-notes',
    missionId: 'pioneer-10',
    title: 'The Pioneer Plaque — A Message From Humanity',
    summary:
      'Pioneer 10 carries a physical plaque intended to identify humanity and its origin if found in the distant future. Hydrogen provides a shared physical reference; a pulsar map encodes the Sun’s location; human figures beside the spacecraft show appearance and scale; a solar-system diagram identifies Earth as the departure planet. The plaque is not a radio message, and no discovery or reply by another civilization is confirmed. NASA source: https://science.nasa.gov/resource/pioneer-plaque/',
    contentStatus: 'sourced',
    sourceUrl: 'https://science.nasa.gov/resource/pioneer-plaque/',
  },
] as const

export type CatalogDiscoveryId =
  (typeof discoveryCatalog)[number]['discoveryId']

export type JournalContentStatus = 'placeholder' | 'sourced'

export type JournalEntry = {
  discoveryId: string
  missionId: MissionId
  title: string
  summary: string
  unlockedAt: string
  contentStatus: JournalContentStatus
}

/** Engine request. Title and summary come from trusted mission content. */
export type DiscoveryUnlockRequest = {
  missionId: string
  discoveryId: string
}

export type DiscoveryUnlockResult = {
  awarded: boolean
  entry: JournalEntry
}
