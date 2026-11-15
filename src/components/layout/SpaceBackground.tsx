import { useEffect, useRef } from 'react'

interface SpaceBackgroundProps {
  celestialImage?: string
  celestialAlt?: string
  showOrbits?: boolean
}

export function SpaceBackground({
  celestialImage = '/assets/common/landing/mars.webp',
  celestialAlt = '',
  showOrbits = true,
}: SpaceBackgroundProps) {
  const artRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const motion = window.matchMedia?.(
      '(prefers-reduced-motion: no-preference) and (pointer: fine)',
    )
    if (!motion?.matches) return

    let frame = 0
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        artRef.current?.style.setProperty(
          '--parallax-x',
          `${(event.clientX / window.innerWidth - 0.5) * 14}px`,
        )
        artRef.current?.style.setProperty(
          '--parallax-y',
          `${(event.clientY / window.innerHeight - 0.5) * 10}px`,
        )
      })
    }

    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div
      ref={artRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Background Gradient & Ambient Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#08101e] to-[#050a14]" />
      <div className="absolute -top-40 right-[-10%] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(83,203,255,0.12)_0%,transparent_65%)] blur-3xl" />
      <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,255,154,0.06)_0%,transparent_60%)] blur-3xl" />
      <div className="absolute bottom-[-10%] right-[20%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(83,203,255,0.08)_0%,transparent_65%)] blur-3xl" />

      {/* Twinkling Star Field */}
      <div className="absolute inset-0">
        <span className="absolute top-[12%] left-[18%] size-1 bg-white rounded-full animate-star-1 opacity-70 shadow-[0_0_6px_#fff]" />
        <span className="absolute top-[28%] left-[75%] size-1.5 bg-[#d4ff9a] rounded-full animate-star-2 opacity-60 shadow-[0_0_8px_#d4ff9a]" />
        <span className="absolute top-[65%] left-[12%] size-1 bg-[#53cbff] rounded-full animate-star-3 opacity-60 shadow-[0_0_6px_#53cbff]" />
        <span className="absolute top-[45%] left-[88%] size-1 bg-white rounded-full animate-star-1 opacity-75 shadow-[0_0_6px_#fff]" />
        <span className="absolute top-[82%] left-[42%] size-1.5 bg-[#d4ff9a] rounded-full animate-star-2 opacity-50 shadow-[0_0_8px_#d4ff9a]" />
        <span className="absolute top-[18%] left-[55%] size-1 bg-white rounded-full animate-star-3 opacity-40" />
        <span className="absolute top-[72%] left-[82%] size-1 bg-white rounded-full animate-star-1 opacity-50" />
      </div>

      {/* Parallax Celestial Space Art */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: 'translate(var(--parallax-x, 0px), var(--parallax-y, 0px))',
        }}
      >
        {/* Planet / Spacecraft Artwork on Right */}
        {celestialImage ? (
          <div className="absolute -right-20 sm:right-[3%] top-[10%] sm:top-[12%] w-[320px] sm:w-[480px] lg:w-[620px] aspect-square rounded-full overflow-hidden opacity-35 sm:opacity-45 pointer-events-none mix-blend-screen">
            <img
              src={celestialImage}
              alt={celestialAlt}
              className="w-full h-full object-cover animate-planet-slow"
              loading="eager"
            />
            {/* Atmospheric Rim & Shadow overlay */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,transparent_35%,rgba(5,10,20,0.85)_80%,#050a14_95%)]" />
          </div>
        ) : null}

        {/* Faint Orbit Rings */}
        {showOrbits ? (
          <svg
            className="absolute -right-24 top-[6%] w-[700px] sm:w-[950px] lg:w-[1100px] h-[650px] opacity-25"
            viewBox="0 0 900 700"
            fill="none"
          >
            <ellipse
              cx="470"
              cy="340"
              rx="414"
              ry="132"
              transform="rotate(-28 470 340)"
              stroke="rgba(83, 203, 255, 0.4)"
              strokeWidth="1"
              strokeDasharray="6 8"
            />
            <ellipse
              cx="470"
              cy="340"
              rx="360"
              ry="240"
              transform="rotate(-28 470 340)"
              stroke="rgba(212, 255, 154, 0.3)"
              strokeWidth="1"
            />
          </svg>
        ) : null}
      </div>
    </div>
  )
}
