import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs() })
it('does not register development/training routes in production', async () => {
  vi.stubEnv('DEV', false); vi.stubEnv('PROD', true)
  const { appRoutes } = await import('@/app/router.tsx')
  expect(appRoutes.some((route) => route.path?.startsWith('/dev/'))).toBe(false)
  const router = createMemoryRouter(appRoutes, { initialEntries: ['/dev/training-simulator'] })
  render(<RouterProvider router={router} />)
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
})
