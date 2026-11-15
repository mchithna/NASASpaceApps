import { LandingStarfield } from '@/pages/components/landing/LandingStarfield.tsx'
import '@/styles/observatory.css'

interface SpaceBackgroundProps {
  showOrbits?: boolean
}

export function SpaceBackground({ showOrbits = false }: SpaceBackgroundProps) {
  return (
    <div
      className="observatory-sky"
      data-orbits={showOrbits ? 'true' : 'false'}
      aria-hidden="true"
    >
      <div className="observatory-sky-photo" />
      <div className="observatory-sky-glow" />
      <LandingStarfield />
    </div>
  )
}
