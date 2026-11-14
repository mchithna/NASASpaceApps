import { createContext } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import {
  createMockServices,
  type MockPersona,
} from '@/mocks/createMockServices.ts'

export type PlatformServicesContextValue = {
  services: NovaServices
  currentPersona: MockPersona | 'custom'
  isLive: boolean
  isConfigured: boolean
  switchPersona: (persona: MockPersona) => void
}

export const defaultMockServices = createMockServices({ persona: 'registered' })

export const PlatformServicesContext =
  createContext<PlatformServicesContextValue | null>(null)
