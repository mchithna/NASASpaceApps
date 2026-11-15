import type { CSSProperties } from 'react'
import '@/styles/observatory.css'

interface SpaceBackgroundProps {
  showOrbits?: boolean
}

// Stable decorative positions do not change when the learner navigates.
const stars = Array.from({ length: 64 }, (_, index) => ({
  left: `${((index * 37.17 + 7) % 100).toFixed(2)}%`,
  top: `${((index * 23.71 + 3) % 100).toFixed(2)}%`,
  '--star-delay': `${-(index % 11)}s`,
  '--star-size': index % 7 === 0 ? '3px' : '1.5px',
}))

export function SpaceBackground({ showOrbits = true }: SpaceBackgroundProps) {
  return (
    <div className="observatory-sky" aria-hidden="true">
      <div className="observatory-sky-photo" />
      <div className="observatory-sky-glow" />
      <div className="observatory-stars">
        {stars.map((style, index) => (
          <span key={index} style={style as CSSProperties} />
        ))}
      </div>
      {showOrbits ? <div className="observatory-orbit" /> : null}
    </div>
  )
}
