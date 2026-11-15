import { ArrowUp, ExternalLink } from 'lucide-react'
import { NovaLogo } from './NovaLogo.tsx'

export function LandingFooter() {
  const scrollToTop = () => {
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }


  return (
    <footer className="relative w-full border-t border-[#344354] bg-[#050A12] py-12 sm:py-16 text-[#AAB7C8]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 3-column Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12 pb-12 border-b border-[#344354]/60">
          
          {/* Left Column: NovaExplorer brand & narrative */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <div className="flex items-center gap-2.5">
              <NovaLogo size={28} className="size-7" />
              <span className="font-heading text-xl font-bold tracking-tight text-[#F5F7FB]">
                Nova<span className="text-[#53CBFF]">Explorer</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm leading-relaxed text-[#AAB7C8] max-w-md">
              An educational space exploration platform bringing the stories and legacies of NASA
              missions to a new generation of explorers.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-[#53CBFF]">
              <span className="size-2 rounded-full bg-[#4FD1A5]" aria-hidden="true" />
              <span>NASA Space Apps Challenge 2026 Global Project</span>
            </div>
          </div>

          {/* Middle Column: Official NASA Resources & Media Credits */}
          <div className="flex flex-col gap-3 md:col-span-4">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#F5F7FB]">
              NASA Resources &amp; Data
            </h4>
            
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <a
                  href="https://science.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#53CBFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
                >
                  <span>NASA Science</span>
                  <ExternalLink className="size-3 text-[#53CBFF]" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jpl.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#53CBFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
                >
                  <span>NASA Jet Propulsion Laboratory</span>
                  <ExternalLink className="size-3 text-[#53CBFF]" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://images.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#53CBFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
                >
                  <span>NASA Image and Video Library</span>
                  <ExternalLink className="size-3 text-[#53CBFF]" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://solarsystem.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#53CBFF] transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
                >
                  <span>NASA Solar System Exploration</span>
                  <ExternalLink className="size-3 text-[#53CBFF]" aria-hidden="true" />
                </a>
              </li>
            </ul>

            <p className="text-[11px] text-[#8C9BB3] pt-1">
              Imagery credits: NASA, NASA/JPL-Caltech, NASA/JSC (Apollo 12), and NASA Ames Research Center.
            </p>
          </div>

          {/* Right Column: Challenge Acknowledgement & Disclaimer */}
          <div className="flex flex-col gap-3 md:col-span-3">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#F5F7FB]">
              Challenge Acknowledgement
            </h4>

            <p className="text-xs leading-relaxed text-[#AAB7C8]">
              NASA Space Apps Challenge 2026: <strong className="text-[#D9FCA7]">Abandoned But Not Forgotten</strong>.
            </p>

            <p className="text-xs leading-relaxed text-[#8C9BB3]">
              NovaExplorer is an independent educational submission and is not officially endorsed by NASA.
            </p>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back-to-top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[#8C9BB3]">
          <p>&copy; 2026 NovaExplorer. Built for the NASA Space Apps Challenge.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#344354] bg-[#101C2A] px-3.5 py-1.5 text-xs text-[#AAB7C8] hover:text-[#F5F7FB] hover:border-[#53CBFF] transition-all focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
          >
            <span>Back to top</span>
            <ArrowUp className="size-3 text-[#53CBFF]" aria-hidden="true" />
          </button>
        </div>

      </div>
    </footer>
  )
}
