import type { ReactNode } from 'react'
import { Orbit } from 'lucide-react'
import { SpaceArtwork, type SpaceVisual } from './SpaceArtwork.tsx'

export function PageHero({
  title,
  description,
  eyebrow = 'The explorer academy',
  visual = 'mars',
  actions,
}: {
  title: string
  description?: string
  eyebrow?: string
  visual?: SpaceVisual
  actions?: ReactNode
}) {
  return (
    <header
      className={`platform-hero ${visual === 'mars' ? 'platform-hero-planet' : ''}`}
    >
      <div className="platform-hero-orbit" aria-hidden="true" />
      <SpaceArtwork
        key={visual}
        visual={visual}
        className="platform-hero-art"
      />
      <div className="platform-hero-content">
        <p className="platform-eyebrow">
          <Orbit size={15} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        {description ? (
          <p className="platform-hero-description">{description}</p>
        ) : null}
        {actions ? (
          <div className="platform-hero-actions">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
