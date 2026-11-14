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
  if (!import.meta.env.DEV || !defaultMockServices) {
    throw new Error('NovaServices must be provided in production.')
  }

  return {
    services: defaultMockServices,
    currentPersona: 'registered',
    isLive: false,
    isConfigured: false,
    switchPersona: () => {
      // Standalone fallback: switching requires a PlatformServicesProvider
    },
  }
}
