import { User, Rocket, Target, Star, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: '1. Choose a Story',
    displayTitle: 'Create Explorer Profile',
    icon: User,
    description: 'Set up your space explorer identity and begin your journey.',
    accent: '#D9FCA7',
  },
  {
    number: '02',
    title: '2. Investigate Science',
    displayTitle: 'Explore Missions',
    icon: Rocket,
    description: 'Discover the stories and scientific achievements of five iconic NASA spacecraft.',
    accent: '#53CBFF',
  },
  {
    number: '03',
    title: '3. Earn Academy XP',
    displayTitle: 'Complete Challenges',
    icon: Target,
    description: 'Explore interactive challenges and investigate space science.',
    accent: '#F7C66A',
  },
  {
    number: '04',
    title: '4. Fill Your Journal',
    displayTitle: 'Earn XP & Achievements',
    icon: Star,
    description: 'Gain experience, unlock achievements, and advance your explorer rank.',
    accent: '#4FD1A5',
  },
]

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative w-full py-16 sm:py-24 bg-[#0B1421]/60 border-t border-[#344354]/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center pb-12 sm:pb-16 max-w-2xl mx-auto gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#53CBFF]">
            Academy Journey
          </span>
          <h2
            id="how-it-works-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F5F7FB]"
          >
            How NovaExplorer Works
          </h2>
          <p className="text-sm sm:text-base text-[#AAB7C8] leading-relaxed">
            A fun, gamified way to explore real NASA missions and their lasting impact.
          </p>
        </div>

        {/* 4 Process Step Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#344354] bg-[#101C2A] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#53CBFF]/60 hover:shadow-elevated"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between pb-4">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl border border-[#344354] bg-[#152333] transition-colors group-hover:border-[#53CBFF]/60"
                    style={{ color: step.accent }}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#344354] group-hover:text-[#AAB7C8] transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="sr-only">{step.title}</span>
                  <h3 className="font-heading text-lg font-bold text-[#F5F7FB]">
                    {step.displayTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#AAB7C8] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting arrow indicator (for desktop between columns) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-6 items-center justify-center rounded-full border border-[#344354] bg-[#0B1421] text-[#AAB7C8]" aria-hidden="true">
                    <ArrowRight className="size-3 text-[#53CBFF]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
