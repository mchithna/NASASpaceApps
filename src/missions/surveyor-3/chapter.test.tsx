import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { serviceError } from '@/contracts/result.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import { validateSceneSequence } from '@/engine/validateModule.ts'
import { chapter } from './chapter.tsx'
import { mission } from './mission.ts'

const module = { mission, scenes: chapter.scenes }

describe('Surveyor 3 authored chapter', () => {
  it('has seven valid, sourced scenes and registered investigations', () => {
    expect(module.scenes).toHaveLength(7)
    expect(validateSceneSequence(mission, module.scenes)).toEqual([])
    expect(validateActivityBindings(module.scenes, chapter.activities)).toEqual(
      [],
    )
    expect(module.scenes.every((scene) => scene.sourceIds.length > 0)).toBe(
      true,
    )
    const duplicate = module.scenes.map((scene, index) =>
      index === 0 ? { ...scene, reward: 'introduction' as const } : scene,
    )
    expect(validateSceneSequence(mission, duplicate).length).toBeGreaterThan(0)
  })

  it('plays all seven scenes, retries wrong answers and failed saves, resumes and rewards only once', async () => {
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
    const heading = (name: string) =>
      screen.findByRole('heading', { level: 2, name })
    const xp = async (total: number) => {
      const result = await services.rewards.getXpSummary()
      expect(result.ok && result.data.totalXp).toBe(total)
    }
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await heading('The Robot They Came Back For')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await heading('Meet Surveyor 3')
    await xp(0)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    for (const name of [
      /1. TV camera/,
      /2. Surface sampler/,
      /3. Landing system/,
    ]) {
      await user.click(screen.getByRole('button', { name }))
    }
    await user.click(screen.getByRole('button', { name: 'Open mission file' }))
    await heading('Three Touchdowns, One Landing')
    await xp(20)
    await user.click(screen.getByRole('button', { name: 'Check order' }))
    expect(screen.getByText(/That order is not right yet/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Move Descent toward the Moon up' }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Move First touchdown and bounce up',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Move First touchdown and bounce up',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check order' }))
    await heading('The Lunar Soil Investigation')
    await xp(20)
    // New runtime reads the same persisted checkpoint; unfinished sampler restarts.
    view.unmount()
    runtime.dispose()
    runtime = createServiceRuntime(services, module)
    const saved = await runtime.loadProgress(mission.id)
    if (!saved.ok) throw new Error(saved.error.message)
    expect(saved.data.currentCheckpointId).toBe('surveyor-soil')
    view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
        progress={saved.data}
      />,
    )
    for (const name of [
      'Position arm',
      'Press the surface',
      'Dig a trench',
      'Inspect the evidence',
    ]) {
      await user.click(screen.getByRole('button', { name }))
    }
    await user.click(
      screen.getByLabelText('The surface could not support a spacecraft.'),
    )
    await user.click(
      screen.getByRole('button', { name: 'Submit investigation' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Try again')
    await xp(20)
    await user.click(
      screen.getByLabelText(
        'The tested surface was firm enough to support an Apollo Lunar Module.',
      ),
    )
    vi.spyOn(services.progress, 'saveCheckpoint').mockResolvedValueOnce(
      serviceError('unavailable', 'Test save unavailable'),
    )
    await user.click(
      screen.getByRole('button', { name: 'Submit investigation' }),
    )
    await screen.findByText('Test save unavailable')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await user.click(
      screen.getByRole('button', { name: 'Retry saving investigation' }),
    )
    await heading('The Last Transmission')
    await xp(60)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await heading('Apollo 12 Returns')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await user.click(screen.getByLabelText('The entire Surveyor 3 lander'))
    await user.click(screen.getByRole('button', { name: 'Check evidence' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Look again')
    expect((await services.rewards.listJournalEntries()).ok).toBe(true)
    await user.click(screen.getByLabelText('The entire Surveyor 3 lander'))
    await user.click(screen.getByLabelText('TV camera system'))
    await user.click(screen.getByLabelText('Surface sampler scoop'))
    await user.click(screen.getByRole('button', { name: 'Check evidence' }))
    await heading("A Mission That Didn't End With Silence")
    await xp(85)
    const journal = await services.rewards.listJournalEntries()
    expect(journal.ok && journal.data).toEqual([
      expect.objectContaining({
        discoveryId: 'surveyor-3-notes',
        contentStatus: 'sourced',
        summary: expect.stringContaining('lunar environment'),
      }),
    ])
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByText('Chapter complete')
    await xp(100)
    expect(screen.getByText(/Lunar Archaeologist unlocked/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start again' }))
    await heading('The Robot They Came Back For')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await heading('Meet Surveyor 3')
    await user.click(screen.getByRole('button', { name: /1. TV camera/ }))
    await xp(100)
    const summary = await services.rewards.getXpSummary()
    expect(summary.ok && summary.data.events).toHaveLength(4)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled(),
    )
    view.unmount()
  }, 30000)
})
