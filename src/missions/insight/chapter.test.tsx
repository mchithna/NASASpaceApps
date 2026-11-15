import { fireEvent, render, screen } from '@testing-library/react'
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
    expect(chapter.scenes[2]).toMatchObject({
      kind: 'activity',
      reward: null,
      activityType: 'insight-deployment',
    })
    expect(chapter.scenes[3]).toMatchObject({
      activityType: 'insight-signal-detective',
      reward: 'activity',
    })
    expect(chapter.scenes[4]).toMatchObject({
      kind: 'discovery',
      reward: 'discovery',
      discoveryId: 'insight-notes',
      interaction: expect.objectContaining({ activityType: 'insight-interior' }),
    })
    expect(chapter.scenes[5]).toMatchObject({
      kind: 'activity',
      reward: null,
      activityType: 'insight-dust-power',
    })
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
    for (const name of [
      'Uneven rocky ground',
      'Obstructed ground',
      'Flat, clear ground',
    ]) {
      await user.click(button(name))
    }
    await user.click(button('Choose this area'))
    await user.click(button('Activate the robotic arm'))
    await user.click(button('Place the wind and thermal shield'))
    await xp(20)
    await user.click(button('Save deployment exercise'))
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
    expect(chapter.scenes[4]).toMatchObject({
      kind: 'discovery',
      reward: 'discovery',
      discoveryId: 'insight-notes',
    })
    await user.click(screen.getByRole('radio', { name: /only wind/ }))
    await user.click(button('Check this clue'))
    expect(screen.getByText(/Wind can shake the ground/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('radio', { name: /outer rocky layer/ }),
    )
    await user.click(button('Check this clue'))
    expect(
      screen.getByRole('img', {
        name: /Revealed: Crust\. Still hidden: Mantle, Core/,
      }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('radio', { name: /layer beneath the crust/ }),
    )
    await user.click(button('Check this clue'))
    await user.click(
      screen.getByRole('radio', { name: /Deep-traveling seismic signals/ }),
    )
    await user.click(button('Check this clue'))
    expect(
      screen.getByText('Discovery Unlocked: Mars Has a Hidden Structure'),
    ).toBeInTheDocument()
    await xp(60)
    await user.click(button('Save interior discovery'))
    await heading('When the Power Faded')
    await xp(85)
    const journal = await services.rewards.listJournalEntries()
    expect(journal.ok && journal.data).toEqual([
      expect.objectContaining({
        discoveryId: 'insight-notes',
        contentStatus: 'placeholder',
      }),
    ])
    const dust = screen.getByRole('slider', { name: 'Dust level' })
    expect(button('Save power demonstration')).toBeDisabled()
    fireEvent.change(dust, { target: { value: '2' } })
    expect(screen.getByText('Heavy dust. Illustrative energy: Low.')).toBeInTheDocument()
    await xp(85)
    await user.click(button('Save power demonstration'))
    await heading('Mars Was Never Truly Silent')
    await xp(85)
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
