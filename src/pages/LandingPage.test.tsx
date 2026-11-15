import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { listMissions } from '@/missions/registry.ts'
import { LandingPage } from '@/pages/LandingPage.tsx'
import { landingMedia } from '@/pages/components/landing/landingMedia.ts'

function renderLanding() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<h1>Explorer Onboarding</h1>} />
        <Route path="/dashboard" element={<h1>Mission Control</h1>} />
        <Route path="/auth" element={<h1>Sign In Page</h1>} />
        <Route path="/missions/:missionId" element={<h1>Mission Details</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('has one descriptive h1 and honest availability and attribution', () => {
    renderLanding()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "Some Missions End.Their Stories Don't.",
    )
    expect(
      screen.getByText(
        /Journey through the extraordinary stories of five NASA spacecraft/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('NASA EDUCATIONAL EXPERIENCE')).toBeInTheDocument()
    expect(
      screen.getByText(/Interactive story chapters are in development/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not officially endorsed by NASA/),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Archival Telemetry Streams/),
    ).not.toBeInTheDocument()
  })
  it('opens onboarding and exposes valid auth and dashboard links', async () => {
    const user = userEvent.setup()
    renderLanding()
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
      'href',
      '/auth',
    )
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute(
      'href',
      '/auth',
    )
    expect(
      screen.getByRole('link', { name: 'Mission Control' }),
    ).toHaveAttribute('href', '/dashboard')
    await user.click(screen.getByRole('link', { name: 'Begin Your Journey' }))
    expect(
      screen.getByRole('heading', { name: 'Explorer Onboarding' }),
    ).toBeInTheDocument()
  })
  it('renders precisely the registry missions with full-card links, descriptions and lazy responsive images', () => {
    renderLanding()
    const section = screen.getByRole('region', { name: 'Featured Missions' })
    expect(within(section).getAllByRole('article')).toHaveLength(5)
    for (const mission of listMissions()) {
      expect(
        within(section).getByRole('heading', {
          level: 3,
          name: mission.displayName,
        }),
      ).toBeInTheDocument()
      expect(
        within(section).getByText(mission.chapterTitle),
      ).toBeInTheDocument()
      expect(within(section).getByText(mission.description)).toBeInTheDocument()
      expect(
        within(section).getByRole('link', {
          name: `Explore ${mission.displayName}: ${mission.chapterTitle}`,
        }),
      ).toHaveAttribute('href', `/missions/${mission.id}`)
      const image = within(section).getByRole('img', {
        name: landingMedia[mission.id].alt,
      })
      expect(image).toHaveAttribute('loading', 'lazy')
      expect(image).toHaveAttribute(
        'srcset',
        expect.stringMatching(/\.webp \d+w, .*\.webp \d+w/),
      )
      expect(image).toHaveAttribute('width', '480')
    }
  })
  it('keeps mission navigation available when an image cannot load', async () => {
    const user = userEvent.setup()
    renderLanding()
    fireEvent.error(
      screen.getByRole('img', { name: landingMedia.opportunity.alt }),
    )
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    await user.click(
      screen.getByRole('link', {
        name: `Explore Opportunity: ${listMissions()[1].chapterTitle}`,
      }),
    )
    expect(
      screen.getByRole('heading', { name: 'Mission Details' }),
    ).toBeInTheDocument()
  })
  it('supports the menu disclosure, Escape focus restoration, and closing after choosing a section', async () => {
    const user = userEvent.setup()
    renderLanding()
    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const menu = document.getElementById('landing-menu')!
    within(menu).getByRole('link', { name: 'About' }).focus()
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    await user.click(toggle)
    await user.click(
      within(document.getElementById('landing-menu')!).getByRole('link', {
        name: 'Explore Missions',
      }),
    )
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('featured-missions')).toHaveFocus()
  })
  it('uses immediate anchor scrolling for reduced motion and opens image credits', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    renderLanding()
    const target = document.getElementById('featured-missions')!
    const scroll = vi.fn()
    target.scrollIntoView = scroll
    await user.click(
      screen.getByRole('link', { name: 'Discover the missions' }),
    )
    expect(scroll).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
    await user.click(screen.getByRole('link', { name: /Illustrative scene/ }))
    expect(document.getElementById('image-credits')).toHaveAttribute('open')
    expect(screen.getByText(/No AI-generated imagery is used/)).toBeVisible()
    vi.unstubAllGlobals()
  })
  it('shows all four process steps and official NASA resource links', () => {
    renderLanding()
    const process = screen.getByRole('region', { name: 'How It Works' })
    expect(within(process).getAllByRole('listitem')).toHaveLength(4)
    for (const title of [
      'Create Explorer Profile',
      'Explore Missions',
      'Complete Challenges',
      'Earn XP & Achievements',
    ]) {
      expect(
        within(process).getByRole('heading', { name: title }),
      ).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'NASA Science' })).toHaveAttribute(
      'href',
      'https://science.nasa.gov',
    )
    expect(
      screen.getByRole('link', {
        name: 'NASA Jet Propulsion Laboratory',
      }),
    ).toHaveAttribute('href', 'https://www.jpl.nasa.gov')
    expect(screen.getByRole('link', { name: 'Back to top' })).toHaveAttribute(
      'href',
      '#home',
    )
  })
})
