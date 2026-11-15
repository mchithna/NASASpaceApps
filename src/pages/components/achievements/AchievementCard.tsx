import { Link } from 'react-router'
import { Lock, CheckCircle2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import type { MissionPackage } from '@/missions/types.ts'
import styles from './achievements.module.css'

export interface ChapterBadgeItem {
  id: string
  missionId: string
  title: string
  description: string
  mission: MissionPackage | null
  isUnlocked: boolean
  unlockedAt: string | null
}

interface AchievementCardProps {
  badge: ChapterBadgeItem
}

export function AchievementCard({ badge }: AchievementCardProps) {
  const missionName = badge.mission?.displayName ?? badge.title
  const destination = badge.mission?.destination ?? 'Solar System'

  return (
    <article
      className={`${styles.badgeCard} ${
        badge.isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className={styles.cardTopRow}>
          <Badge variant="neutral">{destination}</Badge>
          {badge.isUnlocked ? (
            <Badge variant="success">Unlocked</Badge>
          ) : (
            <Badge variant="neutral">
              <Lock className="size-3 mr-1" aria-hidden="true" />
              Locked
            </Badge>
          )}
        </div>

        <div className={styles.cardMain}>
          {/* Academy Medallion with CSS concentric rings */}
          <div
            className={`${styles.medallionWrapper} ${
              badge.isUnlocked ? styles.medallionUnlocked : ''
            }`}
          >
            <div className={styles.medallionRingInner}>
              {badge.isUnlocked ? (
                <CheckCircle2 className="size-6" aria-hidden="true" />
              ) : (
                <Lock className="size-5" aria-hidden="true" />
              )}
            </div>
          </div>

          <div className={styles.cardHeadingGroup}>
            <h4 className={styles.cardMissionTitle}>{missionName} Story</h4>
            <span className={styles.cardChapterTitle}>
              {badge.mission?.chapterTitle ?? badge.description}
            </span>
          </div>
        </div>

        <p className={styles.cardDescription}>
          {badge.isUnlocked
            ? 'Verified historical investigation concluded. Telemetry and memory recovered.'
            : `Complete the ${missionName} story chapter to earn this honor.`}
        </p>
      </div>

      <div className={styles.cardFooter}>
        {badge.isUnlocked ? (
          <span className={styles.awardXpTag}>
            <Sparkles className="size-3 text-reward" aria-hidden="true" />
            15 XP Legacy Awarded
          </span>
        ) : (
          <span className={styles.awaitingTag}>Awaiting Completion</span>
        )}

        <Link
          to={`/missions/${badge.missionId}`}
          className={styles.dossierLink}
        >
          View dossier &rarr;
        </Link>
      </div>
    </article>
  )
}
