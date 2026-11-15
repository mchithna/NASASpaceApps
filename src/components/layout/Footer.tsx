import { Link } from 'react-router'
import { ArrowUp, ExternalLink } from 'lucide-react'
import { NovaLogo } from '@/pages/components/landing/NovaLogo.tsx'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#070d17]/80 backdrop-blur-md pt-12 pb-8 px-6 text-[#9aa7bd] text-xs">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-white font-heading font-semibold text-lg tracking-tight"
            >
              <NovaLogo size={24} />
              <span>
                Nova<span className="text-[#53cbff]">Explorer</span>
              </span>
            </Link>
            <p className="leading-relaxed max-w-sm">
              An educational space exploration platform bringing the stories and
              legacies of NASA missions to a new generation of explorers.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-[#d4ff9a] hover:underline font-medium mt-1"
            >
              <span>Mission Control</span>
              <ExternalLink size={13} aria-hidden="true" />
            </Link>
          </div>

          {/* NASA Resources */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-heading font-semibold text-white text-sm">
              NASA Science Resources
            </h4>
            <a
              href="https://science.nasa.gov"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span>NASA Science Official</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a
              href="https://www.jpl.nasa.gov"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span>NASA Jet Propulsion Laboratory</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
            <a
              href="https://science.nasa.gov/missions/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span>NASA Space Missions Directory</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>

          {/* Space Apps Challenge Badge */}
          <div className="flex flex-col gap-2.5">
            <span className="eyebrow-label text-[10px]">
              <span className="eyebrow-dot" /> NASA SPACE APPS CHALLENGE 2026
            </span>
            <h4 className="font-heading font-semibold text-white text-sm">
              Abandoned But Not Forgotten
            </h4>
            <p className="leading-relaxed">
              NovaExplorer is an independent educational experience and is not
              officially endorsed by NASA. Sourced facts and citations preserve
              original mission credits.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.06] text-[11px]">
          <span>© 2026 NovaExplorer · Keep curiosity alive.</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
