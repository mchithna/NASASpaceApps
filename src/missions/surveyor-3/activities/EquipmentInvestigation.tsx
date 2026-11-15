import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

const equipment = [
  {
    id: 'camera',
    label: 'TV camera',
    detail:
      'The camera sent pictures of the surface to Earth. Controllers could watch the sampler work.',
  },
  {
    id: 'sampler',
    label: 'Surface sampler',
    detail:
      'The scoop moved lunar soil and helped test how firmly the ground could support a load.',
  },
  {
    id: 'landing',
    label: 'Landing system',
    detail:
      'Landing legs supported the spacecraft. Rocket engines slowed its descent; radar helped control the approach.',
  },
] as const

export function EquipmentInvestigation(props: ActivityRenderProps) {
  const [seen, setSeen] = useState<readonly string[]>([])
  const [selected, setSelected] = useState<string>('camera')
  return (
    <div className="flex flex-col gap-4">
      <p className="text-secondary">
        Inspect all three equipment stations to open the mission file.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {equipment.map((item, index) => (
          <Button
            key={item.id}
            variant="secondary"
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id)
              setSeen((current) =>
                current.includes(item.id) ? current : [...current, item.id],
              )
            }}
          >
            {index + 1}. {item.label}
            {seen.includes(item.id) ? ' · Examined' : ''}
          </Button>
        ))}
      </div>
      <p
        role="status"
        className="rounded-surface border border-border bg-elevated p-4 text-foreground"
      >
        {equipment.find((item) => item.id === selected)?.detail}
      </p>
      <p className="text-sm text-secondary">
        {seen.length} of 3 stations examined
      </p>
      <Button
        disabled={seen.length !== 3 || (props.completed && !props.replay)}
        onClick={() => {
          if (!props.replay) props.onComplete()
        }}
      >
        {props.completed && !props.replay
          ? 'Investigation saved'
          : props.replay
            ? 'Replay: equipment examined'
            : 'Open mission file'}
      </Button>
    </div>
  )
}
