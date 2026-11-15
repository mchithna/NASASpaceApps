import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowDown, ArrowRight, ArrowUpRight, Orbit } from 'lucide-react'
import { scrollToLandingSection } from './landingNavigation.ts'
import { LandingMars3D } from './LandingMars3D.tsx'

export function LandingHero() {
  const art = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const motion = window.matchMedia?.(
      '(prefers-reduced-motion: no-preference) and (pointer: fine)',
    )
    if (!motion?.matches) return
    let frame = 0
    const move = (event: PointerEvent) => {
      if (!motion.matches) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        art.current?.style.setProperty(
          '--parallax-x',
          `${(event.clientX / window.innerWidth - 0.5) * 12}px`,
        )
        art.current?.style.setProperty(
          '--parallax-y',
          `${(event.clientY / window.innerHeight - 0.5) * 8}px`,
        )
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return (
    <section
      id="home"
      tabIndex={-1}
      className="lp-hero"
      aria-labelledby="hero-heading"
    >
      <div className="lp-stars" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div ref={art} className="lp-cosmos" aria-hidden="true">
        <div className="lp-sunrise" />
        <LandingMars3D />
        <div className="lp-horizon" />
      </div>
      <div className="lp-container lp-hero-content">
        <p className="lp-eyebrow lp-hero-label">
          <span className="lp-status-dot" /> NASA EDUCATIONAL EXPERIENCE{' '}
          <span className="lp-rule" />
        </p>
        <h1 id="hero-heading">
          <span>Some Missions End.</span>
          <span>Their Stories Don&apos;t.</span>
        </h1>
        <p className="lp-hero-description">
          Journey through the extraordinary stories of five NASA spacecraft that
          changed how we understand the universe. Explore their missions,
          uncover scientific discoveries, and preserve their legacies.
        </p>
        <div className="lp-hero-actions">
          <Link to="/onboarding" className="lp-button lp-primary">
            Begin Your Journey <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
          <a
            href="#featured-missions"
            className="lp-button lp-secondary"
            onClick={scrollToLandingSection}
          >
            Explore Missions <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="lp-hero-note">
          <Orbit size={17} aria-hidden="true" />
          <span>
            Real spacecraft. Extraordinary legacies. A new perspective.
          </span>
        </div>
      </div>
      <div className="lp-container lp-hero-bottom">
        <a
          href="#featured-missions"
          className="lp-scroll-cue"
          onClick={scrollToLandingSection}
        >
          <ArrowDown size={16} aria-hidden="true" /> Discover the missions
        </a>
        <a href="#image-credits" onClick={scrollToLandingSection}>
          Illustrative scene · Mars mosaic: NASA/JPL/USGS
        </a>
      </div>
    </section>
  )
}
