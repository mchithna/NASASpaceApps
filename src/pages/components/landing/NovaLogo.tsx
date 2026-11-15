export type NovaLogoProps = {
  className?: string
  size?: number
}

export function NovaLogo({ className = 'size-8', size = 32 }: NovaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id="planet-grad"
          cx="35%"
          cy="30%"
          r="65%"
        >
          <stop offset="0%" stopColor="#53CBFF" />
          <stop offset="60%" stopColor="#1E3A5F" />
          <stop offset="100%" stopColor="#0B1421" />
        </radialGradient>
        <linearGradient
          id="orbit-grad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#D9FCA7" />
          <stop offset="50%" stopColor="#53CBFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D9FCA7" />
        </linearGradient>
      </defs>

      {/* Central Celestial Body */}
      <circle cx="16" cy="16" r="8" fill="url(#planet-grad)" stroke="#53CBFF" strokeWidth="0.75" />

      {/* Atmospheric Haze Arc */}
      <path
        d="M 9.5 12.5 A 8 8 0 0 1 21 11"
        stroke="#D9FCA7"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Elliptical Orbital Ring (tilted) */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5"
        transform="rotate(-28 16 16)"
        fill="none"
        stroke="url(#orbit-grad)"
        strokeWidth="1.25"
        strokeDasharray="40 4"
      />

      {/* Satellite Node on Orbit */}
      <circle
        cx="27"
        cy="10"
        r="1.8"
        fill="#D9FCA7"
        className="animate-glow-lime"
      />
    </svg>
  )
}
