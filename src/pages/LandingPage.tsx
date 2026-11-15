import { useEffect, useRef } from 'react'
import '@/pages/components/landing/landing.css'
import { LandingNavbar } from '@/pages/components/landing/LandingNavbar.tsx'
import { LandingHero } from '@/pages/components/landing/LandingHero.tsx'
import { LandingMissions } from '@/pages/components/landing/LandingMissions.tsx'
import { LandingHowItWorks } from '@/pages/components/landing/LandingHowItWorks.tsx'
import { LandingAbout } from '@/pages/components/landing/LandingAbout.tsx'
import { LandingFooter } from '@/pages/components/landing/LandingFooter.tsx'
import { LandingStarfield } from '@/pages/components/landing/LandingStarfield.tsx'

const LIQUID_SELECTOR =
  '.lp-nav, .lp-button, .lp-mission-card, .lp-step, .lp-about, .lp-desktop-links a, .lp-desktop-actions > a'

export function LandingPage() {
  const page = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.title = 'NovaExplorer'
    const root = page.current
    if (!root) return

    let pointerFrame = 0
    const onPointerMove = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        LIQUID_SELECTOR,
      )
      if (!target) return
      cancelAnimationFrame(pointerFrame)
      const clientX = event.clientX
      const clientY = event.clientY
      pointerFrame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect()
        const x = clientX - rect.left
        const y = clientY - rect.top
        target.style.setProperty('--liquid-x', `${x.toFixed(1)}px`)
        target.style.setProperty('--liquid-y', `${y.toFixed(1)}px`)
      })
    }

    root.addEventListener('pointermove', onPointerMove, { passive: true })

    if (
      !window.IntersectionObserver ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return () => {
        cancelAnimationFrame(pointerFrame)
        root.removeEventListener('pointermove', onPointerMove)
      }
    }

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
    const targets = root.querySelectorAll('[data-reveal]')
    targets.forEach((target) => {
      target.classList.add('lp-reveal-pending')
      observer.observe(target)
    })
    return () => {
      cancelAnimationFrame(pointerFrame)
      root.removeEventListener('pointermove', onPointerMove)
      observer.disconnect()
      targets.forEach((target) => target.classList.remove('lp-reveal-pending'))
    }
  }, [])

  return (
    <div ref={page} className="nova-landing">
      <LandingStarfield />
      <LandingNavbar />
      <LandingHero />
      <LandingMissions />
      <LandingHowItWorks />
      <LandingAbout />
      <LandingFooter />
    </div>
  )
}
