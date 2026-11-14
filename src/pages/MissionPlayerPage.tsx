import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { MissionFacts } from '@/components/layout/MissionFacts.tsx'
import { textLinkClass } from '@/components/layout/layoutClasses.ts'
import { useMissionParam } from '@/hooks/useMissionParam.ts'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import {
  createServiceRuntime,
  type ServiceRuntime,
} from '@/engine/serviceRuntime.ts'
import { loadMissionChapter } from '@/missions/chapter.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'

type LoadedChapter = NonNullable<Awaited<ReturnType<typeof loadMissionChapter>>>
type PlayerLoad =
  | { status: 'loading' }
  | { status: 'planned' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      chapter: LoadedChapter
      runtime: ServiceRuntime
      progress: MissionRuntimeState
      identity: string
    }

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
        if (active)
          setLoad({
            status: 'error',
            message: 'The chapter could not be loaded. Please try again.',
          })
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
    <div className="flex flex-col gap-6">
      {load.status !== 'ready' ? <MissionFacts mission={mission} /> : null}
      {load.status === 'loading' ? (
        <LoadingState label="Loading your mission" />
      ) : null}
      {load.status === 'planned' ? (
        <p className="text-secondary">
          This chapter is being prepared. No mission progress or rewards have
          been recorded.
        </p>
      ) : null}
      {load.status === 'error' ? (
        <ErrorState title="Mission unavailable" message={load.message} />
      ) : null}
      {load.status === 'error' ? (
        <Link className={textLinkClass} to="/auth">
          Sign in or continue as a guest
        </Link>
      ) : null}
      {load.status === 'ready' ? (
        <>
          <p className="text-sm text-secondary">
            {!isLive
              ? 'Development mock visit. Progress is not saved to a real account.'
              : 'Mission progress uses your player services. Guest progress is saved in this browser tab.'}
          </p>
          <MissionPlayer
            key={`${load.identity}:${attempt}`}
            module={load.chapter.module}
            activities={load.chapter.activities}
            runtime={load.runtime}
            progress={load.progress}
            onExit={() => navigate('/dashboard')}
          />
        </>
      ) : null}
      {load.status === 'error' || load.status === 'ready' ? (
        <Button
          variant="secondary"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Reload saved place
        </Button>
      ) : null}
      <Link className={textLinkClass} to={`/missions/${mission.id}`}>
        Back to overview
      </Link>
      <Link className={textLinkClass} to="/dashboard">
        Mission Control
      </Link>
    </div>
  )
}
