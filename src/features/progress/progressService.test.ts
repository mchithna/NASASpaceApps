import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/features/auth/authService.ts'
import { SupabaseClient } from '@/features/auth/supabaseClient.ts'
import { createProgressService } from './progressService.ts'

describe('ProgressService Implementation Tests', () => {
  it('rejects unauthenticated access', async () => {
    const auth = createAuthService()
    const progress = createProgressService({ auth })

    const res = await progress.getMissionProgress('surveyor-3')
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('unauthenticated')
    }

    const saveRes = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })
    expect(saveRes.ok).toBe(false)
    if (!saveRes.ok) {
      expect(saveRes.error.code).toBe('unauthenticated')
    }
  })

  it('rejects unknown mission IDs and invalid checkpoint keys', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const progress = createProgressService({ auth })

    const badMission = await progress.getMissionProgress('voyager-1')
    expect(badMission.ok).toBe(false)
    if (!badMission.ok) {
      expect(badMission.error.code).toBe('invalid-input')
    }

    const badCheckpoint = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'INVALID_CHECKPOINT!',
    })
    expect(badCheckpoint.ok).toBe(false)
    if (!badCheckpoint.ok) {
      expect(badCheckpoint.error.code).toBe('invalid-input')
    }
  })

  it('initializes mission progress and tracks checkpoints monotonically', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const progress = createProgressService({ auth })

    const initial = await progress.getMissionProgress('surveyor-3')
    expect(initial.ok).toBe(true)
    if (initial.ok) {
      expect(initial.data.status).toBe('not_started')
      expect(initial.data.completedCheckpointIds).toEqual([])
    }

    // Advance to checkpoint 1
    const step1 = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })
    expect(step1.ok).toBe(true)
    if (step1.ok) {
      expect(step1.data.status).toBe('in_progress')
      expect(step1.data.currentCheckpointId).toBe('opening')
    }

    // Complete checkpoint 1 and advance to checkpoint 2
    const step2 = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'field-work',
      completedCheckpointId: 'opening',
    })
    expect(step2.ok).toBe(true)
    if (step2.ok) {
      expect(step2.data.completedCheckpointIds).toContain('opening')
      expect(step2.data.currentCheckpointId).toBe('field-work')
    }

    // Duplicate completion should not duplicate array entry
    const step2Dup = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'field-work',
      completedCheckpointId: 'opening',
    })
    expect(step2Dup.ok).toBe(true)
    if (step2Dup.ok) {
      expect(step2Dup.data.completedCheckpointIds.filter((id) => id === 'opening')).toHaveLength(1)
    }
  })

  it('enforces completion rules and idempotency', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const progress = createProgressService({ auth })

    // Cannot complete not_started mission
    const prematureComplete = await progress.completeMission({ missionId: 'opportunity' })
    expect(prematureComplete.ok).toBe(false)
    if (!prematureComplete.ok) {
      expect(prematureComplete.error.code).toBe('conflict')
    }

    // Start mission
    await progress.saveCheckpoint({
      missionId: 'opportunity',
      checkpointId: 'landing',
    })

    // Complete mission
    const completeRes = await progress.completeMission({ missionId: 'opportunity' })
    expect(completeRes.ok).toBe(true)
    if (completeRes.ok) {
      expect(completeRes.data.progress.status).toBe('completed')
      expect(completeRes.data.reward.rewardKey).toBe('opportunity:legacy')
      expect(completeRes.data.reward.xpAwarded).toBe(15)
      expect(completeRes.data.achievement.unlock.achievementId).toBe('opportunity-story')
    }

    // Saving checkpoint on completed mission is rejected
    const blockedSave = await progress.saveCheckpoint({
      missionId: 'opportunity',
      checkpointId: 'post-landing',
    })
    expect(blockedSave.ok).toBe(false)
    if (!blockedSave.ok) {
      expect(blockedSave.error.code).toBe('conflict')
    }

    // Replay / repeat completeMission is idempotent
    const replayComplete = await progress.completeMission({ missionId: 'opportunity' })
    expect(replayComplete.ok).toBe(true)
    if (replayComplete.ok) {
      expect(replayComplete.data.progress.status).toBe('completed')
      expect(replayComplete.data.reward.awarded).toBe(false)
      expect(replayComplete.data.reward.xpAwarded).toBe(0)
      expect(replayComplete.data.achievement.awarded).toBe(false)
    }
  })

  it('provides overview for all five missions', async () => {
    const auth = createAuthService()
    await auth.startGuestSession()
    const progress = createProgressService({ auth })

    const overview = await progress.getProgressOverview()
    expect(overview.ok).toBe(true)
    if (overview.ok) {
      expect(overview.data.missions).toHaveLength(5)
      const ids = overview.data.missions.map((m) => m.missionId)
      expect(ids).toContain('surveyor-3')
      expect(ids).toContain('opportunity')
      expect(ids).toContain('ingenuity')
      expect(ids).toContain('insight')
      expect(ids).toContain('pioneer-10')
    }
  })

  it('isolates progress between distinct explorer sessions', async () => {
    const auth = createAuthService()
    const progress = createProgressService({ auth })

    // User A
    await auth.startGuestSession()
    await progress.saveCheckpoint({ missionId: 'ingenuity', checkpointId: 'takeoff' })

    const progA = await progress.getMissionProgress('ingenuity')
    expect(progA.ok && progA.data.currentCheckpointId).toBe('takeoff')

    // Switch to User B
    await auth.signOut()
    await auth.startGuestSession()

    const progB = await progress.getMissionProgress('ingenuity')
    expect(progB.ok && progB.data.status).toBe('not_started')
    expect(progB.ok && progB.data.currentCheckpointId).toBeNull()
  })

  it('reports a registered checkpoint failure instead of pretending it was saved', async () => {
    const client = new SupabaseClient({
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'eyJ.test-key',
    })
    vi.spyOn(client, 'signInWithPassword').mockResolvedValue({
      data: {
        user: { id: '11111111-1111-4111-8111-111111111111' },
        session: {
          access_token: 'token',
          token_type: 'bearer',
          refresh_token: 'refresh',
          user: { id: '11111111-1111-4111-8111-111111111111' },
        },
      },
      error: null,
    })

    const auth = createAuthService({ client })
    const signedIn = await auth.signIn({
      email: 'nova@example.com',
      password: 'password123',
    })
    expect(signedIn.ok).toBe(true)

    const query = vi.spyOn(client, 'query')
    query.mockResolvedValueOnce({ data: [], error: null })
    query.mockResolvedValueOnce({
      data: null,
      error: { message: 'permission denied for table mission_progress' },
    })

    const progress = createProgressService({ auth, client })
    const failed = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })

    expect(failed.ok).toBe(false)
    if (!failed.ok) {
      expect(failed.error.code).toBe('unavailable')
    }
    expect(String(query.mock.calls[1]?.[0])).toContain('on_conflict=user_id,mission_id')
  })
})
