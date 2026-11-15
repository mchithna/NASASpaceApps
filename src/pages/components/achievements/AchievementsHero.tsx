import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import styles from './achievements.module.css'

interface AchievementsHeroProps {
  totalUnlocked: number
  totalAchievements: number
}

export function AchievementsHero({
  totalUnlocked,
  totalAchievements,
}: AchievementsHeroProps) {
  return (
    <div className={styles.heroCard}>
      <div className={styles.heroCosmos} aria-hidden="true" />
      <div className={styles.heroContent}>
        <div className={styles.heroIdentity}>
          <div className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>Trophy Showcase</span>
          </div>
          <h2 className={styles.heroTitle}>Academy Story Honors</h2>
          <p className={styles.heroDescription}>
            Conclude mission story chapters to recover the legacy of forgotten
            spacecraft and unlock official academy trophies.
          </p>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Total Unlocked</span>
            <span className={styles.progressScore}>
              {totalUnlocked} of {totalAchievements}
            </span>
          </div>
          <ProgressBar
            value={totalUnlocked}
            max={totalAchievements}
            valueLabel={`${totalUnlocked} / ${totalAchievements}`}
          />
        </div>
      </div>
    </div>
  )
}
