/**
 * Per-mission progress. MissionId is the Phase 1 union from `src/missions/types.ts`.
 */

import type {
  AchievementUnlockResult,
  MilestoneGrant,
} from '@/contracts/rewards.ts'
import type { MissionId } from '@/missions/types.ts'

export const missionProgressStatuses = [
  'not_started',
  'in_progress',
  'completed',
] as const

export type MissionProgressStatus = (typeof missionProgressStatuses)[number]

export type MissionProgress = {
  missionId: MissionId
  status: MissionProgressStatus
  currentCheckpointId: string | null
  completedCheckpointIds: readonly string[]
  completedAt: string | null
  updatedAt: string
}

export type MissionProgressOverview = {
  missions: readonly MissionProgress[]
}

export type SaveCheckpointInput = {
  missionId: string
  checkpointId: string
  /** When set, this checkpoint is recorded as finished. */
  completedCheckpointId?: string
}

/**
 * Completion, the legacy milestone, and the story achievement.
 * Implementations must commit these together.
 */
export type MissionCompletionResult = {
  progress: MissionProgress
  reward: MilestoneGrant
  achievement: AchievementUnlockResult
}
