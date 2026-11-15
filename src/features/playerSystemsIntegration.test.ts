import { describe, expect, it } from 'vitest'
import { createPlayerServices } from './index.ts'

describe('Player Systems End-to-End Programmatic Integration Tests', () => {
  it('runs complete guest player loop across all four services', async () => {
    const services = createPlayerServices()

    // 1. Initial state: signed out
    const initialSession = await services.auth.getSession()
    expect(initialSession.ok && initialSession.data.status).toBe('signed-out')

    const unauthProfile = await services.explorer.getProfile()
    expect(unauthProfile.ok).toBe(false)

    // 2. Guest Sign In
    const guestSession = await services.auth.startGuestSession()
    expect(guestSession.ok && guestSession.data.status).toBe('guest')

    // 3. Profile Onboarding / Setup
    const defaultProfile = await services.explorer.getProfile()
    expect(defaultProfile.ok).toBe(true)
    if (defaultProfile.ok) {
      expect(defaultProfile.data.nickname).toBe('Guest Cadet')
      expect(defaultProfile.data.totalXp).toBe(0)
    }

    const updatedProfile = await services.explorer.saveProfile({
      nickname: 'Astro Cadet',
      avatarId: 'cadet-2',
    })
    expect(updatedProfile.ok && updatedProfile.data.nickname).toBe('Astro Cadet')

    // 4. Mission Play & Checkpoints
    const startProgress = await services.progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })
    expect(startProgress.ok && startProgress.data.status).toBe('in_progress')

    const midProgress = await services.progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'field-work',
      completedCheckpointId: 'opening',
    })
    expect(midProgress.ok && midProgress.data.completedCheckpointIds).toContain('opening')

    // 5. Milestone Rewards
    const introGrant = await services.rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(introGrant.ok && introGrant.data.xpAwarded).toBe(20)

    const actGrant = await services.rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'activity',
    })
    expect(actGrant.ok && actGrant.data.xpAwarded).toBe(40)

    const discGrant = await services.rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'discovery',
    })
    expect(discGrant.ok && discGrant.data.xpAwarded).toBe(25)

    // 6. Journal Discovery Unlock
    const journalUnlock = await services.rewards.unlockDiscovery({
      missionId: 'surveyor-3',
      discoveryId: 'surveyor-3-notes',
    })
    expect(journalUnlock.ok && journalUnlock.data.awarded).toBe(true)

    // 7. Mission Completion (Grants 'legacy' milestone: 15 XP + story achievement)
    const completion = await services.progress.completeMission({
      missionId: 'surveyor-3',
    })
    expect(completion.ok).toBe(true)
    if (completion.ok) {
      expect(completion.data.progress.status).toBe('completed')
      expect(completion.data.reward.rewardKey).toBe('surveyor-3:legacy')
      expect(completion.data.reward.xpAwarded).toBe(15)
      expect(completion.data.achievement.unlock.achievementId).toBe('surveyor-3-story')
    }

    // 8. Verify Totals: 20 + 40 + 25 + 15 = 100 XP -> Rank: Lunar Explorer
    const xpSummary = await services.rewards.getXpSummary()
    expect(xpSummary.ok).toBe(true)
    if (xpSummary.ok) {
      expect(xpSummary.data.totalXp).toBe(100)
      expect(xpSummary.data.rank.name).toBe('Lunar Explorer')
      expect(xpSummary.data.rank.level).toBe(2)
    }

    // 9. Repeat completion is idempotent
    const repeatCompletion = await services.progress.completeMission({
      missionId: 'surveyor-3',
    })
    expect(repeatCompletion.ok).toBe(true)
    if (repeatCompletion.ok) {
      expect(repeatCompletion.data.reward.awarded).toBe(false)
      expect(repeatCompletion.data.reward.xpAwarded).toBe(0)
    }

    const finalSummary = await services.rewards.getXpSummary()
    expect(finalSummary.ok && finalSummary.data.totalXp).toBe(100)

    // 10. Sign out clears session
    await services.auth.signOut()
    const finalSession = await services.auth.getSession()
    expect(finalSession.ok && finalSession.data.status).toBe('signed-out')
  })

  it('enforces multi-user isolation and prevents cross-user state leaks', async () => {
    const services = createPlayerServices()

    // Explorer 1 signs in as guest
    await services.auth.startGuestSession()
    await services.explorer.saveProfile({ nickname: 'Explorer One', avatarId: 'cadet-1' })
    await services.progress.saveCheckpoint({ missionId: 'opportunity', checkpointId: 'landing' })
    await services.rewards.grantMilestone({ missionId: 'opportunity', milestoneId: 'introduction' })

    const summary1 = await services.rewards.getXpSummary()
    expect(summary1.ok && summary1.data.totalXp).toBe(20)

    // Explorer 1 signs out
    await services.auth.signOut()

    // Explorer 2 starts session
    await services.auth.startGuestSession()
    const profile2 = await services.explorer.getProfile()
    expect(profile2.ok && profile2.data.nickname).toBe('Guest Cadet')

    const summary2 = await services.rewards.getXpSummary()
    expect(summary2.ok && summary2.data.totalXp).toBe(0)

    const progress2 = await services.progress.getMissionProgress('opportunity')
    expect(progress2.ok && progress2.data.status).toBe('not_started')

    const achievements2 = await services.rewards.listAchievements()
    expect(achievements2.ok && achievements2.data.every((a) => a.unlockedAt === null)).toBe(true)
  })

  it('rejects caller attempts to inject or inflate XP through profile mutations', async () => {
    const services = createPlayerServices()
    await services.auth.startGuestSession()

    // Attempting to pass forbidden fields (simulating malicious JS payload)
    const maliciousPayload = {
      nickname: 'WhiteHatCadet',
      avatarId: 'cadet-3',
      totalXp: 99999, // Injected field
      rank: 'legacy-guardian', // Injected field
    }

    // Save profile with sanitized contract (cast as never to simulate raw runtime JSON injection)
    const updateRes = await services.explorer.saveProfile(
      maliciousPayload as never,
    )
    expect(updateRes.ok).toBe(true)

    // Verify total XP is unchanged and still authoritative (0 XP)
    const profile = await services.explorer.getProfile()
    expect(profile.ok).toBe(true)
    if (profile.ok) {
      expect(profile.data.nickname).toBe('WhiteHatCadet')
      expect(profile.data.totalXp).toBe(0)
      expect(profile.data.rank.name).toBe('Space Cadet')
    }
  })
})
