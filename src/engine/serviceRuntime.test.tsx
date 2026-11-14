import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { MissionProgress } from '@/contracts/progress.ts'
import { serviceError, serviceOk, type ServiceResult } from '@/contracts/result.ts'
import { milestoneXp } from '@/contracts/rewards.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import type { EngineEffect } from '@/engine/navigation.ts'

function expectOk<T>(result: ServiceResult<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) {
    throw new Error(result.error.message)
  }
  return result.data
}

describe('service runtime', () => {
  it('does not send a confirmed reward or completion again', async () => {
    const services = createMockServices({ persona: 'guest' })
    let grants = 0
    let completions = 0
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        completeMission: async (input) => {
          completions += 1
          return services.progress.completeMission(input)
        },
      },
      rewards: {
        ...services.rewards,
        grantMilestone: async (input) => {
          grants += 1
          return services.rewards.grantMilestone(input)
        },
      },
    })

    const reward: EngineEffect = {
      type: 'grant-milestone',
      request: {
        missionId: 'surveyor-3',
        milestoneId: 'introduction',
        checkpointId: 'opening',
      },
    }
    expect(expectOk(await runtime.apply([reward]))).toBeNull()
    expect(expectOk(await runtime.apply([reward]))).toBeNull()
    expect(grants).toBe(1)

    expect(
      expectOk(
        await runtime.apply([
          {
            type: 'save-checkpoint',
            input: { missionId: 'surveyor-3', checkpointId: 'opening' },
          },
        ]),
      ),
    ).toBeNull()
    const completion: EngineEffect = {
      type: 'complete-mission',
      event: {
        missionId: 'surveyor-3',
        completedCheckpointIds: ['opening'],
      },
    }
    expect(expectOk(await runtime.apply([completion]))).toBeNull()
    expect(expectOk(await runtime.apply([completion]))).toBeNull()
    expect(completions).toBe(1)

    const summary = expectOk(await services.rewards.getXpSummary())
    expect(summary.totalXp).toBe(milestoneXp.introduction + milestoneXp.legacy)
    expect(summary.events.map((event) => event.milestoneId)).toEqual([
      'introduction',
      'legacy',
    ])
  })

  it('retries a failed save without granting the milestone twice', async () => {
    const services = createMockServices({ persona: 'guest' })
    let failSave = true
    let grants = 0
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        saveCheckpoint: async (input) => {
          if (failSave) {
            return serviceError('unavailable', 'The save did not finish.')
          }
          return services.progress.saveCheckpoint(input)
        },
      },
      rewards: {
        ...services.rewards,
        grantMilestone: async (input) => {
          grants += 1
          return services.rewards.grantMilestone(input)
        },
      },
    })
    const effects: EngineEffect[] = [
      {
        type: 'grant-milestone',
        request: {
          missionId: 'surveyor-3',
          milestoneId: 'activity',
          checkpointId: 'task-one',
        },
      },
      {
        type: 'save-checkpoint',
        input: {
          missionId: 'surveyor-3',
          checkpointId: 'finding',
          completedCheckpointId: 'task-one',
        },
      },
    ]

    const failed = await runtime.apply(effects)
    expect(failed.ok).toBe(false)
    if (!failed.ok) {
      expect(failed.error.code).toBe('unavailable')
    }
    expect(grants).toBe(1)

    failSave = false
    expect(expectOk(await runtime.apply(effects))).toBeNull()
    expect(grants).toBe(1)
    const summary = expectOk(await services.rewards.getXpSummary())
    expect(summary.totalXp).toBe(milestoneXp.activity)
    const progress = expectOk(await services.progress.getMissionProgress('surveyor-3'))
    expect(progress.currentCheckpointId).toBe('finding')
  })

  it('shares one in-flight write and rejects an unknown reward key', async () => {
    const services = createMockServices({ persona: 'guest' })
    let calls = 0
    let release: (value: ServiceResult<MissionProgress>) => void = () => undefined
    const gate = new Promise<ServiceResult<MissionProgress>>((resolve) => {
      release = resolve
    })
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        saveCheckpoint: async (input) => {
          calls += 1
          await gate
          return services.progress.saveCheckpoint(input)
        },
      },
      rewards: services.rewards,
    })
    const effect: EngineEffect = {
      type: 'save-checkpoint',
      input: { missionId: 'surveyor-3', checkpointId: 'opening' },
    }
    const first = runtime.apply([effect])
    const second = runtime.apply([effect])
    release(serviceOk({} as MissionProgress))
    await Promise.all([first, second])
    expect(calls).toBe(1)

    let grants = 0
    const guarded = createServiceRuntime({
      progress: services.progress,
      rewards: {
        ...services.rewards,
        grantMilestone: async (input) => {
          grants += 1
          return services.rewards.grantMilestone(input)
        },
      },
    })
    const rejected = await guarded.apply([
      {
        type: 'grant-milestone',
        request: {
          missionId: 'surveyor-3',
          milestoneId: 'bonus',
          checkpointId: 'opening',
        },
      },
    ])
    expect(rejected.ok).toBe(false)
    if (!rejected.ok) {
      expect(rejected.error.code).toBe('invalid-input')
    }
    expect(grants).toBe(0)
  })

  it('resumes the same mock instance and keeps a new instance unsigned', async () => {
    const services = createMockServices({ persona: 'guest' })
    const runtime = createServiceRuntime(services)
    const fixture = createStructuralFixture()
    const user = userEvent.setup()
    const first = render(<MissionPlayer module={fixture} runtime={runtime} />)

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
    first.unmount()

    const loaded = expectOk(await runtime.loadProgress('surveyor-3'))
    expect(loaded).toMatchObject({
      status: 'in_progress',
      currentCheckpointId: 'fixture-opening',
    })

    render(
      <MissionPlayer module={fixture} runtime={runtime} progress={loaded} />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Fixture opening',
    )

    const fresh = createServiceRuntime(createMockServices({ persona: 'guest' }))
    const blank = expectOk(await fresh.loadProgress('surveyor-3'))
    expect(blank).toMatchObject({
      status: 'not_started',
      currentCheckpointId: null,
    })
  })
})

describe('player save states', () => {
  it('shows a failed save and retries it without leaving the scene early', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    let fail = true
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        saveCheckpoint: async (input) => {
          if (fail) {
            return serviceError('unavailable', 'The save did not finish.')
          }
          return services.progress.saveCheckpoint(input)
        },
      },
      rewards: services.rewards,
    })

    render(
      <MissionPlayer module={createStructuralFixture()} runtime={runtime} />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The save did not finish.',
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ready to start',
    )
    expect(screen.queryByText('Your place is saved.')).not.toBeInTheDocument()
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()

    fail = false
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Fixture opening',
    )
  })

  it('keeps a signed-out service on the start screen', async () => {
    const user = userEvent.setup()
    render(
      <MissionPlayer
        module={createStructuralFixture()}
        services={createMockServices()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign in, or continue as a guest, to do that.',
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ready to start',
    )
    expect(screen.queryByText('Your place is saved.')).not.toBeInTheDocument()
  })

  it('waits for the adapter before showing the saved scene', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    let release: (value: ServiceResult<MissionProgress>) => void = () => undefined
    const gate = new Promise<ServiceResult<MissionProgress>>((resolve) => {
      release = resolve
    })
    const runtime = createServiceRuntime({
      progress: {
        ...services.progress,
        saveCheckpoint: (input) =>
          gate.then((result) =>
            result.ok ? services.progress.saveCheckpoint(input) : result,
          ),
      },
      rewards: services.rewards,
    })

    render(
      <MissionPlayer module={createStructuralFixture()} runtime={runtime} />,
    )
    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByRole('status')).toHaveTextContent('Saving your place')
    expect(screen.queryByText('Your place is saved.')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Ready to start',
    )

    release(
      serviceOk({
        missionId: 'surveyor-3',
        status: 'in_progress',
        currentCheckpointId: 'fixture-opening',
        completedCheckpointIds: [],
        completedAt: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )

    expect(await screen.findByText('Your place is saved.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Fixture opening',
    )
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
  })
})
