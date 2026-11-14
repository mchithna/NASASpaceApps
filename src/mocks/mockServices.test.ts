import { describe, expect, it } from 'vitest'
import type { ServiceResult } from '@/contracts/index.ts'
import { missionIds, sumXp } from '@/contracts/index.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import {
  createRegisteredSeed,
  mockRegisteredCredentials,
  mockTime,
} from '@/mocks/fixtures.ts'

function expectOk<T>(result: ServiceResult<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.error.message)
  }
  return result.data
}

describe('mock services', () => {
  it('signs in a guest, a registered explorer, and a signed-out session', async () => {
    const services = createMockServices()
    expect(expectOk(await services.auth.getSession()).status).toBe('signed-out')
    expect((await services.explorer.getProfile()).ok).toBe(false)

    const guest = expectOk(await services.auth.startGuestSession())
    expect(guest.status).toBe('guest')
    const guestProfile = expectOk(await services.explorer.getProfile())
    expect(guestProfile.kind).toBe('guest')
    expect(guestProfile.nickname).toBe('Guest Cadet')
    expect(guestProfile.totalXp).toBe(0)
    expect(guestProfile.rank.id).toBe('space-cadet')
    expect(guestProfile).not.toHaveProperty('password')

    const rejected = await services.auth.signIn({
      email: mockRegisteredCredentials.email,
      password: 'wrong-password',
    })
    expect(rejected.ok).toBe(false)
    expect(expectOk(await services.auth.getSession()).status).toBe('guest')

    const signedIn = expectOk(
      await services.auth.signIn({
        email: 'Nova.Cadet@Example.com',
        password: mockRegisteredCredentials.password,
      }),
    )
    expect(signedIn.status).toBe('authenticated')
    const profile = expectOk(await services.explorer.getProfile())
    expect(profile.nickname).toBe('Nova Cadet')
    expect(profile.explorerId).toBe('explorer-nova')
    expect(JSON.stringify(profile)).not.toContain(
      mockRegisteredCredentials.password,
    )
    expect(JSON.stringify(signedIn)).not.toContain(
      mockRegisteredCredentials.password,
    )

    expect(expectOk(await services.auth.signOut()).status).toBe('signed-out')
    expect((await services.explorer.getProfile()).ok).toBe(false)
  })

  it('notifies listeners after auth changes and stops after unsubscribe', async () => {
    const services = createMockServices({ persona: 'initializing' })
    const seen: string[] = []
    const unsubscribe = services.auth.subscribe((session) => {
      seen.push(session.status)
    })

    expect(seen).toEqual([])
    expect(expectOk(await services.auth.getSession()).status).toBe(
      'initializing',
    )
    await services.auth.startGuestSession()
    unsubscribe()
    await services.auth.signOut()
    expect(seen).toEqual(['guest'])
  })

  it('keeps each mock instance isolated', async () => {
    const first = createMockServices({ persona: 'registered' })
    const second = createMockServices({ persona: 'registered' })

    const granted = expectOk(
      await first.rewards.grantMilestone({
        missionId: 'surveyor-3',
        milestoneId: 'discovery',
      }),
    )
    expect(granted.awarded).toBe(true)
    expect(granted.xpAwarded).toBe(25)

    expect(expectOk(await second.rewards.getXpSummary()).totalXp).toBe(160)
  })

  it('loads the registered profile, five missions, and one in-progress story', async () => {
    const seed = createRegisteredSeed()
    expect(sumXp(seed.rewards)).toBe(160)
    expect(seed.profile.totalXp).toBe(160)

    const services = createMockServices({ persona: 'registered' })
    const profile = expectOk(await services.explorer.getProfile())
    expect(profile.avatarId).toBe('cadet-2')
    expect(profile.rank).toMatchObject({
      level: 2,
      id: 'lunar-explorer',
      name: 'Lunar Explorer',
      totalXp: 160,
      xpUntilNextRank: 40,
    })

    const overview = expectOk(await services.progress.getProgressOverview())
    expect(overview.missions.map((mission) => mission.missionId)).toEqual([
      ...missionIds,
    ])
    expect(overview.missions.map((mission) => mission.status)).toEqual([
      'in_progress',
      'not_started',
      'completed',
      'not_started',
      'not_started',
    ])

    const surveyor = expectOk(
      await services.progress.getMissionProgress('surveyor-3'),
    )
    expect(surveyor.currentCheckpointId).toBe('evidence')
    expect(surveyor.completedCheckpointIds).toEqual(['opening', 'field-work'])
    ;(surveyor.completedCheckpointIds as string[]).push('tampered')
    const reread = expectOk(
      await services.progress.getMissionProgress('surveyor-3'),
    )
    expect(reread.completedCheckpointIds).toEqual(['opening', 'field-work'])
  })

  it('saves a checkpoint and rejects invalid mission or checkpoint input', async () => {
    const services = createMockServices({
      persona: 'registered',
      clock: () => '2026-01-15T13:00:00.000Z',
    })
    const before = expectOk(await services.progress.getProgressOverview())

    for (const missionId of ['apollo-11', 'Surveyor-3', '', '../surveyor-3']) {
      const result = await services.progress.saveCheckpoint({
        missionId,
        checkpointId: 'evidence-review',
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('invalid-input')
      }
    }

    for (const checkpointId of ['', ' ', 'Evidence', '../secret', 'a--b']) {
      const result = await services.progress.saveCheckpoint({
        missionId: 'surveyor-3',
        checkpointId,
      })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('invalid-input')
      }
    }

    expect(expectOk(await services.progress.getProgressOverview())).toEqual(
      before,
    )

    const saved = expectOk(
      await services.progress.saveCheckpoint({
        missionId: 'surveyor-3',
        checkpointId: 'evidence-review',
        completedCheckpointId: 'evidence',
      }),
    )
    expect(saved.status).toBe('in_progress')
    expect(saved.currentCheckpointId).toBe('evidence-review')
    expect(saved.completedCheckpointIds).toEqual([
      'opening',
      'field-work',
      'evidence',
    ])
    expect(saved.updatedAt).toBe('2026-01-15T13:00:00.000Z')

    const repeated = expectOk(
      await services.progress.saveCheckpoint({
        missionId: 'surveyor-3',
        checkpointId: 'evidence-review',
        completedCheckpointId: 'evidence',
      }),
    )
    expect(repeated.completedCheckpointIds).toEqual(
      saved.completedCheckpointIds,
    )
  })

  it('grants catalog XP once and ignores a caller-supplied amount', async () => {
    const services = createMockServices({
      persona: 'registered',
      clock: () => '2026-01-15T13:00:00.000Z',
    })

    const duplicate = expectOk(
      await services.rewards.grantMilestone({
        missionId: 'surveyor-3',
        milestoneId: 'introduction',
      }),
    )
    expect(duplicate.awarded).toBe(false)
    expect(duplicate.xpAwarded).toBe(0)
    expect(duplicate.rewardKey).toBe('surveyor-3:introduction')
    expect(duplicate.totalXp).toBe(160)
    expect(expectOk(await services.explorer.getProfile()).updatedAt).toBe(
      mockTime,
    )

    const input = {
      missionId: 'opportunity',
      milestoneId: 'introduction',
      xp: 999,
    }
    const granted = expectOk(await services.rewards.grantMilestone(input))
    expect(granted.awarded).toBe(true)
    expect(granted.xpAwarded).toBe(20)
    expect(granted.totalXp).toBe(180)
    expect(granted.event.xp).toBe(20)

    const again = expectOk(await services.rewards.grantMilestone(input))
    expect(again.awarded).toBe(false)
    expect(again.totalXp).toBe(180)

    const invalid = await services.rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'bonus',
    })
    expect(invalid.ok).toBe(false)
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(180)
  })

  it('completes a mission once, including the legacy reward', async () => {
    const services = createMockServices({ persona: 'registered' })

    const blocked = await services.progress.completeMission({
      missionId: 'opportunity',
    })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.error.code).toBe('conflict')
    }
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(160)

    const completed = expectOk(
      await services.progress.completeMission({ missionId: 'surveyor-3' }),
    )
    expect(completed.progress.status).toBe('completed')
    expect(completed.reward.awarded).toBe(true)
    expect(completed.reward.xpAwarded).toBe(15)
    expect(completed.reward.totalXp).toBe(175)
    expect(completed.achievement.awarded).toBe(true)
    expect(completed.achievement.unlock.achievementId).toBe('surveyor-3-story')

    const repeated = expectOk(
      await services.progress.completeMission({ missionId: 'surveyor-3' }),
    )
    expect(repeated.reward.awarded).toBe(false)
    expect(repeated.reward.totalXp).toBe(175)
    expect(repeated.achievement.awarded).toBe(false)
    expect(repeated.progress.completedAt).toBe(completed.progress.completedAt)
  })

  it('lists earned and locked achievements and unlocks journal entries once', async () => {
    const services = createMockServices({ persona: 'registered' })
    const achievements = expectOk(await services.rewards.listAchievements())
    expect(
      achievements.map((item) => [item.id, item.unlockedAt !== null]),
    ).toEqual([
      ['surveyor-3-story', false],
      ['opportunity-story', false],
      ['ingenuity-story', true],
      ['insight-story', false],
      ['pioneer-10-story', false],
    ])

    const unlocked = expectOk(
      await services.rewards.unlockAchievement('opportunity-story'),
    )
    expect(unlocked.awarded).toBe(true)
    const again = expectOk(
      await services.rewards.unlockAchievement('opportunity-story'),
    )
    expect(again.awarded).toBe(false)
    expect(again.unlock.unlockedAt).toBe(unlocked.unlock.unlockedAt)
    expect((await services.rewards.unlockAchievement('not-real')).ok).toBe(
      false,
    )
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(160)

    const journal = expectOk(await services.rewards.listJournalEntries())
    expect(journal).toHaveLength(1)
    expect(journal[0]?.contentStatus).toBe('placeholder')
    expect(journal[0]?.summary).toContain('not a NASA finding')

    const existing = expectOk(
      await services.rewards.unlockDiscovery({
        missionId: 'ingenuity',
        discoveryId: 'ingenuity-notes',
      }),
    )
    expect(existing.awarded).toBe(false)

    const mismatched = await services.rewards.unlockDiscovery({
      missionId: 'opportunity',
      discoveryId: 'surveyor-3-notes',
    })
    expect(mismatched.ok).toBe(false)

    const added = expectOk(
      await services.rewards.unlockDiscovery({
        missionId: 'surveyor-3',
        discoveryId: 'training-note',
      }),
    )
    expect(added.awarded).toBe(true)
    expect(added.entry.contentStatus).toBe('placeholder')
    expect(added.entry.summary).toContain('not a NASA finding')

    const addedAgain = expectOk(
      await services.rewards.unlockDiscovery({
        missionId: 'surveyor-3',
        discoveryId: 'training-note',
      }),
    )
    expect(addedAgain.awarded).toBe(false)
    expect(expectOk(await services.rewards.listJournalEntries())).toHaveLength(
      2,
    )
  })

  it('does not merge guest progress into the registered profile', async () => {
    const services = createMockServices({ persona: 'guest' })
    expectOk(
      await services.rewards.grantMilestone({
        missionId: 'insight',
        milestoneId: 'introduction',
      }),
    )
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(20)

    expectOk(
      await services.auth.signIn({
        email: mockRegisteredCredentials.email,
        password: mockRegisteredCredentials.password,
      }),
    )
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(160)

    expectOk(await services.auth.startGuestSession())
    expect(expectOk(await services.rewards.getXpSummary()).totalXp).toBe(20)
  })
})
