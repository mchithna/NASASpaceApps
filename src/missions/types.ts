/**
 * Shared mission metadata contract.
 *
 * Phase 4 can add story scenes, activities, checkpoints, completion,
 * and discoveries as new exports beside `mission` in each package.
 * Those systems are not part of this type.
 */

export const missionIds = [
  'surveyor-3',
  'opportunity',
  'ingenuity',
  'insight',
  'pioneer-10',
] as const

/** Closed set of mission folder and route ids. Do not add or rename one. */
export type MissionId = (typeof missionIds)[number]

/** Where the hardware remains or continues. Matches the confirmed story settings. */
export type MissionDestination = 'Moon' | 'Mars' | 'Deep space'

/** Hardware group used to tell the five stories apart. */
export type MissionCategory =
  | 'lunar-lander'
  | 'mars-rover'
  | 'mars-helicopter'
  | 'mars-lander'
  | 'deep-space-probe'

/**
 * `planned` means the package has metadata and no playable story.
 * `available` is reserved for a later chapter that the engine can open.
 */
export type MissionContentStatus = 'planned' | 'available'

/** Optional tint. Values match existing design tokens. */
export type MissionAccent = 'accent' | 'science' | 'reward'

/** A NASA page or dataset a chapter may cite. */
export type MissionSource = {
  id: string
  title: string
  url: string
  credit?: string
}

/**
 * Metadata for one mission. Story copy, scenes, and activities stay in
 * that mission's folder. This object does not award XP or unlock anything.
 */
export type MissionDefinition = {
  id: MissionId
  displayName: string
  chapterTitle: string
  description: string
  destination: MissionDestination
  category: MissionCategory
  /** Public URL path, such as `/assets/missions/surveyor-3/cover.svg`. */
  coverImage: string
  accent?: MissionAccent
  sources: readonly MissionSource[]
  /**
   * Placeholder id for a future achievement.
   * It is not an achievement name, rule, or XP amount.
   */
  achievementId: string
  status: MissionContentStatus
}

export type MissionLookupResult =
  { status: 'found'; mission: MissionDefinition } | { status: 'not-found' }
