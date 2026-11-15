import { useEffect, useReducer, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import { Helicopter } from '../components/Helicopter.tsx'
import { commands, root } from '../content.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import styles from '../Ingenuity.module.css'

import { stages, flightReducer } from '../flightState.ts'
const checks = [
  'Battery prepared',
  'Rotor system ready',
  'Navigation system ready',
  'Landing area checked',
]

export function FirstFlightSimulator(props: ActivityRenderProps) {
  const [checked, setChecked] = useState<string[]>([])
  const [authorized, setAuthorized] = useState(false)
  const [planReady, setPlanReady] = useState(false)
  const [stage, dispatch] = useReducer(flightReducer, 'ready')
  const [paused, setPaused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const flying = stage !== 'ready' && stage !== 'landed'
  // Timers only advance the explicit state machine. CSS animation events never save progress.
  // Manual stage controls and a finish control keep this usable without animation or timers.
  useEffect(() => {
    if (!flying || paused) return
    const timer = window.setTimeout(
      () => dispatch({ type: 'advance' }),
      stage === 'hover' ? 2200 : 1400,
    )
    return () => window.clearTimeout(timer)
  }, [stage, flying, paused])
  const height =
    stage === 'hover'
      ? '3 m reference'
      : stage === 'takeoff'
        ? 'Rising'
        : stage === 'descent'
          ? 'Descending'
          : 'Surface'
  return (
    <div className={styles.activity}>
      <div
        className={styles.flightWindow}
        data-stage={stage}
        data-paused={paused}
      >
        <div className={styles.flightBackdrop} aria-hidden="true" />
        <div className={styles.flightTop}>
          <span>FLIGHT TEST 01</span>
          <span>SIMULATION / ONBOARD AUTONOMY</span>
        </div>
        <div className={styles.flightAircraft}>
          <Helicopter spinning={flying} />
        </div>
        {flying ? <div className={styles.dust} aria-hidden="true" /> : null}
        <div className={styles.hud} aria-live="polite">
          <span>
            Stage<strong>{stage.replace('-', ' ')}</strong>
          </span>
          <span>
            Illustrative altitude<strong>{height}</strong>
          </span>
          <span>
            Rotors<strong>{flying ? 'Active' : 'Inactive'}</strong>
          </span>
          <span>
            Simulated link<strong>Plan onboard</strong>
          </span>
        </div>
      </div>
      <p className={styles.caption}>
        Accelerated educational animation over a NASA photograph; schematic
        aircraft, illustrative states and altitude. No live telemetry or
        joystick control. Background: NASA/JPL-Caltech · PIA24584, actual
        first-flight navigation image.
      </p>
      <ol className={styles.stageStrip} aria-label="Autonomous flight stages">
        {stages.slice(1).map((item) => (
          <li key={item} aria-current={stage === item ? 'step' : undefined}>
            {item.replace('-', ' ')}
          </li>
        ))}
      </ol>
      {!authorized ? (
        <div className={styles.panel}>
          <h3>A / Preflight readiness</h3>
          <div className={styles.componentList}>
            {checks.map((item) => (
              <button
                key={item}
                aria-pressed={checked.includes(item)}
                onClick={() =>
                  setChecked((old) =>
                    old.includes(item) ? old : [...old, item],
                  )
                }
              >
                {checked.includes(item) ? '✓ ' : ''}
                {item}
              </button>
            ))}
          </div>
          <Button
            disabled={checked.length < 4}
            onClick={() => setAuthorized(true)}
          >
            Authorize Flight
          </Button>
        </div>
      ) : null}
      {authorized && !planReady ? (
        <div className={styles.panel}>
          <h3>B / Prepare the flight sequence</h3>
          <EventOrderActivity
            {...props}
            prompt={commands}
            completed={false}
            replay={false}
            onComplete={() => setPlanReady(true)}
          />
        </div>
      ) : null}
      {planReady && stage === 'ready' ? (
        <>
          <p className={styles.success}>
            Flight plan approved — the aircraft will execute its own sequence.
          </p>
          <Button onClick={() => dispatch({ type: 'advance' })}>
            Execute Autonomous Flight
          </Button>
        </>
      ) : null}
      {flying ? (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setPaused(!paused)}>
            {paused ? 'Resume animation' : 'Pause animation'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'advance' })}
          >
            Next flight stage
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'finish' })}
          >
            Skip animation to safe landing
          </Button>
        </div>
      ) : null}
      {stage === 'landed' ? (
        <div className={styles.success} role="status">
          <h3>Historic First Flight Complete</h3>
          <p>
            April 19, 2021: powered, controlled flight on another planet. The
            real first flight reached 3 meters, hovered for 30 seconds and
            lasted 39.1 seconds in total.
          </p>
          <p>First Flight milestone: 40 XP. Continue to save your progress.</p>
          <Button onClick={() => props.onComplete()}>
            Continue the journey
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'reset' })
              setPaused(false)
            }}
          >
            Replay flight animation
          </Button>
        </div>
      ) : null}
      <details onToggle={(event) => setShowHistory(event.currentTarget.open)}>
        <summary>Review NASA’s actual first-flight photograph</summary>
        {showHistory ? (
          <SceneMediaView
            media={{
              src: `${root}first-flight.webp`,
              alt: 'Ingenuity’s navigation camera captured its shadow on the surface while hovering during the first flight on April 19, 2021.',
              credit:
                'NASA/JPL-Caltech · PIA24584. Actual first-flight navigation image.',
            }}
          />
        ) : null}
        <a
          href="https://science.nasa.gov/resource/first-video-of-nasas-ingenuity-mars-helicopter-in-flight/"
          target="_blank"
          rel="noreferrer"
        >
          Watch NASA’s actual first-flight video (opens a new tab)
        </a>
      </details>
    </div>
  )
}
