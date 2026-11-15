import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { EvidenceMatchActivity } from '@/engine/activities/EvidenceMatchActivity.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import type {
  EvidenceMatchPrompt,
  EventOrderPrompt,
} from '@/engine/activities/prompts.ts'
import { RoverSketch } from './Exploration.tsx'
import styles from '../Opportunity.module.css'

const evidencePrompt: EvidenceMatchPrompt = {
  type: 'evidence-match',
  instruction:
    'Select one interpretation for each evidence card, then check your matches.',
  evidence: [
    {
      id: 'hematite',
      label: 'Hematite-rich spheres',
      meaningId: 'groundwater',
    },
    { id: 'gypsum', label: 'Gypsum veins', meaningId: 'fractures' },
    { id: 'clay', label: 'Clay-bearing rocks', meaningId: 'less-acidic' },
  ],
  meanings: [
    {
      id: 'fractures',
      label: 'Minerals deposited by water moving through fractures',
    },
    {
      id: 'less-acidic',
      label: 'An ancient watery environment that was less acidic',
    },
    {
      id: 'groundwater',
      label: 'Evidence associated with groundwater activity',
    },
  ],
  explanation:
    'Hematite spheres support groundwater alteration. Gypsum veins record water depositing minerals in cracks. Clay-bearing rocks indicate a less acidic watery setting, potentially more suitable for microbes. None proves that life existed.',
}

const timelinePrompt: EventOrderPrompt = {
  type: 'event-order',
  instruction:
    'Rebuild the journey. Use Up and Down to arrange these milestones from earliest to latest.',
  steps: [
    { id: 'landing', label: 'Landing at Eagle Crater' },
    { id: 'water', label: 'Investigating ancient water evidence' },
    { id: 'craters', label: 'Exploring additional craters and Endeavour' },
    { id: 'storm', label: 'Final communication during the 2018 storm' },
  ],
  initialOrder: ['water', 'landing', 'storm', 'craters'],
  correctOrder: ['landing', 'water', 'craters', 'storm'],
  explanation:
    'A short primary mission became years of exploration. Geological discoveries outlasted the final signal.',
}

export function EvidenceMatch(props: ActivityRenderProps) {
  const [attempt, setAttempt] = useState(0)
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <EvidenceMatchActivity
        key={attempt}
        {...props}
        prompt={evidencePrompt}
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
        Reset matches
      </Button>
      {solved ? (
        <>
          <div role="status" className={styles.success}>
            <strong>
              Scientific Discovery Unlocked — The Ancient Water of Mars
            </strong>
            <p>{evidencePrompt.explanation}</p>
          </div>
          <Button onClick={() => props.onComplete()}>
            Save scientific discovery
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function JourneyTimeline(props: ActivityRenderProps) {
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <EventOrderActivity
        {...props}
        prompt={timelinePrompt}
        completed={false}
        replay={false}
        onComplete={() => setSolved(true)}
      />
      {solved ? (
        <>
          <p className={styles.success}>
            Opportunity’s journey ended on Mars. Its discoveries continue to
            shape how we understand the Red Planet.
          </p>
          <Button onClick={() => props.onComplete()}>Finish the journey</Button>
        </>
      ) : null}
    </div>
  )
}

export function DustStormSimulator(props: ActivityRenderProps) {
  const [dust, setDust] = useState(0)
  const [explored, setExplored] = useState(false)
  const sliderId = useId()
  const sky = dust < 2 ? 'Bright' : dust < 4 ? 'Dim' : 'Very dark'
  const power =
    dust < 2
      ? 'More available'
      : dust < 4
        ? 'Reduced'
        : 'Insufficient for normal operations'
  return (
    <div className={styles.activity}>
      <p className="text-secondary">
        Qualitative educational simulation. Dust settings and power states are
        illustrative, not historical measurements. This cannot change the
        mission’s ending.
      </p>
      <div className={`${styles.stage} ${styles.storm}`} aria-hidden="true">
        <div className={styles.sun} />
        <RoverSketch />
        <div className={styles.dust} style={{ opacity: dust / 6 }} />
      </div>
      <label htmlFor={sliderId}>
        Illustrative airborne dust setting:{' '}
        {dust === 0 ? 'Clear sky' : dust < 4 ? 'Dust building' : 'Thick dust'}
      </label>
      <input
        id={sliderId}
        className={styles.range}
        type="range"
        min="0"
        max="5"
        step="1"
        value={dust}
        aria-valuetext={`${dust} of 5 illustrative dust steps; ${sky.toLowerCase()} sunlight`}
        onChange={(event) => {
          const next = Number(event.target.value)
          setDust(next)
          if (next >= 4) setExplored(true)
        }}
      />
      <dl className={styles.readouts} aria-live="polite">
        <div>
          <dt>Sunlight reaching panels</dt>
          <dd>{sky}</dd>
        </div>
        <div>
          <dt>Illustrative available power</dt>
          <dd>{power}</dd>
        </div>
        <div>
          <dt>Illustrative communication</dt>
          <dd>
            {dust < 4
              ? 'Power can support communication'
              : 'Normal communication disrupted'}
          </dd>
        </div>
      </dl>
      <p>
        Airborne dust blocks sunlight before it reaches the solar panels. With
        too little solar energy, Opportunity could not continue normal
        operations. Dust lying on panels was not the only concern.
      </p>
      {explored ? (
        <div className={styles.detail}>
          <h3 className="font-heading text-xl">The historical outcome</h3>
          <ol>
            <li>
              <strong>June 10, 2018:</strong> last communication received.
            </li>
            <li>
              <strong>February 13, 2019:</strong> NASA announced the mission’s
              end after months of repeated attempts to restore contact.
            </li>
          </ol>
          <p>The signals stopped, but the discoveries remained.</p>
        </div>
      ) : (
        <p>Move the slider toward thick dust to observe reduced sunlight.</p>
      )}
      <Button disabled={!explored} onClick={() => props.onComplete()}>
        Finish storm investigation
      </Button>
    </div>
  )
}
