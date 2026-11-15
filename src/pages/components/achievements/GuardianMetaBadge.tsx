import { Shield, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import styles from './achievements.module.css'

interface GuardianMetaBadgeProps {
  isGuardianUnlocked: boolean
  unlockedChapterCount: number
}

export function GuardianMetaBadge({
  isGuardianUnlocked,
  unlockedChapterCount,
}: GuardianMetaBadgeProps) {
  return (
    <section aria-labelledby="meta-badge-heading" className={styles.supremeSection}>
      <h3 id="meta-badge-heading" className={styles.supremeTitle}>
        Supreme Academy Honor
      </h3>

      <div
        className={`${styles.supremeCard} ${
          isGuardianUnlocked ? styles.supremeCardUnlocked : ''
        }`}
      >
        <div className={styles.supremeLayout}>
          <div className={styles.supremeContentGroup}>
            {/* Grand Ceremonial Medallion Emblem */}
            <div
              className={`${styles.supremeMedallionWrapper} ${
                isGuardianUnlocked ? styles.supremeMedallionUnlocked : ''
              }`}
            >
              <div className={styles.supremeMedallionInner}>
                <Shield className="size-8" aria-hidden="true" />
              </div>
            </div>

            <div className={styles.supremeDetails}>
              <div className={styles.supremeBadgeRow}>
                <span className={styles.eyebrow}>
                  Culminating Achievement
                </span>
                {isGuardianUnlocked ? (
                  <Badge variant="reward">Mastered</Badge>
                ) : (
                  <Badge variant="neutral">
                    <Lock className="size-3 mr-1" aria-hidden="true" />
                    {unlockedChapterCount} / 5 Chapters
                  </Badge>
                )}
              </div>

              <h4 className={styles.supremeHonorTitle}>
                Guardian of Forgotten Worlds
              </h4>

              <p className={styles.supremeHonorDesc}>
                Honor awarded to explorers who complete all five historical
                missions, preserving the scientific legacy of humanity&apos;s
                discarded explorers across the solar system.
              </p>
            </div>
          </div>

          <div className={styles.supremeStatusArea}>
            {isGuardianUnlocked ? (
              <Badge variant="success">Achieved</Badge>
            ) : (
              <span className={styles.remainingText}>
                {5 - unlockedChapterCount} chapters remaining
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
