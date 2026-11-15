import { Link } from 'react-router'
import { ArrowUp, ArrowUpRight, Orbit } from 'lucide-react'
import { NovaLogo } from '@/pages/components/landing/NovaLogo.tsx'

export function Footer() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })
  }
  return (
    <footer className="observatory-footer">
      <div className="observatory-footer-inner">
        <div className="observatory-footer-invitation">
          <div>
            <p className="observatory-kicker">
              <Orbit size={15} aria-hidden="true" /> THE EXPLORATION CONTINUES
            </p>
            <h2>
              Every mission leaves <span>a story.</span>
            </h2>
          </div>
          <Link to="/dashboard" className="observatory-link-button">
            Find your next mission <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="observatory-footer-grid">
          <div className="observatory-footer-brand">
            <Link to="/" aria-label="NovaExplorer Home">
              <NovaLogo size={30} /> Nova<span>Explorer</span>
            </Link>
            <p>
              Forgotten spacecraft. Extraordinary stories.
              <br />A new generation of explorers.
            </p>
            <p className="observatory-footer-event">
              NASA SPACE APPS CHALLENGE 2026
            </p>
          </div>
          <nav aria-label="Explore NovaExplorer">
            <h3>Your academy</h3>
            <Link to="/dashboard">Mission Control</Link>
            <Link to="/profile">Explorer Profile</Link>
            <Link to="/journal">Discovery Journal</Link>
            <Link to="/achievements">Achievements</Link>
          </nav>
          <nav aria-label="NASA resources">
            <h3>Beyond the academy</h3>
            <a
              href="https://science.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              NASA Science <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <a
              href="https://www.jpl.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jet Propulsion Laboratory{' '}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <a
              href="https://www.nasa.gov/image-article/milky-way-views/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Night-sky photo &middot; NASA/JAXA{' '}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </nav>
          <div className="observatory-footer-note">
            <h3>Abandoned But Not Forgotten</h3>
            <p>
              An independent educational experience, not officially endorsed by
              NASA. Mission imagery and scientific sources retain their original
              credits.
            </p>
            <p>
              Background: archival photograph with decorative star animation.
            </p>
          </div>
        </div>
        <div className="observatory-footer-bottom">
          <span>
            &copy; 2026 NovaExplorer <span aria-hidden="true">/</span> Keep
            curiosity alive.
          </span>
          <button type="button" onClick={scrollToTop}>
            Back to top <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
