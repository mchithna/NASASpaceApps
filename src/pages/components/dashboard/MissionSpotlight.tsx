import { useState } from 'react'
import { Link } from 'react-router'
import { landingMedia } from '@/pages/components/landing/landingMedia.ts'
import styles from '@/pages/components/dashboard/dashboard.module.css'
import type { MissionProgress } from '@/contracts/progress.ts'
import type { MissionDefinition, MissionId } from '@/missions/types.ts'

function imageWidths(id: MissionId): readonly [number, number] {
  if (id === 'opportunity') return [353, 706]
  if (id === 'insight') return [360, 720]
  return [480, 960]
}

export function MissionSpotlight({
  mission,
  progress,
}: {
  mission: MissionDefinition
  progress: MissionProgress
}) {
  const [failed, setFailed] = useState(false)
  const media = landingMedia[mission.id]
  const widths = imageWidths(mission.id)
  const completedCount = progress.completedCheckpointIds.length

  return (
    <section className={styles.spotlight} aria-label={`${mission.displayName} in progress`}>
      <div className={styles.spotlightMedia} data-mission={mission.id}>
        {failed ? (
          <div className={styles.fallback}>Image unavailable</div>
        ) : (
          <img
            src={`/assets/common/landing/${mission.id}-960.webp`}
            srcSet={`/assets/common/landing/${mission.id}-480.webp ${widths[0]}w, /assets/common/landing/${mission.id}-960.webp ${widths[1]}w`}
            sizes="(min-width: 1024px) 36vw, 100vw"
            width="960"
            height="600"
            alt={media.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        <div className={styles.scrim} aria-hidden="true" />
      </div>
      <div className={styles.spotlightCopy}>
        <p className={styles.downlink}>Active Telemetry Downlink</p>
        <p className={`${styles.status} ${styles.statusInline}`}>In Progress</p>
        <h3 className={styles.spotlightTitle}>{mission.displayName}</h3>
        <p className={styles.chapter}>{mission.chapterTitle}</p>
        <p className={styles.progressNote}>
          {mission.destination}
          {progress.currentCheckpointId ? (
            <>
              {' '}
              · Current checkpoint: <strong>{progress.currentCheckpointId}</strong>
            </>
          ) : null}
          {' '}
          · {completedCount} checkpoint{completedCount === 1 ? '' : 's'} logged
        </p>
        <p className={styles.cardCredit}>
          {media.kind}. <a href={media.source}>{media.credit}</a>
        </p>
        <div className={styles.actions}>
          <Link className={styles.action} to={`/missions/${mission.id}/play`}>
            Continue Mission
          </Link>
          <Link className={styles.quiet} to={`/missions/${mission.id}`}>
            Mission Files
          </Link>
        </div>
      </div>
    </section>
  )
}
