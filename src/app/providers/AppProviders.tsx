import { useState, type ReactNode } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import { PlatformServicesProvider } from '@/pages/context/PlatformServicesContext.tsx'

const acceptance = import.meta.env.DEV
  ? await import('@/engine/training/acceptanceServices.ts')
  : null

export type AppProvidersProps = {
  children: ReactNode
  services?: NovaServices
}

export function AppProviders({ children, services }: AppProvidersProps) {
  const [isolated] = useState(() =>
    !services && acceptance?.acceptanceEnabled()
      ? acceptance.createAcceptanceServices()
      : null,
  )
  return (
    <PlatformServicesProvider
      services={services ?? isolated ?? undefined}
      acceptanceMode={Boolean(isolated)}
    >
      {import.meta.env.DEV ? (
        <aside
          aria-label="Acceptance environment"
          className="bg-surface p-3 text-sm text-foreground"
        >
          {isolated ? (
            <>
              <p>
                Isolated acceptance fixture. Synthetic training rewards; no
                Supabase or real account data.
              </p>
              <a
                className="inline-flex min-h-11 items-center underline"
                href="/dev/training-simulator"
              >
                Open isolated training simulator
              </a>{' '}
              <button
                className="min-h-11 px-3 underline"
                onClick={() => acceptance?.newAcceptanceGuest()}
              >
                New isolated test guest
              </button>
            </>
          ) : (
            <a
              className="inline-flex min-h-11 items-center underline"
              href="/?acceptance=training"
            >
              Open isolated acceptance environment
            </a>
          )}
        </aside>
      ) : null}
      {children}
    </PlatformServicesProvider>
  )
}
