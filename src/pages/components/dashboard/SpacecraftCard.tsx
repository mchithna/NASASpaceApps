import { useState } from 'react'
import { Link } from 'react-router'
import { landingMedia } from '@/pages/components/landing/landingMedia.ts'
import styles from '@/pages/components/dashboard/dashboard.module.css'
import type { MissionProgress, MissionProgressStatus } from '@/contracts/progress.ts'
import type { MissionDefinition, MissionId } from '@/missions/types.ts'

const statusLabel: Record<MissionProgressStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

function imageWidths(id: MissionId): readonly [number, number] {
  if (id === 'opportunity') return [353, 706]
  if (id === 'insight') return [360, 720]
  return [480, 960]
}

function actionFor(status: MissionProgressStatus, missionId: string) {
  if (status === 'completed') {
    return { label: 'Replay Story', to: `/missions/${missionId}/play` }
  }
  if (status === 'in_progress') {
    return { label: 'Continue Mission', to: `/missions/${missionId}/play` }
  }
  return { label: 'Begin Story', to: `/missions/${missionId}` }
}

export function SpacecraftCard({
  mission,
  progress,
}: {
  mission: MissionDefinition
  progress?: MissionProgress
}) {
  const [failed, setFailed] = useState(false)
  const status = progress?.status ?? 'not_started'
  const media = landingMedia[mission.id]
  const widths = imageWidths(mission.id)
  const action = actionFor(status, mission.id)
  const checkpoint = progress?.currentCheckpointId

  return (
    <article className={styles.card}>
      <div className={styles.media} data-mission={mission.id}>
        {failed ? (
          <div className={styles.fallback}>Image unavailable</div>
        ) : (
          <img
            src={`/assets/common/landing/${mission.id}-480.webp`}
            srcSet={`/assets/common/landing/${mission.id}-480.webp ${widths[0]}w, /assets/common/landing/${mission.id}-960.webp ${widths[1]}w`}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
            width="480"
            height="393"
            alt={media.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        <div className={styles.scrim} aria-hidden="true" />
        <p className={styles.chip}>{mission.destination}</p>
        <p className={styles.status}>{statusLabel[status]}</p>
      </div>
      <div className={styles.body}>
        <p className={styles.chapter}>{mission.chapterTitle}</p>
        <h3 className={styles.title}>
          <Link to={`/missions/${mission.id}`}>{mission.displayName}</Link>
        </h3>
        <p className={styles.summary}>{mission.description}</p>
        {status === 'in_progress' && checkpoint ? (
          <p className={styles.progressNote}>
            Resume at: <strong>{checkpoint}</strong>
          </p>
        ) : null}
        <p className={styles.cardCredit}>
          {media.kind}. <a href={media.source}>{media.credit}</a>
        </p>
      </div>
      <div className={styles.footer}>
        <Link className={styles.quiet} to={`/missions/${mission.id}`}>
          Mission Files
        </Link>
        <Link
          className={styles.action}
          to={action.to}
          aria-label={`${action.label} for ${mission.displayName}`}
        >
          {action.label}
        </Link>
      </div>
    </article>
  )
}
