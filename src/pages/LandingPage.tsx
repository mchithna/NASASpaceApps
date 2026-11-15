import { useEffect } from 'react'
import { LandingNavbar } from '@/pages/components/landing/LandingNavbar.tsx'
import { LandingHero } from '@/pages/components/landing/LandingHero.tsx'
import { LandingMissions } from '@/pages/components/landing/LandingMissions.tsx'
import { LandingHowItWorks } from '@/pages/components/landing/LandingHowItWorks.tsx'
import { LandingAbout } from '@/pages/components/landing/LandingAbout.tsx'
import { LandingFooter } from '@/pages/components/landing/LandingFooter.tsx'

export function LandingPage() {
  useEffect(() => {
    document.title = 'NovaExplorer'
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#050A12] text-[#F5F7FB] selection:bg-[#D9FCA7] selection:text-[#050A12]">
      <LandingNavbar />
      <LandingHero />
      <LandingMissions />
      <LandingHowItWorks />
      <LandingAbout />
      <LandingFooter />
    </div>
  )
}
