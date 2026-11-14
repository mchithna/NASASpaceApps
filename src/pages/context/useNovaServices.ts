import { useContext } from 'react'
import {
  defaultMockServices,
  PlatformServicesContext,
  type PlatformServicesContextValue,
} from '@/pages/context/platformServicesContextValue.ts'

/**
 * Accesses the active NovaServices instance.
 * Falls back to an in-memory registered mock instance if no provider is in tree.
 */
export function useNovaServices(): PlatformServicesContextValue {
  const context = useContext(PlatformServicesContext)
  if (context) {
    return context
  }

  return {
    services: defaultMockServices,
    currentPersona: 'registered',
    switchPersona: () => {
      // Standalone fallback: switching requires a PlatformServicesProvider
    },
  }
}
