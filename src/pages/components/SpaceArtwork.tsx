import { useState } from 'react'
import type { MissionId } from '@/missions/types.ts'
import { landingMedia } from './landing/landingMedia.ts'

export type SpaceVisual = MissionId | 'mars'

export function SpaceArtwork({
  visual = 'mars',
  className = '',
  credit = true,
}: {
  visual?: SpaceVisual
  className?: string
  credit?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const media =
    visual === 'mars'
      ? {
          alt: 'Mars hemisphere mosaic showing Valles Marineris',
          credit: 'NASA/JPL/USGS',
          kind: 'Mars mosaic',
          source:
            'https://science.nasa.gov/photojournal/valles-marineris-hemisphere/',
        }
      : landingMedia[visual]
  return (
    <figure className={`space-artwork ${className}`}>
      {failed ? (
        <div
          className="space-artwork-fallback"
          role="img"
          aria-label="Space image unavailable"
        />
      ) : (
        <img
          key={visual}
          src={`/assets/common/landing/${visual === 'mars' ? 'mars.webp' : `${visual}-960.webp`}`}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          width={960}
          height={640}
          onError={() => setFailed(true)}
        />
      )}
      {credit ? (
        <figcaption>
          <a href={media.source} target="_blank" rel="noopener noreferrer">
            {media.kind} · {media.credit}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </figcaption>
      ) : null}
    </figure>
  )
}
