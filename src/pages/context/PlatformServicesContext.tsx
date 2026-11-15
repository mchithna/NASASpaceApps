import { useMemo, useState, type ReactNode } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import { createPlayerServices, isSupabaseConfigured } from '@/features/index.ts'
import type { MockPersona } from '@/mocks/createMockServices.ts'
import {
  PlatformServicesContext,
  createDevelopmentServices,
  type PlatformServicesContextValue,
} from '@/pages/context/platformServicesContextValue.ts'

export type PlatformServicesProviderProps = {
  children: ReactNode
  services?: NovaServices
  initialPersona?: MockPersona
  isLive?: boolean
  acceptanceMode?: boolean
}

let sharedPlayerServices: NovaServices | null = null

function getSharedPlayerServices(): NovaServices {
  if (!sharedPlayerServices) {
    sharedPlayerServices = createPlayerServices()
  }
  return sharedPlayerServices
}


export function PlatformServicesProvider({
  children,
  services: explicitServices,
  initialPersona = 'registered',
  isLive: explicitIsLive,
  acceptanceMode = false,
}: PlatformServicesProviderProps) {
  if (
    import.meta.env.PROD &&
    (explicitIsLive === false || (explicitServices && explicitIsLive !== true))
  ) {
    throw new Error(
      'Production services cannot use mock mode or an unverified override.',
    )
  }
  const isConfigured = isSupabaseConfigured()

  // Live player services are preferred:
  // 1. When explicitIsLive is explicitly true.
  // 2. In production builds (mocks are NEVER enabled in production).
  // 3. In development when Supabase credentials are configured in .env.local.
  // When explicit mock services are injected without isLive flag (e.g. unit tests), default to false.
  const shouldDefaultToLive = import.meta.env.PROD
    ? true
    : explicitIsLive !== undefined
      ? explicitIsLive
      : explicitServices
        ? false
        : Boolean(import.meta.env.PROD) ||
          Boolean(import.meta.env.DEV && isConfigured)

  const [isLiveMode, setIsLiveMode] = useState<boolean>(shouldDefaultToLive)
  const [currentPersona, setCurrentPersona] =
    useState<MockPersona>(initialPersona)
  const [mockServicesInstance, setMockServicesInstance] =
    useState<NovaServices | null>(
      () =>
        explicitServices ??
        (shouldDefaultToLive
          ? null
          : (createDevelopmentServices?.({ persona: initialPersona }) ?? null)),
    )

  const value = useMemo<PlatformServicesContextValue>(() => {
    if (explicitServices) {
      return {
        services: explicitServices,
        currentPersona: 'custom',
        isLive: isLiveMode,
        isAcceptance: import.meta.env.DEV && acceptanceMode,
        isConfigured: isLiveMode,
        switchPersona: (nextPersona: MockPersona) => {
          setCurrentPersona(nextPersona)
        },
      }
    }

    if (isLiveMode) {
      return {
        services: getSharedPlayerServices(),
        currentPersona: 'custom',
        isLive: true,
        isConfigured,
        switchPersona: (nextPersona: MockPersona) => {
          // In development, switching persona switches to mock mode
          if (import.meta.env.DEV) {
            setIsLiveMode(false)
            setCurrentPersona(nextPersona)
            setMockServicesInstance(
              createDevelopmentServices?.({ persona: nextPersona }) ?? null,
            )
          }
        },
      }
    }

    if (!mockServicesInstance || !import.meta.env.DEV)
      throw new Error('Mock services are development-only.')
    return {
      services: mockServicesInstance,
      currentPersona,
      isLive: false,
      isConfigured: false,
      switchPersona: (nextPersona: MockPersona) => {
        setCurrentPersona(nextPersona)
        setMockServicesInstance(
          createDevelopmentServices?.({ persona: nextPersona }) ?? null,
        )
      },
    }
  }, [
    explicitServices,
    acceptanceMode,
    isLiveMode,
    isConfigured,
    mockServicesInstance,
    currentPersona,
  ])

  return (
    <PlatformServicesContext.Provider value={value}>
      {children}
    </PlatformServicesContext.Provider>
  )

}
