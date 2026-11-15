import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { PioneerSpacecraft } from '../components/PioneerSpacecraft.tsx'
import {
  observations,
  root,
  scienceInstrumentChoices,
  scienceTargets,
} from '../content.ts'
import styles from '../Pioneer.module.css'

type Phase = 'ready' | 'approach' | 'encounter' | 'outbound'
export function JupiterFlyby(props: ActivityRenderProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [target, setTarget] = useState<string>('magnetic')
  const [instrument, setInstrument] = useState('')
  const [collected, setCollected] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [showReference, setShowReference] = useState(false)
  const current = scienceTargets.find((item) => item.id === target)!
  function collect() {
    if (instrument !== current.instrument) {
      setFeedback(`Try another instrument. ${current.question}`)
      return
    }
    setCollected((old) => (old.includes(target) ? old : [...old, target]))
    setFeedback(current.finding)
  }
  return (
    <div className={styles.activity}>
      <div className={styles.flyby} data-phase={phase}>
        <div className={styles.flybyTop}>
          <span>JUPITER / SCIENCE ENCOUNTER</span>
          <span>ILLUSTRATED RECONSTRUCTION</span>
        </div>
        <div className={styles.jupiter} />
        <svg
          className={styles.fieldLines}
          viewBox="0 0 800 400"
          aria-hidden="true"
        >
          {[80, 130, 180].map((r) => (
            <ellipse
              key={r}
              cx="550"
              cy="215"
              rx={r * 1.2}
              ry={r * 0.6}
              transform="rotate(-28 550 215)"
            />
          ))}
        </svg>
        <div className={styles.flybyCraft}>
          <PioneerSpacecraft />
        </div>
        <div className={styles.flybyHud} aria-live="polite">
          <span>
            Mission stage<strong>{phase}</strong>
          </span>
          <span>
            Science targets<strong>{collected.length} / 3 inspected</strong>
          </span>
          <span>
            Radiation environment
            <strong>
              {phase === 'encounter'
                ? 'Intense near Jupiter'
                : 'Review encounter'}
            </strong>
          </span>
        </div>
      </div>
      <p className={styles.caption}>
        Jupiter uses cropped NASA/Pioneer 10 imagery. Field lines are
        illustrations. Spacecraft path, sizes and instrument selections are
        simplified; no fabricated telemetry or real-time spacecraft control.
        Pioneer 10 made a flyby, not an orbit or landing.
      </p>
      {phase === 'ready' ? (
        <Button onClick={() => setPhase('approach')}>
          Begin Jupiter approach
        </Button>
      ) : null}
      {phase === 'approach' ? (
        <>
          <p className={styles.objective}>
            Closest approach: December 4, 1973, UTC, about 130,000 km above
            Jupiter’s cloud tops. Your task is to connect three observations
            with the instruments that made them possible.
          </p>
          <Button onClick={() => setPhase('encounter')}>
            Enter science encounter
          </Button>
        </>
      ) : null}
      {phase === 'encounter' ? (
        <>
          <div className={styles.buttonList}>
            {scienceTargets.map((item) => (
              <button
                key={item.id}
                aria-pressed={target === item.id}
                onClick={() => {
                  setTarget(item.id)
                  setInstrument('')
                  setFeedback('')
                }}
              >
                {item.title} {collected.includes(item.id) ? '✓ Recorded' : ''}
              </button>
            ))}
          </div>
          <div className={styles.panel}>
            <h3>{current.title}</h3>
            <p>{current.question}</p>
            <fieldset className={styles.choices}>
              <legend>Choose an instrument</legend>
              {scienceInstrumentChoices.map((name) => (
                <label key={name}>
                  <input
                    type="radio"
                    name="pioneer-jupiter-instrument"
                    checked={instrument === name}
                    onChange={() => setInstrument(name)}
                  />
                  {name}
                </label>
              ))}
            </fieldset>
            <Button disabled={!instrument} onClick={collect}>
              Collect observation
            </Button>
          </div>
          {feedback ? (
            <p
              className={
                collected.includes(target) && instrument === current.instrument
                  ? styles.success
                  : styles.panel
              }
              role="status"
            >
              {feedback}
            </p>
          ) : null}
          <Button
            disabled={collected.length < 3}
            onClick={() => setPhase('outbound')}
          >
            Continue beyond Jupiter
          </Button>
        </>
      ) : null}
      {phase === 'outbound' ? (
        <>
          <div className={styles.success}>
            <h3>Jupiter science investigation complete</h3>
            <p>
              These observations helped scientists understand the giant planet
              and engineers prepare later missions. Pioneer 10 continued
              outward, carrying its discoveries home by radio.
            </p>
          </div>
          <SceneMediaView media={observations} />
          <Button onClick={() => props.onComplete()}>
            Save Jupiter investigation
          </Button>
        </>
      ) : null}
      <details onToggle={(event) => setShowReference(event.currentTarget.open)}>
        <summary>View NASA’s historical Jupiter encounter artwork</summary>
        {showReference ? (
          <SceneMediaView
            media={{
              src: `${root}jupiter-flyby-art.webp`,
              alt: 'Rick Guidice’s historical illustration of Pioneer 10 flying past Jupiter.',
              credit:
                'NASA/Rick Guidice · Artist’s illustration, not a spacecraft photograph.',
            }}
          />
        ) : null}
      </details>
      <details>
        <summary>Review Pioneer 10’s historical Jupiter image sequence</summary>
        <SceneMediaView
          media={{
            src: `${root}jupiter-1973.webp`,
            alt: 'A sequence of Pioneer 10 images shows Jupiter growing during approach and shrinking to a crescent after the flyby.',
            credit:
              'NASA · Historical Pioneer 10 observation sequence. Multiple images, not a single exposure; sizes and spacing are not a scale diagram.',
          }}
        />
      </details>
    </div>
  )
}
