import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { damagePhoto, sandPhoto, timeline } from '../content.ts'
import styles from '../Ingenuity.module.css'

const terrain = [
  {
    id: 'rocks',
    name: 'Boulders',
    text: 'Large rocks create obstacles and make touchdown difficult.',
  },
  {
    id: 'sand',
    name: 'Sand ripples',
    text: 'Relatively featureless sand can leave a camera with too few recognizable points to track. Surface slope also matters; smoothness alone does not decide safety.',
  },
  {
    id: 'target',
    name: 'Observation point',
    text: 'An aerial view can help teams understand terrain and possible rover routes. Ingenuity was a technology demonstrator, not a sample-collecting science helicopter.',
  },
] as const
const zones = [
  { id: 'a', name: 'Zone A — Large boulders' },
  { id: 'b', name: 'Zone B — Feature-poor sand' },
  { id: 'c', name: 'Zone C — Clear, textured terrain' },
] as const

export function AerialScout(props: ActivityRenderProps) {
  const [inspected, setInspected] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('')
  const [corridor, setCorridor] = useState('')
  const [zone, setZone] = useState('')
  const [feedback, setFeedback] = useState('')
  const [solved, setSolved] = useState(false)
  function submit() {
    const safe = corridor === 'clear' && zone === 'c'
    setSolved(safe)
    setFeedback(
      safe
        ? 'Scouting mission successful. This corridor clears obstacles, visits the observation point and ends on clear terrain with visual reference features.'
        : corridor !== 'clear'
          ? 'That direct corridor crosses a boulder field. Try the observation corridor around the obstacles.'
          : zone === 'a'
            ? 'Boulders make touchdown difficult. Choose a clear landing area.'
            : 'Feature-poor sand can make camera tracking harder. In this exercise, choose clear terrain with visible texture.',
    )
  }
  return (
    <div className={styles.activity}>
      <p className={styles.objective}>
        Plan a safe aerial scouting mission. Inspect all three terrain markers,
        choose a corridor and select a landing area.
      </p>
      <div className={styles.map}>
        <svg
          viewBox="0 0 700 340"
          role="img"
          aria-label="Schematic terrain map: takeoff at left, boulders in the center, sand above, textured landing zone at right. Observation corridor curves below the rocks."
        >
          <defs>
            <pattern
              id="ingenuity-terrain"
              width="53"
              height="37"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="11" cy="17" r="2" fill="#c18d6b" />
              <path d="m28 29 8-3" stroke="#d8a780" />
            </pattern>
          </defs>
          <rect width="700" height="340" rx="22" fill="#543d34" />
          <rect width="700" height="340" fill="url(#ingenuity-terrain)" />
          <path
            d="M150 38q70-35 140 0t140 0m-270 20q70-35 140 0t140 0m-270 20q70-35 140 0t140 0"
            stroke="#bf926f"
            strokeWidth="5"
            fill="none"
          />
          <g fill="#252b35" stroke="#927665" strokeWidth="3">
            <path d="m280 166 25-36 40 13 7 39-40 10Z" />
            <path d="m370 159 26-30 36 25-10 40-45-7Z" />
            <path d="m330 199 31-14 19 35-32 15Z" />
          </g>
          <path
            d={
              corridor === 'direct'
                ? 'M78 215 586 180'
                : 'M78 215Q167 315 312 285T478 264Q550 240 586 180'
            }
            className={solved ? styles.routeComplete : styles.route}
          />
          <g fill="#111c2f" stroke="#53cbff" strokeWidth="3">
            <circle cx="78" cy="215" r="23" />
            <circle cx="585" cy="180" r="29" />
            <circle cx="315" cy="285" r="18" />
          </g>
          <g fill="#fff" fontSize="17" fontFamily="sans-serif">
            <text x="38" y="260">
              TAKEOFF
            </text>
            <text x="548" y="234">
              ZONE C
            </text>
            <text x="273" y="326">
              OBSERVE
            </text>
            <text x="150" y="100">
              ZONE B / SAND
            </text>
            <text x="296" y="126">
              ZONE A / ROCKS
            </text>
          </g>
          {solved ? (
            <g className={styles.scoutMarker}>
              <circle cx="0" cy="0" r="9" fill="#fff" />
              <path d="M-18 0h36M0-18v36" stroke="#53cbff" strokeWidth="4" />
            </g>
          ) : null}
        </svg>
        <span className={styles.caption}>
          Hypothetical planning exercise · schematic, no actual coordinates or
          historical flight route
        </span>
      </div>
      <div className={styles.componentList}>
        {terrain.map((item) => (
          <button
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id)
              setInspected((old) =>
                old.includes(item.id) ? old : [...old, item.id],
              )
            }}
          >
            {item.name} {inspected.includes(item.id) ? '✓ Inspected' : ''}
          </button>
        ))}
      </div>
      {selected ? (
        <p className={styles.panel} aria-live="polite">
          {terrain.find((item) => item.id === selected)?.text}
        </p>
      ) : null}
      <div className={styles.twoColumns}>
        <fieldset className={styles.choices}>
          <legend>Flight corridor</legend>
          {[
            ['direct', 'Direct corridor through boulders'],
            ['clear', 'Observation corridor around obstacles'],
          ].map(([id, name]) => (
            <label key={id}>
              <input
                type="radio"
                name="ingenuity-corridor"
                checked={corridor === id}
                disabled={solved}
                onChange={() => setCorridor(id!)}
              />
              {name}
            </label>
          ))}
        </fieldset>
        <fieldset className={styles.choices}>
          <legend>Landing zone</legend>
          {zones.map((item) => (
            <label key={item.id}>
              <input
                type="radio"
                name="ingenuity-zone"
                checked={zone === item.id}
                disabled={solved}
                onChange={() => setZone(item.id)}
              />
              {item.name}
            </label>
          ))}
        </fieldset>
      </div>
      <Button
        disabled={inspected.length < 3 || !corridor || !zone || solved}
        onClick={submit}
      >
        Submit scouting plan
      </Button>
      {feedback ? (
        <p role="status" className={solved ? styles.success : styles.panel}>
          {feedback}
        </p>
      ) : null}
      {solved ? (
        <>
          <SceneMediaView media={sandPhoto} />
          <p>
            Historical aerial context: Flight 70 photographed these sand
            ripples. Our plan above is hypothetical; it does not reproduce that
            flight.
          </p>
          <Button onClick={() => props.onComplete()}>Save scouting plan</Button>
        </>
      ) : null}
      <Button
        variant="secondary"
        onClick={() => {
          setSolved(false)
          setFeedback('')
          setZone('')
          setCorridor('')
        }}
      >
        Reset flight plan
      </Button>
    </div>
  )
}

export function Flight72Investigation(props: ActivityRenderProps) {
  const [terrainAnswer, setTerrainAnswer] = useState('')
  const [tracking, setTracking] = useState('')
  const [inspected, setInspected] = useState(false)
  const [deduction, setDeduction] = useState('')
  const [feedback, setFeedback] = useState('')
  const [solved, setSolved] = useState(false)
  const [zoom, setZoom] = useState(false)
  const ready = terrainAnswer === 'features' && tracking === 'rich' && inspected
  return (
    <div className={styles.activity}>
      <div className={styles.panel}>
        <span className={styles.eyebrow}>01 / TERRAIN IMAGERY</span>
        <SceneMediaView media={sandPhoto} />
        <fieldset className={styles.choices}>
          <legend>Why might a navigation camera struggle here?</legend>
          {[
            ['features', 'Too few distinguishable surface features to track'],
            ['sunlight', 'Mars has no sunlight'],
            ['animals', 'Its camera was designed to detect Martian animals'],
          ].map(([id, label]) => (
            <label key={id}>
              <input
                type="radio"
                name="ingenuity-evidence-terrain"
                checked={terrainAnswer === id}
                onChange={() => setTerrainAnswer(id!)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        {terrainAnswer ? (
          <p role="status">
            {terrainAnswer === 'features'
              ? 'Correct. Similar-looking sand can offer too few stable visual reference points.'
              : 'Try again. Mars receives sunlight, and the camera tracked ground features to estimate motion; it did not look for animals.'}
          </p>
        ) : null}
      </div>
      <div className={styles.panel}>
        <span className={styles.eyebrow}>02 / NAVIGATION ANALYSIS</span>
        <h3>Which terrain offers clearer visual reference points?</h3>
        <div className={styles.twoColumns}>
          {(['poor', 'rich'] as const).map((value) => (
            <button
              key={value}
              className={styles.trackingCard}
              aria-pressed={tracking === value}
              onClick={() => setTracking(value)}
            >
              <svg viewBox="0 0 280 130" aria-hidden="true">
                <rect width="280" height="130" fill="#986e51" />
                {Array.from({ length: value === 'rich' ? 12 : 2 }, (_, i) => (
                  <g
                    key={i}
                    transform={`translate(${25 + ((i * 67) % 230)} ${20 + ((i * 37) % 90)})`}
                  >
                    <path d="m-6-5 10-3 6 9-12 5Z" fill="#4b4340" />
                    <path
                      d="M-12-5v-7h8m16 17v7h-8"
                      fill="none"
                      stroke="#91efff"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>
              {value === 'rich'
                ? 'Feature-rich terrain — many tracking points'
                : 'Feature-poor terrain — few tracking points'}
            </button>
          ))}
        </div>
        {tracking ? (
          <p role="status">
            {tracking === 'rich'
              ? 'Correct. Recognizable features help onboard navigation compare ground images and estimate motion alongside other sensors.'
              : 'Try the other view. Repeated sand patterns can be difficult to distinguish from one image to the next.'}
          </p>
        ) : null}
        <p className={styles.caption}>
          Illustrative comparison and tracking markers, not NASA navigation
          telemetry.
        </p>
      </div>
      <div className={styles.panel}>
        <span className={styles.eyebrow}>03 / ROTOR EVIDENCE</span>
        <div className={zoom ? styles.zoomed : undefined}>
          <SceneMediaView media={damagePhoto} />
        </div>
        <Button
          variant="secondary"
          aria-pressed={zoom}
          onClick={() => setZoom(!zoom)}
        >
          {zoom ? 'Show full image' : 'Enlarge rotor-shadow image'}
        </Button>
        <Button variant="secondary" onClick={() => setInspected(true)}>
          Inspect damaged rotor shadow
        </Button>
        {inspected ? (
          <p className={styles.success}>
            Evidence inspected. This shadow revealed rotor damage. It supports
            an engineering reconstruction; the picture alone does not establish
            the full accident sequence.
          </p>
        ) : null}
      </div>
      {ready ? (
        <div className={styles.panel}>
          <h3>Engineering deduction</h3>
          <fieldset className={styles.choices}>
            <legend>What is the most important lesson from Flight 72?</legend>
            {[
              [
                'safe',
                'Reliable navigation and safe landings are essential for autonomous aircraft on unfamiliar terrain.',
              ],
              [
                'manual',
                'A real-time joystick from Earth would solve every problem.',
              ],
              [
                'proof',
                'This game proves every detail of the accident with certainty.',
              ],
            ].map(([id, label]) => (
              <label key={id}>
                <input
                  type="radio"
                  name="ingenuity-deduction"
                  checked={deduction === id}
                  onChange={() => {
                    setDeduction(id!)
                    setSolved(false)
                  }}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <Button
            disabled={!deduction}
            onClick={() => {
              const correct = deduction === 'safe'
              setSolved(correct)
              setFeedback(
                correct
                  ? 'Evidence complete — Flight 72 engineering lesson ready to save. NASA’s most likely reconstruction begins with insufficient visual-navigation information, followed by a hard landing and rotor damage. Multiple scenarios were considered.'
                  : 'Try again. Ingenuity flew autonomously; a distant investigation reconstructs a likely sequence rather than proving every detail.',
              )
            }}
          >
            Check engineering lesson
          </Button>
        </div>
      ) : (
        <p>
          Investigate all three evidence panels before drawing a conclusion.
        </p>
      )}
      {feedback ? (
        <p role="status" className={solved ? styles.success : styles.panel}>
          {feedback}
        </p>
      ) : null}
      {solved ? (
        <Button onClick={() => props.onComplete()}>
          Save Flight 72 discovery
        </Button>
      ) : null}
    </div>
  )
}

export function LegacyTimeline(props: ActivityRenderProps) {
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <div className={styles.counters}>
        <span>
          <strong>5</strong>planned flights
        </span>
        <span>
          <strong>72</strong>completed flights
        </span>
        <span>
          <strong>2021–2024</strong>Mars flight operations
        </span>
        <span>
          <strong>FIRST</strong>powered, controlled flight on another planet
        </span>
      </div>
      <EventOrderActivity
        {...props}
        prompt={timeline}
        completed={false}
        replay={false}
        onComplete={() => setSolved(true)}
      />
      {solved ? (
        <div className={styles.success}>
          <h3>Five flights were the plan. Seventy-two became the legacy.</h3>
          <p>
            Record completion to request the final 15 XP and the existing
            “Ingenuity story” achievement. The shared player confirms saved
            completion; replay earns no duplicate rewards.
          </p>
          <dl className={styles.rewardList}>
            <div>
              <dt>Introduction</dt>
              <dd>20 XP</dd>
            </div>
            <div>
              <dt>First Flight</dt>
              <dd>40 XP</dd>
            </div>
            <div>
              <dt>Discovery</dt>
              <dd>25 XP</dd>
            </div>
            <div>
              <dt>Legacy</dt>
              <dd>15 XP</dd>
            </div>
            <div>
              <dt>Maximum</dt>
              <dd>100 XP</dd>
            </div>
          </dl>
          <Button onClick={() => props.onComplete()}>
            Complete Ingenuity mission
          </Button>
        </div>
      ) : null}
    </div>
  )
}
