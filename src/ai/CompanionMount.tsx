import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { router } from '@/app/router.tsx'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'
import { isMissionId } from '@/missions/registry.ts'
import { AiCompanion } from './AiCompanion.tsx'
import { NovaAiProvider } from './context/AiContext.tsx'

const subscribeToRoute = (notify: () => void) => router.subscribe(notify)
const getRoute = () => router.state.location.pathname

export type CompanionMountProps = { children?: ReactNode }

/** Shared AI scope for routed pages and one companion across layouts. */
export function CompanionMount({ children }: CompanionMountProps) {
  const route = useSyncExternalStore(subscribeToRoute, getRoute)
  const { services } = useNovaServices()
  const [identityVersion, setIdentityVersion] = useState(0)
  useEffect(
    () =>
      services.auth.subscribe(() => setIdentityVersion((value) => value + 1)),
    [services],
  )
  const candidate = /^\/missions\/([^/]+)(?:\/|$)/.exec(route)?.[1]
  const missionId = candidate && isMissionId(candidate) ? candidate : undefined
  // Remount clears input/history on identity and route transitions, including logout.
  return (
    <NovaAiProvider
      route={route}
      missionId={missionId}
      identityVersion={identityVersion}
    >
      {children}
      <AiCompanion
        key={`${route}:${identityVersion}`}
        context={{ route, missionId }}
      />
    </NovaAiProvider>
  )
}
