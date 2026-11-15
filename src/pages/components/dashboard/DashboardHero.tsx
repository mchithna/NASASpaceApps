import { Link } from 'react-router'
import { Spaceship3DIllustration } from '@/pages/components/Spaceship3DIllustration.tsx'
import styles from '@/pages/components/dashboard/dashboard.module.css'

type DashboardHeroProps = {
  nickname: string
  rankName: string
  resumeTo: string | null
}

export function DashboardHero({ nickname, rankName, resumeTo }: DashboardHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="explorer-hero-name">
      <div className={styles.scene} aria-hidden="true">
        <Spaceship3DIllustration
          variant="command"
          badgeLabel="Orbital Command Craft · Active Telemetry"
        />
      </div>
      <div className={styles.copy}>
        <p className={styles.kicker}>Explorer</p>
        <h2 id="explorer-hero-name" className={styles.name}>
          {nickname}
        </h2>
        <p className={styles.rank}>{rankName}</p>
        {resumeTo ? (
          <Link className={styles.primary} to={resumeTo}>
            Resume mission
          </Link>
        ) : (
          <a className={styles.primary} href="#stories">
            Choose a mission
          </a>
        )}
      </div>
    </section>
  )
}
