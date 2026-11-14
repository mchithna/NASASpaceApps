import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import {
  useActivityAttempt,
  useKeyedState,
} from '@/engine/activities/useActivityAttempt.ts'
import { validateEvidenceMatchPrompt } from '@/engine/activities/validatePrompt.ts'

export function EvidenceMatchActivity({
  sceneId,
  activityId,
  prompt,
  completed,
  replay,
  onComplete,
}: ActivityRenderProps) {
  const valid = validateEvidenceMatchPrompt({ id: sceneId, prompt }).length === 0
  const matchPrompt = prompt?.type === 'evidence-match' ? prompt : null
  const identity = `${sceneId}:${activityId}`
  const [matches, setMatches] = useKeyedState(identity, () => {
    const initial: Record<string, string> = {}
    for (const card of matchPrompt?.evidence ?? []) {
      initial[card.id] = ''
    }
    return initial
  })
  const attempt = useActivityAttempt(identity, completed || replay)

  if (!valid || !matchPrompt) {
    return (
      <ErrorState
        title="This activity cannot start"
        message="This activity is missing information it needs."
      />
    )
  }

  function choose(evidenceId: string, meaningId: string): void {
    if (attempt.inputsLocked) {
      return
    }

    setMatches({ ...matches, [evidenceId]: meaningId })
  }

  function check(): void {
    if (!matchPrompt) {
      return
    }

    const complete = matchPrompt.evidence.every((card) => matches[card.id])
    if (!complete) {
      attempt.miss()
      return
    }

    const solved = matchPrompt.evidence.every(
      (card) => matches[card.id] === card.meaningId,
    )
    if (solved) {
      attempt.succeed(onComplete)
      return
    }

    attempt.miss()
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-[65ch] text-secondary">{matchPrompt.instruction}</p>
      {matchPrompt.evidence.map((card) => (
        <fieldset
          key={card.id}
          className="flex flex-col gap-2 rounded-surface border border-border bg-surface p-3"
        >
          <legend className="px-1 font-medium text-foreground">{card.label}</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {matchPrompt.meanings.map((meaning) => {
              const selected = matches[card.id] === meaning.id
              return (
                <Button
                  key={meaning.id}
                  variant={selected ? 'primary' : 'secondary'}
                  className="w-full sm:w-auto"
                  aria-pressed={selected}
                  disabled={attempt.inputsLocked}
                  onClick={() => choose(card.id, meaning.id)}
                >
                  {meaning.label}
                </Button>
              )
            })}
          </div>
        </fieldset>
      ))}
      <Button
        className="w-full sm:w-auto"
        disabled={attempt.inputsLocked}
        onClick={check}
      >
        Check matches
      </Button>
      {attempt.phase === 'incorrect' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          Those matches are not right yet. Change a selection and check again.
        </p>
      ) : null}
      {attempt.phase === 'correct' ? (
        <p role="status" className="max-w-[65ch] text-secondary">
          Those matches fit the training cards. {matchPrompt.explanation}
        </p>
      ) : null}
    </div>
  )
}
