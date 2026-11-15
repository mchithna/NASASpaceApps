import { render, screen, within } from '@testing-library/react'
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
  it('renders the cinematic hero headline, supporting narrative, and challenge banners', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', { level: 1, name: /Some Missions End/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Journey through the extraordinary stories of five NASA spacecraft/i),
    ).toBeInTheDocument()

    expect(
      screen.getByText('NASA EDUCATIONAL EXPERIENCE'),
    ).toBeInTheDocument()

    expect(
      screen.getAllByText(/Abandoned But Not Forgotten/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders call-to-action buttons connecting to onboarding, mission control, and sign in', async () => {
    const user = userEvent.setup()
    renderLanding()

    // Check Begin Your Journey CTA
    const beginCta = screen.getByRole('link', { name: 'Begin Your Journey' })
    expect(beginCta).toHaveAttribute('href', '/onboarding')

    // Check Mission Control link
    const mcLinks = screen.getAllByRole('link', { name: /Mission Control/i })
    expect(mcLinks.some((l) => l.getAttribute('href') === '/dashboard')).toBe(true)

    // Check Login link
    const loginLinks = screen.getAllByRole('link', { name: 'Login' })
    expect(loginLinks.some((l) => l.getAttribute('href') === '/auth')).toBe(true)

    // Click Begin Your Journey and verify navigation
    await user.click(beginCta)
    expect(screen.getByTestId('onboarding-dest')).toBeInTheDocument()
  })

  it('dynamically renders all five registered missions with accessible images, titles, and links', () => {
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
      expect(image).toBeInTheDocument()

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

    expect(screen.getByText('Create Explorer Profile')).toBeInTheDocument()
    expect(screen.getAllByText('Explore Missions').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Complete Challenges')).toBeInTheDocument()
    expect(screen.getByText('Earn XP & Achievements')).toBeInTheDocument()
  })

  it('renders scientific integrity notice and NASA attribution', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Scientific Integrity & NASA Sources/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/All spacecraft specifications, operational timelines/i),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/not officially endorsed by NASA/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders the floating navigation bar with brand logo and quick links', () => {
    renderLanding()

    const nav = screen.getByRole('navigation', { name: 'Main Navigation' })
    expect(nav).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'NovaExplorer Home' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'Explore Missions' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'How It Works' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'About' })).toBeInTheDocument()
  })


  it('renders the footer with official NASA resources and challenge credits', () => {
    renderLanding()

    expect(screen.getByRole('link', { name: /NASA Science/i })).toHaveAttribute(
      'href',
      'https://science.nasa.gov',
    )
    expect(screen.getByRole('link', { name: /NASA Jet Propulsion Laboratory/i })).toHaveAttribute(
      'href',
      'https://www.jpl.nasa.gov',
    )
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()
  })
})
