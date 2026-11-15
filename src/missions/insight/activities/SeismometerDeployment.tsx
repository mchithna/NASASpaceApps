import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { useActivityAttempt } from '@/engine/activities/useActivityAttempt.ts'
import styles from './InsightObservatory.module.css'

type SiteId = 'rocky' | 'flat' | 'blocked'
type Phase = 'survey' | 'chosen' | 'placed' | 'covered'

const sites: readonly {
  id: SiteId
  marker: string
  name: string
  detail: string
  reject: string
}[] = [
  {
    id: 'rocky',
    marker: 'A',
    name: 'Uneven rocky ground',
    detail:
      'Uneven terrain can make stable instrument positioning more difficult. A seismometer listens for very small vibrations, so a shaky spot makes the record harder to trust.',
    reject:
      'Uneven terrain can make stable instrument positioning more difficult. Choose the flat, clear patch for this exercise.',
  },
  {
    id: 'flat',
    marker: 'B',
    name: 'Flat, clear ground',
    detail:
      'A flat, open patch gives the arm room to set the seismometer down and cover it. This is the suitable location for the simplified exercise.',
    reject: '',
  },
  {
    id: 'blocked',
    marker: 'C',
    name: 'Obstructed ground',
    detail:
      'Nearby obstacles could interfere with deployment. Rocks close to the spot can get in the way of the arm and the wind and thermal shield.',
    reject:
      'Nearby obstacles could interfere with deployment. Choose the flat, clear patch for this exercise.',
  },
]

const markers: readonly { id: SiteId; cx: number }[] = [
  { id: 'rocky', cx: 250 },
  { id: 'flat', cx: 370 },
  { id: 'blocked', cx: 500 },
]

export function SeismometerDeployment(props: ActivityRenderProps) {
  const titleId = useId()
  const identity = `${props.sceneId}:${props.activityId}`
  const finished = props.completed || props.replay
  const attempt = useActivityAttempt(identity, finished)
  const [examined, setExamined] = useState<readonly SiteId[]>(
    finished ? ['rocky', 'flat', 'blocked'] : [],
  )
  const [selected, setSelected] = useState<SiteId | null>(finished ? 'flat' : null)
  const [phase, setPhase] = useState<Phase>(finished ? 'covered' : 'survey')
  const [feedback, setFeedback] = useState<string | null>(null)
  const onGround = phase === 'placed' || phase === 'covered'
  const current = sites.find((site) => site.id === selected)

  function examine(id: SiteId): void {
    setSelected(id)
    setExamined((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id],
    )
    setFeedback(null)
  }

  function chooseArea(): void {
    if (attempt.inputsLocked || phase !== 'survey') {
      return
    }

    if (!selected || examined.length < sites.length) {
      attempt.miss()
      setFeedback('Examine all three patches before you choose a deployment area.')
      return
    }

    if (selected !== 'flat') {
      attempt.miss()
      setFeedback(sites.find((site) => site.id === selected)?.reject ?? null)
      return
    }

    setFeedback(null)
    setPhase('chosen')
  }

  function activateArm(): void {
    if (phase !== 'chosen') {
      return
    }

    setPhase('placed')
  }

  function placeShield(): void {
    if (phase !== 'placed') {
      return
    }

    setPhase('covered')
  }

  const diagramLabel = onGround
    ? phase === 'covered'
      ? 'Educational simulation. SEIS is under the wind and thermal shield on the flat patch.'
      : 'Educational simulation. The arm has set SEIS on the flat patch.'
    : 'Educational simulation. SEIS is still on the lander deck. The three patches are practice choices.'

  return (
    <div className={styles.panel}>
      <div>
        <h3 className="font-heading text-xl font-semibold">Place the Seismometer</h3>
        <p className={styles.copy}>
          InSight’s robotic arm was more than 5 feet 9 inches (1.8 meters) long.
          It lifted SEIS off the deck, set the seismometer on the ground, and
          covered it with a wind and thermal shield.
        </p>
      </div>
      <p className={styles.note}>
        Educational simulation. These three patches are practice choices, not
        sites NASA offered, and the motion is not spacecraft telemetry.
      </p>
      <svg className={styles.drawing} viewBox="0 0 640 280" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{diagramLabel}</title>
        <rect width="640" height="280" fill="#07111f" />
        <path
          d="M0 156 C90 132 150 188 230 164 C310 140 350 196 450 168 C530 146 590 184 640 162 L640 280 L0 280 Z"
          fill="#c46a3a"
        />
        <path d="M228 170 l18 34 h-36 z" fill="#8c3d32" />
        <path d="M262 184 l12 24 h-24 z" fill="#6d2e28" />
        <ellipse cx="370" cy="198" rx="52" ry="16" fill="#e39a58" />
        <circle cx="486" cy="188" r="12" fill="#6d2e28" />
        <circle cx="514" cy="198" r="16" fill="#8c3d32" />
        <rect x="78" y="124" width="96" height="12" rx="2" fill="#9aa7bd" />
        <rect x="96" y="82" width="60" height="42" rx="6" fill="#d7e2ee" />
        <rect x="40" y="90" width="48" height="24" rx="2" fill="#123044" stroke="#53cbff" />
        <rect x="164" y="90" width="48" height="24" rx="2" fill="#123044" stroke="#53cbff" />
        <line
          className={styles.arm}
          x1="126"
          y1="124"
          x2={onGround ? 348 : 156}
          y2={onGround ? 176 : 132}
        />
        {markers.map((marker) => (
          <g key={marker.id}>
            <circle
              cx={marker.cx}
              cy="214"
              r="16"
              className={selected === marker.id ? styles.markerOn : styles.marker}
            />
            <text x={marker.cx} y="214" className={styles.markerText}>
              {sites.find((site) => site.id === marker.id)?.marker}
            </text>
          </g>
        ))}
        <circle className={styles.instrument} cx={onGround ? 370 : 126} cy={onGround ? 186 : 112} r="16" />
        <circle
          className={styles.instrumentCore}
          cx={onGround ? 370 : 126}
          cy={onGround ? 186 : 112}
          r="7"
        />
        <ellipse
          className={phase === 'covered' ? `${styles.shield} ${styles.shieldOn}` : styles.shield}
          cx="370"
          cy="178"
          rx="30"
          ry="18"
        />
      </svg>
      <div className={styles.cards}>
        {sites.map((site) => (
          <button
            key={site.id}
            type="button"
            className={styles.card}
            aria-pressed={selected === site.id}
            onClick={() => examine(site.id)}
          >
            <span className={styles.kicker} aria-hidden="true">
              Patch {site.marker}
            </span>
            <span className={styles.title}>{site.name}</span>
            {selected === site.id ? (
              <span className={styles.kicker} aria-hidden="true">
                Selected
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className={styles.detail}>
        <p>{current?.detail ?? 'Select each patch and read where the instrument would sit.'}</p>
      </div>
      <p className={styles.note}>
        {Math.min(examined.length, sites.length)} of {sites.length} patches examined.
      </p>
      {feedback ? (
        <p role="status" className={styles.note}>
          {feedback}
        </p>
      ) : null}
      {phase === 'survey' ? (
        <Button onClick={chooseArea} disabled={finished}>
          Choose this area
        </Button>
      ) : null}
      {phase === 'chosen' ? (
        <Button onClick={activateArm}>Activate the robotic arm</Button>
      ) : null}
      {phase === 'placed' ? (
        <>
          <p role="status" className={styles.note}>
            The arm sets SEIS on the flat patch. This motion is a classroom
            animation, not spacecraft telemetry.
          </p>
          <Button onClick={placeShield}>Place the wind and thermal shield</Button>
        </>
      ) : null}
      {phase === 'covered' ? (
        <div className={styles.success} role="status">
          <p className="font-semibold text-white">Shield in place</p>
          <p>
            SEIS is on the ground under its wind and thermal shield. The shield
            helps reduce wind and temperature swings so smaller vibrations are
            easier to sense. This drawing is a classroom simulation: the three
            patches were not a menu of real sites, and the motion is not
            spacecraft telemetry.
          </p>
        </div>
      ) : null}
      {phase === 'covered' ? (
        <Button onClick={() => attempt.succeed(props.onComplete)} disabled={finished}>
          Save deployment exercise
        </Button>
      ) : null}
    </div>
  )
}
