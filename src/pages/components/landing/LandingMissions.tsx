import { Link } from 'react-router'
import { ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { listMissions } from '@/missions/registry.ts'

// Authentic high-resolution local NASA assets for the landing page cards
const missionLandingImages: Record<string, string> = {
  'surveyor-3': '/assets/common/landing/surveyor-3.jpg',
  opportunity: '/assets/common/landing/opportunity.jpg',
  ingenuity: '/assets/common/landing/ingenuity.jpg',
  insight: '/assets/common/landing/insight.jpg',
  'pioneer-10': '/assets/common/landing/pioneer-10.jpg',
}

const destinationIcons: Record<string, string> = {
  'The Moon': '🌙',
  Mars: '🪐',
  'Outer Solar System': '✨',
}

export function LandingMissions() {
  const missions = listMissions()

  return (
    <section
      id="featured-missions"
      aria-labelledby="missions-heading"
      className="relative w-full py-16 sm:py-24 bg-[#050A12] border-t border-[#344354]/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-12">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D9FCA7]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>FIVE REMARKABLE SPACECRAFT. FIVE ENDURING LEGACIES.</span>
            </div>
            <h2
              id="missions-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F5F7FB]"
            >
              Featured Missions
            </h2>
            <p className="text-sm sm:text-base text-[#AAB7C8] leading-relaxed">
              Explore authentic NASA missions left across the lunar regolith, the red Martian desert,
              and the cold abyss past Jupiter.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#344354] bg-[#101C2A] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#F5F7FB] transition-all duration-200 hover:border-[#53CBFF] hover:text-[#53CBFF] hover:bg-[#152333] focus-visible:outline-2 focus-visible:outline-[#53CBFF]"
            >
              <span>Explore All Missions</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Five Mission Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {missions.map((mission) => {
            const imageSrc = missionLandingImages[mission.id] || mission.coverImage
            const destIcon = destinationIcons[mission.destination] || '🚀'

            return (
              <article
                key={mission.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#344354] bg-[#101C2A] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#53CBFF]/80 hover:shadow-[0_12px_32px_rgba(83,203,255,0.15)] focus-within:ring-2 focus-within:ring-[#53CBFF]"
              >
                {/* Upper Area: Spacecraft Image with Dark Gradient Overlay */}
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B1421]">
                    <img
                      src={imageSrc}
                      alt={`Cover illustration representing the ${mission.displayName} mission`}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for seamless blend to content */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#101C2A] via-[#101C2A]/40 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Destination Pill Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-[#344354]/80 bg-[#0B1421]/90 px-2.5 py-1 text-[11px] font-semibold text-[#F5F7FB] backdrop-blur-md shadow-sm">
                      <span aria-hidden="true">{destIcon}</span>
                      <span>{mission.destination}</span>
                    </div>

                    {/* Subtle status tag */}
                    <div className="absolute top-3 right-3 rounded-full bg-[#152333]/90 border border-[#344354]/60 px-2 py-0.5 text-[10px] font-medium text-[#AAB7C8] backdrop-blur-md">
                      Inactive
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col gap-2.5 p-5">
                    {/* Story Subtitle */}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D9FCA7]">
                      {mission.chapterTitle}
                    </span>

                    {/* Mission Name */}
                    <h3 className="font-heading text-xl font-bold tracking-tight text-[#F5F7FB] group-hover:text-[#53CBFF] transition-colors">
                      <Link
                        to={`/missions/${mission.id}`}
                        className="focus:outline-none"
                      >
                        {mission.displayName}
                      </Link>
                    </h3>

                    {/* Mission Description */}
                    <p className="line-clamp-3 text-xs leading-relaxed text-[#AAB7C8]">
                      {mission.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Metadata and Action Button */}
                <div className="flex items-center justify-between border-t border-[#344354]/60 bg-[#0B1421]/60 px-5 py-3.5 text-xs">
                  <span className="text-[11px] font-medium text-[#AAB7C8] flex items-center gap-1">
                    <MapPin className="size-3 text-[#53CBFF]" aria-hidden="true" />
                    <span>{mission.sources.length} NASA Source{mission.sources.length === 1 ? '' : 's'}</span>
                  </span>

                  <Link
                    to={`/missions/${mission.id}`}
                    aria-label={`Inspect ${mission.displayName} mission overview`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#D9FCA7] group-hover:text-[#53CBFF] transition-colors"
                  >
                    <span>View story</span>
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

      </div>
    </section>
  )
}
