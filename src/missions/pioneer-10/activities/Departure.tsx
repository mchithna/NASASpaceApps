import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import { PredictionChoiceActivity } from '@/engine/activities/PredictionChoiceActivity.tsx'
import {
  PioneerSpacecraft,
  Starfield,
} from '../components/PioneerSpacecraft.tsx'
import {
  beltInterpretation,
  beltOrder,
  deepSpace,
  instruments,
  plaqueImage,
  systems,
} from '../content.ts'
import styles from '../Pioneer.module.css'

export function Opening(props: ActivityRenderProps) {
  return (
    <div className={styles.activity}>
      <Starfield>
        <div className={styles.openingLabel}>
          <span className={styles.eyebrow}>
            JANUARY 23, 2003 / LAST SIGNAL DETECTED
          </span>
          <h3>
            The spacecraft went silent.
            <br />
            The journey continued.
          </h3>
          <p>EARTH ← 11 HOURS, 20 MINUTES OF LIGHT TRAVEL</p>
        </div>
        <div className={styles.distantCraft}>
          <PioneerSpacecraft />
        </div>
        <svg className={styles.wave} viewBox="0 0 700 80" aria-hidden="true">
          <path d="M0 40h80l9-8 10 16 10-25 10 34 10-45 10 54 10-44 10 32 10-23 10 14 10-5h60l10-4 10 8 10-12 10 17 10-12 10 5h230" />
        </svg>
        <p className={styles.signalCaption}>
          Artistic waveform illustration — not a recording or a spoken message.
        </p>
      </Starfield>
      <p className={styles.objective}>
        Your mission: trace Pioneer 10’s journey to Jupiter and beyond, examine
        its science and message, and discover why contact ended.
      </p>
      <details>
        <summary>NASA’s historical deep-space artwork</summary>
        <SceneMediaView media={deepSpace} />
      </details>
      <Button onClick={() => props.onComplete()}>Trace the Signal</Button>
    </div>
  )
}

export function SpacecraftExplorer(props: ActivityRenderProps) {
  const [visited, setVisited] = useState<string[]>([])
  const [selected, setSelected] = useState('antenna')
  const [referenceOpen, setReferenceOpen] = useState(false)
  const item = systems.find((part) => part.id === selected)!
  const markers = [
    { id: 'antenna', x: 46, y: 58 },
    { id: 'power', x: 16, y: 85 },
    { id: 'magnetometer', x: 89, y: 12 },
    { id: 'science', x: 55, y: 60 },
  ]
  function inspect(id: string) {
    setSelected(id)
    setVisited((old) => (old.includes(id) ? old : [...old, id]))
  }
  return (
    <div className={styles.activity}>
      <div className={styles.columns}>
        <div className={styles.diagram}>
          <div className={styles.diagramArt}>
            <PioneerSpacecraft />
            {markers.map((marker, index) => (
              <button
                key={marker.id}
                className={styles.hotspot}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-label={`Diagram: inspect ${systems[index]!.name}`}
                aria-pressed={selected === marker.id}
                onClick={() => inspect(marker.id)}
              >
                {visited.includes(marker.id) ? '✓' : index + 1}
              </button>
            ))}
          </div>
          <p className={styles.caption}>
            Simplified spacecraft illustration, not to scale. Antenna, generator
            booms and magnetometer are shown schematically. The plaque is shown
            separately below.
          </p>
        </div>
        <div className={styles.stack}>
          <p className={styles.eyebrow}>
            SPACECRAFT SYSTEMS EXPLORED — {visited.length} / 5
          </p>
          <div className={styles.buttonList}>
            {systems.map((part, index) => (
              <button
                key={part.id}
                aria-pressed={selected === part.id}
                onClick={() => inspect(part.id)}
              >
                {index + 1}. {part.name}{' '}
                {visited.includes(part.id) ? '✓ Inspected' : ''}
              </button>
            ))}
          </div>
          <div className={styles.panel} aria-live="polite">
            <h3>{item.name}</h3>
            <p>{item.text}</p>
          </div>
        </div>
      </div>
      {selected === 'plaque' ? (
        <div className={styles.plaqueInset}>
          <p>
            Separate detail: the physical Pioneer plaque. Its mounting location
            is not inferred from the schematic.
          </p>
          <SceneMediaView media={plaqueImage} />
        </div>
      ) : null}
      <details onToggle={(event) => setReferenceOpen(event.currentTarget.open)}>
        <summary>Review NASA’s instrument-location reference</summary>
        {referenceOpen ? <SceneMediaView media={instruments} /> : null}
      </details>
      {visited.length >= 4 ? (
        <p className={styles.success} role="status">
          Spacecraft inspection complete. Radioisotope power helped the mission
          explore far from the Sun.
        </p>
      ) : (
        <p>
          Inspect at least four systems. Every system also has a large labeled
          button.
        </p>
      )}
      <Button disabled={visited.length < 4} onClick={() => props.onComplete()}>
        Finish spacecraft inspection
      </Button>
    </div>
  )
}

export function AsteroidBeltJourney(props: ActivityRenderProps) {
  const [ordered, setOrdered] = useState(false)
  const [surveyed, setSurveyed] = useState(false)
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <div className={styles.orbitMap} data-crossed={surveyed}>
        <svg
          viewBox="0 0 740 340"
          role="img"
          aria-label="Schematic outward journey: Sun, Mars orbit, sparse asteroid belt, Jupiter orbit. Sizes, spacing and route are not to scale."
        >
          <circle cx="40" cy="170" r="28" fill="#e9c784" />
          <path
            d="M130 0q110 170 0 340M600 0q140 170 0 340"
            fill="none"
            stroke="#8fb8d3"
            strokeWidth="2"
          />
          <path
            d="M270 0q120 170 0 340M380 0q130 170 0 340"
            fill="none"
            stroke="#d9a56c"
            strokeOpacity=".3"
            strokeWidth="2"
          />
          {Array.from({ length: 19 }, (_, i) => (
            <circle
              key={i}
              cx={270 + ((i * 43) % 140)}
              cy={20 + ((i * 67) % 300)}
              r={2 + (i % 3)}
              fill="#c6a884"
            />
          ))}
          <path
            className={surveyed ? styles.routeComplete : styles.route}
            d="M100 240Q290 300 580 180T710 110"
          />
          <g fill="#f4f7ff" fontFamily="sans-serif" fontSize="20">
            <text x="7" y="225">
              SUN
            </text>
            <text x="135" y="40">
              MARS ORBIT
            </text>
            <text x="280" y="170">
              MAIN BELT
            </text>
            <text x="530" y="40">
              JUPITER ORBIT
            </text>
          </g>
          <g
            className={surveyed ? styles.beltCraft : undefined}
            transform={surveyed ? undefined : 'translate(100 240)'}
          >
            <circle r="12" fill="#53cbff" />
            <path d="M-20 0h40M0-20v40" stroke="#fff" strokeWidth="3" />
          </g>
        </svg>
        <p className={styles.caption}>
          Schematic reconstruction, not a measured trajectory. Asteroid sizes
          and numbers are exaggerated for visibility; the real belt is mostly
          empty space.
        </p>
      </div>
      <EventOrderActivity
        {...props}
        prompt={beltOrder}
        completed={false}
        replay={false}
        onComplete={() => setOrdered(true)}
      />
      {ordered ? (
        <>
          <Button variant="secondary" onClick={() => setSurveyed(true)}>
            Run the debris survey
          </Button>
          {surveyed ? (
            <>
              <p className={styles.panel}>
                Pioneer 10 entered the belt in July 1972 and emerged in February
                1973. Its detectors investigated dust and small-particle
                hazards, helping pave the way for later outer-planet missions.
              </p>
              <PredictionChoiceActivity
                {...props}
                prompt={beltInterpretation}
                completed={false}
                replay={false}
                onComplete={() => setSolved(true)}
              />
            </>
          ) : null}
        </>
      ) : null}
      {solved ? (
        <Button onClick={() => props.onComplete()}>
          Save asteroid belt findings
        </Button>
      ) : null}
    </div>
  )
}
