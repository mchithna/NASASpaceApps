import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { validateSceneSequence } from '@/engine/validateModule.ts'
import { validateActivityBindings } from '@/engine/activityRegistry.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { serviceError } from '@/contracts/result.ts'
import { chapter } from './chapter.tsx'
import { mission } from './mission.ts'
import { flightReducer } from './flightState.ts'

const module = { mission, scenes: chapter.scenes }
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const click = (name: string | RegExp) => fireEvent.click(button(name))
const scene = (name: string) => screen.findByRole('heading', { name, level: 2 })
function solveOrder(first: string, third: string) {
  click('Check order')
  expect(screen.getByText(/That order is not right yet/)).toBeInTheDocument()
  click(`Move ${first} up`)
  click(`Move ${third} up`)
  click('Check order')
}

describe('Ingenuity chapter', () => {
  it('loads seven sourced scenes and the fixed reward checkpoints through the existing contracts', () => {
    expect(validateSceneSequence(mission, chapter.scenes)).toEqual([])
    expect(
      validateActivityBindings(chapter.scenes, chapter.activities),
    ).toEqual([])
    expect(chapter.scenes).toHaveLength(7)
    expect(chapter.scenes.map((item) => item.reward)).toEqual([
      null,
      'introduction',
      null,
      'activity',
      null,
      'discovery',
      null,
    ])
    expect(chapter.scenes.every((item) => item.sourceIds.length > 0)).toBe(true)
    expect(mission.achievementId).toBe('ingenuity-story')
  })

  it('uses deterministic flight stages and never completes an unexecuted flight', () => {
    expect(flightReducer('ready', { type: 'finish' })).toBe('ready')
    expect(flightReducer('ready', { type: 'advance' })).toBe('spin-up')
    expect(flightReducer('spin-up', { type: 'advance' })).toBe('takeoff')
    expect(flightReducer('takeoff', { type: 'advance' })).toBe('hover')
    expect(flightReducer('hover', { type: 'advance' })).toBe('descent')
    expect(flightReducer('descent', { type: 'advance' })).toBe('landed')
    expect(flightReducer('landed', { type: 'advance' })).toBe('landed')
    expect(flightReducer('hover', { type: 'finish' })).toBe('landed')
    expect(flightReducer('landed', { type: 'reset' })).toBe('ready')
  })

  it('plays the full journey with retries, saved checkpoints, reward failure recovery and idempotent replay', async () => {
    const services = createMockServices({ persona: 'guest' })
    let runtime = createServiceRuntime(services, module)
    let view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
      />,
    )
    const xp = async (value: number) => {
      const result = await services.rewards.getXpSummary()
      expect(result.ok && result.data.totalXp).toBe(value)
    }
    click('Start')
    await scene('What If We Could Fly on Mars?')
    expect(button('Continue')).toBeDisabled()
    click('Begin Flight Training')
    await scene('Meet the Little Helicopter That Could')
    await xp(0)
    expect(button('Finish aircraft inspection')).toBeDisabled()
    for (const name of [
      /^1. Rotor blades/,
      /^2. Solar panel/,
      /^3. Navigation camera/,
      /^4. Battery and electronics/,
    ])
      click(name)
    click('Finish aircraft inspection')
    await scene('Can a Helicopter Fly in the Thin Martian Air?')
    await xp(20)
    click('Run Test')
    expect(
      screen.getByText(/Insufficient lift in this demonstration/),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Earth — denser air'))
    click('Run Test')
    expect(button('Save flight lab findings')).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Mars — very thin air'))
    fireEvent.click(
      screen.getByLabelText('Ingenuity’s larger, fast-spinning rotor design'),
    )
    click('Run Test')
    click('Save flight lab findings')
    await scene('Mission Control: Ready for Takeoff')
    view.unmount()
    runtime.dispose()
    runtime = createServiceRuntime(services, module)
    const saved = await runtime.loadProgress(mission.id)
    if (!saved.ok) throw new Error(saved.error.message)
    expect(saved.data.currentCheckpointId).toBe('first-flight')
    view = render(
      <MissionPlayer
        module={module}
        activities={chapter.activities}
        runtime={runtime}
        progress={saved.data}
      />,
    )
    expect(button('Authorize Flight')).toBeDisabled()
    for (const name of [
      'Battery prepared',
      'Rotor system ready',
      'Navigation system ready',
      'Landing area checked',
    ])
      click(name)
    click('Authorize Flight')
    solveOrder('Spin Up Rotors', 'Hover')
    click('Execute Autonomous Flight')
    click('Pause animation')
    click('Next flight stage')
    click('Next flight stage')
    expect(screen.getByText('3 m reference')).toBeInTheDocument()
    click('Next flight stage')
    click('Next flight stage')
    vi.spyOn(services.progress, 'saveCheckpoint').mockResolvedValueOnce(
      serviceError('unavailable', 'Flight checkpoint interrupted'),
    )
    click('Continue the journey')
    await screen.findByText('Flight checkpoint interrupted')
    await xp(20)
    click('Continue the journey')
    await scene('The Sky Was No Longer the Limit')
    await xp(60)
    for (const name of ['Boulders', 'Sand ripples', 'Observation point'])
      click(name)
    fireEvent.click(screen.getByLabelText('Direct corridor through boulders'))
    fireEvent.click(screen.getByLabelText('Zone A — Large boulders'))
    click('Submit scouting plan')
    expect(screen.getByText(/That direct corridor crosses/)).toBeInTheDocument()
    fireEvent.click(
      screen.getByLabelText('Observation corridor around obstacles'),
    )
    fireEvent.click(screen.getByLabelText('Zone B — Feature-poor sand'))
    click('Submit scouting plan')
    expect(screen.getByText(/Feature-poor sand can make/)).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Zone C — Clear, textured terrain'))
    click('Submit scouting plan')
    click('Save scouting plan')
    await scene('What Happened to Flight 72?')
    await xp(60)
    fireEvent.click(screen.getByLabelText('Mars has no sunlight'))
    expect(
      screen.getByText(/Try again. Mars receives sunlight/),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByLabelText(
        'Too few distinguishable surface features to track',
      ),
    )
    click('Feature-poor terrain — few tracking points')
    click('Feature-rich terrain — many tracking points')
    click('Enlarge rotor-shadow image')
    click('Inspect damaged rotor shadow')
    fireEvent.click(
      screen.getByLabelText(
        'This game proves every detail of the accident with certainty.',
      ),
    )
    click('Check engineering lesson')
    expect(
      screen.getByText(/Try again. Ingenuity flew autonomously/),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByLabelText(
        'Reliable navigation and safe landings are essential for autonomous aircraft on unfamiliar terrain.',
      ),
    )
    click('Check engineering lesson')
    click('Save Flight 72 discovery')
    await scene('Five Flights Became Seventy-Two')
    await xp(85)
    const journal = await services.rewards.listJournalEntries()
    expect(
      journal.ok &&
        journal.data.some((entry) => entry.discoveryId === 'ingenuity-notes'),
    ).toBe(true)
    expect(
      journal.ok &&
        journal.data.find((entry) => entry.discoveryId === 'ingenuity-notes'),
    ).toMatchObject({
      title: 'The Final Flight of Ingenuity',
      contentStatus: 'sourced',
      summary: expect.stringContaining('NASA source: https://www.nasa.gov/'),
    })
    solveOrder(
      'Perseverance carries Ingenuity to Mars — February 18, 2021',
      'Five-flight demonstration becomes an extended mission',
    )
    click('Complete Ingenuity mission')
    await screen.findByText('Chapter complete')
    await xp(100)
    const achievements = await services.rewards.listAchievements()
    expect(
      achievements.ok &&
        achievements.data.find((item) => item.id === 'ingenuity-story')
          ?.unlockedAt,
    ).toBeTruthy()
    const saveSpy = vi.spyOn(services.progress, 'saveCheckpoint')
    const rewardSpy = vi.spyOn(services.rewards, 'grantMilestone')
    saveSpy.mockClear()
    rewardSpy.mockClear()
    click('Start again')
    await scene('What If We Could Fly on Mars?')
    click('Next')
    await scene('Meet the Little Helicopter That Could')
    click('Next')
    await scene('Can a Helicopter Fly in the Thin Martian Air?')
    expect(saveSpy).not.toHaveBeenCalled()
    expect(rewardSpy).not.toHaveBeenCalled()
    await xp(100)
    view.unmount()
    runtime.dispose()
  })

  it('keeps inspection usable when historical images fail', () => {
    const complete = vi.fn()
    const registration = chapter.activities.lookup('ingenuity-opening')!
    render(
      <>
        {registration.render({
          missionId: 'ingenuity',
          sceneId: 'mars-flight-dream',
          activityId: 'begin-training',
          activityType: 'ingenuity-opening',
          config: {},
          completed: false,
          replay: false,
          onComplete: complete,
        })}
      </>,
    )
    const image = screen.getByRole('img', { hidden: true })
    fireEvent.error(image)
    expect(screen.getByText('Picture unavailable')).toBeInTheDocument()
    fireEvent.click(
      within(
        screen.getByRole('button', { name: 'Begin Flight Training' }),
      ).getByText('Begin Flight Training'),
    )
    expect(complete).toHaveBeenCalledOnce()
  })
})
