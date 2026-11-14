import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { DashboardPage } from '@/pages/DashboardPage.tsx'
import {
  MissionControlHero,
  PageShell,
  StatCard,
  StatusBanner,
} from '@/pages/components/index.ts'
import {
  PlatformServicesProvider,
  useNovaServices,
} from '@/pages/context/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

function HookInspector() {
  const { currentPersona } = useNovaServices()
  const { session, profile, progress, isLoading, error } = usePlatformData()

  if (isLoading) {
    return <div data-testid="loading-state">Loading data...</div>
  }

  if (error) {
    return <div data-testid="error-state">Error: {error.message}</div>
  }

  return (
    <div data-testid="hook-data">
      <span data-testid="persona">{currentPersona}</span>
      <span data-testid="session-status">{session?.status}</span>
      <span data-testid="nickname">{profile?.nickname ?? 'no-profile'}</span>
      <span data-testid="rank">{profile?.rank.name ?? 'no-rank'}</span>
      <span data-testid="xp">{profile?.totalXp ?? -1}</span>
      <span data-testid="completed-missions">
        {progress?.missions.filter((m) => m.status === 'completed').length ?? 0}
      </span>
    </div>
  )
}

describe('Platform presentation data boundary', () => {
  it('reads registered persona data correctly from mock services', async () => {
    render(
      <PlatformServicesProvider initialPersona="registered">
        <HookInspector />
      </PlatformServicesProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('hook-data')).toBeInTheDocument()
    })

    expect(screen.getByTestId('persona')).toHaveTextContent('registered')
    expect(screen.getByTestId('session-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('nickname')).toHaveTextContent('Nova Cadet')
    expect(screen.getByTestId('rank')).toHaveTextContent('Lunar Explorer')
    expect(screen.getByTestId('xp')).toHaveTextContent('160')
    // Ingenuity is seeded as completed in registered mock
    expect(screen.getByTestId('completed-missions')).toHaveTextContent('1')
  })

  it('reads guest persona data correctly with 0 XP and guest identity', async () => {
    render(
      <PlatformServicesProvider initialPersona="guest">
        <HookInspector />
      </PlatformServicesProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('hook-data')).toBeInTheDocument()
    })

    expect(screen.getByTestId('persona')).toHaveTextContent('guest')
    expect(screen.getByTestId('session-status')).toHaveTextContent('guest')
    expect(screen.getByTestId('nickname')).toHaveTextContent('Guest Cadet')
    expect(screen.getByTestId('rank')).toHaveTextContent('Space Cadet')
    expect(screen.getByTestId('xp')).toHaveTextContent('0')
    expect(screen.getByTestId('completed-missions')).toHaveTextContent('0')
  })

  it('handles signed-out persona with null profile', async () => {
    render(
      <PlatformServicesProvider initialPersona="signed-out">
        <HookInspector />
      </PlatformServicesProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('hook-data')).toBeInTheDocument()
    })

    expect(screen.getByTestId('persona')).toHaveTextContent('signed-out')
    expect(screen.getByTestId('session-status')).toHaveTextContent('signed-out')
    expect(screen.getByTestId('nickname')).toHaveTextContent('no-profile')
    expect(screen.getByTestId('xp')).toHaveTextContent('-1')
  })

  it('handles service errors gracefully without unhandled exceptions', async () => {
    const errorServices = createMockServices({ persona: 'registered' })
    errorServices.explorer.getProfile = async () => ({
      ok: false,
      error: {
        code: 'unavailable',
        message: 'Telemetry database offline for maintenance.',
      },
    })

    render(
      <PlatformServicesProvider services={errorServices}>
        <HookInspector />
      </PlatformServicesProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
    })

    expect(screen.getByTestId('error-state')).toHaveTextContent(
      'Telemetry database offline for maintenance.',
    )
  })
})

describe('Page presentation components', () => {
  it('renders PageShell with loading state', () => {
    render(
      <PageShell
        title="Telemetry Test"
        isLoading={true}
        loadingMessage="Connecting to Deep Space Network..."
      >
        <div>Content that should not be visible yet</div>
      </PageShell>,
    )

    expect(
      screen.getByText('Connecting to Deep Space Network...'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Content that should not be visible yet'),
    ).not.toBeInTheDocument()
  })

  it('renders PageShell with error and retry button', async () => {
    const user = userEvent.setup()
    let retried = false

    render(
      <PageShell
        title="Telemetry Test"
        error={{ message: 'Satellite downlink lost.' }}
        onRetry={() => {
          retried = true
        }}
      />,
    )

    expect(screen.getByText('Telemetry Error')).toBeInTheDocument()
    expect(screen.getByText('Satellite downlink lost.')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    await user.click(retryButton)
    expect(retried).toBe(true)
  })

  it('renders MissionControlHero with rank and level', () => {
    const profile = {
      explorerId: 'exp-test',
      kind: 'registered' as const,
      nickname: 'Major Tom',
      avatarId: 'cadet-1' as const,
      totalXp: 240,
      rank: {
        level: 3,
        id: 'planetary-explorer' as const,
        name: 'Planetary Explorer',
        minXp: 200,
        totalXp: 240,
        nextRankId: 'mission-specialist' as const,
        nextRankName: 'Mission Specialist',
        nextRankMinXp: 300,
        xpUntilNextRank: 60,
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }

    render(<MissionControlHero profile={profile} xpSummary={null} />)

    expect(screen.getByText('Major Tom')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('Planetary Explorer')).toBeInTheDocument()
    expect(screen.getByText('Total XP:')).toBeInTheDocument()
    expect(screen.getByText('60 XP')).toBeInTheDocument()
  })

  it('renders StatCard and StatusBanner', () => {
    render(
      <div>
        <StatCard label="Orbital Velocity" value="7.8 km/s" detail="Low Earth Orbit" />
        <StatusBanner
          variant="info"
          title="Telemetry Link Active"
          message="Receiving telemetry packets."
        />
      </div>,
    )

    expect(screen.getByText('Orbital Velocity')).toBeInTheDocument()
    expect(screen.getByText('7.8 km/s')).toBeInTheDocument()
    expect(screen.getByText('Telemetry Link Active')).toBeInTheDocument()
    expect(screen.getByText('Receiving telemetry packets.')).toBeInTheDocument()
  })
})

describe('DashboardPage presentation against mock services', () => {
  it('renders complete Mission Control dashboard for registered persona', async () => {
    render(
      <MemoryRouter>
        <PlatformServicesProvider initialPersona="registered">
          <DashboardPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    // Heading exists
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mission Control' }),
    ).toBeInTheDocument()

    // Explorer profile from mock services
    expect(screen.getByText('Nova Cadet')).toBeInTheDocument()
    expect(screen.getAllByText('Lunar Explorer').length).toBeGreaterThanOrEqual(1)

    // Telemetry cards
    expect(screen.getByText('Accumulated XP')).toBeInTheDocument()
    expect(screen.getByText('160 XP')).toBeInTheDocument()

    // Mission cards are rendered with links
    expect(screen.getByRole('link', { name: 'Surveyor 3' })).toHaveAttribute(
      'href',
      '/missions/surveyor-3',
    )
    expect(screen.getByRole('link', { name: 'Pioneer 10' })).toHaveAttribute(
      'href',
      '/missions/pioneer-10',
    )
    expect(screen.getByRole('link', { name: 'Opportunity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ingenuity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'InSight' })).toBeInTheDocument()

    // Progress badges match seeded mock data
    expect(screen.getByText('Completed')).toBeInTheDocument() // Ingenuity
    expect(screen.getByText('In Progress')).toBeInTheDocument() // Surveyor 3
  })

  it('switches personas via the PersonaSwitcher', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PlatformServicesProvider initialPersona="registered">
          <DashboardPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nova Cadet')).toBeInTheDocument()

    // Switch to guest persona
    const guestButton = screen.getByRole('button', { name: 'Guest Explorer' })
    await user.click(guestButton)

    // Nickname and guest badge should update
    await waitFor(() => {
      expect(screen.getByText('Guest Cadet')).toBeInTheDocument()
      expect(screen.getAllByText('Space Cadet').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Guest Session Active')).toBeInTheDocument()
    })
  })
})
