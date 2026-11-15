import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { PlatformServicesProvider } from '@/pages/context/PlatformServicesContext.tsx'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'
import type { ExplorerProfile } from '@/contracts/explorer.ts'
import type { ServiceResult } from '@/contracts/result.ts'

function Readout() {
  const state = usePlatformData()
  return (
    <p>
      {state.session?.status ?? 'loading'}:
      {state.profile?.nickname ?? 'no private profile'}
    </p>
  )
}
describe('private UI state across identity changes', () => {
  it('discards a previous explorer response after sign-out', async () => {
    const services = createMockServices({ persona: 'registered' })
    const profile = await services.explorer.getProfile()
    let release!: (result: ServiceResult<ExplorerProfile>) => void
    const get = vi.spyOn(services.explorer, 'getProfile').mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve
        }),
    )
    render(
      <PlatformServicesProvider services={services}>
        <Readout />
      </PlatformServicesProvider>,
    )
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1))
    await act(async () => {
      await services.auth.signOut()
    })
    await screen.findByText('signed-out:no private profile')
    await act(async () => {
      release(profile)
    })
    expect(screen.queryByText(/Nova Cadet/)).not.toBeInTheDocument()
    expect(
      screen.getByText('signed-out:no private profile'),
    ).toBeInTheDocument()
  })
})
