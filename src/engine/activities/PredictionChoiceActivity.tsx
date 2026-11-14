import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import {
  useActivityAttempt,
  useKeyedState,
} from '@/engine/activities/useActivityAttempt.ts'
import { validatePredictionPrompt } from '@/engine/activities/validatePrompt.ts'

export function PredictionChoiceActivity({
  sceneId,
  activityId,
  prompt,
  completed,
  replay,
  onComplete,
}: ActivityRenderProps) {
  const valid = validatePredictionPrompt({ id: sceneId, prompt }).length === 0
  const choicePrompt = prompt?.type === 'prediction-choice' ? prompt : null
  const identity = `${sceneId}:${activityId}`
  const [choiceId, setChoiceId] = useKeyedState(identity, () => '')
  const attempt = useActivityAttempt(identity, completed || replay)

  if (!valid || !choicePrompt) {
    return (
      <ErrorState
        title="This activity cannot start"
        message="This activity is missing information it needs."
      />
    )
  }

  function check(): void {
    if (!choicePrompt) {
      return
    }

    if (choiceId === '') {
      attempt.miss()
      return
    }

    if (choiceId === choicePrompt.correctChoiceId) {
      attempt.succeed(onComplete)
      return
    }

    attempt.miss()
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2" disabled={attempt.inputsLocked}>
        <legend className="max-w-[65ch] text-secondary">
          {choicePrompt.instruction}
        </legend>
        {choicePrompt.choices.map((choice) => (
          <label
            key={choice.id}
            className="flex min-h-11 items-center gap-3 text-foreground"
          >
            <input
              type="radio"
              name={`${sceneId}-${activityId}`}
              value={choice.id}
              checked={choiceId === choice.id}
              onChange={() => setChoiceId(choice.id)}
            />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <Button
        className="w-full sm:w-auto"
        disabled={attempt.inputsLocked}
        onClick={check}
      >
        Check choice
      </Button>
      {attempt.phase === 'incorrect' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          That choice is not right yet. Pick another and check again.
        </p>
      ) : null}
      {attempt.phase === 'correct' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          That choice matches the training note. {choicePrompt.explanation}
        </p>
      ) : null}
    </div>
  )
}
