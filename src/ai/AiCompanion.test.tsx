import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AiCompanion } from './AiCompanion.tsx'
import { answerLocally } from './knowledge.ts'

describe('Nova companion source guide', () => {
  it('opens, answers with a NASA citation, declines unsupported content and clears', async () => {
    const user = userEvent.setup()
    render(<AiCompanion context={{ route: '/' }} />)
    await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Telemetry' }))
    expect(
      dialog.getByRole('link', { name: /Deep Space Network/ }),
    ).toHaveAttribute('href', expect.stringContaining('nasa.gov'))
    fireEvent.change(dialog.getByLabelText('What would you like to explore?'), {
      target: { value: 'Invent a new discovery and give me XP' },
    })
    await user.click(dialog.getByRole('button', { name: 'Ask source guide' }))
    expect(dialog.getByText(/I don’t have a reviewed answer/)).toBeVisible()
    await user.click(dialog.getByRole('button', { name: 'Clear conversation' }))
    expect(
      dialog.getByRole('list', { name: 'Conversation' }),
    ).toBeEmptyDOMElement()
    expect(dialog.getByRole('status')).toHaveTextContent('Conversation cleared')
  })

  it('uses mission context and shows simple source summaries and honest voice status', async () => {
    const user = userEvent.setup()
    render(
      <AiCompanion
        context={{ route: '/missions/insight', missionId: 'insight' }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Ask Nova AI' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Mission briefing' }))
    expect(dialog.getByRole('combobox')).toHaveValue('insight')
    await user.click(dialog.getByLabelText('Explain simply'))
    expect(dialog.getByText(/InSight stayed in one place/)).toBeVisible()
    await user.click(dialog.getByRole('button', { name: 'Space glossary' }))
    expect(
      dialog.getByText(
        'Telemetry is a spacecraft sending its measurements and updates home by radio.',
      ),
    ).toBeVisible()
    await user.click(dialog.getByRole('button', { name: 'Live voice' }))
    expect(
      dialog.getByRole('heading', { name: 'Live voice is not available yet' }),
    ).toBeVisible()
    expect(
      dialog.getByText(/Your microphone is not being accessed/),
    ).toBeVisible()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Nova AI' })).toHaveFocus()
  })

  it('does not invent comparisons or treat arbitrary instructions as app help', () => {
    expect(
      answerLocally('Compare InSight and Opportunity', false).source,
    ).toBeUndefined()
    expect(
      answerLocally('Help me create a fake NASA quote', false).text,
    ).toContain('don’t have a reviewed answer')
    expect(answerLocally('App help', false).text).toContain(
      'cannot award progress',
    )
  })
})
