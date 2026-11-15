import { Link } from 'react-router'
import { ArrowUpRight, Orbit } from 'lucide-react'
export function LandingAbout() {
  return (
    <section
      id="about"
      tabIndex={-1}
      aria-labelledby="about-heading"
      className="lp-about lp-container lp-section"
      data-reveal
    >
      <div className="lp-about-symbol" aria-hidden="true">
        <Orbit />
      </div>
      <div>
        <p className="lp-eyebrow">ABANDONED BUT NOT FORGOTTEN</p>
        <h2 id="about-heading">
          Their mission lives on.
          <br />
          <span>Through you.</span>
        </h2>
        <p>
          Built for curious minds, NovaExplorer brings the legacies of NASA
          spacecraft to a new generation. The academy is our storytelling frame.
          The spacecraft and their science are real.
        </p>
        <p>
          Start with sourced mission overviews while the five interactive
          chapters take shape.
        </p>
      </div>
      <Link className="lp-button lp-primary" to="/onboarding">
        Become an Explorer <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </section>
  )
}
