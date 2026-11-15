import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/Button.tsx'

describe('Button', () => {
  it.each([
    ['primary', 'bg-[#d4ff9a]'],
    ['secondary', 'bg-white/[0.04]'],
    ['outline', 'border-[#d4ff9a]/60'],
    ['ghost', 'bg-transparent'],
    ['destructive', 'bg-danger'],
  ] as const)('renders the %s variant', (variant, className) => {
    render(<Button variant={variant}>Continue</Button>)

    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass(className)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('disables the button and marks it busy while loading', () => {
    render(<Button loading>Saving</Button>)

    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
