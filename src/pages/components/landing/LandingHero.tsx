import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Compass, ShieldCheck, Orbit, Radio } from 'lucide-react'

export function LandingHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Only track mouse movement if window.matchMedia exists and user does not prefer reduced motion
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window === 'undefined' || window.innerWidth < 1024) return
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 20
      const y = (e.clientY / innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scrollToMissions = () => {
    const el = document.getElementById('featured-missions')
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }


  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-heading"
      className="relative min-h-[92vh] sm:min-h-screen w-full overflow-hidden flex items-center pt-24 pb-16 sm:pt-28 sm:pb-20 bg-[#050A12]"
    >
      {/* Layer 1: Atmospheric Ambient Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Upper Left Blue Nebula */}
        <div className="absolute -top-32 -left-32 size-[500px] rounded-full bg-radial from-[#53CBFF]/12 via-[#1E3A5F]/5 to-transparent blur-3xl" />
        {/* Right Ambient Planet Glow */}
        <div className="absolute top-1/4 -right-24 size-[650px] rounded-full bg-radial from-[#C86432]/15 via-[#823214]/5 to-transparent blur-3xl" />
        {/* Bottom Fade to Page Content */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050A12] via-[#050A12]/80 to-transparent" />
      </div>

      {/* Layer 2: Twinkling Starfield */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Star set 1 */}
        <div className="absolute top-[12%] left-[8%] size-1 rounded-full bg-[#F5F7FB] animate-star-1 opacity-70" />
        <div className="absolute top-[28%] left-[22%] size-1.5 rounded-full bg-[#53CBFF] animate-star-2 opacity-80" />
        <div className="absolute top-[18%] left-[48%] size-1 rounded-full bg-[#F5F7FB] animate-star-3 opacity-60" />
        <div className="absolute top-[45%] left-[12%] size-1 rounded-full bg-[#D9FCA7] animate-star-1 opacity-50" />
        <div className="absolute top-[68%] left-[28%] size-1.5 rounded-full bg-[#F5F7FB] animate-star-2 opacity-75" />
        <div className="absolute top-[82%] left-[15%] size-1 rounded-full bg-[#53CBFF] animate-star-3 opacity-60" />

        {/* Star set 2 (Right hemisphere) */}
        <div className="absolute top-[15%] right-[25%] size-1 rounded-full bg-[#F5F7FB] animate-star-2 opacity-70" />
        <div className="absolute top-[22%] right-[10%] size-1.5 rounded-full bg-[#D9FCA7] animate-star-1 opacity-80" />
        <div className="absolute top-[38%] right-[35%] size-1 rounded-full bg-[#F5F7FB] animate-star-3 opacity-50" />
        <div className="absolute top-[75%] right-[20%] size-1 rounded-full bg-[#53CBFF] animate-star-1 opacity-65" />
        <div className="absolute top-[60%] right-[8%] size-1.5 rounded-full bg-[#F5F7FB] animate-star-2 opacity-75" />
        <div className="absolute top-[85%] right-[42%] size-1 rounded-full bg-[#F5F7FB] animate-star-3 opacity-60" />
      </div>

      {/* Main Content Container */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Headline, Narrative, and Interactive CTAs */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:col-span-7 z-10">
            
            {/* Top Status Pill: NASA Educational Experience */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#344354] bg-[#0B1421]/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#AAB7C8] shadow-sm backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D9FCA7] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#D9FCA7]" />
                </span>
                <span className="text-[#F5F7FB]">NASA EDUCATIONAL EXPERIENCE</span>
                <span className="text-[#344354]" aria-hidden="true">&bull;</span>
                <span className="text-[#53CBFF]">Space Apps 2026</span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#344354]/60 bg-[#152333]/50 px-3 py-1.5 text-xs font-medium text-[#AAB7C8]">
                <Radio className="size-3 text-[#4FD1A5] animate-pulse" aria-hidden="true" />
                <span>5 Archival Telemetry Streams</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="flex flex-col gap-2">
              <h1
                id="hero-heading"
                className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
              >
                <span className="block text-[#F5F7FB]">Some Missions End.</span>
                <span className="block text-[#D9FCA7] drop-shadow-[0_0_24px_rgba(217,252,167,0.35)]">
                  Their Stories Don&apos;t.
                </span>
              </h1>
            </div>

            {/* Supporting Paragraph */}
            <p className="max-w-2xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#AAB7C8]">
              Journey through the extraordinary stories of five NASA spacecraft that
              changed how we understand the universe. Explore their missions, uncover
              scientific discoveries, and preserve their legacies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/onboarding"
                className="group relative inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#D9FCA7] px-7 py-3.5 text-sm sm:text-base font-semibold text-[#050A12] shadow-elevated transition-all duration-200 hover:bg-[#cbf595] hover:shadow-[0_0_28px_rgba(217,252,167,0.45)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#D9FCA7]"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={scrollToMissions}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#344354] bg-[#152333]/80 px-6 py-3.5 text-sm sm:text-base font-medium text-[#F5F7FB] backdrop-blur-md transition-all duration-200 hover:bg-[#152333] hover:border-[#53CBFF]/60 hover:text-[#53CBFF] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
              >
                <Compass className="size-4 text-[#53CBFF]" aria-hidden="true" />
                <span>Explore Missions</span>
              </button>

              <Link
                to="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent px-4 py-3 text-sm font-medium text-[#AAB7C8] hover:text-[#F5F7FB] hover:bg-[#152333]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
              >
                <Orbit className="size-4 text-[#53CBFF]" aria-hidden="true" />
                <span>Mission Control</span>
              </Link>
            </div>

            {/* Educational Trust Badge */}
            <div className="flex items-center gap-2.5 pt-2 text-xs text-[#AAB7C8]">
              <ShieldCheck className="size-4 shrink-0 text-[#4FD1A5]" aria-hidden="true" />
              <span>
                Free educational experience for school-age learners ages 10–17. No commercial tracking or advertising.
              </span>
            </div>
          </div>

          {/* Right Column: Cinematic Planetary Visual Environment */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            <div
              className="relative size-[340px] sm:size-[460px] lg:size-[520px] transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
              }}
            >
              {/* Outer Atmospheric Glow Rings */}
              <div
                className="absolute inset-0 rounded-full bg-radial from-[#C86432]/25 via-[#53CBFF]/10 to-transparent blur-2xl"
                aria-hidden="true"
              />

              {/* Orbital Arc Lines with Subtle Rotation */}
              <svg
                viewBox="0 0 500 500"
                className="absolute inset-0 size-full animate-orbit pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Outer Ellipse */}
                <ellipse
                  cx="250"
                  cy="250"
                  rx="230"
                  ry="90"
                  transform="rotate(-25 250 250)"
                  stroke="#344354"
                  strokeWidth="1"
                  strokeDasharray="8 8"
                  opacity="0.6"
                />
                {/* Highlight Arc on Orbit */}
                <path
                  d="M 80 180 A 230 90 0 0 1 320 160"
                  stroke="#D9FCA7"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                {/* Node Orbiter Marker */}
                <circle cx="320" cy="160" r="3" fill="#D9FCA7" className="animate-glow-lime" />
              </svg>

              {/* Second Counter-Orbit Arc */}
              <svg
                viewBox="0 0 500 500"
                className="absolute inset-0 size-full pointer-events-none opacity-40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <ellipse
                  cx="250"
                  cy="250"
                  rx="180"
                  ry="210"
                  transform="rotate(40 250 250)"
                  stroke="#53CBFF"
                  strokeWidth="0.75"
                  strokeDasharray="4 6"
                />
              </svg>

              {/* The Mars Planet Globe */}
              <div className="relative size-full rounded-full overflow-hidden shadow-[0_0_80px_rgba(200,100,50,0.35)] animate-float">
                <img
                  src="/assets/common/landing/mars-hero.jpg"
                  alt="NASA mosaic photograph of the planet Mars showing global surface features and atmosphere"
                  className="size-full object-cover rounded-full"
                  loading="eager"
                  fetchPriority="high"
                />
                
                {/* Inner Shadow / Terminator Rim Lighting to give 3D spherical depth */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: 'inset -35px -25px 60px 20px rgba(5, 10, 18, 0.95), inset 15px 15px 40px rgba(83, 203, 255, 0.35)',
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Distant Moonlet / Satellite Body */}
              <div
                className="absolute -top-4 -right-2 size-8 sm:size-10 rounded-full bg-[#152333] border border-[#344354] shadow-md flex items-center justify-center animate-star-2"
                aria-hidden="true"
              >
                <div className="size-4 sm:size-5 rounded-full bg-gradient-to-br from-[#8C9BB3] to-[#101C2A]" />
              </div>

              {/* Telemetry Tag Pill Floating Near Planet */}
              <div className="absolute -bottom-2 -left-4 rounded-xl border border-[#344354] bg-[#0B1421]/90 px-3.5 py-2 shadow-elevated backdrop-blur-md hidden sm:flex items-center gap-3 text-xs">
                <div className="size-2 rounded-full bg-[#4FD1A5] animate-ping" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#F5F7FB]">Mars Surface Target</p>
                  <p className="text-[10px] text-[#AAB7C8]">Opportunity &bull; InSight &bull; Ingenuity</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
