import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders.tsx'
import { appRoutes } from '@/app/router.tsx'
import {
  createActivityRegistry,
  defineActivity,
} from '@/engine/activityRegistry.ts'
import { createStructuralFixture } from '@/engine/fixture.ts'
import { loadMissionChapter } from '@/missions/chapter.ts'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { serviceError } from '@/contracts/result.ts'

vi.mock('@/missions/chapter.ts', () => ({ loadMissionChapter: vi.fn() }))

function fixtureChapter() {
  const registered = createActivityRegistry([
    defineActivity('fixture-check', (props) => (
      <button
        onClick={() => {
          props.onComplete()
          props.onComplete()
        }}
      >
        Finish test activity
      </button>
    )),
  ])
  if (!registered.ok) throw new Error('Test registration failed')
  return { module: createStructuralFixture(), activities: registered.value }
}

function open(
  path: string,
  services = createMockServices({ persona: 'guest' }),
) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  const view = render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...view, router, services }
}

beforeEach(() => {
  vi.mocked(loadMissionChapter).mockResolvedValue(fixtureChapter())
})

describe('mission route integration (explicit isolated services, no production stories)', () => {
  it('starts from overview, resumes after remount, completes, exits, shares rewards, and replays', async () => {
    const user = userEvent.setup()
    const first = open('/missions/surveyor-3')
    await user.click(await screen.findByRole('link', { name: 'Start mission' }))
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { level: 2, name: 'Fixture evidence' })
    first.unmount()
    // A new player and runtime re-read the service rather than trusting local state.
    const resumed = open('/missions/surveyor-3/play', first.services)
    await screen.findByRole('heading', { level: 2, name: 'Fixture evidence' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(
      await screen.findByRole('button', { name: 'Finish test activity' }),
    )
    await screen.findByRole('heading', { level: 2, name: 'Fixture discovery' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { level: 2, name: 'Fixture ending' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled(),
    )
    const xp = await resumed.services.rewards.getXpSummary()
    expect(xp.ok && xp.data.totalXp).toBe(100)
    const journal = await resumed.services.rewards.listJournalEntries()
    expect(journal.ok && journal.data.length).toBe(1)
    const achievements = await resumed.services.rewards.listAchievements()
    expect(
      achievements.ok &&
        achievements.data.filter((item) => item.unlockedAt).length,
    ).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Exit mission' }))
    await screen.findByRole('heading', { name: 'Mission Control' })
    expect(screen.getAllByText('100 XP').length).toBeGreaterThan(0)
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(resumed.router.state.location.pathname).toBe('/dashboard')
    resumed.unmount()
    open('/missions/surveyor-3', first.services)
    await user.click(
      await screen.findByRole('link', { name: 'Replay mission' }),
    )
    await user.click(await screen.findByRole('button', { name: 'Start again' }))
    await screen.findByRole('heading', { level: 2, name: 'Fixture opening' })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const after = await first.services.rewards.getXpSummary()
    expect(after.ok && after.data.events.length).toBe(4)
  }, 30000)

  it('shows recoverable save failures and rejects undefined saved scenes', async () => {
    const user = userEvent.setup()
    const services = createMockServices({ persona: 'guest' })
    const save = vi.spyOn(services.progress, 'saveCheckpoint')
    save.mockResolvedValueOnce(
      serviceError('unavailable', 'Connection interrupted. Try again.'),
    )
    const view = open('/missions/surveyor-3/play', services)
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await screen.findByText('Connection interrupted. Try again.')
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await screen.findByRole('heading', { level: 2, name: 'Fixture opening' })
    view.unmount()
    await services.progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'undefined-scene',
    })
    open('/missions/surveyor-3/play', services)
    await screen.findByText('That scene is not part of this mission.')
    expect(
      screen.queryByRole('button', { name: 'Start' }),
    ).not.toBeInTheDocument()
  }, 15000)

  it('keeps missing content empty and rejects training as a public mission', async () => {
    vi.mocked(loadMissionChapter).mockResolvedValue(null)
    const view = open('/missions/surveyor-3/play')
    await screen.findByText(/This chapter is being prepared/)
    const xp = await view.services.rewards.getXpSummary()
    expect(xp.ok && xp.data.totalXp).toBe(0)
    view.unmount()
    open('/missions/training-simulator/play')
    expect(
      screen.getByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
