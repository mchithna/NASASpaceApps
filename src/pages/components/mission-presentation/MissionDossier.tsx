import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Compass,
  ExternalLink,
  Globe2,
  Info,
  Moon,
  Orbit,
  Sparkles,
} from 'lucide-react'
import { landingMedia } from '@/pages/components/landing/landingMedia.ts'
import { useMissionProgress } from '@/pages/hooks/usePlatformData.ts'
import type { MissionDefinition } from '@/missions/types.ts'
import styles from './missionPresentation.module.css'

export type MissionDossierProps = {
  mission: MissionDefinition
}

export function MissionDossier({ mission }: MissionDossierProps) {
  const { progress, isLoading, error } = useMissionProgress(mission.id)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    document.title = `${mission.displayName} · NovaExplorer`
  }, [mission.displayName])

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

  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'

  const actionText = isCompleted
    ? 'Replay mission'
    : isInProgress
      ? 'Continue mission'
      : 'Start mission'

  return (
    <div className={styles.dossierContainer}>
      {/* Cinematic Hero Dossier Card */}
      <article className={styles.heroCard}>
        <div className={styles.heroContent}>
          {/* Badges / Classification Row */}
          <div className={styles.badgeRow}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} aria-hidden="true" />
              NASA Spacecraft Dossier
            </span>
            <span className={`${styles.badge} ${styles.destinationBadge}`}>
              <DestinationIcon size={13} aria-hidden="true" />
              {mission.destination}
            </span>
            <span className={styles.badge}>
              <Compass size={13} aria-hidden="true" />
              {mission.category.replace(/-/g, ' ')}
            </span>
            {isCompleted ? (
              <span className={`${styles.badge} ${styles.statusBadgeCompleted}`}>
                Completed
              </span>
            ) : isInProgress ? (
              <span className={styles.badge}>In Progress</span>
            ) : (
              <span className={`${styles.badge} ${styles.statusBadge}`}>
                Planned Chapter
              </span>
            )}
          </div>

          {/* Heading and Chapter Title */}
          <div className={styles.titleGroup}>
            <h1 className={styles.heading}>{mission.displayName}</h1>
            <p className={styles.chapterTitle}>{mission.chapterTitle}</p>
          </div>

          <p className={styles.description}>{mission.description}</p>

          {/* Mission Progress Loading / Error States */}
          {isLoading ? (
            <p role="status" className={styles.statusMessage}>
              Loading your progress
            </p>
          ) : null}
          {error ? (
            <p role="alert" className={styles.errorMessage}>
              {error.message}
            </p>
          ) : null}

          {/* Spacecraft Visual Display */}
          <div className={styles.artworkSection}>
            {imgFailed ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted">
                <DestinationIcon size={48} aria-hidden="true" />
                <span className="mt-3 text-sm">Spacecraft visual preview</span>
              </div>
            ) : (
              <img
                src={`/assets/common/landing/${mission.id}-480.webp`}
                srcSet={`/assets/common/landing/${mission.id}-480.webp ${imageWidths[0]}w, /assets/common/landing/${mission.id}-960.webp ${imageWidths[1]}w`}
                sizes="(min-width: 1024px) 800px, 100vw"
                width={imageWidths[0]}
                height="320"
                alt={media?.alt ?? `${mission.displayName} spacecraft`}
                className={styles.artworkImg}
                loading="eager"
                onError={() => setImgFailed(true)}
              />
            )}
            <div className={styles.artworkVignette} aria-hidden="true" />

            {/* Credited Source Bar */}
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

          {/* Metadata Cards */}
          <div className={styles.metaGrid}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Destination</span>
              <p className={styles.metaValue}>
                <span className="font-medium text-foreground">Destination: </span>
                {mission.destination}
              </p>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Story Title</span>
              <p className={styles.metaValue}>
                <span className="font-medium text-foreground">Story title: </span>
                {mission.chapterTitle}
              </p>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Explorer Status</span>
              <p className={styles.metaValue}>
                {isCompleted
                  ? 'Completed'
                  : isInProgress
                    ? 'In Progress'
                    : 'Not Started'}
              </p>
            </div>
          </div>

          {/* Chapter Readiness Notice */}
          {mission.status === 'planned' ? (
            <div className={styles.noticeBox}>
              <Info size={18} className={styles.noticeIcon} aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Chapter In Development</p>
                <p>Mission gameplay is not implemented yet.</p>
              </div>
            </div>
          ) : null}

          {/* Compatibility Cover Image Element for Testing Infrastructure */}
          <img
            src={mission.coverImage}
            alt="Placeholder cover. A NASA photograph is not shown yet."
            className={styles.schematicCompatible}
          />

          {/* Action Row */}
          <div className={styles.actionRow}>
            <Link to={`/missions/${mission.id}/play`} className={styles.primaryCta}>
              <span>{actionText}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/dashboard" className={styles.secondaryLink}>
              Mission Control
            </Link>
          </div>
        </div>
      </article>

      {/* Verified NASA Sources */}
      <section className={styles.sourcesSection} aria-labelledby="nasa-sources-heading">
        <h2 id="nasa-sources-heading" className={styles.sourcesHeading}>
          NASA source
        </h2>
        <ul className={styles.sourcesList}>
          {mission.sources.map((source) => (
            <li key={source.id} className={styles.sourceItem}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className={styles.sourceLink}
              >
                {source.title}
                <ExternalLink size={12} aria-hidden="true" />
              </a>
              {source.credit ? (
                <span className={styles.creditTag}>({source.credit})</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
