import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ActivityCompletionEvent } from '@/contracts/missions.ts'
import {
  createActivityRegistry,
  defineActivity,
  validateActivityBindings,
} from '@/engine/activityRegistry.ts'
import { builtinActivityRegistrations } from '@/engine/activities/builtinActivities.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import { EvidenceMatchActivity } from '@/engine/activities/EvidenceMatchActivity.tsx'
import { PredictionChoiceActivity } from '@/engine/activities/PredictionChoiceActivity.tsx'
import type {
  EventOrderPrompt,
  EvidenceMatchPrompt,
  PredictionPrompt,
} from '@/engine/activities/prompts.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import type { ActivityScene, EngineScene } from '@/engine/scenes.ts'
import { createTrainingRuntime } from '@/engine/trainingRuntime.ts'

const orderExplanation =
  'The practice list packs the kit, starts the drill, then writes the note. This is not a NASA procedure.'

const orderPrompt: EventOrderPrompt = {
  type: 'event-order',
  instruction: 'Put the practice steps in order.',
  steps: [
    { id: 'pack-kit', label: 'Pack the kit' },
    { id: 'start-drill', label: 'Start the drill' },
    { id: 'write-note', label: 'Write the note' },
  ],
  correctOrder: ['pack-kit', 'start-drill', 'write-note'],
  initialOrder: ['write-note', 'start-drill', 'pack-kit'],
  explanation: orderExplanation,
}

const matchExplanation =
  'Each practice card uses the meaning printed for this exercise. This is not a NASA measurement.'

const matchPrompt: EvidenceMatchPrompt = {
  type: 'evidence-match',
  instruction: 'Match each practice card to a meaning.',
  evidence: [
    { id: 'red-card', label: 'Red card', meaningId: 'means-stop' },
    { id: 'blue-card', label: 'Blue card', meaningId: 'means-go' },
  ],
  meanings: [
    { id: 'means-stop', label: 'Stop the practice' },
    { id: 'means-go', label: 'Continue the practice' },
  ],
  explanation: matchExplanation,
}

const predictionExplanation =
  'The practice note checks the spare battery before the switch. This is not a NASA procedure.'

const predictionPrompt: PredictionPrompt = {
  type: 'prediction-choice',
  instruction: 'Which practice step comes first?',
  choices: [
    { id: 'check-battery', label: 'Check the spare battery' },
    { id: 'flip-switch', label: 'Flip the switch' },
  ],
  correctChoiceId: 'check-battery',
  explanation: predictionExplanation,
}

function activityProps(
  prompt: EventOrderPrompt | EvidenceMatchPrompt | PredictionPrompt,
  activityId = 'practice-task',
) {
  return {
    missionId: 'surveyor-3' as const,
    sceneId: 'practice-scene',
    activityId,
    activityType: prompt.type,
    config: {},
    prompt,
    completed: false,
    replay: false,
    onComplete: vi.fn(),
  }
}

describe('reusable activities', () => {
  it('lets a learner retry an order, then completes once from the keyboard', async () => {
    const user = userEvent.setup()
    const props = activityProps(orderPrompt)
    render(<EventOrderActivity {...props} />)

    await user.click(screen.getByRole('button', { name: 'Check order' }))
    expect(screen.getByRole('status')).toHaveTextContent(/not right yet/i)
    expect(screen.queryByText(orderExplanation)).not.toBeInTheDocument()
    expect(props.onComplete).not.toHaveBeenCalled()

    const movePackUp = screen.getByRole('button', { name: 'Move Pack the kit up' })
    movePackUp.focus()
    expect(movePackUp).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')
    const moveStartUp = screen.getByRole('button', { name: 'Move Start the drill up' })
    moveStartUp.focus()
    await user.keyboard('{Enter}')

    const check = screen.getByRole('button', { name: 'Check order' })
    check.focus()
    await user.keyboard('{Enter}')
    fireEvent.click(check)

    expect(props.onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent(orderExplanation)
    expect(screen.getByRole('button', { name: 'Check order' })).toBeDisabled()
  })

  it('resets order state when a different activity is shown', async () => {
    const user = userEvent.setup()
    const props = activityProps(orderPrompt, 'first-order')
    const { rerender } = render(<EventOrderActivity {...props} />)

    await user.click(screen.getByRole('button', { name: 'Move Pack the kit up' }))
    expect(screen.getByText('2. Pack the kit')).toBeInTheDocument()

    rerender(
      <EventOrderActivity
        {...props}
        activityId="second-order"
        prompt={{
          ...orderPrompt,
          instruction: 'Order the practice letters.',
          steps: [
            { id: 'letter-a', label: 'Alpha card' },
            { id: 'letter-b', label: 'Beta card' },
          ],
          correctOrder: ['letter-a', 'letter-b'],
          initialOrder: ['letter-a', 'letter-b'],
          explanation: 'Alpha comes before beta in this exercise.',
        }}
      />,
    )

    expect(screen.getByText('1. Alpha card')).toBeInTheDocument()
    expect(screen.queryByText('Pack the kit')).not.toBeInTheDocument()
  })

  it('lets a learner correct a match and explains the answer once', async () => {
    const user = userEvent.setup()
    const props = activityProps(matchPrompt)
    render(<EvidenceMatchActivity {...props} />)

    const stopButtons = screen.getAllByRole('button', { name: 'Stop the practice' })
    const continueButtons = screen.getAllByRole('button', {
      name: 'Continue the practice',
    })
    const firstStop = stopButtons[0]
    const firstContinue = continueButtons[0]
    const secondStop = stopButtons[1]
    const secondContinue = continueButtons[1]
    if (!firstStop || !firstContinue || !secondStop || !secondContinue) {
      throw new Error('Match controls are missing.')
    }

    firstContinue.focus()
    await user.keyboard('{Enter}')
    secondStop.focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Check matches' }))

    expect(screen.getByRole('status')).toHaveTextContent(/not right yet/i)
    expect(props.onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Check matches' })).toBeEnabled()

    await user.click(firstStop)
    await user.click(secondContinue)
    await user.click(screen.getByRole('button', { name: 'Check matches' }))
    await user.click(screen.getByRole('button', { name: 'Check matches' }))

    expect(props.onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent(matchExplanation)
  })

  it('explains a prediction after the learner changes a wrong choice', async () => {
    const user = userEvent.setup()
    const props = activityProps(predictionPrompt)
    render(<PredictionChoiceActivity {...props} />)

    const wrong = screen.getByRole('radio', { name: 'Flip the switch' })
    wrong.focus()
    await user.keyboard(' ')
    await user.click(screen.getByRole('button', { name: 'Check choice' }))
    expect(screen.getByRole('status')).toHaveTextContent(/not right yet/i)
    expect(screen.queryByText(predictionExplanation)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Check the spare battery' }))
    await user.click(screen.getByRole('button', { name: 'Check choice' }))
    expect(props.onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent(predictionExplanation)
  })

  it('rejects an unknown activity and an incomplete reusable payload', () => {
    const registry = createActivityRegistry(builtinActivityRegistrations)
    expect(registry.ok).toBe(true)
    if (!registry.ok) {
      return
    }

    const unknown: ActivityScene = {
      id: 'practice-scene',
      kind: 'activity',
      title: 'Practice',
      narration: 'academy',
      sourceIds: [],
      activityId: 'missing-task',
      activityType: 'missing-task',
      config: {},
    }
    const invalid: ActivityScene = {
      ...unknown,
      activityId: 'broken-order',
      activityType: 'event-order',
      prompt: {
        type: 'event-order',
        instruction: 'Put the practice steps in order.',
        steps: [],
        correctOrder: [],
        explanation: orderExplanation,
      },
    }

    const issues = validateActivityBindings([unknown, invalid], registry.value)
    expect(issues.map((issue) => issue.code)).toEqual([
      'unknown-activity',
      'invalid-activity-config',
    ])
    expect(issues.every((issue) => !issue.message.includes('missing-task'))).toBe(
      true,
    )
  })
})

describe('activities inside the player', () => {
  it('shows an unknown activity without play controls', () => {
    const fixture = createStructuralFixture()
    const scenes = fixture.scenes.map((scene) =>
      scene.kind === 'activity'
        ? { ...scene, activityType: 'missing-task' }
        : scene,
    )

    render(<MissionPlayer module={{ mission: fixture.mission, scenes }} />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This activity type is not registered.',
    )
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('plays both reusable activities from the keyboard and grants the activity milestone once', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()
    const story = fixture.scenes.find((scene) => scene.kind === 'story')
    const discovery = fixture.scenes.find((scene) => scene.kind === 'discovery')
    const ending = fixture.scenes.find((scene) => scene.kind === 'ending')
    if (!story || !discovery || !ending) {
      throw new Error('Fixture scenes are missing.')
    }

    const scenes: EngineScene[] = [
      story,
      {
        id: 'order-scene',
        kind: 'activity',
        title: 'Order practice',
        narration: 'academy',
        sourceIds: [],
        activityId: 'order-practice',
        activityType: 'event-order',
        config: {},
        prompt: orderPrompt,
      },
      {
        id: 'match-scene',
        kind: 'activity',
        title: 'Match practice',
        narration: 'academy',
        sourceIds: [],
        activityId: 'match-practice',
        activityType: 'evidence-match',
        config: {},
        prompt: matchPrompt,
      },
      discovery,
      ending,
    ]
    const runtime = createTrainingRuntime()
    const onActivityComplete = vi.fn()

    render(
      <MissionPlayer
        module={{ mission: fixture.mission, scenes }}
        runtime={runtime}
        onActivityComplete={onActivityComplete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Put the practice steps in order.')).toBeInTheDocument()

    const movePackUp = screen.getByRole('button', { name: 'Move Pack the kit up' })
    movePackUp.focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')
    screen.getByRole('button', { name: 'Move Start the drill up' }).focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Check order' }))

    expect(
      await screen.findByText('Match each practice card to a meaning.'),
    ).toBeInTheDocument()

    const stopButtons = screen.getAllByRole('button', { name: 'Stop the practice' })
    const continueButtons = screen.getAllByRole('button', {
      name: 'Continue the practice',
    })
    const redStop = stopButtons[0]
    const blueContinue = continueButtons[1]
    if (!redStop || !blueContinue) {
      throw new Error('Match controls are missing.')
    }
    redStop.focus()
    await user.keyboard('{Enter}')
    blueContinue.focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Check matches' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'Fixture discovery' })).toBeInTheDocument()

    const completions = onActivityComplete.mock.calls.map((call) => {
      const event: ActivityCompletionEvent | undefined = call[0]
      return event
    })
    expect(completions).toEqual([
      {
        missionId: 'surveyor-3',
        checkpointId: 'order-scene',
        activityId: 'order-practice',
      },
      {
        missionId: 'surveyor-3',
        checkpointId: 'match-scene',
        activityId: 'match-practice',
      },
    ])
    expect(
      runtime.applied.filter(
        (effect) =>
          effect.type === 'grant-milestone' && effect.request.milestoneId === 'activity',
      ),
    ).toHaveLength(1)
  })

  it('ignores a second completion from a custom activity', async () => {
    const user = userEvent.setup()
    const fixture = createStructuralFixture()
    const registry = createActivityRegistry([
      defineActivity('fixture-check', (props) => (
        <button
          type="button"
          onClick={() => {
            props.onComplete()
            props.onComplete()
          }}
        >
          Finish twice
        </button>
      )),
    ])
    expect(registry.ok).toBe(true)
    if (!registry.ok) {
      return
    }

    const runtime = createTrainingRuntime()
    render(
      <MissionPlayer
        module={fixture}
        runtime={runtime}
        activities={registry.value}
        progress={{
          missionId: 'surveyor-3',
          status: 'in_progress',
          currentCheckpointId: 'fixture-activity',
          completedCheckpointIds: ['fixture-opening', 'fixture-evidence'],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Finish twice' }))
    expect(runtime.applied).toHaveLength(2)
    expect(runtime.applied.map((effect) => effect.type)).toEqual([
      'grant-milestone',
      'save-checkpoint',
    ])
  })
})
