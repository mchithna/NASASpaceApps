import { Link } from 'react-router'
import { ArrowUp, ExternalLink } from 'lucide-react'
import { NovaLogo } from './NovaLogo.tsx'
import { landingMedia } from './landingMedia.ts'
import { listMissions } from '@/missions/registry.ts'
import { scrollToLandingSection } from './landingNavigation.ts'
export function LandingFooter() {
  return (
    <footer className="lp-footer" data-reveal>
      <div className="lp-container">
        <div className="lp-footer-grid">
          <div>
            <a
              className="lp-brand"
              href="#home"
              onClick={scrollToLandingSection}
            >
              <NovaLogo />
              <span>NovaExplorer</span>
            </a>
            <p>
              An educational space exploration platform bringing the stories and
              legacies of NASA missions to a new generation of explorers.
            </p>
            <Link to="/dashboard" className="lp-text-link">
              Mission Control <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
          <div>
            <h2>NASA Resources</h2>
            <a href="https://science.nasa.gov">
              NASA Science <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a href="https://www.jpl.nasa.gov">
              NASA Jet Propulsion Laboratory{' '}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
            <a href="https://science.nasa.gov/missions/">
              Official NASA missions{' '}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
          <div>
            <p className="lp-eyebrow">NASA SPACE APPS CHALLENGE 2026</p>
            <h2>Abandoned But Not Forgotten</h2>
            <p>
              NovaExplorer is an independent educational project and is not
              officially endorsed by NASA.
            </p>
          </div>
        </div>
        <details className="lp-credits" id="image-credits" tabIndex={-1}>
          <summary>Image &amp; information credits</summary>
          <p>
            The hero is an illustrative CSS composition using a cropped detail
            of a NASA Mars mosaic, with decorative stars, orbital curves,
            lighting, and horizon. It is not a photograph of an observed scene.
            No AI-generated imagery is used.
          </p>
          <ul>
            <li>
              <a href="https://science.nasa.gov/photojournal/valles-marineris-hemisphere/">
                Mars: Valles Marineris Hemisphere (PIA00003)
              </a>{' '}
              — NASA/JPL/USGS. Mosaic of Viking Orbiter images.
            </li>
            {listMissions().map((mission) => {
              const media = landingMedia[mission.id]
              return (
                <li key={mission.id}>
                  <a href={media.source}>
                    {mission.displayName}: {media.kind}
                  </a>{' '}
                  — {media.credit}.{' '}
                  <a href={mission.sources[0]?.url}>Mission information</a>.
                </li>
              )
            })}
          </ul>
          <p>
            Images are locally resized and compressed; card images are cropped
            for layout. NASA media is used for educational purposes with source
            credits under{' '}
            <a href="https://www.nasa.gov/nasa-brand-center/images-and-media/">
              NASA media usage guidance
            </a>
            . Third-party rights, where noted by NASA, remain with their owners.
            Artist concepts are illustrations, not spacecraft photographs.
          </p>
        </details>
        <div className="lp-footer-bottom">
          <span>© 2026 NovaExplorer · Keep curiosity alive.</span>
          <a href="#home" onClick={scrollToLandingSection}>
            Back to top <ArrowUp size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
