import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { Helicopter } from '../components/Helicopter.tsx'
import { helicopterPhoto, parts, root } from '../content.ts'
import styles from '../Ingenuity.module.css'

export function Opening(props: ActivityRenderProps) {
  return (
    <div className={styles.activity}>
      <div className={styles.hero}>
        <SceneMediaView media={helicopterPhoto} />
        <div className={styles.heroLabel}>
          <span>JEZERO CRATER / MARS</span>
          <strong>
            5 planned.
            <br />
            72 flown.
          </strong>
          <span>THE NEXT FRONTIER IS ABOVE US.</span>
        </div>
      </div>
      <div className={styles.objective}>
        <strong>Your role: Mars flight engineer</strong>
        <p>
          In this educational reconstruction, inspect the aircraft, prepare an
          autonomous flight plan and investigate the lessons it left behind. You
          are not controlling the historical helicopter.
        </p>
      </div>
      <Button onClick={() => props.onComplete()}>Begin Flight Training</Button>
    </div>
  )
}

export function ComponentExplorer(props: ActivityRenderProps) {
  const [rotating, setRotating] = useState(false)
  const [showAnatomy, setShowAnatomy] = useState(false)
  const [visited, setVisited] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('rotors')
  const descriptionId = useId()
  const part = parts.find((item) => item.id === selected)!
  function inspect(id: string) {
    setSelected(id)
    setVisited((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    )
  }
  return (
    <div className={styles.activity}>
      <div className={styles.twoColumns}>
        <div className={styles.diagram}>
          <Helicopter spinning={rotating} />
          {parts.map((item, index) => (
            <button
              key={item.id}
              className={styles.hotspot}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-label={`Diagram: inspect ${item.name}`}
              aria-pressed={selected === item.id}
              aria-describedby={descriptionId}
              onClick={() => inspect(item.id)}
            >
              {visited.includes(item.id) ? '✓' : index + 1}
            </button>
          ))}
          <p className={styles.caption}>
            Simplified engineering illustration · not to scale
          </p>
        </div>
        <div className={styles.stack}>
          <p className={styles.eyebrow}>
            COMPONENTS DISCOVERED — {visited.length} / 5
          </p>
          <div className={styles.componentList}>
            {parts.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={selected === item.id}
                onClick={() => inspect(item.id)}
              >
                {index + 1}. {item.name}{' '}
                {visited.includes(item.id) ? '✓ Inspected' : ''}
              </button>
            ))}
          </div>
          <div id={descriptionId} className={styles.panel} aria-live="polite">
            <h3>{part.name}</h3>
            <p>{part.text}</p>
          </div>
        </div>
      </div>
      <Button
        variant="secondary"
        aria-pressed={rotating}
        onClick={() => setRotating(!rotating)}
      >
        {rotating ? 'Stop illustrative rotors' : 'Animate illustrative rotors'}
      </Button>
      <details onToggle={(event) => setShowAnatomy(event.currentTarget.open)}>
        <summary>View NASA’s aircraft anatomy diagram</summary>
        {showAnatomy ? (
          <SceneMediaView
            media={{
              src: `${root}components.webp`,
              alt: 'NASA diagram identifying Ingenuity’s rotors, solar panel, electronics body, cameras and landing legs.',
              credit:
                'NASA/JPL-Caltech · Ingenuity landing press kit. Technical illustration.',
            }}
          />
        ) : null}
      </details>
      {visited.length >= 4 ? (
        <p role="status" className={styles.success}>
          Aircraft inspection complete — lightweight engineering made Mars
          flight possible.
        </p>
      ) : (
        <p>Inspect at least four components to complete the aircraft check.</p>
      )}
      <Button disabled={visited.length < 4} onClick={() => props.onComplete()}>
        Finish aircraft inspection
      </Button>
    </div>
  )
}

export function MarsFlightLab(props: ActivityRenderProps) {
  const [atmosphere, setAtmosphere] = useState<'earth' | 'mars'>('mars')
  const [rotor, setRotor] = useState<'ordinary' | 'ingenuity'>('ordinary')
  const [result, setResult] = useState<'idle' | 'grounded' | 'earth' | 'ready'>(
    'idle',
  )
  const [solved, setSolved] = useState(false)
  function run() {
    const next =
      atmosphere === 'earth'
        ? 'earth'
        : rotor === 'ingenuity'
          ? 'ready'
          : 'grounded'
    setResult(next)
    if (next === 'ready') setSolved(true)
  }
  return (
    <div className={styles.activity}>
      <p className={styles.objective}>
        Challenge: choose a rotor design that gives our Mars helicopter the best
        chance of flight.
      </p>
      <div className={styles.twoColumns}>
        <div className={styles.chamber} data-lift={result === 'ready'}>
          <span className={styles.eyebrow}>
            {atmosphere.toUpperCase()} / QUALITATIVE TEST CHAMBER
          </span>
          <svg
            className={styles.particles}
            viewBox="0 0 500 340"
            aria-hidden="true"
          >
            {Array.from({ length: atmosphere === 'earth' ? 58 : 9 }, (_, i) => (
              <circle
                key={i}
                cx={20 + ((i * 73) % 460)}
                cy={20 + ((i * 47) % 300)}
                r="3"
              />
            ))}
          </svg>
          <div className={styles.labAircraft}>
            <Helicopter spinning={result !== 'idle'} />
          </div>
          <span className={styles.groundLine} />
        </div>
        <div className={styles.stack}>
          <fieldset className={styles.choices}>
            <legend>Atmosphere</legend>
            {(['earth', 'mars'] as const).map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={radioName(props, 'air')}
                  checked={atmosphere === value}
                  onChange={() => {
                    setAtmosphere(value)
                    setResult('idle')
                  }}
                />
                {value === 'earth'
                  ? 'Earth — denser air'
                  : 'Mars — very thin air'}
              </label>
            ))}
          </fieldset>
          <fieldset className={styles.choices}>
            <legend>Rotor configuration</legend>
            {(['ordinary', 'ingenuity'] as const).map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name={radioName(props, 'rotor')}
                  checked={rotor === value}
                  onChange={() => {
                    setRotor(value)
                    setResult('idle')
                  }}
                />
                {value === 'ordinary'
                  ? 'Ordinary small rotor design'
                  : 'Ingenuity’s larger, fast-spinning rotor design'}
              </label>
            ))}
          </fieldset>
          <Button onClick={run}>Run Test</Button>
        </div>
      </div>
      <p
        role="status"
        className={result === 'ready' ? styles.success : styles.panel}
      >
        {result === 'grounded'
          ? 'Insufficient lift in this demonstration. Thin Martian air gives blades fewer molecules to push against. Try the specially designed rotors.'
          : result === 'earth'
            ? 'Denser Earth air is easier to push against. Now test a design in Mars’s thin atmosphere to meet the challenge.'
            : result === 'ready'
              ? 'Flight configuration ready. Large, fast-spinning blades help generate lift in thin air; Mars’s lower gravity also helps.'
              : 'Select an atmosphere and rotor design, then run a test.'}
      </p>
      <p className={styles.caption}>
        Qualitative educational demonstration, not a flight calculation.
        Particle counts and movement are illustrative. The historical aircraft
        did not swap rotor designs. NASA fact: Mars’s near-surface air is about
        1% as dense as Earth’s; initial demonstration rotors spun at about 2,400
        rpm.
      </p>
      <Button disabled={!solved} onClick={() => props.onComplete()}>
        Save flight lab findings
      </Button>
    </div>
  )
}

function radioName(props: ActivityRenderProps, suffix: string): string {
  return `${props.sceneId}-${props.activityId}-${suffix}`
}
