import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import {
  createServiceRuntime,
  type ServiceRuntime,
} from '@/engine/serviceRuntime.ts'
import { loadMissionChapter } from '@/missions/chapter.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'
import {
  MissionPlayerShell,
  type PlayerLoad,
} from '@/pages/components/mission-presentation/MissionPlayerShell.tsx'

export function MissionPlayerPage() {
  const route = useMissionParam()

  if (route.status === 'not-found') {
    return <NotFoundPage />
  }

  return <ChapterPlayer key={route.mission.id} mission={route.mission} />
}

function ChapterPlayer({ mission }: { mission: MissionDefinition }) {
  const { services, isLive, isConfigured } = useNovaServices()
  const navigate = useNavigate()
  const [load, setLoad] = useState<PlayerLoad>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    let visitRuntime: ServiceRuntime | undefined

    async function open() {
      setLoad({ status: 'loading' })
      try {
        if (isLive && !isConfigured) {
          setLoad({
            status: 'error',
            message:
              'Player services are not configured. Please try again when the connection is available.',
          })
          return
        }

        const chapter = await loadMissionChapter(mission.id)
        if (!active) return

        if (!chapter) {
          setLoad({ status: 'planned' })
          return
        }

        const session = await services.auth.getSession()
        if (!active) return

        if (!session.ok) {
          setLoad({ status: 'error', message: session.error.message })
          return
        }

        if (
          session.data.status !== 'guest' &&
          session.data.status !== 'authenticated'
        ) {
          setLoad({
            status: 'error',
            message:
              'Sign in or continue as a guest before starting a mission.',
          })
          return
        }

        const identity = session.data.identity.explorerId
        const runtime = createServiceRuntime(services, chapter.module, identity)
        visitRuntime = runtime

        const progress = await runtime.loadProgress(mission.id)
        if (!active) return

        setLoad(
          progress.ok
            ? {
                status: 'ready',
                chapter,
                runtime,
                progress: progress.data,
                identity,
              }
            : { status: 'error', message: progress.error.message },
        )
      } catch {
        if (active) {
          setLoad({
            status: 'error',
            message: 'The chapter could not be loaded. Please try again.',
          })
        }
      }
    }

    void open()

    const unsubscribe = services.auth.subscribe(() => {
      if (active) {
        visitRuntime?.dispose()
        setLoad({ status: 'loading' })
        setAttempt((value) => value + 1)
      }
    })

    return () => {
      active = false
      visitRuntime?.dispose()
      unsubscribe()
    }
  }, [services, mission.id, attempt, isLive, isConfigured])

  return (
    <MissionPlayerShell
      mission={mission}
      load={load}
      attempt={attempt}
      onRetry={() => setAttempt((value) => value + 1)}
      onExit={() => navigate('/dashboard')}
      isLive={isLive}
    />
  )
}
