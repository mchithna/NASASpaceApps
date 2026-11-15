import { ArrowUpRight, Orbit, Sparkles } from 'lucide-react'
import { Moon3DIllustration } from '@/pages/components/Moon3DIllustration.tsx'
import styles from '@/pages/AuthPage.module.css'

export function AuthArtwork() {
  return (
    <aside className={styles.artwork} aria-label="Your next adventure">
      <div className={styles.stars} aria-hidden="true" />
      <div className={styles.artworkIntro}>
        <span className={styles.eyebrow}>
          <span className={styles.statusDot} /> THE EXPLORER ACADEMY
        </span>
        <h2>
          Big universe.
          <br />
          Bigger curiosity<span className={styles.lime}>.</span>
        </h2>
        <p>
          Discover the stories of spacecraft left behind.
          <br className={styles.desktopBreak} /> Start a new chapter of your
          own.
        </p>
      </div>

      <figure className={styles.planetFigure}>
        <div className={styles.planetScene}>
          <Moon3DIllustration />
          <div className={styles.planetLabel} aria-hidden="true">
            <span /> LUNA <small>A world of stories</small>
          </div>
          <div className={styles.discoveryTag}>
            <Sparkles size={17} aria-hidden="true" />
            <span>
              Stay curious.
              <br />
              <strong>Go a little further.</strong>
            </span>
          </div>
        </div>
        <figcaption>
          <a
            href="https://science.nasa.gov/moon/"
            target="_blank"
            rel="noreferrer"
          >
            3D Lunar Model · NASA Lunar Science{' '}
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </figcaption>
      </figure>

      <div className={styles.artworkFooter}>
        <Orbit size={26} aria-hidden="true" />
        <div>
          <strong>Every mission leaves a story.</strong>
          <p>Be the explorer who keeps it alive.</p>
        </div>
        <span className={styles.chapterNumber} aria-hidden="true">
          01 / ∞
        </span>
      </div>
    </aside>
  )
}
