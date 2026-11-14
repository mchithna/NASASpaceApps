import { describe, expect, it } from 'vitest'
import {
  achievementCatalog,
  discoveryCatalog,
  explorerRankLadder,
  listMissionRewardKeys,
  milestoneXp,
  missionIds,
  missionXpCap,
  rankForXp,
  runtimeStateFromProgress,
  type DiscoveryUnlockRequest,
  type ExplorerProfile,
  type ExplorerProfileUpdate,
  type MissionId,
  type NovaServices,
  type RewardsService,
} from '@/contracts/index.ts'
import type { MissionId as RegistryMissionId } from '@/missions/types.ts'
import { listMissions } from '@/missions/registry.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { createRegisteredSeed } from '@/mocks/fixtures.ts'

type SameMissionId = [RegistryMissionId] extends [MissionId]
  ? [MissionId] extends [RegistryMissionId]
    ? true
    : false
  : false

type GrantInput = Parameters<RewardsService['grantMilestone']>[0]
type GrantHasNoXp = 'xp' extends keyof GrantInput ? false : true
type GrantHasNoExplorerId = 'explorerId' extends keyof GrantInput ? false : true
type ProfileHasNoPassword = 'password' extends keyof ExplorerProfile
  ? false
  : true
type ProfileHasNoToken = 'accessToken' extends keyof ExplorerProfile
  ? false
  : true
type UpdateHasNoXp = 'totalXp' extends keyof ExplorerProfileUpdate
  ? false
  : true
type DiscoveryHasNoTitle = 'title' extends keyof DiscoveryUnlockRequest
  ? false
  : true

describe('shared contracts', () => {
  it('keeps one MissionId and rejects caller-supplied XP', () => {
    const locks = {
      sameMissionId: true as SameMissionId,
      grantHasNoXp: true as GrantHasNoXp,
      grantHasNoExplorerId: true as GrantHasNoExplorerId,
      profileHasNoPassword: true as ProfileHasNoPassword,
      profileHasNoToken: true as ProfileHasNoToken,
      updateHasNoXp: true as UpdateHasNoXp,
      discoveryHasNoTitle: true as DiscoveryHasNoTitle,
    }

    expect(locks).toEqual({
      sameMissionId: true,
      grantHasNoXp: true,
      grantHasNoExplorerId: true,
      profileHasNoPassword: true,
      profileHasNoToken: true,
      updateHasNoXp: true,
      discoveryHasNoTitle: true,
    })
  })

  it('accepts the mock service bundle as NovaServices', () => {
    const services: NovaServices = createMockServices()

    expect(services.auth.getSession).toEqual(expect.any(Function))
    expect(services.explorer.getProfile).toEqual(expect.any(Function))
    expect(services.progress.getMissionProgress).toEqual(expect.any(Function))
    expect(services.rewards.grantMilestone).toEqual(expect.any(Function))
  })

  it('uses the five Phase 1 mission ids for rewards and achievements', () => {
    expect([...missionIds]).toEqual([
      'surveyor-3',
      'opportunity',
      'ingenuity',
      'insight',
      'pioneer-10',
    ])

    const keys = listMissionRewardKeys()
    expect(keys).toHaveLength(missionIds.length * 4)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain('surveyor-3:introduction')
    expect(keys).toContain('pioneer-10:legacy')

    expect(milestoneXp).toEqual({
      introduction: 20,
      activity: 40,
      discovery: 25,
      legacy: 15,
    })
    expect(missionXpCap).toBe(100)

    const registryAchievementIds = listMissions().map(
      (mission) => mission.achievementId,
    )
    expect(achievementCatalog.map((item) => item.id)).toEqual(
      registryAchievementIds,
    )
    expect(discoveryCatalog.map((item) => item.missionId)).toEqual([
      ...missionIds,
    ])
  })

  it('derives level and rank at every XP boundary', () => {
    const cases = [
      [0, 1, 'space-cadet', 'Space Cadet', 100],
      [99, 1, 'space-cadet', 'Space Cadet', 1],
      [100, 2, 'lunar-explorer', 'Lunar Explorer', 100],
      [199, 2, 'lunar-explorer', 'Lunar Explorer', 1],
      [200, 3, 'planetary-explorer', 'Planetary Explorer', 100],
      [299, 3, 'planetary-explorer', 'Planetary Explorer', 1],
      [300, 4, 'mission-specialist', 'Mission Specialist', 100],
      [399, 4, 'mission-specialist', 'Mission Specialist', 1],
      [400, 5, 'deep-space-explorer', 'Deep Space Explorer', 100],
      [499, 5, 'deep-space-explorer', 'Deep Space Explorer', 1],
      [500, 6, 'legacy-guardian', 'Legacy Guardian', null],
      [501, 6, 'legacy-guardian', 'Legacy Guardian', null],
    ] as const

    expect(explorerRankLadder.map((rank) => rank.minXp)).toEqual([
      0, 100, 200, 300, 400, 500,
    ])
    expect(explorerRankLadder[5]?.minXp).toBe(missionIds.length * missionXpCap)

    for (const [totalXp, level, id, name, xpUntilNextRank] of cases) {
      const rank = rankForXp(totalXp)
      expect(rank.level).toBe(level)
      expect(rank.id).toBe(id)
      expect(rank.name).toBe(name)
      expect(rank.totalXp).toBe(totalXp)
      expect(rank.xpUntilNextRank).toBe(xpUntilNextRank)
      if (xpUntilNextRank === null) {
        expect(rank.nextRankId).toBeNull()
      } else {
        expect(rank.nextRankId).toEqual(expect.any(String))
      }
    }

    expect(() => rankForXp(-1)).toThrow(RangeError)
    expect(() => rankForXp(1.5)).toThrow(RangeError)
    expect(() => rankForXp(Number.NaN)).toThrow(RangeError)
    expect(() => rankForXp(Number.POSITIVE_INFINITY)).toThrow(RangeError)
  })

  it('copies progress into runtime state without adding XP', () => {
    const progress = createRegisteredSeed().progress[0]
    expect(progress).toBeDefined()
    if (!progress) {
      return
    }

    expect(runtimeStateFromProgress(progress)).toEqual({
      missionId: progress.missionId,
      status: progress.status,
      currentCheckpointId: progress.currentCheckpointId,
      completedCheckpointIds: progress.completedCheckpointIds,
    })
  })
})
