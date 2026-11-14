import type { ReactNode } from 'react'
import type { NovaServices } from '@/contracts/services.ts'
import { PlatformServicesProvider } from '@/pages/context/PlatformServicesContext.tsx'

export type AppProvidersProps = {
  children: ReactNode
  services?: NovaServices
}

export function AppProviders({ children, services }: AppProvidersProps) {
  return (
    <PlatformServicesProvider services={services}>
      {children}
    </PlatformServicesProvider>
  )
}
