/**
 * Dev-only harness for the training simulator.
 * It is not registered on the production router.
 * The mock lives on this component instance. A browser reload drops it.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createServiceRuntime } from '@/engine/serviceRuntime.ts'
import { createTrainingActivities } from '@/engine/training/trainingSlotActivity.tsx'
import {
  createTrainingSimulator,
  trainingSimulatorLabel,
} from '@/engine/training/trainingSimulator.ts'

export function TrainingSimulatorPreview() {
  const [services] = useState(() => createMockServices({ persona: 'guest' }))
  const [runtime] = useState(() => createServiceRuntime(services))
  const [activities] = useState(() => {
    const registered = createTrainingActivities()
    if (!registered.ok) {
      throw new Error('The training activities could not be registered.')
    }
    return registered.value
  })
  const [module] = useState(() => createTrainingSimulator())
  const [progress, setProgress] = useState<MissionRuntimeState | null>(null)
  const [left, setLeft] = useState(false)
  const [visit, setVisit] = useState(0)

  async function resume(): Promise<void> {
    const loaded = await runtime.loadProgress(module.mission.id)
    if (loaded.ok) {
      setProgress(loaded.data)
    }
    setLeft(false)
    setVisit((current) => current + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[65ch] text-secondary">{trainingSimulatorLabel}</p>
      <p className="max-w-[65ch] text-sm text-muted">
        Developer preview. A browser reload starts a new mock and does not keep
        this visit.
      </p>
      {left ? (
        <Button className="w-full sm:w-auto" onClick={() => void resume()}>
          Resume training
        </Button>
      ) : (
        <MissionPlayer
          key={visit}
          module={module}
          runtime={runtime}
          activities={activities}
          progress={progress}
          onExit={() => setLeft(true)}
        />
      )}
    </div>
  )
}
