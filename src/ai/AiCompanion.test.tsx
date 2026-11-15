import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AiCompanion } from './AiCompanion.tsx'

describe('Nova Chatbot Companion', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('opens and closes via launcher button, close button, and Escape key', async () => {
    const user = userEvent.setup()
    render(<AiCompanion context={{ route: '/' }} />)

    const launcher = screen.getByRole('button', { name: 'Ask Nova AI' })
    expect(launcher).toHaveAttribute('aria-expanded', 'false')

    // Click to open
    await user.click(launcher)
    expect(launcher).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog', { name: 'Nova AI chat' })
    expect(dialog).toHaveClass('open')
    expect(within(dialog).getByText('Nova AI')).toBeInTheDocument()
    expect(within(dialog).getByText('NASA missions guide')).toBeInTheDocument()

    // Close via close button
    await user.click(screen.getByRole('button', { name: 'Close Nova AI chat' }))
    expect(launcher).toHaveAttribute('aria-expanded', 'false')
    expect(launcher).toHaveFocus()

    // Reopen and close via Escape
    await user.click(launcher)
    expect(dialog).toHaveClass('open')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(launcher).toHaveAttribute('aria-expanded', 'false')
  })

  it('displays starter question chips and sends message on chip click', async () => {
    const user = userEvent.setup()

    // Mock fetch streaming response
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: {
        getReader() {
          const chunks = ['Surveyor 3 was a robotic Moon lander.']
          let index = 0
          return {
            read() {
              if (index < chunks.length) {
                const value = new TextEncoder().encode(chunks[index++])
                return Promise.resolve({ done: false, value })
              }
              return Promise.resolve({ done: true, value: undefined })
            },
          }
        },
      },
    } as unknown as Response)

    render(<AiCompanion context={{ route: '/' }} />)
    await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))

    // Starter question chips exist
    const chip = screen.getByRole('button', {
      name: /Tell me about Surveyor 3/i,
    })
    expect(chip).toBeInTheDocument()

    // Clicking chip sends the question
    await user.click(chip)

    // User message is rendered
    expect(
      screen.getByText('Tell me about Surveyor 3', { exact: false }),
    ).toBeInTheDocument()

    // Bot streaming reply arrives
    await waitFor(() => {
      expect(
        screen.getByText(/Surveyor 3 was a robotic Moon lander/i),
      ).toBeInTheDocument()
    })
  })

  it('handles simulated error and allows retrying via Try again button', async () => {
    const user = userEvent.setup()

    // First call fails
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Nova service temporarily unavailable.',
        }),
      } as unknown as Response)
      // Second call (retry) succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: {
          getReader() {
            const chunks = ['Opportunity explored Mars rocks for liquid water.']
            let index = 0
            return {
              read() {
                if (index < chunks.length) {
                  const value = new TextEncoder().encode(chunks[index++])
                  return Promise.resolve({ done: false, value })
                }
                return Promise.resolve({ done: true, value: undefined })
              },
            }
          },
        },
      } as unknown as Response)

    render(<AiCompanion context={{ route: '/missions/opportunity' }} />)
    await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))

    const input = screen.getByRole('textbox', { name: 'Ask about a mission' })
    await user.type(input, 'Tell me about Opportunity{enter}')

    // Error alert is displayed
    await waitFor(() => {
      expect(
        screen.getByText('Nova service temporarily unavailable.'),
      ).toBeInTheDocument()
    })

    const retryBtn = screen.getByRole('button', { name: /Try again/i })
    expect(retryBtn).toBeInTheDocument()

    // Clicking retry re-triggers the query
    await user.click(retryBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/Opportunity explored Mars rocks for liquid water/i),
      ).toBeInTheDocument()
    })
  })

  it('clears conversation history when New chat is clicked', async () => {
    const user = userEvent.setup()

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: {
        getReader() {
          const chunks = ['Pioneer 10 reached Jupiter.']
          let index = 0
          return {
            read() {
              if (index < chunks.length) {
                const value = new TextEncoder().encode(chunks[index++])
                return Promise.resolve({ done: false, value })
              }
              return Promise.resolve({ done: true, value: undefined })
            },
          }
        },
      },
    } as unknown as Response)

    render(<AiCompanion context={{ route: '/' }} />)
    await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))

    const chip = screen.getByRole('button', {
      name: /Which mission went farthest/i,
    })
    await user.click(chip)

    await waitFor(() => {
      expect(screen.getByText(/Pioneer 10 reached Jupiter/i)).toBeInTheDocument()
    })

    // Click "New chat"
    await user.click(screen.getByRole('button', { name: 'New chat' }))

    // User question and reply are cleared; starter chips return
    expect(
      screen.queryByText(/Pioneer 10 reached Jupiter/i),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Which mission went farthest/i }),
    ).toBeInTheDocument()
  })
})
