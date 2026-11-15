import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SeismometerDeployment } from './SeismometerDeployment.tsx'

function renderActivity(onComplete = vi.fn(), finished = false) {
  render(
    <SeismometerDeployment
      missionId="insight"
      sceneId="insight-deployment"
      activityId="seismometer-deployment"
      activityType="insight-deployment"
      config={{}}
      completed={finished}
      replay={finished}
      onComplete={onComplete}
    />,
  )
  return onComplete
}

describe('Seismometer Deployment', () => {
  it('rejects an unsuitable patch, then completes once from the flat ground', async () => {
    const user = userEvent.setup({ delay: null })
    const onComplete = renderActivity()

    expect(
      screen.getByRole('heading', { name: 'Place the Seismometer' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/practice choices, not/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Uneven rocky ground' }))
    expect(screen.getByText(/stable instrument positioning/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Obstructed ground' }))
    expect(screen.getByText(/interfere with deployment/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Choose this area' }))
    expect(screen.getByText(/Examine all three patches/)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Flat, clear ground' }))
    await user.click(screen.getByRole('button', { name: 'Uneven rocky ground' }))
    await user.click(screen.getByRole('button', { name: 'Choose this area' }))
    expect(
      screen.getByText(/Choose the flat, clear patch for this exercise/),
    ).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Flat, clear ground' }))
    await user.click(screen.getByRole('button', { name: 'Choose this area' }))
    await user.click(screen.getByRole('button', { name: 'Activate the robotic arm' }))
    expect(screen.getByText(/classroom animation/)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /arm has set SEIS on the flat patch/ }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Place the wind and thermal shield' }),
    )
    expect(screen.getByText('Shield in place')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    const save = screen.getByRole('button', { name: 'Save deployment exercise' })
    await user.click(save)
    await user.click(save)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows the finished placement on replay without completing again', () => {
    const onComplete = renderActivity(vi.fn(), true)
    expect(screen.getByText('Shield in place')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save deployment exercise' }),
    ).toBeDisabled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
