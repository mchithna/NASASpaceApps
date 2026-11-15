import { Link } from 'react-router'
import { marsImage } from '@/pages/components/dashboard/marsImage.ts'
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
        <div className={styles.planet}>
          <img src={marsImage.src} alt="" width="1000" height="1000" />
        </div>
        <svg className={styles.orbits} viewBox="0 0 640 420" fill="none">
          <ellipse cx="390" cy="210" rx="250" ry="78" transform="rotate(-24 390 210)" />
          <ellipse cx="390" cy="210" rx="190" ry="120" transform="rotate(-24 390 210)" />
        </svg>
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
      <p className={styles.credit}>
        {marsImage.alt}.{' '}
        <a href={marsImage.source}>{marsImage.credit}</a>
      </p>
    </section>
  )
}
