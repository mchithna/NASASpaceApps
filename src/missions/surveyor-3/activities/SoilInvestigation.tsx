import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

const steps = [
  {
    label: 'Position arm',
    text: 'Move the sampler toward the investigation area.',
  },
  {
    label: 'Press the surface',
    text: 'A bearing test presses against the soil to investigate its ability to support a load.',
  },
  {
    label: 'Dig a trench',
    text: 'Expose a trench to examine the soil beneath the surface.',
  },
  {
    label: 'Inspect the evidence',
    text: 'The real mission combined sampling and bearing tests to assess the ground for Apollo.',
  },
] as const

export function SoilInvestigation(props: ActivityRenderProps) {
  const name = useId()
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [incorrect, setIncorrect] = useState(false)
  const [solved, setSolved] = useState(false)
  const current = steps[step]
  return (
    <div className="flex flex-col gap-4">
      <p className="text-secondary">
        Can the lunar surface support an Apollo Lunar Module? Operate this
        simplified surface sampler, then interpret the historical findings.
      </p>
      <p className="text-sm text-secondary">
        Simulation: illustrative motion and trench, without measured forces or
        recorded instrument movement.
      </p>
      <svg
        viewBox="0 0 480 200"
        role="img"
        aria-label={
          step < 3
            ? 'Illustrative sampler arm above lunar soil'
            : 'Illustrative sampler beside an exposed trench'
        }
        className="w-full rounded-surface border border-border bg-background text-secondary"
      >
        <path
          d="M0 155 Q80 138 160 155 T320 150 T480 155 V200 H0Z"
          fill="currentColor"
          opacity=".4"
        />
        <path
          d="M70 70 L120 150 M70 70 L30 150 M40 150 H60 M105 150 H135"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
        />
        <g className="text-science">
          <path
            d={
              step === 0
                ? 'M70 70 L170 45 L240 70'
                : step === 1
                  ? 'M70 70 L180 80 L275 140'
                  : 'M70 70 L180 100 L300 160'
            }
            stroke="currentColor"
            strokeWidth="7"
            fill="none"
            className="motion-safe:transition-all motion-safe:duration-500"
          />
          <path
            d={
              step === 0
                ? 'M225 70 H255 L250 85 H230Z'
                : step === 1
                  ? 'M260 140 H290 L285 155 H265Z'
                  : 'M285 160 H315 L310 175 H290Z'
            }
            fill="currentColor"
          />
        </g>
        {step >= 3 ? (
          <path
            d="M250 155 L265 180 H330 L345 155"
            fill="var(--color-background)"
            stroke="currentColor"
            strokeWidth="3"
          />
        ) : null}
      </svg>
      <div role="status" className="text-secondary">
        {current ? (
          <p>
            Step {step + 1} / 4: {current.text}
          </p>
        ) : (
          <p>Evidence ready. What did the sampler experiments indicate?</p>
        )}
      </div>
      {current ? (
        <Button onClick={() => setStep((value) => value + 1)}>
          {current.label}
        </Button>
      ) : (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-heading text-lg text-foreground">
            What did the sampler experiments indicate about lunar soil?
          </legend>
          {[
            ['deep-dust', 'The surface could not support a spacecraft.'],
            [
              'firm',
              'The tested surface was firm enough to support an Apollo Lunar Module.',
            ],
            ['water', 'The tests found liquid water beneath the sampler.'],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-11 items-center gap-3 rounded-surface border border-border p-3 text-foreground"
            >
              <input
                type="radio"
                name={name}
                value={value}
                checked={answer === value}
                onChange={() => {
                  setAnswer(value!)
                  setIncorrect(false)
                  setSolved(false)
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
      )}
      {incorrect ? (
        <p role="alert" className="text-foreground">
          Try again. Bearing tests investigated support, and the combined
          results helped establish that the tested ground was firm enough for
          Apollo. These tests did not discover liquid water.
        </p>
      ) : null}
      {solved ? (
        <p role="status" className="text-secondary">
          Correct. Sampling and bearing tests provided evidence for Apollo
          landing plans. Continue after your place is saved, or submit again if
          saving fails.
        </p>
      ) : null}
      {step === 4 ? (
        <Button
          disabled={!answer || (props.completed && !props.replay)}
          onClick={() => {
            if (answer !== 'firm') {
              setIncorrect(true)
              return
            }
            setSolved(true)
            if (!props.replay) props.onComplete()
          }}
        >
          {props.completed && !props.replay
            ? 'Investigation saved'
            : solved
              ? 'Retry saving investigation'
              : 'Submit investigation'}
        </Button>
      ) : null}
    </div>
  )
}
