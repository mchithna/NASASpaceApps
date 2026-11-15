import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatLauncher } from './ChatLauncher.tsx'

describe('ChatLauncher', () => {
  it('renders with accessible name, greeting bubble, and aria-expanded state', () => {
    const { rerender } = render(<ChatLauncher open={false} />)

    const button = screen.getByRole('button', { name: 'Ask Nova AI' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveClass('nova-chat-launcher')

    // Greeting bubble
    expect(
      screen.getByText('Hi, I’m Nova. Ask me about any mission.'),
    ).toBeInTheDocument()

    // SVG artwork
    const svg = screen.getByRole('img', {
      name: 'Astronaut giving a thumbs up from a neon flying saucer',
    })
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 120 120')

    // Pill label
    expect(screen.getByText('Ask Nova AI')).toBeInTheDocument()

    rerender(<ChatLauncher open={true} />)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
