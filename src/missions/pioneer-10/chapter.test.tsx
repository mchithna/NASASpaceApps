import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { validateSceneSequence } from '@/engine/validateModule.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { serviceError } from '@/contracts/result.ts'
import { chapter } from './chapter.tsx'
import { mission } from './mission.ts'
import { lightDelay, plaqueMatch, scienceTargets } from './content.ts'

const module = { mission, scenes: chapter.scenes }
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const click = (name: string | RegExp) => fireEvent.click(button(name))
const scene = (name: string) => screen.findByRole('heading', { name, level: 2 })

describe('Pioneer 10 chapter', () => {
  it('has seven sourced scenes, explicit reward timing and valid registered interactions', () => {
    expect(chapter.scenes).toHaveLength(7)
    expect(validateSceneSequence(mission, chapter.scenes)).toEqual([])
    expect(
      validateActivityBindings(chapter.scenes, chapter.activities),
    ).toEqual([])
    expect(chapter.scenes.map((item) => item.reward)).toEqual([
      null,
      'introduction',
      null,
      'activity',
      'discovery',
      null,
      null,
    ])
    expect(chapter.scenes.every((item) => item.sourceIds.length > 0)).toBe(true)
    expect(mission.id).toBe('pioneer-10')
    expect(mission.achievementId).toBe('pioneer-10-story')
  })
  it('calculates physically consistent illustrative one-way delays', () => {
    expect(lightDelay(1)).toBe('0 h 56 min')
    expect(lightDelay(6)).toBe('5 h 34 min')
    expect(lightDelay(12.23)).toBe('11 h 20 min')
  })
  it('plays every activity, gates rewards, recovers failed saves, resumes and replays without duplicate rewards', async () => {
    const services = createMockServices({ persona: 'guest' })
    let runtime = createServiceRuntime(services, module)
    let view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
      />,
    )
    const xp = async (amount: number) => {
      const result = await services.rewards.getXpSummary()
      expect(result.ok && result.data.totalXp).toBe(amount)
    }
    click('Start')
    await scene('The Last Whisper From Deep Space')
    expect(button('Continue')).toBeDisabled()
    click('Trace the Signal')
    await scene('Meet Pioneer 10')
    await xp(0)
    expect(button('Finish spacecraft inspection')).toBeDisabled()
    for (const name of [
      /^1. High-Gain/,
      /^2. Radioisotope/,
      /^3. Magnetometer/,
      /^4. Scientific Instruments/,
    ])
      click(name)
    click('Finish spacecraft inspection')
    await scene('Into Uncharted Territory')
    await xp(20)
    click('Check order')
    expect(screen.getByText(/That order is not right yet/)).toBeInTheDocument()
    click('Move Beyond Mars up')
    click('Check order')
    click('Run the debris survey')
    fireEvent.click(
      screen.getByLabelText(
        'The asteroid belt is a tightly packed wall requiring constant dodging.',
      ),
    )
    click('Check choice')
    expect(screen.getByText(/That choice is not right yet/)).toBeInTheDocument()
    fireEvent.click(
      screen.getByLabelText(
        'The belt is mostly empty space; measuring dust and debris helped assess spacecraft risks.',
      ),
    )
    click('Check choice')
    click('Save asteroid belt findings')
    await scene('Jupiter: A Giant Revealed')
    view.unmount()
    runtime.dispose()
    runtime = createServiceRuntime(services, module)
    const saved = await runtime.loadProgress('pioneer-10')
    if (!saved.ok) throw new Error(saved.error.message)
    expect(saved.data.currentCheckpointId).toBe('jupiter-encounter')
    view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
        progress={saved.data}
      />,
    )
    click('Begin Jupiter approach')
    click('Enter science encounter')
    expect(button('Continue beyond Jupiter')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Imaging photopolarimeter'))
    click('Collect observation')
    expect(screen.getByText(/Try another instrument/)).toBeInTheDocument()
    for (const target of scienceTargets) {
      click(new RegExp(`^${target.title}`))
      fireEvent.click(screen.getByLabelText(target.instrument))
      click('Collect observation')
    }
    click('Continue beyond Jupiter')
    vi.spyOn(services.progress, 'saveCheckpoint').mockResolvedValueOnce(
      serviceError('unavailable', 'Pioneer checkpoint interrupted'),
    )
    click('Save Jupiter investigation')
    await screen.findByText('Pioneer checkpoint interrupted')
    await xp(20)
    click('Save Jupiter investigation')
    await scene('A Message From Humanity')
    await xp(60)
    for (const name of [
      /^1. Hydrogen reference/,
      /^2. Pulsar map/,
      /^3. Human figures/,
      /^4. Solar system/,
    ])
      click(name)
    click('Zoom selected symbol')
    click('Show full plaque')
    click('Check matches')
    expect(
      screen.getByText(/Those matches are not right yet/),
    ).toBeInTheDocument()
    for (const card of plaqueMatch.evidence) {
      const group = screen.getByRole('group', { name: card.label })
      const meaning = plaqueMatch.meanings.find(
        (item) => item.id === card.meaningId,
      )!
      fireEvent.click(
        [...group.querySelectorAll('button')].find(
          (item) => item.textContent === meaning.label,
        )!,
      )
    }
    click('Check matches')
    click('Reset symbol matches')
    for (const card of plaqueMatch.evidence) {
      const group = screen.getByRole('group', { name: card.label })
      const meaning = plaqueMatch.meanings.find(
        (item) => item.id === card.meaningId,
      )!
      fireEvent.click(
        [...group.querySelectorAll('button')].find(
          (item) => item.textContent === meaning.label,
        )!,
      )
    }
    click('Check matches')
    click('Save Pioneer plaque discovery')
    await scene('The Faintest Voice Across the Stars')
    await xp(85)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '6' } })
    expect(screen.getByText('5 h 34 min')).toBeInTheDocument()
    click('January 23, 2003 — Last detected signal')
    click(/^Increasing Distance/)
    click(/^Decreasing Electrical Power/)
    fireEvent.click(
      screen.getByLabelText('Jupiter destroyed the spacecraft in 1973.'),
    )
    click('Check choice')
    expect(screen.getByText(/That choice is not right yet/)).toBeInTheDocument()
    fireEvent.click(
      screen.getByLabelText(
        'Its available power declined and the already faint signal became undetectable.',
      ),
    )
    click('Check choice')
    click('Finish communication investigation')
    await scene('The Messenger That Never Came Home')
    await xp(85)
    click('Check order')
    click('Move 1972 — Launch from Earth up')
    click('Move 1973 — Jupiter flyby up')
    click('Check order')
    click('Complete Pioneer 10 mission')
    await screen.findByText('Chapter complete')
    await xp(100)
    const journal = await services.rewards.listJournalEntries()
    expect(
      journal.ok &&
        journal.data.find((item) => item.discoveryId === 'pioneer-10-notes'),
    ).toMatchObject({
      title: 'The Pioneer Plaque — A Message From Humanity',
      contentStatus: 'sourced',
      summary: expect.stringContaining('NASA source:'),
    })
    const achievements = await services.rewards.listAchievements()
    expect(
      achievements.ok &&
        achievements.data.find((item) => item.id === 'pioneer-10-story')
          ?.unlockedAt,
    ).toBeTruthy()
    const save = vi.spyOn(services.progress, 'saveCheckpoint')
    save.mockClear()
    const grant = vi.spyOn(services.rewards, 'grantMilestone')
    click('Start again')
    await scene('The Last Whisper From Deep Space')
    click('Next')
    await scene('Meet Pioneer 10')
    expect(save).not.toHaveBeenCalled()
    expect(grant).not.toHaveBeenCalled()
    await xp(100)
    view.unmount()
    runtime.dispose()
  }, 30000)
})
