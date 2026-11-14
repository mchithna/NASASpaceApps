import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PlatformServicesProvider } from './PlatformServicesContext.tsx'
import { useNovaServices } from './useNovaServices.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import { createStructuralFixture } from '@/engine/fixture.ts'
import userEvent from '@testing-library/user-event'

afterEach(() => {
  vi.unstubAllEnvs()
})
function Consumer() {
  const value = useNovaServices()
  return <p>{value.isLive ? 'real boundary' : 'mock boundary'}</p>
}
describe('production service boundary', () => {
  it('does not fall back to a training runtime when production player services are missing', async () => {
    vi.stubEnv('PROD', true); vi.stubEnv('DEV', false)
    const user = userEvent.setup()
    render(<MissionPlayer module={createStructuralFixture()} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await screen.findByText('Mission services are not connected. Reload your saved place.')
    expect(screen.queryByText('Your place is saved.')).not.toBeInTheDocument()
  })
  it('rejects explicit mock mode and unverified injections in production', () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('DEV', false)
    expect(() =>
      render(
        <PlatformServicesProvider isLive={false}>
          <Consumer />
        </PlatformServicesProvider>,
      ),
    ).toThrow('Production services cannot')
    expect(() =>
      render(
        <PlatformServicesProvider services={createMockServices()}>
          <Consumer />
        </PlatformServicesProvider>,
      ),
    ).toThrow('Production services cannot')
  })
  it('fails closed without a provider in production', () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('DEV', false)
    expect(() => render(<Consumer />)).toThrow('NovaServices must be provided')
  })
  it('uses real services by default even without configuration, with no persona downgrade', () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('DEV', false)
    function Switcher() {
      const value = useNovaServices()
      return (
        <button onClick={() => value.switchPersona('registered')}>
          {value.isLive ? 'real boundary' : 'mock boundary'}
        </button>
      )
    }
    render(
      <PlatformServicesProvider>
        <Switcher />
      </PlatformServicesProvider>,
    )
    screen.getByRole('button', { name: 'real boundary' }).click()
    expect(
      screen.getByRole('button', { name: 'real boundary' }),
    ).toBeInTheDocument()
  })
})
