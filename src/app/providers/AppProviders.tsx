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
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <PlatformServicesProvider
      services={services ?? isolated ?? undefined}
      acceptanceMode={Boolean(isolated)}
    >
      {import.meta.env.DEV ? (
        <aside
          aria-label="Acceptance environment"
          className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md"
        >
          {isMinimized ? (
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#344354] bg-[#0B1421]/95 px-3.5 py-1.5 text-xs font-semibold text-[#D9FCA7] shadow-elevated backdrop-blur-md transition-all hover:border-[#53CBFF] hover:text-[#53CBFF]"
              aria-label="Expand Dev Mock Banner"
            >
              <span className="size-2 rounded-full bg-[#4FD1A5] animate-pulse" />
              <span>Dev Mock Active</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-[#344354] bg-[#0B1421]/95 p-3.5 shadow-elevated backdrop-blur-md text-xs text-[#F5F7FB]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#344354]/60">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#152333] border border-[#344354] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D9FCA7]">
                    Dev Mock Mode
                  </span>
                  <span className="text-[11px] text-[#AAB7C8]">Local tab fixture</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  aria-label="Minimize dev banner"
                  className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full hover:bg-[#152333] text-[#AAB7C8] hover:text-[#F5F7FB] transition-colors"
                >
                  &times;
                </button>
              </div>

              {isolated ? (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[11px] leading-relaxed text-[#AAB7C8]">
                    Isolated acceptance fixture. Synthetic training rewards; no
                    Supabase or real account data.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#344354] bg-[#152333] px-3 py-1.5 text-xs font-medium text-[#53CBFF] transition-colors hover:border-[#53CBFF] hover:bg-[#101C2A]"
                      href="/dev/training-simulator"
                    >
                      Open isolated training simulator
                    </a>
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#344354] bg-[#152333] px-3 py-1.5 text-xs font-medium text-[#F5F7FB] transition-colors hover:border-[#D9FCA7] hover:text-[#D9FCA7]"
                      onClick={() => acceptance?.newAcceptanceGuest()}
                    >
                      New isolated test guest
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] leading-relaxed text-[#AAB7C8]">
                    Supabase credentials not configured in <code className="text-[#F5F7FB]">.env.local</code>. Running with in-memory mock services.
                  </p>
                  <a
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#344354] bg-[#152333] px-3 py-1.5 text-xs font-medium text-[#53CBFF] transition-colors hover:border-[#53CBFF] hover:bg-[#101C2A]"
                    href="/?acceptance=training"
                  >
                    Open isolated acceptance environment
                  </a>
                </div>
              )}
            </div>
          )}
        </aside>
      ) : null}
      {children}
    </PlatformServicesProvider>
  )
}
