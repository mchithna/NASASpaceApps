import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { listMissions } from '@/missions/registry.ts'
import { DashboardPage } from '@/pages/DashboardPage.tsx'
import { PlatformServicesProvider } from '@/pages/context/index.ts'

function renderDashboard(persona: 'registered' | 'guest' | 'signed-out' = 'registered') {
  const services = createMockServices({ persona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/missions/:missionId"
              element={<div data-testid="mission-overview">Mission Overview</div>}
            />
            <Route
              path="/missions/:missionId/play"
              element={<div data-testid="mission-play">Mission Player</div>}
            />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

describe('DashboardPage presentation and mission actions', () => {
  it('renders heading, explorer hero, and telemetry metrics from mock services', async () => {
    renderDashboard('registered')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mission Control' }),
    ).toBeInTheDocument()

    // Explorer Profile
    expect(screen.getByText('Nova Cadet')).toBeInTheDocument()
    expect(screen.getAllByText('Lunar Explorer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('160 XP')).toBeInTheDocument()

    // Metrics Row
    expect(screen.getByText('Missions Completed')).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByText('Discoveries Logged')).toBeInTheDocument()
  })

  it('renders exactly five mission cards directly from the registry', async () => {
    renderDashboard('registered')
    const registryMissions = listMissions()

    expect(registryMissions).toHaveLength(5)

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    for (const mission of registryMissions) {
      expect(
        screen.getAllByRole('heading', { level: 3, name: mission.displayName }).length,
      ).toBeGreaterThanOrEqual(1)
    }
  })

  it('displays state-dependent CTA action buttons matching mock progress', async () => {
    renderDashboard('registered')

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    // In-progress mission (Surveyor 3) -> "Continue Mission"
    const continueCta = screen.getAllByRole('link', {
      name: /Continue Mission for Surveyor 3/i,
    })
    expect(continueCta.length).toBeGreaterThanOrEqual(1)
    expect(continueCta[0]).toHaveAttribute('href', '/missions/surveyor-3/play')

    // Completed mission (Ingenuity) -> "Replay Story"
    const replayCta = screen.getByRole('link', {
      name: /Replay Story for Ingenuity/i,
    })
    expect(replayCta).toHaveAttribute('href', '/missions/ingenuity/play')

    // Not started mission (Opportunity) -> "Begin Story"
    const beginCta = screen.getByRole('link', {
      name: /Begin Story for Opportunity/i,
    })
    expect(beginCta).toHaveAttribute('href', '/missions/opportunity')
  })

  it('renders active mission spotlight when an in-progress mission exists', async () => {
    renderDashboard('registered')

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    expect(
      screen.getByRole('heading', { level: 2, name: 'Continue Active Mission' }),
    ).toBeInTheDocument()

    expect(screen.getByText(/Active Telemetry Downlink/i)).toBeInTheDocument()
    expect(screen.getAllByText('evidence').length).toBeGreaterThanOrEqual(1)
  })

  it('navigates when mission action CTA is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard('registered')

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    const replayButton = screen.getByRole('link', {
      name: /Replay Story for Ingenuity/i,
    })
    await user.click(replayButton)

    await waitFor(() => {
      expect(screen.getByTestId('mission-play')).toBeInTheDocument()
    })
  })

  it('renders guest persona with zero completed missions and guest mode notice', async () => {
    renderDashboard('guest')

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    expect(screen.getByText('Guest Cadet')).toBeInTheDocument()
    expect(screen.getAllByText('Space Cadet').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('0 / 5')).toBeInTheDocument()
    expect(screen.getByText('Guest Session Active')).toBeInTheDocument()

    // In guest mode with fresh seed, all missions should be not_started
    const beginStories = screen.getAllByRole('link', { name: /Begin Story/i })
    expect(beginStories).toHaveLength(5)
  })

  it('renders error state when services are unavailable and supports retry', async () => {
    const user = userEvent.setup()
    const errorServices = createMockServices({ persona: 'registered' })

    let fail = true
    errorServices.explorer.getProfile = async () => {
      if (fail) {
        return {
          ok: false,
          error: {
            code: 'unavailable',
            message: 'Deep Space Network packet loss.',
          },
        }
      }
      return createMockServices({ persona: 'registered' }).explorer.getProfile()
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <PlatformServicesProvider services={errorServices}>
          <DashboardPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Deep Space Network packet loss.'),
    ).toBeInTheDocument()

    // Click retry after restoring
    fail = false
    const retryButton = screen.getByRole('button', { name: 'Retry' })
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Nova Cadet')).toBeInTheDocument()
    })
  })
})
