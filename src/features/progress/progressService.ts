/**
 * ProgressService implementation.
 * Resilient, session-scoped mission progress and checkpoint persistence for the 5 fixed missions.
 * Fully conforms to Phase 1.5 ProgressService contract.
 */

import type {
  AuthService,
  MissionCompletionResult,
  MissionId,
  MissionProgress,
  MissionProgressOverview,
  ProgressService,
  RewardsService,
  SaveCheckpointInput,
} from '@/contracts/index.ts'
import { isStableKey } from '@/contracts/ids.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import { storyAchievementId } from '@/contracts/rewards.ts'
import { isMissionId } from '@/missions/registry.ts'
import { missionIds } from '@/missions/types.ts'
import {
  getSupabaseClient,
  type SupabaseClient,
} from '@/features/auth/supabaseClient.ts'

export type ProgressServiceOptions = {
  auth: AuthService
  rewards?: RewardsService
  client?: SupabaseClient
  clock?: () => string
}

function blankProgress(missionId: MissionId, time: string): MissionProgress {
  return {
    missionId,
    status: 'not_started',
    currentCheckpointId: null,
    completedCheckpointIds: [],
    completedAt: null,
    updatedAt: time,
  }
}

export function createProgressService(options: ProgressServiceOptions): ProgressService {
  const { auth, rewards, clock = () => new Date().toISOString() } = options
  const client = options.client ?? getSupabaseClient()

  // In-memory progress store mapped by explorerId -> Map<MissionId, MissionProgress>
  const userProgressStore = new Map<string, Map<MissionId, MissionProgress>>()

  function getProgressMap(explorerId: string): Map<MissionId, MissionProgress> {
    let map = userProgressStore.get(explorerId)
    if (!map) {
      map = new Map<MissionId, MissionProgress>()
      const at = clock()
      for (const id of missionIds) {
        map.set(id, blankProgress(id, at))
      }
      userProgressStore.set(explorerId, map)
    }
    return map
  }

  async function resolveSession() {
    const sessionRes = await auth.getSession()
    if (!sessionRes.ok) {
      return null
    }
    const session = sessionRes.data
    if (session.status !== 'guest' && session.status !== 'authenticated') {
      return null
    }
    return session
  }

  function requireMission(missionId: string): ServiceResult<MissionId> {
    if (!isMissionId(missionId)) {
      return serviceError(
        'invalid-input',
        'Choose one of the five NovaExplorer missions.',
      )
    }
    return serviceOk(missionId)
  }

  function requireCheckpoint(checkpointId: string): ServiceResult<string> {
    if (!isStableKey(checkpointId)) {
      return serviceError(
        'invalid-input',
        'Checkpoint names use lowercase letters, numbers, and hyphens.',
      )
    }
    return serviceOk(checkpointId)
  }

  return {
    async getMissionProgress(missionId: string): Promise<ServiceResult<MissionProgress>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const parsedMission = requireMission(missionId)
      if (!parsedMission.ok) {
        return parsedMission
      }

      const { explorerId, kind } = session.identity

      if (kind === 'guest' || !client.isConfigured) {
        const progressMap = getProgressMap(explorerId)
        const record = progressMap.get(parsedMission.data)
        if (!record) {
          return serviceError('not-found', 'That mission has no saved progress.')
        }
        return serviceOk(structuredClone(record))
      }

      // Query database
      const { data, error } = await client.query<
        Array<{
          mission_id: MissionId
          status: 'not_started' | 'in_progress' | 'completed'
          current_checkpoint_id: string | null
          completed_checkpoint_ids: string[]
          completed_at: string | null
          updated_at: string
        }>
      >(
        `mission_progress?user_id=eq.${encodeURIComponent(explorerId)}&mission_id=eq.${encodeURIComponent(parsedMission.data)}&select=*`,
      )

      if (error) {
        return serviceError(
          'unavailable',
          error.message || 'Mission progress could not be loaded.',
        )
      }

      if (!data || data.length === 0) {
        return serviceOk(blankProgress(parsedMission.data, clock()))
      }

      const row = data[0]
      if (!row) {
        return serviceError('not-found', 'That mission has no saved progress.')
      }

      const progress: MissionProgress = {
        missionId: row.mission_id,
        status: row.status,
        currentCheckpointId: row.current_checkpoint_id,
        completedCheckpointIds: row.completed_checkpoint_ids ?? [],
        completedAt: row.completed_at,
        updatedAt: row.updated_at,
      }

      return serviceOk(progress)
    },

    async getProgressOverview(): Promise<ServiceResult<MissionProgressOverview>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const missions: MissionProgress[] = []
      for (const mId of missionIds) {
        const p = await this.getMissionProgress(mId)
        if (p.ok) {
          missions.push(p.data)
        } else if (p.error.code === 'unavailable') {
          return p
        } else {
          missions.push(blankProgress(mId, clock()))
        }
      }

      return serviceOk({ missions })
    },

    async saveCheckpoint(input: SaveCheckpointInput): Promise<ServiceResult<MissionProgress>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const parsedMission = requireMission(input.missionId)
      if (!parsedMission.ok) {
        return parsedMission
      }

      const checkpoint = requireCheckpoint(input.checkpointId)
      if (!checkpoint.ok) {
        return checkpoint
      }

      if (
        input.completedCheckpointId !== undefined &&
        !isStableKey(input.completedCheckpointId)
      ) {
        return serviceError(
          'invalid-input',
          'Checkpoint names use lowercase letters, numbers, and hyphens.',
        )
      }

      const { explorerId, kind } = session.identity

      if (kind === 'registered' && client.isConfigured) {
        const existing = await this.getMissionProgress(parsedMission.data)
        if (!existing.ok) {
          return existing
        }
        if (existing.data.status === 'completed') {
          return serviceError('conflict', 'This mission is already complete.')
        }

        const completed = [...existing.data.completedCheckpointIds]
        if (
          input.completedCheckpointId &&
          !completed.includes(input.completedCheckpointId)
        ) {
          completed.push(input.completedCheckpointId)
        }

        const at = clock()
        const next: MissionProgress = {
          missionId: parsedMission.data,
          status: 'in_progress',
          currentCheckpointId: checkpoint.data,
          completedCheckpointIds: completed,
          completedAt: null,
          updatedAt: at,
        }

        const saved = await client.query(
          'mission_progress?on_conflict=user_id,mission_id',
          {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates' },
            body: {
              user_id: explorerId,
              mission_id: parsedMission.data,
              status: 'in_progress',
              current_checkpoint_id: checkpoint.data,
              completed_checkpoint_ids: completed,
              updated_at: at,
            },
          },
        )

        if (saved.error) {
          return serviceError(
            'unavailable',
            saved.error.message || 'The checkpoint could not be saved.',
          )
        }

        return serviceOk(next)
      }

      const progressMap = getProgressMap(explorerId)
      const current = progressMap.get(parsedMission.data) ?? blankProgress(parsedMission.data, clock())

      if (current.status === 'completed') {
        return serviceError('conflict', 'This mission is already complete.')
      }

      const completed = [...current.completedCheckpointIds]
      if (
        input.completedCheckpointId &&
        !completed.includes(input.completedCheckpointId)
      ) {
        completed.push(input.completedCheckpointId)
      }

      const at = clock()
      const next: MissionProgress = {
        missionId: parsedMission.data,
        status: 'in_progress',
        currentCheckpointId: checkpoint.data,
        completedCheckpointIds: completed,
        completedAt: null,
        updatedAt: at,
      }

      progressMap.set(parsedMission.data, next)

      return serviceOk(structuredClone(next))
    },

    async completeMission(input: { missionId: string }): Promise<ServiceResult<MissionCompletionResult>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const parsedMission = requireMission(input.missionId)
      if (!parsedMission.ok) {
        return parsedMission
      }

      const { explorerId, kind } = session.identity

      if (kind === 'registered' && client.isConfigured) {
        const existing = await this.getMissionProgress(parsedMission.data)
        if (!existing.ok) {
          return existing
        }
        if (existing.data.status === 'not_started') {
          return serviceError('conflict', 'Start the mission before completing it.')
        }

        const rpcRes = await client.rpc<MissionCompletionResult>('rpc_complete_mission', {
          p_mission_id: parsedMission.data,
        })
        if (rpcRes.error || !rpcRes.data) {
          const msg = rpcRes.error?.message ?? ''
          if (msg.includes('conflict')) {
            return serviceError('conflict', 'Start the mission before completing it.')
          }
          if (msg.includes('not-found')) {
            return serviceError('not-found', 'That mission has no saved progress.')
          }
          return serviceError('unavailable', rpcRes.error?.message || 'Failed to complete mission.')
        }
        return serviceOk(rpcRes.data)
      }

      const progressMap = getProgressMap(explorerId)
      const current = progressMap.get(parsedMission.data) ?? blankProgress(parsedMission.data, clock())

      if (current.status === 'not_started') {
        return serviceError('conflict', 'Start the mission before completing it.')
      }

      const at = clock()

      // Guest or local fallback
      let nextProgress = current
      if (current.status === 'in_progress') {
        nextProgress = {
          ...current,
          status: 'completed',
          completedAt: at,
          updatedAt: at,
        }
        progressMap.set(parsedMission.data, nextProgress)
      }

      // Grant legacy milestone and story achievement via rewards if provided
      let rewardGrant
      if (rewards) {
        const grantRes = await rewards.grantMilestone({
          missionId: parsedMission.data,
          milestoneId: 'legacy',
        })
        if (grantRes.ok) {
          rewardGrant = grantRes.data
        }
      }

      if (!rewardGrant) {
        rewardGrant = {
          awarded: current.status !== 'completed',
          rewardKey: `${parsedMission.data}:legacy` as const,
          xpAwarded: current.status !== 'completed' ? 15 : 0,
          event: {
            rewardKey: `${parsedMission.data}:legacy` as const,
            missionId: parsedMission.data,
            milestoneId: 'legacy' as const,
            xp: 15 as const,
            awardedAt: at,
          },
          totalXp: 15,
          rank: {
            level: 1,
            id: 'space-cadet' as const,
            name: 'Space Cadet',
            minXp: 0,
            totalXp: 15,
            nextRankId: 'lunar-explorer' as const,
            nextRankName: 'Lunar Explorer',
            nextRankMinXp: 100,
            xpUntilNextRank: 85,
          },
        }
      }

      let achievementUnlock
      if (rewards) {
        const achRes = await rewards.unlockAchievement(storyAchievementId(parsedMission.data))
        if (achRes.ok) {
          achievementUnlock = achRes.data
        }
      }

      if (!achievementUnlock) {
        achievementUnlock = {
          awarded: current.status !== 'completed',
          unlock: {
            achievementId: storyAchievementId(parsedMission.data),
            unlockedAt: at,
          },
        }
      }

      return serviceOk({
        progress: structuredClone(nextProgress),
        reward: rewardGrant,
        achievement: achievementUnlock,
      })
    },
  }
}
