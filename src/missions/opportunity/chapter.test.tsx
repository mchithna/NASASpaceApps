import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import { validateSceneSequence } from '@/engine/validateModule.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { serviceError } from '@/contracts/result.ts'
import { createAuthService } from '@/features/auth/authService.ts'
import { SupabaseClient } from '@/features/auth/supabaseClient.ts'
import { createProgressService } from '@/features/progress/progressService.ts'
import { createRewardsService } from '@/features/achievements/rewardsService.ts'
import { chapter } from './chapter.tsx'
import { mission } from './mission.ts'

const module = { mission, scenes: chapter.scenes }

describe('Opportunity chapter', () => {
  it('has seven sourced scenes, an ending interaction and explicit reward timing', () => {
    expect(chapter.scenes).toHaveLength(7)
    expect(validateSceneSequence(mission, chapter.scenes)).toEqual([])
    expect(
      validateActivityBindings(chapter.scenes, chapter.activities),
    ).toEqual([])
    expect(chapter.scenes.every((scene) => scene.sourceIds.length > 0)).toBe(
      true,
    )
    expect(chapter.scenes.map((scene) => scene.reward)).toEqual([
      null,
      'introduction',
      null,
      'activity',
      'discovery',
      null,
      null,
    ])
    expect(chapter.scenes[6]?.interaction?.activityType).toBe(
      'opportunity-timeline',
    )
  })

  it('plays every activity, retries incorrect answers and failed saves, resumes and replays without rewards', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    let runtime = createServiceRuntime(services, module)
    let view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
      />,
    )
    const button = (name: string | RegExp) =>
      screen.getByRole('button', { name })
    const heading = (name: string) =>
      screen.findByRole('heading', { level: 2, name })
    async function xp(total: number) {
      const result = await services.rewards.getXpSummary()
      expect(result.ok && result.data.totalXp).toBe(total)
    }
    await user.click(button('Start'))
    await heading('The Day Mars Went Silent')
    expect(button('Continue')).toBeDisabled()
    await user.click(button('Begin Investigation'))
    await heading('Meet Opportunity')
    await xp(0)
    for (const name of [
      'Panoramic Camera',
      'Microscopic Imager',
      'Spectrometers',
    ])
      await user.click(button(`Inspect ${name}`))
    await user.click(button('Finish rover investigation'))
    await heading('Was Mars Once Wet?')
    await xp(20)
    await user.click(button(/^Hematite-rich spheres/))
    await user.click(button(/^Sedimentary rock layers/))
    await user.click(
      screen.getByLabelText('Opportunity discovered living organisms.'),
    )
    await user.click(button('Check choice'))
    expect(screen.getByText(/That choice is not right yet/)).toBeInTheDocument()
    await user.click(
      screen.getByLabelText(
        'Liquid water affected parts of Mars in the distant past.',
      ),
    )
    await user.click(button('Check choice'))
    await user.click(button('Save water investigation'))
    await heading('The Journey Beyond Expectations')
    await xp(20)
    expect(button(/2. Endurance Crater/)).toBeDisabled()
    view.unmount()
    runtime.dispose()
    runtime = createServiceRuntime(services, module)
    const saved = await runtime.loadProgress(mission.id)
    if (!saved.ok) throw new Error(saved.error.message)
    expect(saved.data.currentCheckpointId).toBe('mars-expedition')
    view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
        progress={saved.data}
      />,
    )
    const targets = [
      'Inspect the outcrop',
      'Examine the rock layers',
      'Observe the crater wall',
      'Open the investigation area',
    ]
    const destinations = [
      'Endurance Crater',
      'Victoria Crater',
      'Endeavour Crater',
    ]
    for (let i = 0; i < 4; i++) {
      await user.click(button(targets[i]!))
      if (i < 3) await user.click(button(`Travel to ${destinations[i]}`))
    }
    vi.spyOn(services.progress, 'saveCheckpoint').mockResolvedValueOnce(
      serviceError('unavailable', 'Opportunity test save interrupted'),
    )
    await user.click(button('Finish expedition'))
    await screen.findByText('Opportunity test save interrupted')
    await xp(20)
    await user.click(button('Finish expedition'))
    await heading('More Evidence, More Questions')
    await xp(60)
    const choose = async (card: string, interpretation: RegExp) =>
      user.click(
        within(screen.getByRole('group', { name: card })).getByRole('button', {
          name: interpretation,
        }),
      )
    await choose('Hematite-rich spheres', /Minerals deposited/)
    await user.click(button('Check matches'))
    expect(
      screen.getByText(/Those matches are not right yet/),
    ).toBeInTheDocument()
    await user.click(button('Reset matches'))
    await choose('Hematite-rich spheres', /groundwater/)
    await choose('Gypsum veins', /Minerals deposited/)
    await choose('Clay-bearing rocks', /less acidic/)
    await user.click(button('Check matches'))
    await user.click(button('Save scientific discovery'))
    await heading('When the Sunlight Disappeared')
    await xp(85)
    const journal = await services.rewards.listJournalEntries()
    expect(journal.ok && journal.data).toEqual([
      expect.objectContaining({
        discoveryId: 'opportunity-notes',
        contentStatus: 'sourced',
        summary: expect.stringContaining('https://science.nasa.gov/'),
      }),
    ])
    expect(button('Finish storm investigation')).toBeDisabled()
    // jsdom does not implement native range keyboard changes.
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } })
    expect(
      screen.getByText('Insufficient for normal operations'),
    ).toBeInTheDocument()
    await user.click(button('Finish storm investigation'))
    await heading("The Explorer That Wouldn't Stop")
    expect(button('Continue')).toBeDisabled()
    await user.click(button('Check order'))
    expect(screen.getByText(/That order is not right yet/)).toBeInTheDocument()
    await user.click(button('Move Landing at Eagle Crater up'))
    await user.click(
      button('Move Exploring additional craters and Endeavour up'),
    )
    await user.click(button('Check order'))
    await user.click(button('Finish the journey'))
    await screen.findByText('Chapter complete')
    await xp(100)
    expect(screen.getByText(/Martian Trailblazer/)).toBeInTheDocument()
    const grant = vi.spyOn(services.rewards, 'grantMilestone')
    const save = vi.spyOn(services.progress, 'saveCheckpoint')
    await user.click(button('Start again'))
    await heading('The Day Mars Went Silent')
    await user.click(button('Next'))
    await heading('Meet Opportunity')
    expect(grant).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
    await xp(100)
    view.unmount()
  }, 60000)

  it('restores real guest checkpoints and idempotent outcomes from tab storage', async () => {
    const explorerId = crypto.randomUUID()
    function services() {
      const client = new SupabaseClient({
        supabaseUrl: '',
        supabaseAnonKey: '',
      })
      const auth = createAuthService({
        client,
        initialSession: {
          status: 'guest',
          identity: { explorerId, kind: 'guest' },
        },
      })
      const rewards = createRewardsService({ auth, client })
      return {
        rewards,
        progress: createProgressService({ auth, client, rewards }),
      }
    }
    const first = services()
    const { openModule, reduceNavigation } =
      await import('@/engine/navigation.ts')
    const opened = openModule(module, null)
    if (!opened.ok) throw new Error('Invalid module')
    let position = opened.value
    let runtime = createServiceRuntime(first, module)
    const started = reduceNavigation(module, position, { type: 'start' })
    if (!started.ok) throw new Error('Start failed')
    expect((await runtime.apply(started.value.effects)).ok).toBe(true)
    position = started.value.position
    for (let i = 0; i < 7; i++) {
      const next = reduceNavigation(module, position, {
        type: 'complete',
        activityComplete: true,
      })
      if (!next.ok) throw new Error(next.issues[0]?.message)
      expect((await runtime.apply(next.value.effects)).ok).toBe(true)
      position = next.value.position
      if (i === 2) {
        runtime.dispose()
        const refreshed = services()
        runtime = createServiceRuntime(refreshed, module)
        const loaded = await runtime.loadProgress('opportunity')
        expect(loaded.ok && loaded.data.currentCheckpointId).toBe(
          'mars-expedition',
        )
      }
    }
    const restored = services()
    const progress = await restored.progress.getMissionProgress('opportunity')
    expect(progress.ok && progress.data.status).toBe('completed')
    const result = await restored.rewards.getXpSummary()
    expect(result.ok && result.data.totalXp).toBe(100)
    expect(result.ok && result.data.events.map((event) => event.xp)).toEqual([
      20, 40, 25, 15,
    ])
    const repeated = await restored.progress.completeMission({
      missionId: 'opportunity',
    })
    expect(repeated.ok && repeated.data.reward.xpAwarded).toBe(0)
  })
})
