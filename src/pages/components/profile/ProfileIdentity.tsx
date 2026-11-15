import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { marsImage } from '@/pages/components/profile/marsImage.ts'
import styles from '@/pages/components/profile/profile.module.css'

type ProfileIdentityProps = {
  nickname: string
  role: string
  avatar: LucideIcon
  isGuest: boolean
  level: number
  rankName: string
  totalXp: number
  xpDetail: string
  completedLabel: string
  progressValue: number
  progressMax: number
  progressLabel: string
}

export function ProfileIdentity({
  nickname,
  role,
  avatar: AvatarIcon,
  isGuest,
  level,
  rankName,
  totalXp,
  xpDetail,
  completedLabel,
  progressValue,
  progressMax,
  progressLabel,
}: ProfileIdentityProps) {
  return (
    <section className={styles.identity} aria-labelledby="profile-callsign">
      <div className={styles.copy}>
        <div className={styles.headingRow}>
          <div className={styles.identityMain}>
            <div className={styles.avatar}>
              <AvatarIcon className="size-7" aria-hidden="true" />
            </div>
            <div className={styles.identityText}>
              <div className={styles.kicker}>
                Active Callsign{' '}
                {isGuest ? <Badge variant="warning">Guest</Badge> : <Badge variant="neutral">Verified</Badge>}
              </div>
              <h2 id="profile-callsign" className={styles.name}>
                {nickname}
              </h2>
              <span className={styles.role}>{role}</span>
            </div>
          </div>
          <div className={styles.badges}>
            <Badge variant="science">Level {level}</Badge>
            <Badge variant="reward">{rankName}</Badge>
          </div>
        </div>

        <div className={styles.stats}>
          <div>
            <div className={styles.statLabel}>Total XP</div>
            <div className={styles.statValue}>{totalXp} XP</div>
            <div className={styles.statDetail}>{xpDetail}</div>
          </div>
          <div>
            <div className={styles.statLabel}>Missions Concluded</div>
            <div className={styles.statValue}>{completedLabel}</div>
            <div className={styles.statDetail}>Spacecraft investigated</div>
          </div>
          <div>
            <div className={styles.statLabel}>Rank Progression</div>
            <ProgressBar
              value={progressValue}
              max={progressMax}
              valueLabel={progressLabel}
            />
          </div>
        </div>
      </div>

      <figure className={styles.art}>
        <div className={styles.planet} aria-hidden="true">
          <img src={marsImage.src} alt="" width="1000" height="1000" />
        </div>
        <svg className={styles.orbits} viewBox="0 0 420 420" fill="none" aria-hidden="true">
          <ellipse cx="230" cy="180" rx="160" ry="54" transform="rotate(-20 230 180)" />
          <ellipse cx="230" cy="180" rx="120" ry="86" transform="rotate(-20 230 180)" />
        </svg>
        <figcaption className={styles.credit}>
          {marsImage.alt}. <a href={marsImage.source}>{marsImage.credit}</a>
        </figcaption>
      </figure>
    </section>
  )
}

export function ProfileEditRegion({ children }: { children: ReactNode }) {
  return (
    <section className={styles.edit} aria-labelledby="edit-profile-heading">
      <h2 id="edit-profile-heading" className={styles.editTitle}>
        Edit profile
      </h2>
      {children}
    </section>
  )
}
