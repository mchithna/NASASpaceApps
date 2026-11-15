import { createContext } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import type { MockPersona } from '@/mocks/createMockServices.ts'

export type PlatformServicesContextValue = {
  services: NovaServices
  currentPersona: MockPersona | 'custom'
  isLive: boolean
  isAcceptance?: boolean
  isConfigured: boolean
  switchPersona: (persona: MockPersona) => void
}

// Vite removes this import entirely from production bundles.
export const createDevelopmentServices = import.meta.env.DEV
  ? (await import('@/mocks/createMockServices.ts')).createMockServices
  : undefined
export const defaultMockServices = createDevelopmentServices?.({
  persona: 'registered',
})

export const PlatformServicesContext =
  createContext<PlatformServicesContextValue | null>(null)
