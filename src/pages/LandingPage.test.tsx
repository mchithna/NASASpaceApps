import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { listMissions } from '@/missions/registry.ts'
import { LandingPage } from '@/pages/LandingPage.tsx'

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/onboarding"
          element={<div data-testid="onboarding-dest">Explorer Onboarding</div>}
        />
        <Route
          path="/dashboard"
          element={<div data-testid="dashboard-dest">Mission Control Dashboard</div>}
        />
        <Route
          path="/auth"
          element={<div data-testid="auth-dest">Sign In Page</div>}
        />
        <Route
          path="/missions/:missionId"
          element={<div data-testid="mission-dest">Mission Details</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LandingPage component', () => {
  it('renders the hero headline, subtitle, and challenge banner', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', { level: 1, name: 'NovaExplorer' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Discover the stories that space left behind.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('NASA Space Apps Challenge 2026'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Abandoned But Not Forgotten'),
    ).toBeInTheDocument()
  })

  it('renders call-to-action buttons connecting to appropriate routes', async () => {
    const user = userEvent.setup()
    renderLanding()

    // Check Begin Exploring CTA
    const beginCta = screen.getByRole('link', { name: 'Begin Exploring' })
    expect(beginCta).toHaveAttribute('href', '/onboarding')

    // Check Mission Control link
    const mcLink = screen.getByRole('link', { name: 'Mission Control' })
    expect(mcLink).toHaveAttribute('href', '/dashboard')

    // Check Sign in link
    const signInLink = screen.getByRole('link', { name: 'Sign in' })
    expect(signInLink).toHaveAttribute('href', '/auth')

    // Click Begin Exploring and verify navigation
    await user.click(beginCta)
    expect(screen.getByTestId('onboarding-dest')).toBeInTheDocument()
  })

  it('dynamically renders all five registered missions with accessible images and links', () => {
    renderLanding()
    const registeredMissions = listMissions()

    expect(registeredMissions).toHaveLength(5)

    for (const mission of registeredMissions) {
      // Check display name
      expect(
        screen.getByRole('heading', { level: 3, name: mission.displayName }),
      ).toBeInTheDocument()

      // Check destination badge
      expect(screen.getAllByText(mission.destination).length).toBeGreaterThanOrEqual(1)

      // Check chapter title
      expect(screen.getByText(mission.chapterTitle)).toBeInTheDocument()

      // Check accessible image
      const image = screen.getByRole('img', {
        name: `Cover illustration representing the ${mission.displayName} mission`,
      })
      expect(image).toHaveAttribute('src', mission.coverImage)

      // Check link to mission overview
      const inspectLink = screen.getByRole('link', {
        name: `Inspect ${mission.displayName} mission overview`,
      })
      expect(inspectLink).toHaveAttribute('href', `/missions/${mission.id}`)
    }
  })

  it('renders the four-step "How NovaExplorer Works" educational section', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', { level: 2, name: 'How NovaExplorer Works' }),
    ).toBeInTheDocument()

    expect(screen.getByText('1. Choose a Story')).toBeInTheDocument()
    expect(screen.getByText('2. Investigate Science')).toBeInTheDocument()
    expect(screen.getByText('3. Earn Academy XP')).toBeInTheDocument()
    expect(screen.getByText('4. Fill Your Journal')).toBeInTheDocument()
  })

  it('renders scientific integrity notice and NASA disclaimer', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Scientific Integrity & NASA Sources',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/All spacecraft specifications, operational timelines/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not officially endorsed by NASA/i),
    ).toBeInTheDocument()
  })
})
