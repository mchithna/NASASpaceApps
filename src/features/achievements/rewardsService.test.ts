import { describe, expect, it } from 'vitest'
import { rankForXp } from '@/contracts/explorer.ts'
import { createAuthService } from '@/features/auth/authService.ts'
import { createRewardsService } from './rewardsService.ts'

describe('RewardsService Implementation and Idempotency Tests', () => {
  it('rejects unauthenticated requests', async () => {
    const auth = createAuthService()
    const rewards = createRewardsService({ auth })

    const res = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('unauthenticated')
    }
  })

  it('rejects invalid mission or milestone keys', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })

    const badMission = await rewards.grantMilestone({
      missionId: 'voyager-1',
      milestoneId: 'introduction',
    })
    expect(badMission.ok).toBe(false)
    if (!badMission.ok) {
      expect(badMission.error.code).toBe('invalid-input')
    }

    const badMilestone = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'bonus-xp',
    })
    expect(badMilestone.ok).toBe(false)
    if (!badMilestone.ok) {
      expect(badMilestone.error.code).toBe('invalid-input')
    }
  })

  it('grants milestone XP and enforces idempotency against duplicates', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })

    // First grant: introduction -> 20 XP
    const grant1 = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(grant1.ok).toBe(true)
    if (grant1.ok) {
      expect(grant1.data.awarded).toBe(true)
      expect(grant1.data.xpAwarded).toBe(20)
      expect(grant1.data.totalXp).toBe(20)
      expect(grant1.data.rank.name).toBe('Space Cadet')
    }

    // Duplicate grant: should NOT award additional XP
    const grant1Dup = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(grant1Dup.ok).toBe(true)
    if (grant1Dup.ok) {
      expect(grant1Dup.data.awarded).toBe(false)
      expect(grant1Dup.data.xpAwarded).toBe(0)
      expect(grant1Dup.data.totalXp).toBe(20)
    }

    // Second grant: activity -> 40 XP. Total -> 60 XP
    const grant2 = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'activity',
    })
    expect(grant2.ok).toBe(true)
    if (grant2.ok) {
      expect(grant2.data.awarded).toBe(true)
      expect(grant2.data.xpAwarded).toBe(40)
      expect(grant2.data.totalXp).toBe(60)
    }

    const summary = await rewards.getXpSummary()
    expect(summary.ok).toBe(true)
    if (summary.ok) {
      expect(summary.data.totalXp).toBe(60)
      expect(summary.data.events).toHaveLength(2)
    }
  })

  it('verifies exact rank boundaries across 0, 99, 100, 199, 200, 399, 400, 499, 500+ XP', () => {
    expect(rankForXp(0).name).toBe('Space Cadet')
    expect(rankForXp(99).name).toBe('Space Cadet')
    expect(rankForXp(100).name).toBe('Lunar Explorer')
    expect(rankForXp(199).name).toBe('Lunar Explorer')
    expect(rankForXp(200).name).toBe('Planetary Explorer')
    expect(rankForXp(299).name).toBe('Planetary Explorer')
    expect(rankForXp(300).name).toBe('Mission Specialist')
    expect(rankForXp(399).name).toBe('Mission Specialist')
    expect(rankForXp(400).name).toBe('Deep Space Explorer')
    expect(rankForXp(499).name).toBe('Deep Space Explorer')
    expect(rankForXp(500).name).toBe('Legacy Guardian')
    expect(rankForXp(600).name).toBe('Legacy Guardian')
  })

  it('unlocks achievements idempotently and lists catalog status', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })

    const initialList = await rewards.listAchievements()
    expect(initialList.ok).toBe(true)
    if (initialList.ok) {
      expect(initialList.data).toHaveLength(5)
      expect(initialList.data.every((a) => a.unlockedAt === null)).toBe(true)
    }

    const unlock1 = await rewards.unlockAchievement('surveyor-3-story')
    expect(unlock1.ok).toBe(true)
    if (unlock1.ok) {
      expect(unlock1.data.awarded).toBe(true)
      expect(unlock1.data.unlock.achievementId).toBe('surveyor-3-story')
    }

    // Repeated unlock is safe
    const unlock1Dup = await rewards.unlockAchievement('surveyor-3-story')
    expect(unlock1Dup.ok).toBe(true)
    if (unlock1Dup.ok) {
      expect(unlock1Dup.data.awarded).toBe(false)
    }

    const updatedList = await rewards.listAchievements()
    expect(updatedList.ok).toBe(true)
    if (updatedList.ok) {
      const surveyor = updatedList.data.find((a) => a.id === 'surveyor-3-story')
      expect(surveyor?.unlockedAt).toBeTruthy()
    }
  })

  it('unlocks journal discoveries idempotently and enforces mission constraints', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })

    // Mismatched mission and discovery ID
    const mismatch = await rewards.unlockDiscovery({
      missionId: 'opportunity',
      discoveryId: 'surveyor-3-notes',
    })
    expect(mismatch.ok).toBe(false)
    if (!mismatch.ok) {
      expect(mismatch.error.code).toBe('invalid-input')
    }

    // Valid discovery unlock
    const unlockRes = await rewards.unlockDiscovery({
      missionId: 'surveyor-3',
      discoveryId: 'surveyor-3-notes',
    })
    expect(unlockRes.ok).toBe(true)
    if (unlockRes.ok) {
      expect(unlockRes.data.awarded).toBe(true)
      expect(unlockRes.data.entry.discoveryId).toBe('surveyor-3-notes')
    }

    // Duplicate unlock is safe
    const duplicateRes = await rewards.unlockDiscovery({
      missionId: 'surveyor-3',
      discoveryId: 'surveyor-3-notes',
    })
    expect(duplicateRes.ok).toBe(true)
    if (duplicateRes.ok) {
      expect(duplicateRes.data.awarded).toBe(false)
    }

    const journalList = await rewards.listJournalEntries()
    expect(journalList.ok).toBe(true)
    if (journalList.ok) {
      expect(journalList.data).toHaveLength(1)
      expect(journalList.data[0]?.discoveryId).toBe('surveyor-3-notes')
    }
  })

  it('isolates reward data across distinct explorer sessions', async () => {
    const auth = createAuthService()
    const rewards = createRewardsService({ auth })

    // Session 1
    await auth.startGuestSession()
    await rewards.grantMilestone({ missionId: 'ingenuity', milestoneId: 'discovery' })

    const summary1 = await rewards.getXpSummary()
    expect(summary1.ok && summary1.data.totalXp).toBe(25)

    // Session 2
    await auth.signOut()
    await auth.startGuestSession()

    const summary2 = await rewards.getXpSummary()
    expect(summary2.ok && summary2.data.totalXp).toBe(0)
    expect(summary2.ok && summary2.data.events).toHaveLength(0)
  })

  it('handles concurrent milestone grant requests idempotently without inflating XP', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })

    const [res1, res2, res3] = await Promise.all([
      rewards.grantMilestone({ missionId: 'opportunity', milestoneId: 'introduction' }),
      rewards.grantMilestone({ missionId: 'opportunity', milestoneId: 'introduction' }),
      rewards.grantMilestone({ missionId: 'opportunity', milestoneId: 'introduction' }),
    ])

    expect(res1.ok && res2.ok && res3.ok).toBe(true)
    const awards = [res1, res2, res3].filter((r) => r.ok && r.data.awarded)
    expect(awards).toHaveLength(1)

    const summary = await rewards.getXpSummary()
    expect(summary.ok).toBe(true)
    if (summary.ok) {
      expect(summary.data.totalXp).toBe(20)
      expect(summary.data.events).toHaveLength(1)
    }
  })

  it('caps total XP at 500 across all five missions and reaches Legacy Guardian rank', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const rewards = createRewardsService({ auth })
    const missions = ['surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10'] as const
    const milestones = ['introduction', 'activity', 'discovery', 'legacy'] as const

    for (const missionId of missions) {
      for (const milestoneId of milestones) {
        const res = await rewards.grantMilestone({ missionId, milestoneId })
        expect(res.ok).toBe(true)
        if (res.ok) {
          expect(res.data.awarded).toBe(true)
        }
      }
    }

    const summary = await rewards.getXpSummary()
    expect(summary.ok).toBe(true)
    if (summary.ok) {
      expect(summary.data.totalXp).toBe(500)
      expect(summary.data.events).toHaveLength(20)
      expect(summary.data.rank.level).toBe(6)
      expect(summary.data.rank.name).toBe('Legacy Guardian')
      expect(summary.data.rank.nextRankId).toBeNull()
      expect(summary.data.rank.xpUntilNextRank).toBeNull()
    }
  })
})
