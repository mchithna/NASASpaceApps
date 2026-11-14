import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import type { EventOrderPrompt } from '@/engine/activities/prompts.ts'
import {
  useActivityAttempt,
  useKeyedState,
} from '@/engine/activities/useActivityAttempt.ts'
import { validateEventOrderPrompt } from '@/engine/activities/validatePrompt.ts'

function startingOrder(prompt: EventOrderPrompt): string[] {
  const source = prompt.initialOrder ?? [...prompt.correctOrder].reverse()
  return [...source]
}

export function EventOrderActivity({
  sceneId,
  activityId,
  prompt,
  completed,
  replay,
  onComplete,
}: ActivityRenderProps) {
  const scene = { id: sceneId, prompt }
  const valid = validateEventOrderPrompt(scene).length === 0
  const orderPrompt = prompt?.type === 'event-order' ? prompt : null
  const identity = `${sceneId}:${activityId}`
  const [order, setOrder] = useKeyedState(identity, () =>
    orderPrompt ? startingOrder(orderPrompt) : [],
  )
  const attempt = useActivityAttempt(identity, completed || replay)

  if (!valid || !orderPrompt) {
    return (
      <ErrorState
        title="This activity cannot start"
        message="This activity is missing information it needs."
      />
    )
  }

  const labels = new Map(orderPrompt.steps.map((step) => [step.id, step.label]))

  function move(index: number, direction: -1 | 1): void {
    if (attempt.inputsLocked) {
      return
    }

    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= order.length) {
      return
    }

    const next = [...order]
    const current = next[index]
    const neighbor = next[nextIndex]
    if (current === undefined || neighbor === undefined) {
      return
    }

    next[index] = neighbor
    next[nextIndex] = current
    setOrder(next)
  }

  function check(): void {
    const solved =
      order.length === orderPrompt?.correctOrder.length &&
      order.every((id, index) => id === orderPrompt.correctOrder[index])

    if (solved) {
      attempt.succeed(onComplete)
      return
    }

    attempt.miss()
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-[65ch] text-secondary">{orderPrompt.instruction}</p>
      <ol className="flex flex-col gap-2" aria-label="Steps in the current order">
        {order.map((stepId, index) => {
          const label = labels.get(stepId) ?? 'Step'
          return (
            <li
              key={stepId}
              className="flex flex-col gap-2 rounded-surface border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-foreground">
                {index + 1}. {label}
              </span>
              <span className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={attempt.inputsLocked || index === 0}
                  aria-label={`Move ${label} up`}
                  onClick={() => move(index, -1)}
                >
                  Up
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={attempt.inputsLocked || index === order.length - 1}
                  aria-label={`Move ${label} down`}
                  onClick={() => move(index, 1)}
                >
                  Down
                </Button>
              </span>
            </li>
          )
        })}
      </ol>
      <Button
        className="w-full sm:w-auto"
        disabled={attempt.inputsLocked}
        onClick={check}
      >
        Check order
      </Button>
      {attempt.phase === 'incorrect' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          That order is not right yet. Move the steps and check again.
        </p>
      ) : null}
      {attempt.phase === 'correct' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          That order matches the training sequence. {orderPrompt.explanation}
        </p>
      ) : null}
    </div>
  )
}
