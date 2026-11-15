import { Link } from 'react-router'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export function LandingAbout() {
  return (
    <section
      id="about"
      aria-labelledby="attribution-heading"
      className="relative w-full py-16 sm:py-20 bg-[#050A12] border-t border-[#344354]/40"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl border border-[#344354] bg-[#101C2A]/90 p-8 sm:p-12 shadow-surface backdrop-blur-md">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-radial from-[#53CBFF]/10 to-transparent blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 max-w-3xl">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#344354] bg-[#152333] px-3 py-1 text-xs font-semibold text-[#53CBFF]">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                <span>Educational Mission</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D9FCA7]">
                Scientific Accuracy Standard
              </span>
            </div>

            {/* Heading */}
            <h2
              id="attribution-heading"
              className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F7FB]"
            >
              Scientific Integrity &amp; NASA Sources
            </h2>

            {/* Detailed description */}
            <p className="text-sm sm:text-base leading-relaxed text-[#AAB7C8]">
              All spacecraft specifications, operational timelines, landing coordinates, and historical accounts
              are researched directly from NASA Science, JPL, and public NASA archives. Academy narration,
              interactive simulations, and training scenarios are educational interpretations designed to inspire
              young scientists. This project is an independent submission to the NASA Space Apps Challenge 2026
              and is not officially endorsed by NASA.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-sm">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-1.5 font-semibold text-[#D9FCA7] hover:text-[#cbf595] hover:underline focus-visible:outline-2 focus-visible:outline-[#D9FCA7]"
              >
                <span>Set up your Explorer Profile</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 font-semibold text-[#53CBFF] hover:underline focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
              >
                <span>Open Mission Control</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
