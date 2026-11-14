import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/features/auth/authService.ts'
import { SupabaseClient } from '@/features/auth/supabaseClient.ts'
import { createProgressService } from '@/features/progress/progressService.ts'
import { createRewardsService } from '@/features/achievements/rewardsService.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import {
  openModule,
  reduceNavigation,
  type EnginePosition,
  type NavigationAction,
} from '@/engine/navigation.ts'
import { serviceError } from '@/contracts/result.ts'

function guestServices(explorerId: string) {
  const client = new SupabaseClient({ supabaseUrl: '', supabaseAnonKey: '' })
  const auth = createAuthService({
    client,
    initialSession: {
      status: 'guest',
      identity: { explorerId, kind: 'guest' },
    },
  })
  const rewards = createRewardsService({ auth, client })
  return { progress: createProgressService({ auth, client, rewards }), rewards }
}

describe('real guest services across refresh (tab-local, no Supabase)', () => {
  it('recovers a partial scene write, completes once, and restores serialized progress and outcomes', async () => {
    const id = crypto.randomUUID()
    const module = createStructuralFixture()
    const first = guestServices(id)
    const runtime = createServiceRuntime(first, module)
    const opened = openModule(module, null)
    if (!opened.ok) throw new Error('Invalid fixture')
    let position: EnginePosition = opened.value
    async function act(action: NavigationAction) {
      const next = reduceNavigation(module, position, action)
      if (!next.ok) throw new Error('Invalid test action')
      const applied = await runtime.apply(next.value.effects)
      if (applied.ok) position = next.value.position
      return applied
    }
    expect((await act({ type: 'start' })).ok).toBe(true)
    vi.spyOn(first.rewards, 'grantMilestone').mockResolvedValueOnce(
      serviceError('unavailable', 'Interrupted reward response'),
    )
    expect((await act({ type: 'complete' })).ok).toBe(false)

    const refreshed = guestServices(id)
    const resumedRuntime = createServiceRuntime(refreshed, module)
    const loaded = await resumedRuntime.loadProgress('surveyor-3')
    expect(loaded.ok && loaded.data.currentCheckpointId).toBe(
      'fixture-evidence',
    )
    const xp = await refreshed.rewards.getXpSummary()
    expect(xp.ok && xp.data.totalXp).toBe(20)
    if (!loaded.ok) throw new Error('Resume failed')
    const resumed = openModule(module, loaded.data)
    if (!resumed.ok) throw new Error('Resume validation failed')
    position = resumed.value
    while (position.status !== 'completed') {
      const next = reduceNavigation(module, position, {
        type: 'complete',
        activityComplete: true,
      })
      if (!next.ok) throw new Error('Invalid scene completion')
      const applied = await resumedRuntime.apply(next.value.effects)
      expect(applied.ok).toBe(true)
      position = next.value.position
    }
    const again = guestServices(id)
    const finished = await createServiceRuntime(again, module).loadProgress(
      'surveyor-3',
    )
    expect(finished.ok && finished.data.status).toBe('completed')
    const summary = await again.rewards.getXpSummary()
    expect(summary.ok && summary.data.totalXp).toBe(100)
    expect(summary.ok && summary.data.events.length).toBe(4)
    const discoveries = await again.rewards.listJournalEntries()
    expect(discoveries.ok && discoveries.data.length).toBe(1)
    const achievements = await again.rewards.listAchievements()
    expect(
      achievements.ok &&
        achievements.data.filter((item) => item.unlockedAt).length,
    ).toBe(1)
    const other = await guestServices(
      crypto.randomUUID(),
    ).rewards.getXpSummary()
    expect(other.ok && other.data.totalXp).toBe(0)
  })
})
