import type { CSSProperties } from 'react'
import { UserRound, Rocket, Target, Star, ArrowRight } from 'lucide-react'
const steps = [
  {
    title: 'Create Explorer Profile',
    icon: UserRound,
    description: 'Set up your space explorer identity and begin your journey.',
  },
  {
    title: 'Explore Missions',
    icon: Rocket,
    description:
      'Discover the stories and scientific achievements of five iconic NASA spacecraft.',
  },
  {
    title: 'Complete Challenges',
    icon: Target,
    description:
      'Explore interactive challenges and investigate space science.',
  },
  {
    title: 'Earn XP & Achievements',
    icon: Star,
    description:
      'Gain experience, unlock achievements, and advance your explorer rank.',
  },
]
export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="lp-section lp-process"
      aria-labelledby="how-it-works-heading"
    >
      <div className="lp-container">
        <div className="lp-centered-heading" data-reveal>
          <p className="lp-eyebrow">YOUR NEXT GREAT ADVENTURE</p>
          <h2 id="how-it-works-heading">How It Works</h2>
          <p>
            A fun, gamified way to explore real NASA missions and their lasting
            impact.
          </p>
        </div>
        <ol className="lp-process-grid">
          {steps.map(({ title, icon: Icon, description }, index) => (
            <li
              className="lp-step"
              key={title}
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` } as CSSProperties}
            >
              <div className="lp-step-top">
                <span className="lp-step-icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <span className="lp-step-number">0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              {index < 3 && (
                <ArrowRight
                  className="lp-step-connector"
                  size={18}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
        <p className="lp-process-note">
          The academy journey above describes the planned chapter experience.
          Mission overviews and explorer setup are available now.
        </p>
      </div>
    </section>
  )
}
