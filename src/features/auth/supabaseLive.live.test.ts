/**
 * Hosted Supabase checks. They stay skipped during ordinary unit tests.
 * Run them only after .env.local has the project URL and publishable key:
 * VITE_SUPABASE_LIVE_TESTS=true npm test -- src/features/auth/supabaseLive.live.test.ts
 * These calls create real auth users. They do not use a secret key.
 */

import { describe, expect, it } from 'vitest'
import { createAuthService } from '@/features/auth/authService.ts'
import { SupabaseClient, resolveSupabaseApiKey } from '@/features/auth/supabaseClient.ts'
import { createExplorerService } from '@/features/profiles/explorerService.ts'
import { createProgressService } from '@/features/progress/progressService.ts'
import { createRewardsService } from '@/features/achievements/rewardsService.ts'

const liveUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const liveKey = resolveSupabaseApiKey(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
const liveReady =
  import.meta.env.VITE_SUPABASE_LIVE_TESTS === 'true' &&
  liveUrl.length > 0 &&
  liveKey.length > 0

function hostedClient(): SupabaseClient {
  return new SupabaseClient({
    supabaseUrl: liveUrl,
    supabaseAnonKey: liveKey,
  })
}

describe.skipIf(!liveReady)('hosted Supabase player systems', () => {
  it('signs in an anonymous guest and refuses database XP for that guest', async () => {
    const client = hostedClient()
    const auth = createAuthService({ client })
    const started = await auth.startGuestSession()
    expect(started.ok, started.ok ? '' : `${started.error.code}: ${started.error.message}`).toBe(true)
    if (!started.ok || started.data.status !== 'guest') {
      return
    }

    const restored = hostedClient()
    expect(restored.getSession()?.user.id).toBe(started.data.identity.explorerId)
    expect(restored.getSession()?.user.is_anonymous).toBe(true)

    const grant = await restored.rpc('rpc_grant_milestone', {
      p_mission_id: 'surveyor-3',
      p_milestone_id: 'introduction',
    })
    expect(grant.error).toBeTruthy()

    await auth.signOut()
    restored.setSession(null, 'SIGNED_OUT')
  })

  it('creates a registered explorer, saves progress, and blocks a second XP grant', async () => {
    const client = hostedClient()
    const auth = createAuthService({ client })
    const explorer = createExplorerService({ auth, client })
    const rewards = createRewardsService({ auth, client })
    const progress = createProgressService({ auth, rewards, client })
    const email = `novaexplorer.live.${crypto.randomUUID()}@example.com`
    const password = `Academy-${crypto.randomUUID()}`

    const signedUp = await auth.signUp({
      email,
      password,
      nickname: 'Live Cadet',
      avatarId: 'cadet-1',
    })
    expect(signedUp.ok, signedUp.ok ? '' : `${signedUp.error.code}: ${signedUp.error.message}`).toBe(true)
    if (!signedUp.ok || signedUp.data.status !== 'authenticated') {
      return
    }
    const explorerId = signedUp.data.identity.explorerId

    const profile = await explorer.getProfile()
    expect(profile.ok).toBe(true)
    if (profile.ok) {
      expect(profile.data.explorerId).toBe(explorerId)
      expect(profile.data.totalXp).toBe(0)
    }

    await auth.signOut()
    const signedIn = await auth.signIn({ email, password })
    expect(signedIn.ok).toBe(true)

    const saved = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })
    expect(saved.ok).toBe(true)

    const loaded = await progress.getMissionProgress('surveyor-3')
    expect(loaded.ok && loaded.data.currentCheckpointId).toBe('opening')

    const firstGrant = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(firstGrant.ok && firstGrant.data.awarded).toBe(true)
    expect(firstGrant.ok && firstGrant.data.xpAwarded).toBe(20)

    const secondGrant = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })
    expect(secondGrant.ok && secondGrant.data.awarded).toBe(false)
    expect(secondGrant.ok && secondGrant.data.xpAwarded).toBe(0)

    const achievements = await rewards.listAchievements()
    expect(achievements.ok).toBe(true)

    const other = hostedClient()
    const otherAuth = createAuthService({ client: other })
    const otherSignup = await otherAuth.signUp({
      email: `novaexplorer.other.${crypto.randomUUID()}@example.com`,
      password: `Academy-${crypto.randomUUID()}`,
      nickname: 'Other Cadet',
      avatarId: 'cadet-2',
    })
    expect(otherSignup.ok).toBe(true)

    const isolated = await other.query<unknown[]>(
      `profiles?id=eq.${encodeURIComponent(explorerId)}&select=id`,
    )
    expect(isolated.error).toBeNull()
    expect(isolated.data).toEqual([])

    await auth.signOut()
    await otherAuth.signOut()
  })
})
