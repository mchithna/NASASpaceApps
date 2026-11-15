import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CompanionMount } from './CompanionMount.tsx'

const boundary = vi.hoisted(() => ({
  route: '/',
  authChanged: null as (() => void) | null,
  routeChanged: null as (() => void) | null,
}))

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
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).toHaveClass('open')

  // Auth changed event triggers remount, closing panel
  act(() => boundary.authChanged?.())
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).not.toHaveClass('open')

  // Navigation updates route and mission context
  act(() => {
    boundary.route = '/missions/ingenuity'
    boundary.routeChanged?.()
  })

  await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))
  expect(screen.getByRole('dialog', { name: 'Nova AI chat' })).toHaveClass('open')

  view.unmount()
  expect(boundary.authChanged).toBeNull()
  expect(boundary.routeChanged).toBeNull()
}, 30000)
