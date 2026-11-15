import { useId, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { EvidenceMatchActivity } from '@/engine/activities/EvidenceMatchActivity.tsx'
import { PredictionChoiceActivity } from '@/engine/activities/PredictionChoiceActivity.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import {
  PioneerSpacecraft,
  Starfield,
} from '../components/PioneerSpacecraft.tsx'
import {
  deepSpace,
  dsn,
  legacyOrder,
  lightDelay,
  plaqueImage,
  plaqueMatch,
  plaqueSymbols,
  signalQuestion,
} from '../content.ts'
import styles from '../Pioneer.module.css'

export function PlaqueDecoder(props: ActivityRenderProps) {
  const [selected, setSelected] = useState('hydrogen')
  const [visited, setVisited] = useState<string[]>([])
  const [zoom, setZoom] = useState(false)
  const [solved, setSolved] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const current = plaqueSymbols.find((item) => item.id === selected)!
  function inspect(id: string) {
    setSelected(id)
    setVisited((old) => (old.includes(id) ? old : [...old, id]))
  }
  return (
    <div className={styles.activity}>
      <p className={styles.objective}>
        Decode a physical message from humanity. Inspect all four symbol groups,
        then connect them with their intended meanings.
      </p>
      <div
        className={styles.plaqueViewport}
        data-zoom={zoom}
        style={
          { '--zoom-origin': `${current.x}% ${current.y}%` } as CSSProperties
        }
      >
        <SceneMediaView media={plaqueImage} />
        {!zoom
          ? plaqueSymbols.map((symbol, index) => (
              <button
                className={styles.hotspot}
                style={{ left: `${symbol.x}%`, top: `${symbol.y}%` }}
                key={symbol.id}
                aria-label={`Plaque diagram: inspect ${symbol.label}`}
                onClick={() => inspect(symbol.id)}
              >
                {visited.includes(symbol.id) ? '✓' : index + 1}
              </button>
            ))
          : null}
      </div>
      <Button
        variant="secondary"
        aria-pressed={zoom}
        onClick={() => setZoom(!zoom)}
      >
        {zoom ? 'Show full plaque' : 'Zoom selected symbol'}
      </Button>
      <div className={styles.buttonList}>
        {plaqueSymbols.map((symbol, index) => (
          <button
            key={symbol.id}
            aria-pressed={selected === symbol.id}
            onClick={() => inspect(symbol.id)}
          >
            {index + 1}. {symbol.label}{' '}
            {visited.includes(symbol.id) ? '✓ Inspected' : ''}
          </button>
        ))}
      </div>
      <div className={styles.panel} aria-live="polite">
        <h3>{current.label}</h3>
        <p>{current.text}</p>
      </div>
      <p className={styles.caption}>
        Historical scientific imagery is preserved. The designers hoped another
        intelligence might interpret the symbols someday. There is no confirmed
        discovery, decoding or reply by another civilization.
      </p>
      {visited.length === 4 ? (
        <>
          <EvidenceMatchActivity
            key={attempt}
            {...props}
            prompt={plaqueMatch}
            completed={false}
            replay={false}
            onComplete={() => setSolved(true)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setAttempt(attempt + 1)
              setSolved(false)
            }}
          >
            Reset symbol matches
          </Button>
        </>
      ) : (
        <p>SYMBOL GROUPS EXPLORED — {visited.length} / 4</p>
      )}
      {solved ? (
        <>
          <div className={styles.success} role="status">
            <h3>Plaque decoded — ready for your Discovery Journal</h3>
            <p>{plaqueMatch.explanation}</p>
          </div>
          <Button onClick={() => props.onComplete()}>
            Save Pioneer plaque discovery
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function DeepSpaceSignalLab(props: ActivityRenderProps) {
  const [distance, setDistance] = useState(1)
  const [exploredDistance, setExploredDistance] = useState(false)
  const [historical, setHistorical] = useState(false)
  const [inspected, setInspected] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [showStation, setShowStation] = useState(false)
  const sliderId = useId()
  const ready = historical && exploredDistance && inspected.length === 2
  const duration = 1.5 + distance / 3
  return (
    <div className={styles.activity}>
      <Starfield>
        <div
          className={styles.linkScene}
          style={
            {
              '--signal-end': `${48 + distance * 2.5}%`,
              '--signal-duration': `${duration}s`,
            } as CSSProperties
          }
        >
          <div className={styles.earthStation}>
            <div className={styles.earth} aria-hidden="true" />
            <strong>EARTH STATION</strong>
            <span>DSN / schematic</span>
          </div>
          <div className={styles.signalPath} aria-hidden="true">
            {pulse > 0 ? (
              <span key={pulse} className={styles.signalPulse} />
            ) : null}
          </div>
          <div className={styles.signalCraft}>
            <PioneerSpacecraft />
            <strong>PIONEER 10</strong>
          </div>
          <p className={styles.linkLabel}>
            Accelerated, historical signal illustration. No live transmissions
            or recorded audio.
          </p>
        </div>
      </Starfield>
      <label htmlFor={sliderId} className={styles.eyebrow}>
        ILLUSTRATIVE EARTH–SPACECRAFT DISTANCE
      </label>
      <p className={styles.caption}>
        Earth context photograph: NASA/Apollo 17 crew, December 1972. It was not
        taken by Pioneer 10. The station and link layout are schematic.
      </p>
      <input
        id={sliderId}
        className={styles.slider}
        type="range"
        min="1"
        max="12.23"
        step="0.01"
        value={distance}
        onChange={(event) => {
          setDistance(Number(event.target.value))
          setExploredDistance(true)
          setHistorical(false)
        }}
        aria-valuetext={`${distance.toFixed(2)} billion kilometers; calculated one-way delay ${lightDelay(distance)}`}
      />
      <div className={styles.readouts}>
        <span>
          Distance setting<strong>{distance.toFixed(2)} billion km</strong>
        </span>
        <span>
          Calculated one-way delay<strong>{lightDelay(distance)}</strong>
        </span>
        <span>
          Historical contact status
          <strong>
            {historical ? 'Last weak signal detected' : 'Teaching example'}
          </strong>
        </span>
      </div>
      <p className={styles.caption}>
        Intermediate distances are illustrative calculations, not recorded
        telemetry. Delay = distance ÷ the speed of light (299,792.458 km/s),
        rounded to the nearest minute. Screen animation is greatly accelerated;
        radio signals do not cross this distance in seconds.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setPulse(pulse + 1)}>
          Play illustrative signal pulse
        </Button>
        <Button
          onClick={() => {
            setDistance(12.23)
            setHistorical(true)
            setPulse(pulse + 1)
          }}
        >
          January 23, 2003 — Last detected signal
        </Button>
      </div>
      {historical ? (
        <div className={styles.panel}>
          <h3>January 23, 2003 — Last signal detected</h3>
          <p>
            Approximately 12.23 billion km from Earth. One-way light travel:
            about 11 hours and 20 minutes. The signal was extremely weak; no
            scientific telemetry was recovered. The last telemetry return was
            April 27, 2002.
          </p>
          <p>
            Routine contact had ended in March 1997, with intermittent contacts
            afterward. A further attempt in 2006 was unsuccessful.
          </p>
        </div>
      ) : null}
      <div className={styles.columns}>
        {[
          [
            'distance',
            'Increasing Distance',
            'A radio signal spreads as it travels. Greater distance makes the received signal weaker and harder for Earth’s antennas to detect.',
          ],
          [
            'power',
            'Decreasing Electrical Power',
            'Aging radioisotope generators supplied less electrical power. Eventually the already faint radio link fell below detection. This was not a solar-panel or fictional battery-percentage problem.',
          ],
        ].map(([id, title, text]) => (
          <button
            className={styles.infoButton}
            key={id}
            aria-pressed={inspected.includes(id!)}
            onClick={() =>
              setInspected((old) => (old.includes(id!) ? old : [...old, id!]))
            }
          >
            <strong>
              {title} {inspected.includes(id!) ? '✓ Reviewed' : ''}
            </strong>
            <span>{text}</span>
            {id === 'power' ? (
              <span className={styles.powerIllustration} aria-hidden="true">
                <i />
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <p className={styles.caption}>
        The power graphic is a qualitative illustration, not a NASA measurement.
        More distance and declining electrical power are different challenges.
      </p>
      {ready ? (
        <PredictionChoiceActivity
          {...props}
          prompt={signalQuestion}
          completed={false}
          replay={false}
          onComplete={() => setSolved(true)}
        />
      ) : (
        <p>
          Change the distance setting, open the January 2003 preset, and review
          both communication challenges before drawing your conclusion.
        </p>
      )}
      {solved ? (
        <>
          <div className={styles.success}>
            <h3>Contact ended. The journey did not.</h3>
            <p>
              No detectable transmissions have been received since the final
              contact. Pioneer 10 continues outward; it has not returned to
              Earth or arrived at another star.
            </p>
          </div>
          <Button onClick={() => props.onComplete()}>
            Finish communication investigation
          </Button>
        </>
      ) : null}
      <details onToggle={(event) => setShowStation(event.currentTarget.open)}>
        <summary>See NASA’s Deep Space Network antennas</summary>
        {showStation ? <SceneMediaView media={dsn} /> : null}
      </details>
    </div>
  )
}

export function LegacyTimeline(props: ActivityRenderProps) {
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <div className={styles.legacyVisual}>
        <SceneMediaView media={deepSpace} />
        <p>
          The signal faded.
          <br />
          <strong>The legacy travelled on.</strong>
        </p>
      </div>
      <div className={styles.counters}>
        <span>
          <strong>FIRST</strong>Main asteroid belt crossing
        </span>
        <span>
          <strong>FIRST</strong>Close Jupiter flyby
        </span>
        <span>
          <strong>21 months</strong>Originally planned mission
        </span>
        <span>
          <strong>30+ years</strong>From launch to last detected signal
        </span>
      </div>
      <EventOrderActivity
        {...props}
        prompt={legacyOrder}
        completed={false}
        replay={false}
        onComplete={() => setSolved(true)}
      />
      {solved ? (
        <div className={styles.success}>
          <h3>A messenger that never came home</h3>
          <p>
            Complete the mission to save your legacy milestone and unlock the
            existing “Pioneer 10 story” achievement. Your plaque discovery is
            already part of the journey.
          </p>
          <dl className={styles.rewards}>
            <div>
              <dt>Introduction</dt>
              <dd>20 XP</dd>
            </div>
            <div>
              <dt>Jupiter investigation</dt>
              <dd>40 XP</dd>
            </div>
            <div>
              <dt>Plaque discovery</dt>
              <dd>25 XP</dd>
            </div>
            <div>
              <dt>Legacy</dt>
              <dd>15 XP</dd>
            </div>
            <div>
              <dt>Maximum mission reward</dt>
              <dd>100 XP</dd>
            </div>
          </dl>
          <Button onClick={() => props.onComplete()}>
            Complete Pioneer 10 mission
          </Button>
        </div>
      ) : null}
      <p className={styles.caption}>
        Use Mission Control or Exit mission to return. Start again replays
        completed scenes and activities without duplicate rewards.
      </p>
    </div>
  )
}
