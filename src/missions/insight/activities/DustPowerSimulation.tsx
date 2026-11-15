import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { useActivityAttempt } from '@/engine/activities/useActivityAttempt.ts'
import styles from './InsightObservatory.module.css'

const dustLabels = [
  'Clear sunlight',
  'Light dust',
  'Heavy dust',
  'Panels heavily covered',
] as const

const energyLabels = ['High', 'Reduced', 'Low', 'Very low'] as const

export function DustPowerSimulation(props: ActivityRenderProps) {
  const titleId = useId()
  const sliderId = useId()
  const identity = `${props.sceneId}:${props.activityId}`
  const finished = props.completed || props.replay
  const attempt = useActivityAttempt(identity, finished)
  const [dust, setDust] = useState(finished ? 3 : 0)
  const [explored, setExplored] = useState(finished)
  const dustLabel = dustLabels[dust] ?? dustLabels[0]
  const energyLabel = energyLabels[dust] ?? energyLabels[0]
  const reading = `${dustLabel}. Illustrative energy: ${energyLabel}.`

  function changeDust(value: number): void {
    const next = Math.min(3, Math.max(0, value))
    setDust(next)
    if (next >= 2) {
      setExplored(true)
    }
  }

  return (
    <div className={styles.panel}>
      <div>
        <h3 className="font-heading text-xl font-semibold">Sunlight on the Panels</h3>
        <p className={styles.copy}>
          InSight depended on sunlight to power its equipment. Dust in the air
          and dust on the solar panels block some of that light, so a
          solar-powered lander has less energy for its instruments.
        </p>
      </div>
      <p className={styles.note}>
        Qualitative educational model. The dust control and the energy
        indicator are not NASA measurements and do not calculate watt-hours.
      </p>
      <svg className={styles.sketch} viewBox="0 0 360 200" role="img" aria-labelledby={titleId}>
        <title id={titleId}>
          {`Educational drawing of a solar-powered lander. ${reading} Not a NASA measurement.`}
        </title>
        <rect width="360" height="200" fill="#07111f" />
        <rect className={styles.haze} width="360" height="200" opacity={dust * 0.12} />
        <circle cx="54" cy="42" r="16" fill="#ffe08a" />
        <g className={styles.rays} opacity={1 - dust * 0.22}>
          <line x1="54" y1="14" x2="54" y2="4" />
          <line x1="74" y1="22" x2="84" y2="12" />
          <line x1="82" y1="42" x2="96" y2="42" />
          <line x1="74" y1="62" x2="86" y2="74" />
          <line x1="34" y1="22" x2="24" y2="12" />
        </g>
        <path
          d="M0 150 C40 138 80 162 140 148 C200 134 240 166 300 150 C330 142 348 154 360 148 L360 200 L0 200 Z"
          fill="#c46a3a"
        />
        <rect x="168" y="112" width="54" height="28" rx="4" fill="#d7e2ee" />
        <rect x="112" y="116" width="48" height="18" rx="2" fill="#123044" stroke="#53cbff" />
        <rect x="230" y="116" width="48" height="18" rx="2" fill="#123044" stroke="#53cbff" />
        <rect className={styles.dust} x="112" y="116" width="48" height="18" opacity={dust / 3} />
        <rect className={styles.dust} x="230" y="116" width="48" height="18" opacity={dust / 3} />
        <rect x="156" y="140" width="78" height="8" rx="2" fill="#9aa7bd" />
      </svg>
      <label className={styles.sliderLabel} htmlFor={sliderId}>
        Dust level
        <input
          id={sliderId}
          className={styles.slider}
          type="range"
          min={0}
          max={3}
          step={1}
          value={dust}
          aria-valuetext={dustLabel}
          onChange={(event) => changeDust(Number(event.currentTarget.value))}
        />
      </label>
      <p role="status">{reading}</p>
      <div
        className={styles.meter}
        role="meter"
        aria-label="Illustrative available energy"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={4 - dust}
        aria-valuetext={energyLabel}
      >
        <span className={styles.meterFill} style={{ width: `${((3 - dust) / 3) * 100}%` }} />
      </div>
      <p className={styles.note}>
        {explored
          ? 'You raised the dust enough to compare the indicator.'
          : 'Raise the dust to heavy, or until the panels are covered, to compare the energy indicator.'}
      </p>
      {explored ? (
        <div className={styles.success}>
          <p className="font-semibold text-white">InSight’s final operational period</p>
          <p>
            NASA reported about 5,000 watt-hours per Martian day soon after
            landing, and about 500 watt-hours by spring 2022. Those figures
            come from NASA, not from this slider. With less power, fewer
            instruments could stay on. SEIS was the last science instrument
            that remained powered. InSight sent its last signal on December 15,
            2022. NASA concluded the mission on December 21, 2022.
          </p>
        </div>
      ) : null}
      <Button
        onClick={() => attempt.succeed(props.onComplete)}
        disabled={!explored || finished}
      >
        Save power demonstration
      </Button>
    </div>
  )
}
