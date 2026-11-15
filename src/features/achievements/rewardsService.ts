/**
 * RewardsService implementation.
 * Authoritative XP, milestone rewards, achievements, and journal unlocks.
 * Fully conforms to Phase 1.5 RewardsService contract.
 */

import type {
  AchievementId,
  AchievementRecord,
  AchievementUnlockResult,
  AuthService,
  DiscoveryUnlockRequest,
  DiscoveryUnlockResult,
  JournalEntry,
  MilestoneGrant,
  MissionId,
  MissionMilestoneId,
  RewardsService,
  XpRewardEvent,
  XpSummary,
} from '@/contracts/index.ts'
import { rankForXp } from '@/contracts/explorer.ts'
import { serviceFailure } from '@/features/serviceFailure.ts'
import {
  isRecord,
  readGuestCache,
  writeGuestCache,
} from '@/features/guestSessionCache.ts'
import { isStableKey } from '@/contracts/ids.ts'
import {
  serviceError,
  serviceOk,
  type ServiceResult,
} from '@/contracts/result.ts'
import {
  achievementCatalog,
  discoveryCatalog,
  isAchievementId,
  isMissionMilestoneId,
  journalPlaceholderSummary,
  milestoneXp,
  rewardKeyFor,
  sumXp,
} from '@/contracts/rewards.ts'
import { isMissionId } from '@/missions/registry.ts'
import {
  getSupabaseClient,
  type SupabaseClient,
} from '@/features/auth/supabaseClient.ts'

export type RewardsServiceOptions = {
  auth: AuthService
  client?: SupabaseClient
  clock?: () => string
}

type UserRewardsBucket = {
  rewards: XpRewardEvent[]
  achievements: Map<AchievementId, string>
  journal: JournalEntry[]
}

export function createRewardsService(
  options: RewardsServiceOptions,
): RewardsService {
  const { auth, clock = () => new Date().toISOString() } = options
  const client = options.client ?? getSupabaseClient()

  // User store for guest / local / offline mode
  const userBuckets = new Map<string, UserRewardsBucket>()

  function getBucket(explorerId: string): UserRewardsBucket {
    let bucket = userBuckets.get(explorerId)
    if (!bucket) {
      bucket = {
        rewards: [],
        achievements: new Map<AchievementId, string>(),
        journal: [],
      }
      const stored = readGuestCache(explorerId, 'rewards')
      if (isRecord(stored)) {
        if (Array.isArray(stored.rewards))
          bucket.rewards = (stored.rewards as unknown[]).filter(isStoredReward)
        if (Array.isArray(stored.achievements)) {
          for (const pair of stored.achievements as unknown[]) {
            if (
              Array.isArray(pair) &&
              typeof pair[0] === 'string' &&
              isAchievementId(pair[0]) &&
              typeof pair[1] === 'string'
            ) {
              bucket.achievements.set(pair[0], pair[1])
            }
          }
        }
        if (Array.isArray(stored.journal))
          bucket.journal = (stored.journal as unknown[]).filter(isStoredJournal)
      }
      userBuckets.set(explorerId, bucket)
    }
    return bucket
  }

  function persist(explorerId: string, bucket: UserRewardsBucket): boolean {
    return writeGuestCache(explorerId, 'rewards', {
      ...bucket,
      achievements: [...bucket.achievements],
    })
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

  return {
    async grantMilestone(input: {
      missionId: string
      milestoneId: string
    }): Promise<ServiceResult<MilestoneGrant>> {
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

      if (!isMissionMilestoneId(input.milestoneId)) {
        return serviceError(
          'invalid-input',
          'That reward is not one of the four mission milestones.',
        )
      }

      const { explorerId, kind } = session.identity
      const at = clock()

      // If registered with live Supabase client, call trusted security-definer RPC
      if (kind === 'registered' && client.isConfigured) {
        const rpcRes = await client.rpc<{
          awarded: boolean
          rewardKey: string
          xpAwarded: number
          event: XpRewardEvent
          totalXp: number
        }>('rpc_grant_milestone', {
          p_mission_id: parsedMission.data,
          p_milestone_id: input.milestoneId,
        })

        if (rpcRes.error || !rpcRes.data) {
          return serviceFailure(
            rpcRes.error?.message || 'Failed to grant milestone.',
          )
        }

        const data = rpcRes.data
        return serviceOk({
          awarded: data.awarded,
          rewardKey: data.event.rewardKey,
          xpAwarded: data.xpAwarded,
          event: data.event,
          totalXp: data.totalXp,
          rank: rankForXp(data.totalXp),
        })
      }

      // In-memory / guest mode
      const bucket = getBucket(explorerId)
      const rKey = rewardKeyFor(
        parsedMission.data,
        input.milestoneId as MissionMilestoneId,
      )
      const existing = bucket.rewards.find((e) => e.rewardKey === rKey)

      if (existing) {
        const totalXp = sumXp(bucket.rewards)
        return serviceOk({
          awarded: false,
          rewardKey: rKey,
          xpAwarded: 0,
          event: structuredClone(existing),
          totalXp,
          rank: rankForXp(totalXp),
        })
      }

      const event: XpRewardEvent = {
        rewardKey: rKey,
        missionId: parsedMission.data,
        milestoneId: input.milestoneId as MissionMilestoneId,
        xp: milestoneXp[input.milestoneId as MissionMilestoneId],
        awardedAt: at,
      }
      bucket.rewards.push(event)
      if (!persist(explorerId, bucket)) {
        bucket.rewards.pop()
        return serviceError(
          'unavailable',
          'Your browser could not save guest rewards. Please try again.',
        )
      }

      const totalXp = sumXp(bucket.rewards)
      return serviceOk({
        awarded: true,
        rewardKey: rKey,
        xpAwarded: event.xp,
        event: structuredClone(event),
        totalXp,
        rank: rankForXp(totalXp),
      })
    },

    async getXpSummary(): Promise<ServiceResult<XpSummary>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const { explorerId, kind } = session.identity

      if (kind === 'registered' && client.isConfigured) {
        const { data, error } = await client.query<
          Array<{
            reward_key: string
            mission_id: MissionId
            milestone_id: MissionMilestoneId
            xp: number
            awarded_at: string
          }>
        >(
          `xp_reward_events?user_id=eq.${encodeURIComponent(explorerId)}&select=*`,
        )

        if (!error && data) {
          const events: XpRewardEvent[] = data.map((row) => ({
            rewardKey: row.reward_key as `${MissionId}:${MissionMilestoneId}`,
            missionId: row.mission_id,
            milestoneId: row.milestone_id,
            xp: row.xp as XpRewardEvent['xp'],
            awardedAt: row.awarded_at,
          }))
          const totalXp = sumXp(events)
          return serviceOk({
            totalXp,
            rank: rankForXp(totalXp),
            events,
          })
        }
        return serviceFailure(error?.message ?? 'Rewards could not be loaded.')
      }

      const bucket = getBucket(explorerId)
      const totalXp = sumXp(bucket.rewards)
      return serviceOk({
        totalXp,
        rank: rankForXp(totalXp),
        events: structuredClone(bucket.rewards),
      })
    },

    async listAchievements(): Promise<
      ServiceResult<readonly AchievementRecord[]>
    > {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const { explorerId, kind } = session.identity
      const unlockedMap = new Map<string, string>()

      if (kind === 'registered' && client.isConfigured) {
        const { data, error } = await client.query<
          Array<{
            achievement_id: string
            unlocked_at: string
          }>
        >(
          `unlocked_achievements?user_id=eq.${encodeURIComponent(explorerId)}&select=*`,
        )

        if (error || !data)
          return serviceFailure(
            error?.message ?? 'Achievements could not be loaded.',
          )

        if (!error && data) {
          for (const row of data) {
            unlockedMap.set(row.achievement_id, row.unlocked_at)
          }
        }
      } else {
        const bucket = getBucket(explorerId)
        for (const [id, date] of bucket.achievements.entries()) {
          unlockedMap.set(id, date)
        }
      }

      const records: AchievementRecord[] = achievementCatalog.map(
        (catalogItem) => ({
          id: catalogItem.id,
          missionId: catalogItem.missionId,
          title: catalogItem.title,
          description: catalogItem.description,
          unlockedAt: unlockedMap.get(catalogItem.id) ?? null,
        }),
      )

      return serviceOk(records)
    },

    async unlockAchievement(
      achievementId: string,
    ): Promise<ServiceResult<AchievementUnlockResult>> {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      if (!isAchievementId(achievementId)) {
        return serviceError(
          'invalid-input',
          'That achievement is not in the catalog.',
        )
      }

      const { explorerId, kind } = session.identity
      const at = clock()
      const bucket = getBucket(explorerId)

      if (kind === 'registered' && client.isConfigured) {
        const result = await client.rpc<AchievementUnlockResult>(
          'rpc_unlock_achievement',
          {
            p_achievement_id: achievementId,
          },
        )
        return result.error || !result.data
          ? serviceFailure(
              result.error?.message ?? 'Achievement could not be saved.',
            )
          : serviceOk(result.data)
      }

      const existing = bucket.achievements.get(achievementId)
      if (existing) {
        return serviceOk({
          awarded: false,
          unlock: {
            achievementId,
            unlockedAt: existing,
          },
        })
      }

      bucket.achievements.set(achievementId, at)
      if (!persist(explorerId, bucket)) {
        bucket.achievements.delete(achievementId)
        return serviceError(
          'unavailable',
          'Your browser could not save the guest achievement. Please try again.',
        )
      }
      return serviceOk({
        awarded: true,
        unlock: {
          achievementId,
          unlockedAt: at,
        },
      })
    },

    async unlockDiscovery(
      input: DiscoveryUnlockRequest,
    ): Promise<ServiceResult<DiscoveryUnlockResult>> {
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

      if (!isStableKey(input.discoveryId)) {
        return serviceError(
          'invalid-input',
          'Discovery names use lowercase letters, numbers, and hyphens.',
        )
      }

      const known = discoveryCatalog.find(
        (entry) => entry.discoveryId === input.discoveryId,
      )
      if (known && known.missionId !== parsedMission.data) {
        return serviceError(
          'invalid-input',
          'That discovery belongs to a different mission.',
        )
      }

      const { explorerId, kind } = session.identity
      if (kind === 'registered' && client.isConfigured) {
        const result = await client.rpc<DiscoveryUnlockResult>(
          'rpc_unlock_discovery',
          {
            p_mission_id: parsedMission.data,
            p_discovery_id: input.discoveryId,
          },
        )
        return result.error || !result.data
          ? serviceFailure(
              result.error?.message ?? 'Discovery could not be saved.',
            )
          : serviceOk(result.data)
      }
      const bucket = getBucket(explorerId)
      const at = clock()

      const existing = bucket.journal.find(
        (entry) =>
          entry.missionId === parsedMission.data &&
          entry.discoveryId === input.discoveryId,
      )

      if (existing) {
        return serviceOk({
          awarded: false,
          entry: structuredClone(existing),
        })
      }

      const entry: JournalEntry = {
        discoveryId: input.discoveryId,
        missionId: parsedMission.data,
        title: known?.title ?? 'Placeholder discovery',
        summary:
          known && 'summary' in known
            ? known.summary
            : journalPlaceholderSummary,
        unlockedAt: at,
        contentStatus:
          known && 'contentStatus' in known
            ? known.contentStatus
            : 'placeholder',
      }
      bucket.journal.push(entry)
      if (!persist(explorerId, bucket)) {
        bucket.journal.pop()
        return serviceError(
          'unavailable',
          'Your browser could not save the guest discovery. Please try again.',
        )
      }

      return serviceOk({
        awarded: true,
        entry: structuredClone(entry),
      })
    },

    async listJournalEntries(): Promise<
      ServiceResult<readonly JournalEntry[]>
    > {
      const session = await resolveSession()
      if (!session) {
        return serviceError(
          'unauthenticated',
          'Sign in, or continue as a guest, to do that.',
        )
      }

      const { explorerId, kind } = session.identity

      if (kind === 'registered' && client.isConfigured) {
        const { data, error } = await client.query<
          Array<{
            mission_id: MissionId
            discovery_id: string
            title: string
            summary: string
            content_status: 'placeholder' | 'sourced'
            unlocked_at: string
          }>
        >(
          `journal_entries?user_id=eq.${encodeURIComponent(explorerId)}&select=*`,
        )

        if (!error && data) {
          const list: JournalEntry[] = data.map((row) => ({
            missionId: row.mission_id,
            discoveryId: row.discovery_id,
            title: row.title,
            summary: row.summary,
            contentStatus: row.content_status,
            unlockedAt: row.unlocked_at,
          }))
          return serviceOk(list)
        }
        return serviceFailure(
          error?.message ?? 'Journal entries could not be loaded.',
        )
      }

      const bucket = getBucket(explorerId)
      return serviceOk(structuredClone(bucket.journal))
    },
  }
}

function isStoredReward(value: unknown): value is XpRewardEvent {
  return (
    isRecord(value) &&
    typeof value.missionId === 'string' &&
    isMissionId(value.missionId) &&
    typeof value.milestoneId === 'string' &&
    isMissionMilestoneId(value.milestoneId) &&
    value.xp === milestoneXp[value.milestoneId] &&
    value.rewardKey === rewardKeyFor(value.missionId, value.milestoneId) &&
    typeof value.awardedAt === 'string'
  )
}

function isStoredJournal(value: unknown): value is JournalEntry {
  return (
    isRecord(value) &&
    typeof value.missionId === 'string' &&
    isMissionId(value.missionId) &&
    typeof value.discoveryId === 'string' &&
    isStableKey(value.discoveryId) &&
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.unlockedAt === 'string' &&
    (value.contentStatus === 'placeholder' || value.contentStatus === 'sourced')
  )
}
