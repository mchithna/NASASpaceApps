import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DustPowerSimulation } from './DustPowerSimulation.tsx'

function renderActivity(onComplete = vi.fn(), finished = false) {
  render(
    <DustPowerSimulation
      missionId="insight"
      sceneId="insight-fading-power"
      activityId="dust-power"
      activityType="insight-dust-power"
      config={{}}
      completed={finished}
      replay={finished}
      onComplete={onComplete}
    />,
  )
  return onComplete
}

describe('Dust and solar power', () => {
  it('lowers the illustrative indicator as dust increases, then completes once', async () => {
    const user = userEvent.setup()
    const onComplete = renderActivity()
    const slider = screen.getByRole('slider', { name: 'Dust level' })

    expect(screen.getByText('Clear sunlight. Illustrative energy: High.')).toBeInTheDocument()
    expect(screen.queryByText(/5,000 watt-hours/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save power demonstration' })).toBeDisabled()

    fireEvent.change(slider, { target: { value: '1' } })
    expect(screen.getByText('Light dust. Illustrative energy: Reduced.')).toBeInTheDocument()
    expect(screen.queryByText(/5,000 watt-hours/)).not.toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.change(slider, { target: { value: '2' } })
    expect(screen.getByText('Heavy dust. Illustrative energy: Low.')).toBeInTheDocument()
    expect(screen.getByText(/about 5,000 watt-hours/)).toBeInTheDocument()
    expect(screen.getByText(/not from this slider/)).toBeInTheDocument()

    const save = screen.getByRole('button', { name: 'Save power demonstration' })
    await user.click(save)
    await user.click(save)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows the final operational note on replay without completing again', () => {
    const onComplete = renderActivity(vi.fn(), true)
    expect(screen.getByText(/last science instrument/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save power demonstration' })).toBeDisabled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
