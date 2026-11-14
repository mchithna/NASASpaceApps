import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import type { SceneRendererRegistry } from '@/engine/sceneRenderers.ts'

const registry = createActivityRegistry([
  defineActivity('fixture-check', () => null),
])

if (!registry.ok) {
  throw new Error('The fixture activity could not be registered.')
}

const activities = registry.value

const sceneRenderers: SceneRendererRegistry = {
  story: () => null,
  evidence: () => null,
  activity: () => null,
  discovery: () => null,
  ending: () => null,
}

describe('MissionPlayer', () => {
  it('does not call services for an empty scene sequence', () => {
    const fixture = createStructuralFixture()
    const services = createMockServices({ persona: 'guest' })
    const save = vi.spyOn(services.progress, 'saveCheckpoint')

    render(
      <MissionPlayer
        module={{ mission: fixture.mission, scenes: [] }}
        services={services}
        progress={null}
        sceneRenderers={sceneRenderers}
        activities={activities}
      >
        {(view) => <p>{view.phase}</p>}
      </MissionPlayer>,
    )

    expect(screen.getByText('invalid')).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it('does not call services when the activity type is not registered', () => {
    const fixture = createStructuralFixture()
    const services = createMockServices({ persona: 'guest' })
    const save = vi.spyOn(services.progress, 'saveCheckpoint')
    const empty = createActivityRegistry([])
    expect(empty.ok).toBe(true)
    if (!empty.ok) {
      return
    }

    render(
      <MissionPlayer
        module={fixture}
        services={services}
        progress={null}
        sceneRenderers={sceneRenderers}
        activities={empty.value}
      >
        {(view) => <p>{view.issues.map((issue) => issue.code).join(' ')}</p>}
      </MissionPlayer>,
    )

    expect(screen.getByText('unknown-activity')).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it('saves the first scene when the learner starts', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()
    const services = createMockServices({ persona: 'guest' })
    const save = vi.spyOn(services.progress, 'saveCheckpoint')

    render(
      <MissionPlayer
        module={fixture}
        services={services}
        progress={null}
        sceneRenderers={sceneRenderers}
        activities={activities}
      >
        {(view) => (
          <>
            <p>{view.scene?.id ?? 'none'}</p>
            <button type="button" onClick={view.actions.start}>
              Start
            </button>
          </>
        )}
      </MissionPlayer>,
    )

    expect(screen.getByText('none')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Start' }))

    await waitFor(() => {
      expect(screen.getByText('fixture-opening')).toBeInTheDocument()
    })
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({
      missionId: 'surveyor-3',
      checkpointId: 'fixture-opening',
    })
  })
})
