/**
 * Mission-engine events.
 * The engine must not import Supabase types. It emits these events and calls
 * the service interfaces. Metadata stays in `src/missions/types.ts`.
 */

import type {
  MissionProgress,
  MissionProgressStatus,
} from '@/contracts/progress.ts'
import type {
  DiscoveryUnlockRequest,
  MilestoneCompletionRequest,
} from '@/contracts/rewards.ts'
import type { MissionId } from '@/missions/types.ts'

export type { DiscoveryUnlockRequest, MilestoneCompletionRequest }

export type MissionRuntimeState = {
  missionId: MissionId
  status: MissionProgressStatus
  currentCheckpointId: string | null
  completedCheckpointIds: readonly string[]
}

export function runtimeStateFromProgress(
  progress: MissionProgress,
): MissionRuntimeState {
  return {
    missionId: progress.missionId,
    status: progress.status,
    currentCheckpointId: progress.currentCheckpointId,
    completedCheckpointIds: progress.completedCheckpointIds,
  }
}

/** A finished activity. This event does not include an XP amount. */
export type ActivityCompletionEvent = {
  missionId: MissionId
  checkpointId: string
  activityId: string
}

/**
 * The engine's local completion notice.
 * `completeMission` accepts only the mission id and uses stored progress.
 */
export type MissionCompletionEvent = {
  missionId: MissionId
  completedCheckpointIds: readonly string[]
}
