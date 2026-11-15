import { useState } from 'react'
import { Link } from 'react-router'
import {
  Compass,
  ExternalLink,
  Globe2,
  Info,
  Moon,
  Orbit,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { MissionPlayer } from '@/engine/MissionPlayer.tsx'
import type { ServiceRuntime } from '@/engine/serviceRuntime.ts'
import type { MissionRuntimeState } from '@/contracts/missions.ts'
import { loadMissionChapter } from '@/missions/chapter.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import { landingMedia } from '@/pages/components/landing/landingMedia.ts'
import styles from './missionPresentation.module.css'

type LoadedChapter = NonNullable<Awaited<ReturnType<typeof loadMissionChapter>>>

export type PlayerLoad =
  | { status: 'loading' }
  | { status: 'planned' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      chapter: LoadedChapter
      runtime: ServiceRuntime
      progress: MissionRuntimeState
      identity: string
    }

export type MissionPlayerShellProps = {
  mission: MissionDefinition
  load: PlayerLoad
  attempt: number
  onRetry: () => void
  onExit: () => void
  isLive: boolean
}

export function MissionPlayerShell({
  mission,
  load,
  attempt,
  onRetry,
  onExit,
  isLive,
}: MissionPlayerShellProps) {
  const [imgFailed, setImgFailed] = useState(false)
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
    <div className={styles.playerContainer}>
      {/* Route-level header present in non-ready states for navigation context */}
      {load.status !== 'ready' ? (
        <header className={styles.playerHeader}>
          <div className={styles.badgeRow}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} aria-hidden="true" />
              Mission Story Player
            </span>
            <span className={`${styles.badge} ${styles.destinationBadge}`}>
              <DestinationIcon size={13} aria-hidden="true" />
              {mission.destination}
            </span>
            <span className={styles.badge}>
              <Compass size={13} aria-hidden="true" />
              {mission.category.replace(/-/g, ' ')}
            </span>
          </div>
          <h1 className={styles.heading}>{mission.displayName}</h1>
          <p className={styles.chapterTitle}>{mission.chapterTitle}</p>
        </header>
      ) : null}

      {/* Loading state */}
      {load.status === 'loading' ? (
        <div className={styles.playerCard}>
          <LoadingState label="Loading your mission" />
        </div>
      ) : null}

      {/* Honest Planned / Unprepared Chapter State */}
      {load.status === 'planned' ? (
        <article className={styles.playerCard}>
          {/* Credited Spacecraft Artwork */}
          <div className={styles.plannedArtBox}>
            {imgFailed ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <DestinationIcon size={44} aria-hidden="true" />
                <span className="mt-2 text-sm">{mission.displayName}</span>
              </div>
            ) : (
              <img
                src={`/assets/common/landing/${mission.id}-480.webp`}
                srcSet={`/assets/common/landing/${mission.id}-480.webp ${imageWidths[0]}w, /assets/common/landing/${mission.id}-960.webp ${imageWidths[1]}w`}
                sizes="(min-width: 1024px) 800px, 100vw"
                width={imageWidths[0]}
                height="300"
                alt={media?.alt ?? `${mission.displayName} spacecraft`}
                className={styles.plannedImg}
                loading="eager"
                onError={() => setImgFailed(true)}
              />
            )}
            <div className={styles.artworkVignette} aria-hidden="true" />

            <div className={styles.creditBar}>
              <span className={styles.creditItem}>
                <span className="font-semibold text-secondary">Credit:</span>{' '}
                {media?.credit ?? 'NASA'}
                {media?.kind ? (
                  <span className="text-xs text-muted">({media.kind})</span>
                ) : null}
              </span>
              {media?.source ? (
                <a
                  href={media.source}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.creditLink}
                >
                  NASA Archive <ExternalLink size={12} aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>

          {/* Honest preparation advisory */}
          <div className={styles.plannedAdvisory}>
            <h2 className={styles.plannedAdvisoryTitle}>
              <Info size={18} aria-hidden="true" />
              Chapter in Preparation
            </h2>
            <p className={styles.plannedAdvisoryText}>
              This chapter is being prepared. No mission progress or rewards have
              been recorded.
            </p>
            <p className={styles.plannedExplicitNote}>
              Exploration telemetry notice: Factual educational activities and
              interactive story scenes for {mission.displayName} are currently in development.
              No XP, rank advancements, or Discovery Journal entries are granted by this preview.
            </p>
          </div>
        </article>
      ) : null}

      {/* Error state */}
      {load.status === 'error' ? (
        <div className={styles.playerCard}>
          <ErrorState title="Mission unavailable" message={load.message} />
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/auth" className={styles.buttonLink}>
              Sign in or continue as a guest
            </Link>
          </div>
        </div>
      ) : null}

      {/* Ready State: Live interactive mission chapter player */}
      {load.status === 'ready' ? (
        <div className="flex flex-col gap-4">
          <p className={styles.playerServiceNotice}>
            {!isLive
              ? 'Development mock visit. Progress is not saved to a real account.'
              : 'Mission progress uses your player services. Guest progress is saved in this browser tab.'}
          </p>

          <MissionPlayer
            key={`${load.identity}:${attempt}`}
            module={load.chapter.module}
            activities={load.chapter.activities}
            runtime={load.runtime}
            progress={load.progress}
            onExit={onExit}
          />
        </div>
      ) : null}

      {/* Consistent navigation actions across all states */}
      <nav aria-label="Player navigation" className={styles.playerNavLinks}>
        {load.status === 'error' || load.status === 'ready' ? (
          <Button variant="secondary" onClick={onRetry}>
            Reload saved place
          </Button>
        ) : null}
        <Link to={`/missions/${mission.id}`} className={styles.secondaryLink}>
          Back to overview
        </Link>
        <Link to="/dashboard" className={styles.secondaryLink}>
          Mission Control
        </Link>
      </nav>
    </div>
  )
}
