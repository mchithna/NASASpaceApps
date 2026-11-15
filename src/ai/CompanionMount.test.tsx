import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CompanionMount } from './CompanionMount.tsx'
import { useNovaAi } from './context/AiContext.tsx'

const boundary = vi.hoisted(() => ({
  route: '/',
  authChanged: null as (() => void) | null,
  routeChanged: null as (() => void) | null,
}))

vi.mock('./services/aiClient.ts', () => ({
  checkAiHealth: async () => ({
    isConfigured: true,
    provider: 'Test provider',
  }),
  sendChatMessage: async () => ({
    content: 'Shared test answer',
    sources: [],
    suggestedQuestions: [],
    isLive: true,
    model: 'test-model',
  }),
  synthesizeSpeech: vi.fn(),
}))

it('shares routed AI prompts with the companion and clears them on identity changes', async () => {
  const user = userEvent.setup()
  boundary.route = '/missions/opportunity'
  function RoutedAiConsumer() {
    const { route, missionId, ask } = useNovaAi()
    return (
      <>
        <output>{`${route}:${missionId}`}</output>
        <button onClick={() => void ask('A test question')}>
          Ask from page
        </button>
      </>
    )
  }

  render(
    <CompanionMount>
      <RoutedAiConsumer />
    </CompanionMount>,
  )

  expect(screen.getByRole('status')).toHaveTextContent(
    '/missions/opportunity:opportunity',
  )
  expect(screen.getAllByRole('button', { name: 'Ask Nova AI' })).toHaveLength(1)
  await user.click(screen.getByRole('button', { name: 'Ask from page' }))
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).toHaveClass(
    'open',
  )
  expect(await screen.findByText('Shared test answer')).toBeInTheDocument()

  act(() => boundary.authChanged?.())
  expect(screen.queryByText('Shared test answer')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ask Nova AI' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
}, 30000)

vi.mock('@/app/router.tsx', () => ({
  router: {
    get state() {
      return { location: { pathname: boundary.route } }
    },
    subscribe: (listener: () => void) => {
      boundary.routeChanged = listener
      return () => {
        boundary.routeChanged = null
      }
    },
  },
}))
vi.mock('@/pages/context/useNovaServices.ts', () => {
  const services = {
    auth: {
      subscribe: (listener: () => void) => {
        boundary.authChanged = listener
        return () => {
          boundary.authChanged = null
        }
      },
    },
  }
  return { useNovaServices: () => ({ services }) }
})

it('clears conversation on auth notifications and derives new mission context on navigation', async () => {
  const user = userEvent.setup()
  const view = render(<CompanionMount />)

  // Open launcher
  await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).toHaveClass(
    'open',
  )

  // Auth changed event triggers remount, closing panel
  act(() => boundary.authChanged?.())
  expect(screen.getByRole('dialog', { hidden: true })).not.toHaveClass('open')

  // Navigation updates route and mission context
  act(() => {
    boundary.route = '/missions/ingenuity'
    boundary.routeChanged?.()
  })

  await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).toHaveClass(
    'open',
  )

  view.unmount()
  expect(boundary.authChanged).toBeNull()
  expect(boundary.routeChanged).toBeNull()
}, 30000)
