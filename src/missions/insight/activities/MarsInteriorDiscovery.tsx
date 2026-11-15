import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { useActivityAttempt } from '@/engine/activities/useActivityAttempt.ts'
import styles from './InsightObservatory.module.css'

type Choice = { id: string; label: string }

type Stage = {
  id: 'crust' | 'mantle' | 'core'
  name: string
  clue: string
  choices: readonly Choice[]
  correctId: string
  misses: Readonly<Record<string, string>>
  reveal: string
}

const stages: readonly Stage[] = [
  {
    id: 'crust',
    name: 'Crust',
    clue: 'A marsquake sends vibrations through Mars’s outer rocky layer. Those vibrations change as they pass through that material. Cameras can photograph the surface, but they do not show the structure of the layer beneath it.',
    choices: [
      {
        id: 'crust',
        label:
          'The changes help scientists investigate the crust, the outer rocky layer.',
      },
      {
        id: 'wind',
        label: 'The vibration is only wind, so the outer layer cannot be studied.',
      },
      {
        id: 'photo',
        label: 'A surface photograph measures how thick the crust is.',
      },
    ],
    correctId: 'crust',
    misses: {
      wind: 'Wind can shake the ground, but this clue is about vibrations that traveled through rock. Wind is not a map of the crust.',
      photo: 'Cameras show the surface. They do not measure the rocky layer beneath it.',
    },
    reveal:
      'The crust is Mars’s outer rocky layer. Seismic observations help scientists investigate its structure. This is a simplified clue, not the full study NASA scientists carried out.',
  },
  {
    id: 'mantle',
    name: 'Mantle',
    clue: 'Some vibrations travel deeper than the crust. Their timing and shape change in the material below it.',
    choices: [
      {
        id: 'mantle',
        label:
          'Those changes help scientists study the mantle, the layer beneath the crust.',
      },
      {
        id: 'surface',
        label: 'The mantle is the dusty red surface.',
      },
      {
        id: 'drawing',
        label: 'This classroom drawing is a NASA measurement of the mantle.',
      },
    ],
    correctId: 'mantle',
    misses: {
      surface:
        'The red surface is what cameras see. The mantle is deeper, beneath the crust.',
      drawing:
        'This picture is a schematic. It is not a NASA measurement of the mantle.',
    },
    reveal:
      'The mantle lies beneath the crust. The way seismic waves move through it helps scientists narrow down what that deeper material is like. This is still a teaching model.',
  },
  {
    id: 'core',
    name: 'Core',
    clue: 'Some seismic signals have traveled through the deep interior. Scientists use that kind of evidence to investigate the innermost layer. The heat probe did not dig to this layer.',
    choices: [
      {
        id: 'core',
        label:
          'Deep-traveling seismic signals help scientists investigate the core’s size and properties.',
      },
      {
        id: 'surface',
        label: 'The core is the red surface in photographs.',
      },
      {
        id: 'probe',
        label: 'The heat probe reached the core and measured it directly.',
      },
    ],
    correctId: 'core',
    misses: {
      surface:
        'The surface is the outside of Mars. The core is the deep interior in this schematic.',
      probe:
        'The heat probe did not reach its planned depth, and it did not reach the core. Seismic observations helped scientists investigate the core.',
    },
    reveal:
      'The core is the deepest layer in this drawing. InSight’s seismic observations helped scientists investigate its size and properties. A separate radio experiment, RISE, also tracked the lander to study the core. These three clues are not that complete analysis.',
  },
]

function layerClass(visible: boolean): string {
  return `${styles.layer} ${visible ? styles.layerOn : ''}`
}

export function MarsInteriorDiscovery(props: ActivityRenderProps) {
  const titleId = useId()
  const identity = `${props.sceneId}:${props.activityId}`
  const finishedVisit = props.completed || props.replay
  const attempt = useActivityAttempt(identity, finishedVisit)
  const [step, setStep] = useState(finishedVisit ? stages.length : 0)
  const [choice, setChoice] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const stage = stages[step]
  const solved = step >= stages.length

  function check(): void {
    if (!stage || solved) {
      return
    }

    if (choice === '') {
      setFeedback('Choose an interpretation, then check it.')
      return
    }

    if (choice !== stage.correctId) {
      attempt.miss()
      setFeedback(stage.misses[choice] ?? 'That interpretation does not fit this clue.')
      return
    }

    setFeedback(null)
    setChoice('')
    setStep((current) => current + 1)
  }

  function save(): void {
    attempt.succeed(props.onComplete)
  }

  const revealed = stages.slice(0, step).map((item) => item.name)
  const hidden = stages.slice(step).map((item) => item.name)

  return (
    <div className={styles.panel}>
      <p className={styles.copy}>
        We can see the surface of Mars through cameras. But InSight’s seismic
        observations helped scientists understand what lies deep beneath it.
      </p>
      <p className={styles.copy}>
        <strong className="text-white">
          Interpret seismic clues to uncover the hidden structure of Mars.
        </strong>
      </p>
      <div className={styles.layout}>
        <figure className={styles.figure}>
          <svg
            className={styles.planet}
            viewBox="0 0 320 320"
            role="img"
            aria-labelledby={titleId}
          >
            <title id={titleId}>
              Schematic cross-section of Mars, not to scale
              {revealed.length > 0
                ? `. Revealed: ${revealed.join(', ')}`
                : '. Interior hidden'}
              {hidden.length > 0 ? `. Still hidden: ${hidden.join(', ')}` : ''}
            </title>
            <circle className={styles.surface} cx="160" cy="160" r="132" />
            <circle className={styles.unknown} cx="160" cy="160" r="114" />
            <circle
              className={`${styles.crust} ${layerClass(step >= 1)}`}
              cx="160"
              cy="160"
              r="114"
            />
            <circle
              className={styles.unknown}
              cx="160"
              cy="160"
              r="98"
              opacity={step >= 2 ? 0 : 1}
            />
            <circle
              className={`${styles.mantle} ${layerClass(step >= 2)}`}
              cx="160"
              cy="160"
              r="98"
            />
            <circle
              className={styles.unknown}
              cx="160"
              cy="160"
              r="46"
              opacity={step >= 3 ? 0 : 1}
            />
            <circle
              className={`${styles.core} ${layerClass(step >= 3)}`}
              cx="160"
              cy="160"
              r="46"
            />
            {step >= 1 ? (
              <text className={styles.label} x="160" y="58" textAnchor="middle">
                Crust
              </text>
            ) : null}
            {step >= 2 ? (
              <text
                className={styles.coreLabel}
                x="160"
                y="108"
                textAnchor="middle"
              >
                Mantle
              </text>
            ) : null}
            {step >= 3 ? (
              <text
                className={styles.coreLabel}
                x="160"
                y="164"
                textAnchor="middle"
              >
                Core
              </text>
            ) : (
              <text className={styles.label} x="160" y="164" textAnchor="middle">
                Hidden
              </text>
            )}
          </svg>
          <figcaption className={styles.note}>
            Schematic, not to scale. Educational drawing, not a NASA
            measurement or a reconstruction of Mars.
          </figcaption>
        </figure>
        <div className="flex flex-col gap-3">
          <p role="status" className={styles.note}>
            {solved
              ? 'Crust, mantle, and core are revealed.'
              : `${revealed.length > 0 ? `Revealed: ${revealed.join(', ')}. ` : ''}Still hidden: ${hidden.join(', ')}.`}
          </p>
          {stages.slice(0, step).map((item) => (
            <div key={item.id} className={styles.reveal}>
              <p className="font-semibold text-white">{item.name}</p>
              <p>{item.reveal}</p>
            </div>
          ))}
          {stage ? (
            <fieldset className={styles.choices} disabled={solved}>
              <legend className={styles.copy}>
                {stage.name} clue. {stage.clue}
              </legend>
              {stage.choices.map((item) => (
                <label key={item.id} className={styles.choice}>
                  <input
                    type="radio"
                    name={`insight-interior-${stage.id}`}
                    value={item.id}
                    checked={choice === item.id}
                    onChange={() => setChoice(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
          {feedback && !solved ? (
            <p role="status" className={styles.note}>
              {feedback}
            </p>
          ) : null}
          {stage ? <Button onClick={check}>Check this clue</Button> : null}
        </div>
      </div>
      <details className={styles.mole}>
        <summary>Not Every Experiment Goes as Planned</summary>
        <p className={styles.copy}>
          HP3, nicknamed the mole, was designed to hammer about 16 feet (5
          meters) down and measure heat flowing from Mars’s interior. The soil
          was clumpier than expected. Its 16-inch (40-centimeter) probe got
          only slightly below the surface. It still collected information about
          the soil, but not the deep heat-flow record it was built for.
        </p>
      </details>
      {solved ? (
        <div className={`${styles.reveal} ${styles.unlocked}`} role="status">
          <p className="font-semibold text-white">
            Discovery Unlocked: Mars Has a Hidden Structure
          </p>
          <p>
            Seismic observations helped scientists investigate Mars’s crust,
            mantle, and core. The three clues are an educational explanation of
            that idea. They are not the complete analysis NASA scientists
            performed.
          </p>
          <Button onClick={save} disabled={finishedVisit}>
            Save interior discovery
          </Button>
        </div>
      ) : null}
    </div>
  )
}
