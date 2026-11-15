import { useEffect, useRef } from 'react'
import '@/pages/components/landing/landing.css'
import { LandingNavbar } from '@/pages/components/landing/LandingNavbar.tsx'
import { LandingHero } from '@/pages/components/landing/LandingHero.tsx'
import { LandingMissions } from '@/pages/components/landing/LandingMissions.tsx'
import { LandingHowItWorks } from '@/pages/components/landing/LandingHowItWorks.tsx'
import { LandingAbout } from '@/pages/components/landing/LandingAbout.tsx'
import { LandingFooter } from '@/pages/components/landing/LandingFooter.tsx'

export function LandingPage() {
  const page = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.title = 'NovaExplorer'
    if (
      !window.IntersectionObserver ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )
      return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('lp-reveal-pending')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    const targets = page.current?.querySelectorAll('[data-reveal]')
    targets?.forEach((target) => {
      target.classList.add('lp-reveal-pending')
      observer.observe(target)
    })
    return () => {
      observer.disconnect()
      targets?.forEach((target) => target.classList.remove('lp-reveal-pending'))
    }
  }, [])

  return (
    <div ref={page} className="nova-landing">
      <LandingNavbar />
      <LandingHero />
      <LandingMissions />
      <LandingHowItWorks />
      <LandingAbout />
      <LandingFooter />
    </div>
  )
}
