import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { serviceOk } from '@/contracts/result.ts'
import { createActivityRegistry } from '@/engine/activityRegistry.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import {
  createTrainingRuntime,
  type MissionRuntimeAdapter,
} from '@/engine/trainingRuntime.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'

function runtimeSpy(): MissionRuntimeAdapter & { apply: ReturnType<typeof vi.fn> } {
  const apply = vi.fn(async () => serviceOk(null))
  return { apply }
}

function sceneHeading(): HTMLElement {
  return screen.getByRole('heading', { level: 2 })
}

describe('MissionPlayer frame', () => {
  it('shows an error and does not write when the sequence is empty', async () => {
    const fixture = createStructuralFixture()
    const runtime = runtimeSpy()

    render(
      <MissionPlayer
        module={{ mission: fixture.mission, scenes: [] }}
        runtime={runtime}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A mission needs at least one scene.',
    )
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(runtime.apply).not.toHaveBeenCalled()
  })

  it('shows an error when the saved scene is not in the mission', () => {
    const fixture = createStructuralFixture()
    const progress: MissionRuntimeState = {
      missionId: 'surveyor-3',
      status: 'in_progress',
      currentCheckpointId: 'not-a-scene',
      completedCheckpointIds: [],
    }

    render(<MissionPlayer module={fixture} progress={progress} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'That scene is not part of this mission.',
    )
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('starts on the first scene and disables back and next', async () => {
    const user = userEvent.setup()
    const runtime = createTrainingRuntime()

    render(
      <MissionPlayer module={createStructuralFixture()} runtime={runtime} />,
    )

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0 of 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start' }))

    expect(sceneHeading()).toHaveTextContent('Fixture opening')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByText('1 of 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    expect(runtime.applied).toEqual([
      expect.objectContaining({
        type: 'save-checkpoint',
        input: {
          missionId: 'surveyor-3',
          checkpointId: 'fixture-opening',
        },
      }),
    ])
  })

  it('moves next and back only through unlocked scenes', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()
    const progress: MissionRuntimeState = {
      missionId: 'surveyor-3',
      status: 'in_progress',
      currentCheckpointId: 'fixture-opening',
      completedCheckpointIds: ['fixture-opening'],
    }

    render(<MissionPlayer module={fixture} progress={progress} />)

    expect(sceneHeading()).toHaveTextContent('Fixture opening')
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(sceneHeading()).toHaveTextContent('Fixture evidence')
    expect(screen.getByText('2 of 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Surveyor 3 — NASA Science' }),
    ).toHaveAttribute('href', 'https://science.nasa.gov/mission/surveyor-3/')
    expect(
      screen.getByText('Academy narration and NASA source'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(sceneHeading()).toHaveTextContent('Fixture opening')
    expect(screen.getByText('1 of 5')).toBeInTheDocument()
  })

  it('disables next on the last scene during replay', () => {
    const fixture = createStructuralFixture()
    const progress: MissionRuntimeState = {
      missionId: 'surveyor-3',
      status: 'completed',
      currentCheckpointId: 'fixture-ending',
      completedCheckpointIds: fixture.scenes.map((scene) => scene.id),
    }
    const runtime = runtimeSpy()

    render(
      <MissionPlayer module={fixture} progress={progress} runtime={runtime} />,
    )

    expect(sceneHeading()).toHaveTextContent('Fixture ending')
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()
    expect(screen.getByText('5 of 5')).toBeInTheDocument()
    expect(runtime.apply).not.toHaveBeenCalled()
  })

  it('returns to the first scene on restart and keeps it after rerender', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()
    const progress: MissionRuntimeState = {
      missionId: 'surveyor-3',
      status: 'in_progress',
      currentCheckpointId: 'fixture-evidence',
      completedCheckpointIds: ['fixture-opening'],
    }
    const view = render(<MissionPlayer module={fixture} progress={progress} />)

    await user.click(screen.getByRole('button', { name: 'Start again' }))
    expect(sceneHeading()).toHaveTextContent('Fixture opening')

    view.rerender(<MissionPlayer module={fixture} progress={progress} />)
    expect(sceneHeading()).toHaveTextContent('Fixture opening')
  })

  it('calls exit without leaving the scene', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    const fixture = createStructuralFixture()

    render(
      <MissionPlayer
        module={fixture}
        onExit={onExit}
        progress={{
          missionId: 'surveyor-3',
          status: 'in_progress',
          currentCheckpointId: 'fixture-evidence',
          completedCheckpointIds: ['fixture-opening'],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Exit mission' }))
    expect(onExit).toHaveBeenCalledTimes(1)
    expect(sceneHeading()).toHaveTextContent('Fixture evidence')
  })

  it('moves next from the keyboard and shows the source link', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()

    render(
      <MissionPlayer
        module={fixture}
        progress={{
          missionId: 'surveyor-3',
          status: 'in_progress',
          currentCheckpointId: 'fixture-evidence',
          completedCheckpointIds: ['fixture-opening', 'fixture-evidence'],
        }}
      />,
    )

    const back = screen.getByRole('button', { name: 'Back' })
    const next = screen.getByRole('button', { name: 'Next' })
    back.focus()
    expect(back).toHaveFocus()
    await user.tab()
    expect(next).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(sceneHeading()).toHaveTextContent('Fixture activity')
  })

  it('does not offer next or continue on an unfinished activity', () => {
    const empty = createActivityRegistry([
      {
        activityType: 'fixture-check',
        render: () => null,
      },
    ])
    expect(empty.ok).toBe(true)
    if (!empty.ok) {
      return
    }

    render(
      <MissionPlayer
        module={createStructuralFixture()}
        activities={empty.value}
        progress={{
          missionId: 'surveyor-3',
          status: 'in_progress',
          currentCheckpointId: 'fixture-activity',
          completedCheckpointIds: ['fixture-opening', 'fixture-evidence'],
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
})
