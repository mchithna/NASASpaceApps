import styles from '../Ingenuity.module.css'

/** Simplified engineering illustration; four blades in two coaxial rotors. */
export function Helicopter({ spinning = false }: { spinning?: boolean }) {
  return (
    <svg viewBox="0 0 500 340" className={styles.helicopter} aria-hidden="true">
      <path d="M250 66V188" stroke="#c8dcf0" strokeWidth="7" />
      <path
        d="m183 40 115 0 35 29-132 0Z"
        fill="#1d3550"
        stroke="#90b7dc"
        strokeWidth="3"
      />
      <path
        d="m212 43 15 23m10-23 13 23m11-23 12 23m12-23 12 23m-93-11h111"
        stroke="#87c2e2"
      />
      <g
        className={spinning ? styles.rotor : undefined}
        style={{ transformOrigin: '250px 103px' }}
      >
        <path
          d="M250 99 45 88 35 103 250 109 456 120 466 105Z"
          fill="#d7e5ec"
          stroke="#334963"
          strokeWidth="3"
        />
      </g>
      <g
        className={spinning ? styles.counterRotor : undefined}
        style={{ transformOrigin: '250px 139px' }}
      >
        <path
          d="m250 135-175 25 12 14 164-29 174-26-12-13Z"
          fill="#a8c2ce"
          stroke="#334963"
          strokeWidth="3"
        />
      </g>
      <path
        d="m214 183 65-8 20 54-68 20-23-23Z"
        fill="#dbaf62"
        stroke="#f7dca6"
        strokeWidth="3"
      />
      <path
        d="m214 183 17 66m48-74-6 61m-57-34 66-9m-62 24 68-13"
        stroke="#98773f"
        strokeWidth="2"
      />
      <path
        d="m218 233-70 70m131-64 72 64m-100-64-30 66m45-69 40 69"
        stroke="#d8e8eb"
        strokeWidth="5"
        fill="none"
      />
      <path
        d="M135 304h30m172 0h29m-158 3h26m59 0h26"
        stroke="#9dbac4"
        strokeWidth="5"
      />
      <circle
        cx="253"
        cy="244"
        r="7"
        fill="#0b1020"
        stroke="#53cbff"
        strokeWidth="3"
      />
    </svg>
  )
}
