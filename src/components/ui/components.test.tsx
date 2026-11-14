import { render, screen } from '@testing-library/react'
import { Telescope } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card, CardBody, CardHeader } from '@/components/ui/Card.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'

describe('shared UI components', () => {
  it('renders a page heading and description', () => {
    render(
      <PageHeader
        title="Mission Control"
        description="Choose a story to open."
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mission Control' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Choose a story to open.')).toBeInTheDocument()
  })

  it('renders card content', () => {
    render(
      <Card>
        <CardHeader title="Standard" description="A quiet surface." />
        <CardBody>
          <p>Body content sits inside.</p>
        </CardBody>
      </Card>,
    )

    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('Body content sits inside.')).toBeInTheDocument()
  })

  it('renders badge labels', () => {
    render(
      <>
        <Badge>Neutral</Badge>
        <Badge variant="success">Ready</Badge>
        <Badge variant="science">Science</Badge>
      </>,
    )

    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
  })

  it('exposes progress semantics', () => {
    render(
      <ProgressBar
        label="Story progress"
        value={42}
        max={100}
        valueLabel="42%"
      />,
    )

    const bar = screen.getByRole('progressbar', { name: 'Story progress' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('announces loading, empty, and error states', () => {
    render(
      <>
        <LoadingState label="Loading the story" />
        <EmptyState
          icon={Telescope}
          title="No notes yet"
          description="The journal is empty."
        />
        <ErrorState message="The story could not be opened." />
      </>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Loading the story')
    expect(screen.getByText('No notes yet')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The story could not be opened.',
    )
  })
})
