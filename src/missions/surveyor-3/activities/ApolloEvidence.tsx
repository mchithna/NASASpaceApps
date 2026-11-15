import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

export function ApolloEvidence(props: ActivityRenderProps) {
  const [selected, setSelected] = useState<readonly string[]>([])
  const [incorrect, setIncorrect] = useState(false)
  const [solved, setSolved] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-lg text-foreground">
          Which two items were returned to Earth? Select the evidence.
        </legend>
        {[
          ['camera', 'TV camera system'],
          ['scoop', 'Surface sampler scoop'],
          ['whole-lander', 'The entire Surveyor 3 lander'],
        ].map(([id, label]) => (
          <label
            key={id}
            className="flex min-h-11 items-center gap-3 rounded-surface border border-border bg-surface p-3 text-foreground"
          >
            <input
              type="checkbox"
              checked={selected.includes(id!)}
              onChange={() => {
                setSelected((current) =>
                  current.includes(id!)
                    ? current.filter((value) => value !== id)
                    : [...current, id!],
                )
                setIncorrect(false)
                setSolved(false)
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {incorrect ? (
        <p role="alert" className="text-foreground">
          Look again: astronauts removed selected parts, including the camera
          and scoop. They left the lander on the Moon. Change your evidence and
          retry.
        </p>
      ) : null}
      {solved ? (
        <p role="status" className="text-secondary">
          Correct. Returned hardware let scientists examine prolonged lunar
          exposure. The discovery is recorded when saving succeeds; retry below
          if needed.
        </p>
      ) : null}
      <Button
        disabled={selected.length === 0 || (props.completed && !props.replay)}
        onClick={() => {
          if (
            selected.length !== 2 ||
            !selected.includes('camera') ||
            !selected.includes('scoop')
          ) {
            setIncorrect(true)
            return
          }
          setSolved(true)
          if (!props.replay) props.onComplete()
        }}
      >
        {props.completed && !props.replay
          ? 'Evidence saved'
          : solved
            ? 'Retry saving evidence'
            : 'Check evidence'}
      </Button>
    </div>
  )
}
