import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { missionXpCap } from '@/contracts/rewards.ts'
import type { ServiceResult } from '@/contracts/result.ts'
import { serviceError } from '@/contracts/result.ts'
import { listMissions } from '@/missions/registry.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { TrainingSimulatorPreview } from '@/engine/training/TrainingSimulatorPreview.tsx'
import { createTrainingActivities } from '@/engine/training/trainingSlotActivity.tsx'
import {
  createTrainingSimulator,
  trainingSimulatorLabel,
} from '@/engine/training/trainingSimulator.ts'

function expectOk<T>(result: ServiceResult<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.error.message)
  }
  return result.data
}

function registeredActivities() {
  const result = createTrainingActivities()
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error('Training activities failed to register.')
  }
  return result.value
}

describe('training simulator', () => {
  it('is not a sixth production mission', () => {
    expect(listMissions().map((mission) => mission.id)).toEqual([
      'surveyor-3',
      'opportunity',
      'ingenuity',
      'insight',
      'pioneer-10',
    ])
    expect(createTrainingSimulator().mission.id).toBe('surveyor-3')
  })

  it('refuses to play until the custom activity is registered', () => {
    render(<MissionPlayer module={createTrainingSimulator()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This activity type is not registered.',
    )
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('completes the practice visit once and does not grant the milestones again', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime(services)

    render(
      <MissionPlayer
        module={createTrainingSimulator()}
        runtime={runtime}
        activities={registeredActivities()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator intro' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/This opening is academy narration/)).toBeInTheDocument()
    expect(screen.getByText('Academy narration')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator evidence',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('No picture')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Surveyor 3 — NASA Science' }),
    ).toHaveAttribute('href', 'https://science.nasa.gov/mission/surveyor-3/')

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator intro' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator evidence',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator timeline',
      }),
    ).toBeInTheDocument()

    const moveReadUp = screen.getByRole('button', {
      name: 'Move Read the practice card up',
    })
    moveReadUp.focus()
    await user.keyboard('{Enter}')
    const checkOrder = screen.getByRole('button', { name: 'Check order' })
    checkOrder.focus()
    await user.keyboard('{Enter}')

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator custom slot',
      }),
    ).toBeInTheDocument()
    const slot = screen.getByRole('button', { name: 'Mark the practice slot done' })
    slot.focus()
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
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    const summary = expectOk(await services.rewards.getXpSummary())
    expect(summary.totalXp).toBe(missionXpCap)
    expect(summary.events.map((event) => event.milestoneId)).toEqual([
      'introduction',
      'activity',
      'discovery',
      'legacy',
    ])
    const progress = expectOk(await services.progress.getMissionProgress('surveyor-3'))
    expect(progress).toMatchObject({
      status: 'completed',
      currentCheckpointId: 'sim-ending',
    })
    const journal = expectOk(await services.rewards.listJournalEntries())
    expect(journal).toEqual([
      expect.objectContaining({
        discoveryId: 'sim-note',
        contentStatus: 'placeholder',
      }),
    ])

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Training simulator discovery',
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator ending' }),
    ).toBeInTheDocument()
    const replayed = expectOk(await services.rewards.getXpSummary())
    expect(replayed.totalXp).toBe(missionXpCap)
    expect(replayed.events).toHaveLength(4)
  })

  it('resumes the same mock after exit and shows a lost session', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime(services)
    const view = render(
      <MissionPlayer
        module={createTrainingSimulator()}
        runtime={runtime}
        activities={registeredActivities()}
        onExit={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()
    view.unmount()

    const loaded = expectOk(await runtime.loadProgress('surveyor-3'))
    render(
      <MissionPlayer
        module={createTrainingSimulator()}
        runtime={runtime}
        activities={registeredActivities()}
        progress={loaded}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Training simulator intro',
    )

    await services.auth.signOut()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign in, or continue as a guest, to do that.',
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Training simulator intro',
    )
  })

  it('shows an invalid scene, a missing source, and a failed save', async () => {
    const user = userEvent.setup()
    const fixture = createTrainingSimulator()
    const { unmount } = render(
      <MissionPlayer
        module={fixture}
        activities={registeredActivities()}
        progress={{
          missionId: 'surveyor-3',
          status: 'in_progress',
          currentCheckpointId: 'not-a-scene',
          completedCheckpointIds: [],
        }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'That scene is not part of this mission.',
    )
    unmount()

    const missingSource = {
      ...fixture,
      scenes: fixture.scenes.map((scene) =>
        scene.kind === 'evidence' ? { ...scene, sourceIds: ['missing-source'] } : scene,
      ),
    }
    const missing = render(
      <MissionPlayer module={missingSource} activities={registeredActivities()} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'A scene cites a source that is not on this mission.',
    )
    missing.unmount()

    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        saveCheckpoint: async () =>
          serviceError('unavailable', 'The save did not finish.'),
      },
      rewards: services.rewards,
    })
    render(
      <MissionPlayer
        module={fixture}
        runtime={runtime}
        activities={registeredActivities()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The save did not finish.',
    )
    expect(screen.queryByText('Your place is saved.')).not.toBeInTheDocument()
  })

  it('previews the visit with a full-width control and a resume path', async () => {
    const user = userEvent.setup()
    render(<TrainingSimulatorPreview />)

    expect(screen.getByText(trainingSimulatorLabel)).toBeInTheDocument()
    expect(screen.getByText(/browser reload/i)).toBeInTheDocument()
    const start = screen.getByRole('button', { name: 'Start' })
    expect(start.className).toContain('w-full')
    expect(start.className).toContain('sm:w-auto')

    await user.click(start)
    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Exit mission' }))
    await user.click(screen.getByRole('button', { name: 'Resume training' }))
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Training simulator intro' }),
    ).toBeInTheDocument()
  })
})
