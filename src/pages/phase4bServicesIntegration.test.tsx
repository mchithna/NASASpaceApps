import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppLayout } from '@/components/layout/AppLayout.tsx'
import { createPlayerServices } from '@/features/index.ts'
import { AchievementsPage } from '@/pages/AchievementsPage.tsx'
import { AuthPage } from '@/pages/AuthPage.tsx'
import { DashboardPage } from '@/pages/DashboardPage.tsx'
import { JournalPage } from '@/pages/JournalPage.tsx'
import { OnboardingPage } from '@/pages/OnboardingPage.tsx'
import { ProfilePage } from '@/pages/ProfilePage.tsx'
import { PlatformServicesProvider } from '@/pages/context/index.ts'

describe('Phase 4B Step 3: Platform UI wired to real Phase 2 Player Services', () => {
  it('wires guest onboarding and profile setup to real player services', async () => {
    const user = userEvent.setup()
    const services = createPlayerServices()

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-screen">Mission Control</div>}
            />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    // Wait for OnboardingPage to initialize guest session
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Explorer Setup' }),
    ).toBeInTheDocument()

    // Callsign input should default to Guest Cadet
    const callsignInput = await screen.findByLabelText(/Choose Callsign/i)
    await waitFor(() => {
      expect(callsignInput).toHaveValue('Guest Cadet')
    })

    // Guest recovery warning should be visible
    expect(
      screen.getByText(/Anonymous guest sessions cannot be recovered/i),
    ).toBeInTheDocument()

    // Customize callsign and avatar
    await user.clear(callsignInput)
    await user.type(callsignInput, 'Cosmic Pathfinder')

    const pioneerAvatar = screen.getByRole('radio', {
      name: /Deep Space Pioneer/i,
    })
    await user.click(pioneerAvatar)

    const submitBtn = screen.getByRole('button', {
      name: /Save Profile & Enter Mission Control/i,
    })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
    })

    // Verify persisted state in real Phase 2 explorer service
    const savedProfile = await services.explorer.getProfile()
    expect(savedProfile.ok).toBe(true)
    if (savedProfile.ok) {
      expect(savedProfile.data.nickname).toBe('Cosmic Pathfinder')
      expect(savedProfile.data.avatarId).toBe('cadet-3')
      expect(savedProfile.data.kind).toBe('guest')
      expect(savedProfile.data.totalXp).toBe(0)
    }
  })

  it('drives Mission Control dashboard from real profile, rank, XP, and mission progress', async () => {
    const services = createPlayerServices()
    await services.auth.startGuestSession()
    await services.explorer.saveProfile({
      nickname: 'Nova Voyager',
      avatarId: 'cadet-1',
    })

    // Progress surveyor-3 to in-progress with 20 XP
    await services.progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'opening',
    })
    await services.rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'introduction',
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/missions/:missionId/play" element={<div>Play</div>} />
            <Route path="/missions/:missionId" element={<div>Dossier</div>} />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    // Heading & Explorer Profile Hero
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mission Control' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Nova Voyager')).toBeInTheDocument()
    expect(screen.getByText('20 XP')).toBeInTheDocument()
    expect(screen.getByText('Guest Session Active')).toBeInTheDocument()
    expect(screen.getByText('Operational telemetry')).toBeInTheDocument()

    // Active Mission Spotlight for in-progress Surveyor 3
    expect(
      screen.getByRole('heading', { level: 2, name: 'Continue Active Mission' }),
    ).toBeInTheDocument()

    // 5 Mission Cards from registry
    const surveyorCards = screen.getAllByRole('heading', {
      level: 3,
      name: 'Surveyor 3',
    })
    expect(surveyorCards.length).toBeGreaterThanOrEqual(1)

    // Surveyor 3 action CTA should be "Continue Mission"
    const continueBtn = screen.getAllByRole('link', {
      name: /Continue Mission for Surveyor 3/i,
    })
    expect(continueBtn.length).toBeGreaterThanOrEqual(1)
    expect(continueBtn[0]).toHaveAttribute('href', '/missions/surveyor-3/play')

    // Opportunity should be Not Started -> "Begin Story"
    const beginBtn = screen.getByRole('link', {
      name: /Begin Story for Opportunity/i,
    })
    expect(beginBtn).toHaveAttribute('href', '/missions/opportunity')
  })

  it('updates dashboard actions to Replay Story and displays completed metrics on mission completion', async () => {
    const services = createPlayerServices()
    await services.auth.startGuestSession()
    await services.progress.saveCheckpoint({
      missionId: 'ingenuity',
      checkpointId: 'flight-logs',
    })
    await services.progress.completeMission({ missionId: 'ingenuity' })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <DashboardPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { level: 1, name: 'Mission Control' })

    // Missions Completed metric should now show 1 / 5
    expect(screen.getByText('1 / 5')).toBeInTheDocument()

    // Ingenuity action CTA should be "Replay Story"
    const replayBtn = screen.getByRole('link', {
      name: /Replay Story for Ingenuity/i,
    })
    expect(replayBtn).toHaveAttribute('href', '/missions/ingenuity/play')
  })

  it('wires AchievementsPage and Discovery Journal to real rewards service methods', async () => {
    const services = createPlayerServices()
    await services.auth.startGuestSession()

    // Complete Opportunity mission (unlocks opportunity-story achievement + 15 XP)
    await services.progress.saveCheckpoint({
      missionId: 'opportunity',
      checkpointId: 'endurance-crater',
    })
    await services.progress.completeMission({ missionId: 'opportunity' })

    // Unlock a discovery entry
    await services.rewards.unlockDiscovery({
      missionId: 'opportunity',
      discoveryId: 'opportunity-notes',
    })

    // Test Achievements Page
    const { unmount } = render(
      <MemoryRouter initialEntries={['/achievements']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <AchievementsPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Achievements' }),
    ).toBeInTheDocument()

    // Opportunity Story should be unlocked
    expect(screen.getByText('Opportunity Story')).toBeInTheDocument()
    expect(screen.getByText('Unlocked')).toBeInTheDocument()
    expect(screen.getByText('15 XP Legacy Awarded')).toBeInTheDocument()

    unmount()

    // Test Journal Page
    render(
      <MemoryRouter initialEntries={['/journal']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <JournalPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Discovery Journal' }),
    ).toBeInTheDocument()

    // Journal should show 1 finding
    expect(screen.getByText('Total Findings')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Opportunity \(1\)/i })).toBeInTheDocument()
    expect(screen.getByText('Placeholder: Opportunity')).toBeInTheDocument()
  })

  it('supports signout from AppLayout and ProfilePage, safely navigating without crashes', async () => {
    const user = userEvent.setup()
    const services = createPlayerServices()
    await services.auth.startGuestSession()
    await services.explorer.saveProfile({ nickname: 'Departure Cadet' })

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <Routes>
            <Route path="/" element={<div>Home Landing Screen</div>} />
            <Route element={<AppLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Explorer Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Departure Cadet')).toBeInTheDocument()

    // Locate the End Guest Session button in the Profile session card
    const endSessionBtns = screen.getAllByRole('button', {
      name: /End Guest Session/i,
    })
    expect(endSessionBtns.length).toBeGreaterThanOrEqual(1)

    // Click End Guest Session
    await user.click(endSessionBtns[0])

    // Should navigate cleanly to '/'
    await waitFor(() => {
      expect(screen.getByText('Home Landing Screen')).toBeInTheDocument()
    })

    // Verify auth session is now signed-out
    const currentSession = await services.auth.getSession()
    expect(currentSession.ok && currentSession.data.status).toBe('signed-out')
  })

  it('displays guest recovery limitations clearly on Auth and Profile pages', async () => {
    const services = createPlayerServices()

    // 1. Auth Page Guest Option Warning
    const { unmount } = render(
      <MemoryRouter initialEntries={['/auth']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <AuthPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/Guest Recovery Limitation:/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Anonymous guest sessions are tied to this browser only and cannot be recovered/i,
      ),
    ).toBeInTheDocument()

    unmount()

    // 2. Profile Page Guest Warning
    await services.auth.startGuestSession()
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <ProfilePage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Guest Explorer Session'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /You are operating under a local guest session. Your callsign and flight insignia are kept in memory/i,
      ),
    ).toBeInTheDocument()
  })

  it('gracefully handles service errors with visible retry mechanism', async () => {
    const user = userEvent.setup()
    const services = createPlayerServices()
    await services.auth.startGuestSession()

    let shouldFail = true
    const realGetProfile = services.explorer.getProfile.bind(services.explorer)
    services.explorer.getProfile = async () => {
      if (shouldFail) {
        return {
          ok: false,
          error: {
            code: 'unavailable',
            message: 'Deep Space Network uplink interrupted.',
          },
        }
      }
      return realGetProfile()
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <PlatformServicesProvider services={services} isLive={true}>
          <DashboardPage />
        </PlatformServicesProvider>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Deep Space Network uplink interrupted.'),
    ).toBeInTheDocument()

    // Resolve error and click Retry
    shouldFail = false
    const retryBtn = screen.getByRole('button', { name: 'Retry' })
    await user.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Mission Telemetry')).toBeInTheDocument()
    })
  })
})
