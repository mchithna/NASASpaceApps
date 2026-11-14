import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '@/app/App.tsx'
import { appRoutes } from '@/app/router.tsx'

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('application routes', () => {
  it('renders the home page through the application shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'NovaExplorer' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('opens Mission Control from the home page', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'Mission Control',
      }),
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mission Control' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Surveyor 3' })).toHaveAttribute(
      'href',
      '/missions/surveyor-3',
    )
    expect(screen.getByRole('link', { name: 'Pioneer 10' })).toBeInTheDocument()
  })

  it('shows the not-found page for an unknown address', () => {
    renderRoute('/does-not-exist')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('shows mission metadata for a known mission', () => {
    renderRoute('/missions/opportunity')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Opportunity' }),
    ).toBeInTheDocument()
    const destination = screen.getByText('Destination:').closest('p')
    if (!destination) {
      throw new Error('Destination text is missing its paragraph.')
    }
    expect(destination).toHaveTextContent('Destination: Mars')
    expect(
      screen.getByText('Mission gameplay is not implemented yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Placeholder cover. A NASA photograph is not shown yet.',
      }),
    ).toHaveAttribute('src', '/assets/missions/opportunity/cover.svg')
  })

  it('shows the play placeholder for a known mission', () => {
    renderRoute('/missions/insight/play')

    expect(
      screen.getByRole('heading', { level: 1, name: 'InSight' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to overview' }),
    ).toHaveAttribute('href', '/missions/insight')
  })

  it('uses the not-found page for an unknown mission id', () => {
    renderRoute('/missions/apollo-11/play')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/apollo-11/)).not.toBeInTheDocument()
  })
})
