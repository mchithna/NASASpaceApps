import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '@/mocks/createMockServices.ts'
import { mockRegisteredCredentials } from '@/mocks/fixtures.ts'
import { AuthPage } from '@/pages/AuthPage.tsx'
import { OnboardingPage } from '@/pages/OnboardingPage.tsx'
import { PlatformServicesProvider } from '@/pages/context/index.ts'

function renderAuthPage(initialPersona: 'signed-out' | 'registered' | 'guest' = 'signed-out') {
  const services = createMockServices({ persona: initialPersona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/auth']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-screen">Mission Control</div>}
            />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

function renderOnboardingPage(initialPersona: 'signed-out' | 'guest' | 'registered' = 'guest') {
  const services = createMockServices({ persona: initialPersona })
  return {
    services,
    ...render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <PlatformServicesProvider services={services}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-screen">Mission Control</div>}
            />
          </Routes>
        </PlatformServicesProvider>
      </MemoryRouter>,
    ),
  }
}

describe('AuthPage presentation and mock service integration', () => {
  it('renders title, guest option, and in-memory prototype notice', () => {
    renderAuthPage('signed-out')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign In to NovaExplorer' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 2, name: 'Continue as Guest' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Development services operate in-memory/i),
    ).toBeInTheDocument()
  })

  it('starts guest session and navigates to dashboard on clicking Guest CTA', async () => {
    const user = userEvent.setup()
    const { services } = renderAuthPage('signed-out')

    const guestButton = screen.getByRole('button', {
      name: /Enter Mission Control as Guest/i,
    })
    await user.click(guestButton)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
    })

    const session = await services.auth.getSession()
    expect(session.ok && session.data.status).toBe('guest')
  })

  it('fills demo credentials and logs in successfully', async () => {
    const user = userEvent.setup()
    const { services } = renderAuthPage('signed-out')

    const fillButton = screen.getByRole('button', {
      name: /Fill Demo Account Credentials/i,
    })
    await user.click(fillButton)

    const emailInput = screen.getByLabelText(/Academy Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    expect(emailInput).toHaveValue(mockRegisteredCredentials.email)
    expect(passwordInput).toHaveValue(mockRegisteredCredentials.password)

    const signInSubmit = screen.getByRole('button', { name: 'Sign In' })
    await user.click(signInSubmit)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
    })

    const session = await services.auth.getSession()
    expect(session.ok && session.data.status).toBe('authenticated')
  })

  it('displays recoverable error alert on incorrect credentials', async () => {
    const user = userEvent.setup()
    renderAuthPage('signed-out')

    const emailInput = screen.getByLabelText(/Academy Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const signInSubmit = screen.getByRole('button', { name: 'Sign In' })
    await user.click(signInSubmit)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(
        screen.getByText('Those sign-in details do not match.'),
      ).toBeInTheDocument()
    })
  })

  it('switches to create account tab and registers a new explorer', async () => {
    const user = userEvent.setup()
    const { services } = renderAuthPage('signed-out')

    const signUpTab = screen.getByRole('tab', { name: /Create Account/i })
    await user.click(signUpTab)

    expect(screen.getByLabelText(/Callsign \/ Nickname/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Callsign \/ Nickname/i), 'Starlight')
    await user.type(screen.getByLabelText(/Academy Email/i), 'starlight@example.com')
    await user.type(screen.getByLabelText(/Password/i), 'securepassword123')

    const registerButton = screen.getByRole('button', {
      name: /Register Profile & Begin/i,
    })
    await user.click(registerButton)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
    })

    const session = await services.auth.getSession()
    expect(session.ok && session.data.status).toBe('authenticated')

    const profile = await services.explorer.getProfile()
    expect(profile.ok && profile.data.nickname).toBe('Starlight')
  })
})

describe('OnboardingPage presentation and mock service integration', () => {
  it('loads profile and populates default callsign and avatar selection', async () => {
    renderOnboardingPage('guest')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Explorer Setup' }),
    ).toBeInTheDocument()

    const nicknameInput = screen.getByLabelText(/Choose Callsign/i)
    expect(nicknameInput).toHaveValue('Guest Cadet')

    expect(
      screen.getByRole('radio', { name: /Lunar Surveyor/i }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('validates nickname length and character restrictions', async () => {
    const user = userEvent.setup()
    renderOnboardingPage('guest')

    const nicknameInput = await screen.findByLabelText(/Choose Callsign/i)
    const submitButton = screen.getByRole('button', {
      name: /Save Profile & Enter Mission Control/i,
    })

    // Clear nickname to 1 character (invalid)
    await user.clear(nicknameInput)
    await user.type(nicknameInput, 'A')

    expect(
      screen.getByText(/Use a nickname between 2 and 20 characters/i),
    ).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Type valid nickname
    await user.clear(nicknameInput)
    await user.type(nicknameInput, 'Solar Wind')

    expect(submitButton).toBeEnabled()
  })

  it('selects avatar and saves profile through explorer service', async () => {
    const user = userEvent.setup()
    const { services } = renderOnboardingPage('guest')

    const nicknameInput = await screen.findByLabelText(/Choose Callsign/i)
    await user.clear(nicknameInput)
    await user.type(nicknameInput, 'Astro Pilot')

    // Select Mars Rover Pilot (cadet-2)
    const marsAvatar = screen.getByRole('radio', { name: /Mars Rover Pilot/i })
    await user.click(marsAvatar)
    expect(marsAvatar).toHaveAttribute('aria-checked', 'true')

    const submitButton = screen.getByRole('button', {
      name: /Save Profile & Enter Mission Control/i,
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument()
    })

    const profile = await services.explorer.getProfile()
    expect(profile.ok).toBe(true)
    if (profile.ok) {
      expect(profile.data.nickname).toBe('Astro Pilot')
      expect(profile.data.avatarId).toBe('cadet-2')
    }
  })
})
