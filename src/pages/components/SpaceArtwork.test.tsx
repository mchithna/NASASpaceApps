import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageHero } from './PageHero.tsx'
import { SpaceArtwork } from './SpaceArtwork.tsx'

describe('credited space imagery', () => {
  it('retains the source link and an accessible fallback when an image fails', () => {
    render(<SpaceArtwork visual="ingenuity" />)
    fireEvent.error(screen.getByRole('img', { name: /Ingenuity helicopter/ }))
    expect(
      screen.getByRole('img', { name: 'Space image unavailable' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Artist concept.*NASA/ }),
    ).toHaveAttribute('href', expect.stringContaining('science.nasa.gov'))
  })
  it('recovers imagery when navigating to a different page hero', () => {
    const view = render(<PageHero title="Mission file" visual="surveyor-3" />)
    fireEvent.error(screen.getByRole('img', { name: /Surveyor 3 lander/ }))
    view.rerender(<PageHero title="Explorer Profile" visual="mars" />)
    expect(
      screen.getByRole('img', { name: /Mars hemisphere mosaic/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'Space image unavailable' }),
    ).not.toBeInTheDocument()
  })
})
