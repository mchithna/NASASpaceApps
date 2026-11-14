/**
 * Phase 4A merge check.
 * One guest mock instance plays the training simulator through MissionPlayer.
 * This is not a production mission and not a persisted visit.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { missionXpCap } from '@/contracts/rewards.ts'
import type { ServiceResult } from '@/contracts/result.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { createTrainingActivities } from '@/engine/training/trainingSlotActivity.tsx'
import { createTrainingSimulator } from '@/engine/training/trainingSimulator.ts'

function expectOk<T>(result: ServiceResult<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.error.message)
  }
  return result.data
}

describe('Phase 4A mock integration', () => {
  it('completes, resumes, replays, and keeps the milestone total', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime(services)
    const activities = createTrainingActivities()
    expect(activities.ok).toBe(true)
    if (!activities.ok) {
      return
    }

    const module = createTrainingSimulator()
    const first = render(
      <MissionPlayer
        module={module}
        runtime={runtime}
        activities={activities.value}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator intro' }),
    ).toBeInTheDocument()
    first.unmount()

    const resumed = expectOk(await runtime.loadProgress('surveyor-3'))
    expect(resumed.currentCheckpointId).toBe('sim-intro')
    render(
      <MissionPlayer
        module={module}
        runtime={runtime}
        activities={activities.value}
        progress={resumed}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator evidence',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Surveyor 3 — NASA Science' }),
    ).toHaveAttribute('href', 'https://science.nasa.gov/mission/surveyor-3/')
    expect(screen.getByText('Academy narration and NASA source')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator timeline',
      }),
    ).toBeInTheDocument()
    screen.getByRole('button', { name: 'Move Read the practice card up' }).focus()
    await user.keyboard('{Enter}')
    screen.getByRole('button', { name: 'Check order' }).focus()
    await user.keyboard('{Enter}')

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator custom slot',
      }),
    ).toBeInTheDocument()
    screen.getByRole('button', { name: 'Mark the practice slot done' }).focus()
    await user.keyboard('{Enter}')

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator discovery',
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator ending' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()

    const finished = expectOk(await services.rewards.getXpSummary())
    expect(finished.totalXp).toBe(missionXpCap)
    expect(finished.events.map((event) => event.milestoneId)).toEqual([
      'introduction',
      'activity',
      'discovery',
      'legacy',
    ])

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Training simulator ending',
    )
    const replayed = expectOk(await services.rewards.getXpSummary())
    expect(replayed.totalXp).toBe(missionXpCap)
    expect(replayed.events).toHaveLength(4)
  })
})
