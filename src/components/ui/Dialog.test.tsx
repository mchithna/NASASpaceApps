import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Dialog } from '@/components/ui/Dialog.tsx'

function DialogHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open note
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Mission note"
        description="This note is only a sample."
      >
        <p>Inside the dialog</p>
      </Dialog>
    </>
  )
}

describe('Dialog', () => {
  it('opens with an accessible name and closes from the Close button', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open note' }))

    const dialog = screen.getByRole('dialog', { name: 'Mission note' })
    expect(dialog).toHaveAccessibleDescription('This note is only a sample.')
    expect(screen.getByText('Inside the dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open note' }),
    ).toBeInTheDocument()
  })

  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    await user.click(screen.getByRole('button', { name: 'Open note' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
