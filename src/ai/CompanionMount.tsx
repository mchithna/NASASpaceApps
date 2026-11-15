import { useEffect, useState, useSyncExternalStore } from 'react'
import { router } from '@/app/router.tsx'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'
import { isMissionId } from '@/missions/registry.ts'
import { AiCompanion } from './AiCompanion.tsx'

const subscribeToRoute = (notify: () => void) => router.subscribe(notify)
const getRoute = () => router.state.location.pathname

/** One mount across layouts; never reads page DOM, profile or journal contents. */
export function CompanionMount() {
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
    <AiCompanion
      key={`${route}:${identityVersion}`}
      context={{ route, missionId }}
    />
  )
}
