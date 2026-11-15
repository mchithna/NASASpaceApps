import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'

const instruments = [
  {
    id: 'seis',
    name: 'SEIS seismometer',
    detail:
      'SEIS, the Seismic Experiment for Interior Structure, is a dome placed on the Martian surface. It measures vibrations from marsquakes, meteorite impacts, and weather. A wind and thermal shield covers it so smaller shakes are easier to sense.',
  },
  {
    id: 'hp3',
    name: 'HP3 heat probe',
    detail:
      'HP3, the Heat Flow and Physical Properties Package, was built to measure heat flowing out of Mars. The lander’s arm was meant to set it on the surface, and a mole was designed to hammer almost 16 feet (5 meters) underground.',
  },
  {
    id: 'rise',
    name: 'RISE radio experiment',
    detail:
      'RISE, the Rotation and Interior Structure Experiment, uses radio tracking of the lander’s position. The wobble of Mars’s north pole helps scientists study the size and makeup of the iron-rich core.',
  },
  {
    id: 'panels',
    name: 'Solar panels',
    detail:
      'InSight’s electricity comes from sunlight on its solar panels. Dust settling on those panels later reduced the energy available to run the lander.',
  },
] as const

export function OpenArchive(props: ActivityRenderProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="max-w-[65ch] text-secondary">
        You are a junior seismic scientist. The recovered archive holds the
        landing, the instruments, and the vibrations InSight measured. Open it
        to start the investigation.
      </p>
      <Button
        onClick={() => props.onComplete()}
        disabled={props.completed || props.replay}
      >
        Open the mission archive
      </Button>
    </div>
  )
}

export function InstrumentCards(props: ActivityRenderProps) {
  const [seen, setSeen] = useState<readonly string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const current = instruments.find((item) => item.id === selected)
  const ready = seen.length >= 3

  function inspect(id: string) {
    setSelected(id)
    setSeen((currentIds) =>
      currentIds.includes(id) ? currentIds : [...currentIds, id],
    )
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="max-w-[65ch] text-secondary">
        Open at least three instrument records. A lander can explore without
        driving: it measures the planet from one place.
      </p>
      <div className="flex flex-wrap gap-2">
        {instruments.map((item) => (
          <Button
            key={item.id}
            variant="secondary"
            aria-pressed={selected === item.id}
            onClick={() => inspect(item.id)}
          >
            {item.name}
            {seen.includes(item.id) ? ' · Opened' : ''}
          </Button>
        ))}
      </div>
      <p aria-live="polite" className="max-w-[65ch] text-secondary">
        {current?.detail ?? 'Choose an instrument to read what it was built to measure.'}
      </p>
      <p className="text-sm text-secondary">
        {Math.min(seen.length, 3)} of 3 required records opened.
      </p>
      <Button
        onClick={() => props.onComplete()}
        disabled={!ready || props.completed || props.replay}
      >
        Save instrument introduction
      </Button>
    </div>
  )
}
