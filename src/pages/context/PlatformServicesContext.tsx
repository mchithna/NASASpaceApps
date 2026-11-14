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

function DevModeBanner({ acceptanceMode }: { acceptanceMode: boolean }) {
  return (
    <aside
      aria-label="Development Mode Notice"
      className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-xs text-foreground"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Dev Mock Mode
          </span>
          <span className="text-secondary">
            {acceptanceMode ? (
              'Explicit acceptance fixture. Local tab storage only; no Supabase connection.'
            ) : (
              <>
                Supabase credentials not configured in{' '}
                <code className="text-foreground">.env.local</code>. Running
                with in-memory mock services.
              </>
            )}
          </span>
        </div>
        <span className="text-[11px] text-muted">
          Setup: copy <code className="text-foreground">.env.example</code> to{' '}
          <code className="text-foreground">.env.local</code> and set{' '}
          <code className="text-foreground">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-foreground">VITE_SUPABASE_PUBLISHABLE_KEY</code>
          .
        </span>
      </div>
    </aside>
  )
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
      {import.meta.env.DEV && !value.isLive ? (
        <DevModeBanner acceptanceMode={acceptanceMode} />
      ) : null}
      {children}
    </PlatformServicesContext.Provider>
  )
}
