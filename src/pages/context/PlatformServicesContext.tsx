import { useMemo, useState, type ReactNode } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import {
  createMockServices,
  type MockPersona,
} from '@/mocks/createMockServices.ts'
import {
  PlatformServicesContext,
  type PlatformServicesContextValue,
} from '@/pages/context/platformServicesContextValue.ts'

export type PlatformServicesProviderProps = {
  children: ReactNode
  services?: NovaServices
  initialPersona?: MockPersona
}

export function PlatformServicesProvider({
  children,
  services: explicitServices,
  initialPersona = 'registered',
}: PlatformServicesProviderProps) {
  const [currentPersona, setCurrentPersona] =
    useState<MockPersona>(initialPersona)
  const [internalServices, setInternalServices] = useState<NovaServices>(() =>
    explicitServices ?? createMockServices({ persona: initialPersona }),
  )

  const value = useMemo<PlatformServicesContextValue>(() => {
    if (explicitServices) {
      return {
        services: explicitServices,
        currentPersona: 'custom',
        switchPersona: () => {
          // Custom services cannot be dynamically switched with mock presets
        },
      }
    }

    return {
      services: internalServices,
      currentPersona,
      switchPersona: (nextPersona: MockPersona) => {
        setCurrentPersona(nextPersona)
        setInternalServices(createMockServices({ persona: nextPersona }))
      },
    }
  }, [explicitServices, internalServices, currentPersona])

  return (
    <PlatformServicesContext.Provider value={value}>
      {children}
    </PlatformServicesContext.Provider>
  )
}
