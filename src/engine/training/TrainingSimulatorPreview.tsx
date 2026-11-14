/**
 * Dev-only harness for the training simulator.
 * It is not registered on the production router.
 * The mock lives on this component instance. A browser reload drops it.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'
import { acceptanceEnabled } from '@/engine/training/acceptanceServices.ts'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
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
  return acceptanceEnabled() ? <IntegratedTraining /> : <StandaloneTraining />
}

function IntegratedTraining() {
  const { services } = useNovaServices()
  const navigate = useNavigate()
  const [module] = useState(createTrainingSimulator)
  const [runtime] = useState(() => createServiceRuntime(services, module))
  const [progress, setProgress] = useState<MissionRuntimeState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [activities] = useState(() => {
    const result = createTrainingActivities()
    if (!result.ok) throw new Error('Training activity registration failed')
    return result.value
  })
  useEffect(() => {
    let active = true
    void runtime
      .loadProgress(module.mission.id)
      .then((result) => {
        if (!active) return
        if (result.ok) {
          setProgress(result.data)
          setError(null)
        } else setError(result.error.message)
        setLoaded(true)
      })
      .catch(() => {
        if (active) {
          setError('Training progress could not be loaded.')
          setLoaded(true)
        }
      })
    return () => {
      active = false
    }
  }, [runtime, module, attempt])
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <p>
        {trainingSimulatorLabel} Isolated acceptance fixture; not saved to a
        real account.
      </p>
      {!loaded ? (
        <LoadingState label="Loading isolated training" />
      ) : error ? (
        <>
          <ErrorState message={error} />
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Retry training
          </Button>
        </>
      ) : (
        <MissionPlayer
          key={attempt}
          module={module}
          runtime={runtime}
          activities={activities}
          progress={progress}
          onExit={() => navigate('/dashboard')}
        />
      )}
    </div>
  )
}

function StandaloneTraining() {
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
