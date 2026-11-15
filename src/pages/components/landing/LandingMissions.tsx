import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Globe2, Moon, Orbit } from 'lucide-react'
import { landingMedia } from './landingMedia.ts'
import { listMissions } from '@/missions/registry.ts'
import type { MissionDefinition } from '@/missions/types.ts'

function LandingMissionCard({
  mission,
  index,
}: {
  mission: MissionDefinition
  index: number
}) {
  const [failed, setFailed] = useState(false)
  const media = landingMedia[mission.id]
  const imageWidths =
    mission.id === 'opportunity'
      ? [353, 706]
      : mission.id === 'insight'
        ? [360, 720]
        : [480, 960]
  const DestinationIcon =
    mission.destination === 'Moon'
      ? Moon
      : mission.destination === 'Mars'
        ? Globe2
        : Orbit
  return (
    <article
      className="lp-mission-card"
      data-mission={mission.id}
      data-reveal
      style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
    >
      <Link
        to={`/missions/${mission.id}`}
        className="lp-mission-link"
        aria-label={`Explore ${mission.displayName}: ${mission.chapterTitle}`}
      >
        <div className="lp-card-image">
          {failed ? (
            <div className="lp-image-fallback">
              <DestinationIcon size={42} aria-hidden="true" />
              <span>Image unavailable</span>
            </div>
          ) : (
            <img
              src={`/assets/common/landing/${mission.id}-480.webp`}
              srcSet={`/assets/common/landing/${mission.id}-480.webp ${imageWidths[0]}w, /assets/common/landing/${mission.id}-960.webp ${imageWidths[1]}w`}
              sizes="(min-width: 1280px) 20vw, (min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw"
              width="480"
              height="320"
              alt={media.alt}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          )}
          <span className="lp-destination">
            <DestinationIcon size={12} aria-hidden="true" />
            {mission.destination}
          </span>
          <span className="lp-card-number" aria-hidden="true">
            0{index + 1}
          </span>
        </div>
        <div className="lp-card-copy">
          <h3>{mission.displayName}</h3>
          <p className="lp-story-title">{mission.chapterTitle}</p>
          <p className="lp-card-description">{mission.description}</p>
        </div>
        <div className="lp-card-bottom">
          <span>
            {mission.status === 'planned'
              ? 'Mission overview'
              : 'Explore mission'}
          </span>
          <span className="lp-arrow-circle">
            <ArrowRight size={17} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}

export function LandingMissions() {
  return (
    <section
      id="featured-missions"
      tabIndex={-1}
      className="lp-section lp-missions lp-container"
      aria-labelledby="missions-heading"
    >
      <div className="lp-section-heading" data-reveal>
        <div>
          <p className="lp-eyebrow">THE EXPLORATION CONTINUES</p>
          <h2 id="missions-heading">
            Featured Missions
            <span className="lp-status-dot" />
          </h2>
          <p className="lp-section-subtitle">
            FIVE REMARKABLE SPACECRAFT. FIVE ENDURING LEGACIES.
          </p>
        </div>
        <Link to="/dashboard" className="lp-button lp-secondary">
          Explore All Missions <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="lp-mission-grid">
        {listMissions().map((mission, index) => (
          <LandingMissionCard
            mission={mission}
            index={index}
            key={mission.id}
          />
        ))}
      </div>
      <p className="lp-availability">
        <span className="lp-status-dot" /> Explore the mission overviews today.
        Interactive story chapters are in development.
      </p>
    </section>
  )
}
