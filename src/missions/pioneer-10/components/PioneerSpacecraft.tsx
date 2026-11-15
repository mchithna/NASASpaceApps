import styles from '../Pioneer.module.css'
import type { ReactNode } from 'react'

/** Schematic geometry based on NASA references. Not to scale; no fabricated logos. */
export function PioneerSpacecraft() {
  return (
    <svg className={styles.craft} viewBox="0 0 480 340" aria-hidden="true">
      <path d="M252 174 422 45" stroke="#b4ccdc" strokeWidth="4" />
      <circle cx="427" cy="41" r="9" fill="#d9a56c" />
      <path
        d="M230 205 66 285M237 216 102 321M232 197l-74-124"
        stroke="#b4ccdc"
        strokeWidth="5"
      />
      <g fill="#455a6a" stroke="#d5d9d0" strokeWidth="2">
        <path d="m45 266 38-8 17 35-37 12Z" />
        <path d="m81 303 35-12 20 31-36 13Z" />
      </g>
      <path
        d="m42 271 44 13m-37-3 41 13m-3 17 42 10m-38-2 42 10"
        stroke="#e9c784"
        strokeWidth="3"
      />
      <path
        d="m207 168 62-12 22 65-54 18-31-25Z"
        fill="#c6a45d"
        stroke="#f5d99b"
        strokeWidth="3"
      />
      <path
        d="M215 115Q360 183 242 280Q317 177 215 115Z"
        fill="#b5c1ce"
        stroke="#edf0ec"
        strokeWidth="4"
      />
      <ellipse
        cx="222"
        cy="196"
        rx="53"
        ry="86"
        transform="rotate(-17 222 196)"
        fill="#486177"
        stroke="#e2e5de"
        strokeWidth="4"
      />
      <path
        d="M217 124 170 182 245 263M249 132l-79 50 103 51"
        fill="none"
        stroke="#e0e4d9"
        strokeWidth="3"
      />
      <circle cx="170" cy="182" r="10" fill="#e9c784" />
      <path d="m166 66-13 28 24-4Z" fill="#adbfce" />
    </svg>
  )
}

export function Starfield({ children }: { children?: ReactNode }) {
  return <div className={styles.starfield}>{children}</div>
}
