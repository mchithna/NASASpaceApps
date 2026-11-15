import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { AchievementsPage } from '@/pages/AchievementsPage.tsx'
import { JournalPage } from '@/pages/JournalPage.tsx'
import { ProfilePage } from '@/pages/ProfilePage.tsx'
import { PlatformServicesProvider } from '@/pages/context/index.ts'

function renderProfilePage(persona: 'registered' | 'guest' | 'signed-out' = 'registered') {
  const services = createMockServices({ persona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/profile']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<div>Auth Page</div>} />
            <Route path="/onboarding" element={<div>Onboarding Page</div>} />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

function renderAchievementsPage(persona: 'registered' | 'guest' | 'signed-out' = 'registered') {
  const services = createMockServices({ persona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/achievements']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/missions/:missionId" element={<div>Mission Dossier</div>} />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

function renderJournalPage(persona: 'registered' | 'guest' | 'signed-out' = 'registered') {
  const services = createMockServices({ persona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/journal']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

describe('ProfilePage presentation and interactions', () => {
  it('renders explorer profile data, rank progression, and mission statistics', async () => {
    renderProfilePage('registered')

    expect(await screen.findByRole('heading', { level: 1, name: 'Explorer Profile' })).toBeInTheDocument()
    expect(await screen.findByText('Nova Cadet')).toBeInTheDocument()
    expect(screen.getAllByText('Lunar Explorer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('160 XP')).toBeInTheDocument()
    expect(screen.getByText('60 / 100 XP to Planetary Explorer')).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('updates nickname and avatar successfully via mock explorer service', async () => {
    const user = userEvent.setup()
    const { services } = renderProfilePage('registered')

    await screen.findByRole('heading', { level: 1, name: 'Explorer Profile' })
    const input = screen.getByLabelText(/callsign/i)
    await waitFor(() => expect(input).toHaveValue('Nova Cadet'))

    await user.clear(input)
    await user.type(input, 'AstroPioneer')

    const roverRadio = screen.getByRole('radio', { name: /Mars Rover Pilot/i })
    await user.click(roverRadio)

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Explorer profile updated successfully/i)).toBeInTheDocument()
    })

    // Check service state
    const profileRes = await services.explorer.getProfile()
    if (profileRes.ok && profileRes.data) {
      expect(profileRes.data.nickname).toBe('AstroPioneer')
      expect(profileRes.data.avatarId).toBe('cadet-2')
    }
  })

  it('validates nickname format and disables saving on invalid callsign', async () => {
    const user = userEvent.setup()
    renderProfilePage('registered')

    await screen.findByRole('heading', { level: 1, name: 'Explorer Profile' })
    const input = screen.getByLabelText(/callsign/i)
    await waitFor(() => expect(input).toHaveValue('Nova Cadet'))

    await user.clear(input)
    await user.type(input, 'x') // too short (< 2 chars)

    expect(screen.getByText(/Use a nickname between 2 and 20 characters/i)).toBeInTheDocument()

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    expect(saveButton).toBeDisabled()
  })

  it('displays guest banner with option to upgrade when logged in as guest', async () => {
    renderProfilePage('guest')

    expect(await screen.findByText('Guest Explorer Session')).toBeInTheDocument()
    expect(screen.getByText(/Development mock visit. Guest progress and profile changes stay in memory/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Create a separate account/i })).toBeInTheDocument()
  })

  it('displays signed out status banner when session is signed out', async () => {
    renderProfilePage('signed-out')

    expect(await screen.findByText('Signed Out')).toBeInTheDocument()
    expect(screen.getByText(/You are currently exploring without an active identity/i)).toBeInTheDocument()
  })
})

describe('AchievementsPage presentation', () => {
  it('renders chapter badges showcase and progression', async () => {
    renderAchievementsPage('registered')

    expect(await screen.findByRole('heading', { level: 1, name: 'Achievements' })).toBeInTheDocument()
    expect(screen.getByText('Academy Story Honors')).toBeInTheDocument()
    expect(screen.getByText('Total Unlocked')).toBeInTheDocument()
    expect(screen.getByText('1 of 6')).toBeInTheDocument()

    // Ingenuity should be unlocked in registered mock
    expect(screen.getByText('Unlocked')).toBeInTheDocument()
    expect(screen.getByText('15 XP Legacy Awarded')).toBeInTheDocument()

    // Supreme honor
    expect(screen.getByText('Guardian of Forgotten Worlds')).toBeInTheDocument()
    expect(screen.getByText('1 / 5 Chapters')).toBeInTheDocument()
    expect(screen.getByText('4 chapters remaining')).toBeInTheDocument()
  })

  it('renders empty state when zero achievements are unlocked', async () => {
    renderAchievementsPage('signed-out')

    expect(await screen.findByRole('heading', { level: 1, name: 'Achievements' })).toBeInTheDocument()
    expect(screen.getByText('No Story Achievements Unlocked Yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Go to Mission Control/i })).toBeInTheDocument()
  })
})

describe('JournalPage presentation and filtering', () => {
  it('renders journal entries with simulation status and authentic NASA archival links', async () => {
    renderJournalPage('registered')

    expect(await screen.findByRole('heading', { level: 1, name: 'Discovery Journal' })).toBeInTheDocument()
    expect(screen.getByText('Spacecraft Field Dossiers')).toBeInTheDocument()
    expect(screen.getByText('Total Findings')).toBeInTheDocument()

    // Verify Ingenuity notes from registered mock seed
    expect(screen.getByText('Placeholder: Ingenuity')).toBeInTheDocument()
    expect(screen.getByText('Simulation Note')).toBeInTheDocument()
    expect(screen.getByText(/Academy Simulation Note:/i)).toBeInTheDocument()

    // NASA source citations
    expect(screen.getByText('Official NASA Sources & Archival Records')).toBeInTheDocument()
    const nasaLink = screen.getByRole('link', { name: /Ingenuity Mars Helicopter/i })
    expect(nasaLink).toHaveAttribute('target', '_blank')
    expect(nasaLink).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('filters discoveries by mission and search input', async () => {
    const user = userEvent.setup()
    renderJournalPage('registered')

    await screen.findByRole('heading', { level: 1, name: 'Discovery Journal' })
    expect(screen.getByText('Placeholder: Ingenuity')).toBeInTheDocument()

    // Click on Surveyor 3 filter button (which has 0 entries in mock)
    const surveyorFilter = screen.getByRole('button', { name: /Surveyor 3 \(0\)/i })
    await user.click(surveyorFilter)

    expect(screen.queryByText('Placeholder: Ingenuity')).not.toBeInTheDocument()
    expect(screen.getByText('No matching records found')).toBeInTheDocument()

    // Reset filters
    const clearBtn = screen.getByRole('button', { name: /Clear filters and search/i })
    await user.click(clearBtn)

    expect(screen.getByText('Placeholder: Ingenuity')).toBeInTheDocument()

    // Filter via search input
    const searchInput = screen.getByRole('searchbox', { name: /Search journal findings/i })
    await user.type(searchInput, 'HelicopterNonExistent')

    expect(screen.queryByText('Placeholder: Ingenuity')).not.toBeInTheDocument()
    expect(screen.getByText('No matching records found')).toBeInTheDocument()
  })

  it('renders empty state when there are zero discoveries in the journal', async () => {
    renderJournalPage('signed-out')

    expect(await screen.findByRole('heading', { level: 1, name: 'Discovery Journal' })).toBeInTheDocument()
    expect(screen.getByText('No Discoveries Logged Yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Go to Mission Control/i })).toBeInTheDocument()
  })
})
