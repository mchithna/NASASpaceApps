import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SeismicSignalDetective } from './SeismicSignalDetective.tsx'

function renderActivity(onComplete = vi.fn()) {
  render(
    <SeismicSignalDetective
      missionId="insight"
      sceneId="insight-first-whisper"
      activityId="signal-detective"
      activityType="insight-signal-detective"
      config={{}}
      completed={false}
      replay={false}
      onComplete={onComplete}
    />,
  )
  return onComplete
}

describe('Seismic Signal Detective', () => {
  it('explains a wrong signal, then completes once from the marsquake', async () => {
    const user = userEvent.setup()
    const onComplete = renderActivity()

    expect(
      screen.getByRole('heading', { name: 'Decode the Marsquake' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Play NASA recording' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Signal A/ }))
    expect(screen.getByText(/wind record/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Signal B/ }))
    expect(screen.getByText(/robotic arm moves/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Signal C/ }))
    expect(screen.getByText(/does not follow the wind/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Signal B/ }))
    await user.click(screen.getByRole('button', { name: 'Analyze Signal' }))
    expect(screen.getByText(/comes from the spacecraft/)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Signal C/ }))
    await user.click(screen.getByRole('button', { name: 'Analyze Signal' }))
    expect(screen.getByText('Investigation Complete')).toBeInTheDocument()
    expect(
      screen.getByText(/first likely marsquake in April 2019/),
    ).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    const save = screen.getByRole('button', { name: 'Save signal investigation' })
    await user.click(save)
    await user.click(save)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
