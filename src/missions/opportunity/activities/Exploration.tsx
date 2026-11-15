import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { SceneMediaView } from '@/engine/scenes/SceneMediaView.tsx'
import { PredictionChoiceActivity } from '@/engine/activities/PredictionChoiceActivity.tsx'
import { assetRoot, clues, equipment, stops } from '../content.ts'
import styles from '../Opportunity.module.css'

export function RoverSketch() {
  return (
    <svg className={styles.rover} viewBox="0 0 500 300" aria-hidden="true">
      <path
        d="M100 180 210 140 400 165 300 215Z"
        fill="#364867"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="m130 180 175 20m-130-35 175 20m-130-35 175 20M190 150l-40 45m90-35-40 45m90-35-40 45m90-35-40 45"
        stroke="#a6cae5"
        strokeWidth="2"
      />
      <path
        d="M275 150V65h30m-25 0h-25V45h55v20M170 210l-45 25m75-15 30 25m95-35 45 20M160 190l-40 15-20 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      {[125, 230, 370].map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy="250"
            r="22"
            fill="#151e32"
            stroke="currentColor"
            strokeWidth="6"
          />
          <circle
            cx={x + 35}
            cy="215"
            r="17"
            fill="#151e32"
            stroke="currentColor"
            strokeWidth="5"
          />
        </g>
      ))}
    </svg>
  )
}

export function Opening(props: ActivityRenderProps) {
  return (
    <div className={styles.activity}>
      <div className={styles.signal} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <p className="text-secondary">
        Signal no longer received. Artistic communication visualization, not
        recovered radio data or audio.
      </p>
      <p>
        Your mission: reconstruct Opportunity’s journey and discover the
        scientific legacy it left behind.
      </p>
      <Button onClick={() => props.onComplete()}>Begin Investigation</Button>
    </div>
  )
}

export function ExploreRover(props: ActivityRenderProps) {
  const [seen, setSeen] = useState<readonly number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const detailId = useId()
  function inspect(index: number) {
    setSelected(index)
    setSeen((current) =>
      current.includes(index) ? current : [...current, index],
    )
  }
  return (
    <div className={styles.activity}>
      <p>
        Inspect at least three components. Numbers link the schematic to the
        equipment controls.
      </p>
      <div className={styles.stage}>
        <RoverSketch />
        {equipment.map((item, i) => (
          <button
            key={item.name}
            className={styles.hotspot}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-label={`Inspect ${item.name}`}
            aria-pressed={selected === i}
            aria-describedby={detailId}
            onClick={() => inspect(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="text-sm text-secondary">
        Simplified equipment schematic; positions are illustrative.
      </p>
      <div className={styles.grid}>
        {equipment.map((item, i) => (
          <Button
            key={item.name}
            variant="secondary"
            aria-pressed={selected === i}
            onClick={() => inspect(i)}
          >
            {i + 1}. {item.name}
            {seen.includes(i) ? ' · Inspected' : ''}
          </Button>
        ))}
      </div>
      <div id={detailId} role="status" className={styles.detail}>
        {selected === null ? (
          'Choose a component to investigate.'
        ) : (
          <>
            <strong>{equipment[selected].name}</strong>
            <p>{equipment[selected].detail}</p>
          </>
        )}
      </div>
      <p>{seen.length} of 6 inspected · 3 needed</p>
      {seen.length >= 3 ? (
        <p className={styles.success}>
          Explorer Knowledge Unlocked — Meet Opportunity
        </p>
      ) : null}
      <Button disabled={seen.length < 3} onClick={() => props.onComplete()}>
        Finish rover investigation
      </Button>
    </div>
  )
}

export function WaterDetective(props: ActivityRenderProps) {
  const [seen, setSeen] = useState<readonly number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  return (
    <div className={styles.activity}>
      <div className={styles.grid}>
        {clues.map((clue, i) => (
          <Button
            key={clue.name}
            variant="secondary"
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i)
              setSeen((current) =>
                current.includes(i) ? current : [...current, i],
              )
            }}
          >
            {clue.name}
            {seen.includes(i) ? ' · Collected' : ''}
          </Button>
        ))}
      </div>
      {selected !== null ? (
        <div className={styles.detail}>
          <SceneMediaView
            media={{
              src: assetRoot + clues[selected].image,
              alt: clues[selected].name,
              credit: clues[selected].credit,
            }}
          />
          <p role="status">{clues[selected].detail}</p>
        </div>
      ) : (
        <p>Inspect both geological clues before drawing a conclusion.</p>
      )}
      {seen.length === 2 ? (
        <p className={styles.detail}>
          Science check: these minerals and rock structures help reconstruct
          past water activity. Neither clue identifies living organisms. Combine
          both clues before making your conclusion.
        </p>
      ) : null}
      {seen.length === 2 ? (
        <PredictionChoiceActivity
          {...props}
          completed={false}
          replay={false}
          onComplete={() => setSolved(true)}
          prompt={{
            type: 'prediction-choice',
            instruction: 'What do these geological findings suggest?',
            choices: [
              { id: 'dry', label: 'Mars has always been completely dry.' },
              {
                id: 'water',
                label:
                  'Liquid water affected parts of Mars in the distant past.',
              },
              { id: 'life', label: 'Opportunity discovered living organisms.' },
            ],
            correctChoiceId: 'water',
            explanation:
              'Minerals and rock structures support past water activity. Evidence of past water is not proof that life existed on Mars.',
          }}
        />
      ) : null}
      {solved ? (
        <>
          <p className={styles.success}>
            Ancient water evidence identified. Water alone does not prove life.
          </p>
          <Button onClick={() => props.onComplete()}>
            Save water investigation
          </Button>
        </>
      ) : null}
    </div>
  )
}

export function MarsExpedition(props: ActivityRenderProps) {
  const [active, setActive] = useState(0)
  const [finished, setFinished] = useState<readonly number[]>([])
  const stop = stops[active]
  const unlocked = Math.min(finished.length, stops.length - 1)
  return (
    <div className={styles.activity}>
      <p className="text-secondary">
        Educational reconstruction · schematic route, not to scale. Explore
        historical stops; you are not driving the real rover.
      </p>
      <nav aria-label="Expedition destinations" className={styles.route}>
        <span className={styles.track} aria-hidden="true" />
        <span
          className={styles.marker}
          style={{ left: `${active * 25 + 6}%` }}
          aria-hidden="true"
        >
          <RoverSketch />
        </span>
        {stops.map((item, i) => (
          <Button
            key={item.name}
            variant={active === i ? 'primary' : 'secondary'}
            disabled={i > unlocked}
            aria-current={active === i ? 'step' : undefined}
            onClick={() => setActive(i)}
          >
            {i + 1}. {item.name}
            {finished.includes(i)
              ? ' · Complete'
              : i > unlocked
                ? ' · Locked'
                : ''}
          </Button>
        ))}
      </nav>
      <SceneMediaView
        media={{
          src: assetRoot + stop.image,
          alt: `Historical view at ${stop.name}`,
          credit: stop.credit,
        }}
      />
      <div className={styles.detail}>
        <h3 className="font-heading text-xl">
          {stop.name} · {stop.date}
        </h3>
        <p>{stop.objective}</p>
      </div>
      <Button
        variant="secondary"
        onClick={() =>
          setFinished((current) =>
            current.includes(active) ? current : [...current, active],
          )
        }
      >
        {stop.target}
      </Button>
      {finished.includes(active) ? (
        <>
          <p role="status" className={styles.success}>
            {stop.finding}
          </p>
          {active < 3 ? (
            <Button onClick={() => setActive(active + 1)}>
              Travel to {stops[active + 1].name}
            </Button>
          ) : null}
        </>
      ) : null}
      <Button
        variant="ghost"
        disabled={active === 0}
        onClick={() => setActive(active - 1)}
      >
        Review previous evidence
      </Button>
      <p>{finished.length} of 4 destinations investigated</p>
      {finished.length === 4 ? (
        <>
          <p className={styles.success}>
            Journey Complete — A Mission Beyond 90 Days. Opportunity eventually
            travelled 45.16 km during almost 15 years on Mars.
          </p>
          <Button onClick={() => props.onComplete()}>Finish expedition</Button>
        </>
      ) : null}
    </div>
  )
}
