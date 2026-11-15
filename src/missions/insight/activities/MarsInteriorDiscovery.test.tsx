import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MarsInteriorDiscovery } from './MarsInteriorDiscovery.tsx'

function renderActivity(onComplete = vi.fn()) {
  render(
    <MarsInteriorDiscovery
      missionId="insight"
      sceneId="insight-interior"
      activityId="interior-discovery"
      activityType="insight-interior"
      config={{}}
      completed={false}
      replay={false}
      onComplete={onComplete}
    />,
  )
  return onComplete
}

describe('Mars interior discovery', () => {
  it('retries a wrong clue, reveals each layer, and completes once', async () => {
    const user = userEvent.setup()
    const onComplete = renderActivity()

    expect(
      screen.getByText(/Interpret seismic clues to uncover the hidden structure/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Schematic, not to scale/)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Still hidden: Crust, Mantle, Core/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /surface photograph/ }))
    await user.click(screen.getByRole('button', { name: 'Check this clue' }))
    expect(screen.getByText(/Cameras show the surface/)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('radio', { name: /outer rocky layer/ }))
    await user.click(screen.getByRole('button', { name: 'Check this clue' }))
    expect(
      screen.getByRole('img', {
        name: /Revealed: Crust\. Still hidden: Mantle, Core/,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /layer beneath the crust/ }))
    await user.click(screen.getByRole('button', { name: 'Check this clue' }))
    expect(
      screen.getByRole('img', { name: /Revealed: Crust, Mantle\. Still hidden: Core/ }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('radio', { name: /Deep-traveling seismic signals/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Check this clue' }))
    expect(
      screen.getByText('Discovery Unlocked: Mars Has a Hidden Structure'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Crust, mantle, and core are revealed.'),
    ).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByText('Not Every Experiment Goes as Planned'))
    expect(screen.getByText(/nicknamed the mole/)).toBeInTheDocument()

    const save = screen.getByRole('button', { name: 'Save interior discovery' })
    await user.click(save)
    await user.click(save)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
