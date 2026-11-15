import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import { validateSceneSequence } from '@/engine/validateModule.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { loadMissionChapter } from '@/missions/chapter.ts'
import { chapter } from './chapter.tsx'
import { mission } from './mission.ts'

const module = { mission, scenes: chapter.scenes }

describe('InSight chapter foundation', () => {
  it('loads seven scenes in order with the reward contract', async () => {
    expect(chapter.scenes.map((scene) => [scene.id, scene.kind])).toEqual([
      ['insight-last-signal', 'story'],
      ['insight-arrival', 'story'],
      ['insight-deployment', 'activity'],
      ['insight-first-whisper', 'activity'],
      ['insight-interior', 'discovery'],
      ['insight-fading-power', 'activity'],
      ['insight-legacy', 'ending'],
    ])
    expect(chapter.scenes.map((scene) => scene.reward)).toEqual([
      null,
      'introduction',
      null,
      'activity',
      'discovery',
      null,
      null,
    ])
    expect(chapter.scenes[4]).toMatchObject({ discoveryId: 'insight-notes' })
    expect(validateSceneSequence(mission, chapter.scenes)).toEqual([])
    expect(
      validateActivityBindings(chapter.scenes, chapter.activities),
    ).toEqual([])
    const loaded = await loadMissionChapter('insight')
    expect(loaded?.module.mission.id).toBe('insight')
    expect(loaded?.module.scenes.map((scene) => scene.id)).toEqual(
      chapter.scenes.map((scene) => scene.id),
    )
  })

  it('walks every scene and awards each milestone once', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime(services, module)
    render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
      />,
    )
    const button = (name: string) => screen.getByRole('button', { name })
    const heading = (name: string) =>
      screen.findByRole('heading', { level: 2, name })
    async function xp(total: number) {
      const result = await services.rewards.getXpSummary()
      expect(result.ok && result.data.totalXp).toBe(total)
    }

    await user.click(button('Start'))
    await heading('The Last Signal')
    expect(button('Continue')).toBeDisabled()
    await user.click(button('Open the mission archive'))
    await heading('A Scientist Arrives on Mars')
    await xp(0)
    expect(button('Save instrument introduction')).toBeDisabled()
    for (const name of [
      'SEIS seismometer',
      'HP3 heat probe',
      'RISE radio experiment',
    ]) {
      await user.click(button(name))
    }
    await user.click(button('Save instrument introduction'))
    await heading("Setting Up Mars's Ears")
    await xp(20)
    await user.click(button('Mark deployment notes ready'))
    await heading('The First Whisper')
    await xp(20)
    await user.click(screen.getByRole('button', { name: /Signal A/ }))
    await user.click(screen.getByRole('button', { name: /Signal B/ }))
    await user.click(screen.getByRole('button', { name: /Signal C/ }))
    await user.click(screen.getByRole('button', { name: /Signal A/ }))
    await user.click(button('Analyze Signal'))
    expect(screen.getByText(/weather noise/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Signal C/ }))
    await user.click(button('Analyze Signal'))
    expect(
      screen.getByText(/first likely marsquake in April 2019/),
    ).toBeInTheDocument()
    await xp(20)
    await user.click(button('Save signal investigation'))
    await heading('Seeing the Invisible Planet')
    await xp(60)
    await user.click(button('Mark interior notes ready'))
    await heading('When the Power Faded')
    await xp(85)
    const journal = await services.rewards.listJournalEntries()
    expect(journal.ok && journal.data).toEqual([
      expect.objectContaining({
        discoveryId: 'insight-notes',
        contentStatus: 'placeholder',
      }),
    ])
    await user.click(button('Mark power notes ready'))
    await heading('Mars Was Never Truly Silent')
    expect(button('Continue')).toBeEnabled()
    await user.click(button('Continue'))
    await screen.findByText('Chapter complete')
    await xp(100)
    expect(screen.getByText(/InSight story unlocked/)).toBeInTheDocument()

    const grant = vi.spyOn(services.rewards, 'grantMilestone')
    await user.click(button('Start again'))
    await heading('The Last Signal')
    await user.click(button('Next'))
    await heading('A Scientist Arrives on Mars')
    expect(grant).not.toHaveBeenCalled()
    await xp(100)
    runtime.dispose()
  })
})
