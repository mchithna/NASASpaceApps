import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import './chatLauncher.css'

export type ChatLauncherProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean
}

export const ChatLauncher = forwardRef<HTMLButtonElement, ChatLauncherProps>(
  function ChatLauncher({ open = false, className = '', ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        id="novaLauncher"
        className={`nova-chat-launcher ${className}`.trim()}
        aria-label="Ask Nova AI"
        aria-expanded={open}
        aria-haspopup="dialog"
        {...props}
      >
        <span className="nova-hello">
          Hi, I’m Nova. Ask me about any mission.
        </span>
        <span className="nova-badge">
          <svg
            viewBox="0 0 120 120"
            role="img"
            aria-label="Astronaut giving a thumbs up from a neon flying saucer"
          >
            <defs>
              <radialGradient id="nxBg" cx="30%" cy="30%" r="90%">
                <stop offset="0" stopColor="#3b1f86" />
                <stop offset=".55" stopColor="#0d1a4a" />
                <stop offset="1" stopColor="#040913" />
              </radialGradient>
              <radialGradient id="nxMoon" cx="35%" cy="30%" r="80%">
                <stop offset="0" stopColor="#e6eaf7" />
                <stop offset="1" stopColor="#6d74a8" />
              </radialGradient>
              <radialGradient id="nxEarth" cx="55%" cy="20%" r="90%">
                <stop offset="0" stopColor="#4aa8ff" />
                <stop offset="1" stopColor="#0a2c78" />
              </radialGradient>
              <linearGradient id="nxBeam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#86ff4a" stopOpacity=".85" />
                <stop offset="1" stopColor="#86ff4a" stopOpacity=".04" />
              </linearGradient>
              <linearGradient id="nxHull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f1f5fb" />
                <stop offset=".5" stopColor="#aab4c6" />
                <stop offset="1" stopColor="#586379" />
              </linearGradient>
              <linearGradient id="nxTop" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#8e99ad" />
                <stop offset=".5" stopColor="#f0f3f9" />
                <stop offset="1" stopColor="#8e99ad" />
              </linearGradient>
              <linearGradient id="nxVisor" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#173a6e" />
                <stop offset=".7" stopColor="#091630" />
                <stop offset="1" stopColor="#3a7a52" />
              </linearGradient>
              <filter id="nxNeon" x="-30%" y="-90%" width="160%" height="280%">
                <feGaussianBlur stdDeviation="1.3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle cx="60" cy="60" r="60" fill="url(#nxBg)" />
            <ellipse
              cx="22"
              cy="30"
              rx="28"
              ry="13"
              fill="#8a46ff"
              opacity=".2"
              transform="rotate(-25 22 30)"
            />
            <g fill="#fff">
              <circle
                className="nx-star"
                style={{ '--d': '0s' } as CSSProperties}
                cx="18"
                cy="14"
                r="1.2"
              />
              <circle
                className="nx-star"
                style={{ '--d': '.9s' } as CSSProperties}
                cx="48"
                cy="9"
                r="1"
              />
              <circle
                className="nx-star"
                style={{ '--d': '1.7s' } as CSSProperties}
                cx="78"
                cy="16"
                r="1.1"
              />
              <circle
                className="nx-star"
                style={{ '--d': '2.3s' } as CSSProperties}
                cx="112"
                cy="58"
                r="1"
              />
              <circle
                className="nx-star"
                style={{ '--d': '1.2s' } as CSSProperties}
                cx="8"
                cy="64"
                r="1"
              />
              <circle
                className="nx-star"
                style={{ '--d': '.4s' } as CSSProperties}
                cx="108"
                cy="104"
                r="1"
              />
            </g>

            {/* moon */}
            <circle cx="98" cy="25" r="11" fill="url(#nxMoon)" />
            <g fill="#8b92c4" opacity=".55">
              <circle cx="94" cy="22" r="2.4" />
              <circle cx="102" cy="29" r="1.8" />
              <circle cx="99" cy="19" r="1.2" />
            </g>

            {/* earth */}
            <circle
              cx="8"
              cy="118"
              r="34"
              fill="url(#nxEarth)"
              stroke="#6cc0ff"
              strokeWidth=".9"
            />
            <ellipse
              cx="22"
              cy="104"
              rx="8"
              ry="4"
              fill="#3fae5a"
              transform="rotate(-20 22 104)"
            />
            <ellipse
              cx="12"
              cy="96"
              rx="9"
              ry="2.2"
              fill="#fff"
              opacity=".8"
            />
            <ellipse
              cx="30"
              cy="112"
              rx="7"
              ry="1.8"
              fill="#fff"
              opacity=".7"
            />

            {/* asteroids */}
            <path
              className="nx-peb"
              style={{ '--d': '0s' } as CSSProperties}
              d="M8 50L15 46L22 50L20 57L11 58Z"
              fill="#6b5a66"
            />
            <path
              className="nx-peb"
              style={{ '--d': '1.6s' } as CSSProperties}
              d="M104 80L110 78L114 83L109 88Z"
              fill="#7a6572"
            />

            {/* tractor beam */}
            <g className="nx-beam">
              <polygon
                points="47,88 73,88 102,120 18,120"
                fill="url(#nxBeam)"
              />
              <g
                stroke="#d6ffb8"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity=".7"
              >
                <line className="nx-flow" x1="53" y1="90" x2="40" y2="120" />
                <line
                  className="nx-flow"
                  style={{ animationDelay: '-.4s' }}
                  x1="60"
                  y1="90"
                  x2="60"
                  y2="120"
                />
                <line
                  className="nx-flow"
                  style={{ animationDelay: '-.7s' }}
                  x1="67"
                  y1="90"
                  x2="80"
                  y2="120"
                />
              </g>
            </g>

            <g className="nx-ship">
              {/* neon rings */}
              <ellipse
                className="nx-ring"
                cx="60"
                cy="72"
                rx="54"
                ry="12"
                fill="none"
                stroke="#86ff4a"
                strokeWidth="1.3"
                filter="url(#nxNeon)"
              />
              <ellipse
                className="nx-ring"
                style={{
                  transformOrigin: '60px 91px',
                  animationDelay: '-1.2s',
                }}
                cx="60"
                cy="91"
                rx="38"
                ry="6"
                fill="none"
                stroke="#86ff4a"
                strokeWidth="1.1"
                filter="url(#nxNeon)"
              />

              {/* hull */}
              <path
                d="M14 68C16 84 36 92 60 92C84 92 104 84 106 68Z"
                fill="url(#nxHull)"
              />
              <ellipse
                cx="60"
                cy="67"
                rx="46"
                ry="8"
                fill="url(#nxTop)"
                stroke="#6c778c"
                strokeWidth=".6"
              />
              <ellipse cx="60" cy="65" rx="22" ry="4.5" fill="#1a2132" />
              <ellipse
                className="nx-glow"
                cx="60"
                cy="91"
                rx="15"
                ry="3.4"
                fill="#9bff63"
                filter="url(#nxNeon)"
              />

              {/* astronaut */}
              <rect
                x="66"
                y="41"
                width="9"
                height="15"
                rx="3.5"
                fill="#cfd6e3"
              />
              <rect
                x="49"
                y="51"
                width="22"
                height="17"
                rx="6"
                fill="#f6f8fc"
              />
              <circle cx="56.5" cy="58" r="3.7" fill="#1f52d4" />
              <circle cx="55.3" cy="57" r=".7" fill="#fff" />
              <circle cx="58" cy="59.2" r=".6" fill="#fff" />
              <rect x="65" y="54" width="5" height="3.2" rx=".6" fill="#d8353c" />
              <rect x="65" y="54" width="2.2" height="1.8" fill="#2a4aa8" />
              <rect
                x="69"
                y="53"
                width="7"
                height="14"
                rx="3.5"
                fill="#f2f5fb"
                stroke="#cdd5e3"
                strokeWidth=".5"
              />
              <circle
                cx="74"
                cy="66.5"
                r="3.6"
                fill="#fff"
                stroke="#cdd5e3"
                strokeWidth=".5"
              />
              <circle
                cx="60"
                cy="42"
                r="10.5"
                fill="#f7f9fd"
                stroke="#cdd5e3"
                strokeWidth=".5"
              />
              <ellipse
                cx="60"
                cy="43"
                rx="7.2"
                ry="6.2"
                fill="url(#nxVisor)"
              />
              <circle cx="63.4" cy="40.6" r="1.6" fill="#bfe0ff" />
              <path
                d="M54 46Q58 44 62 47"
                stroke="#c9a46a"
                strokeWidth="1.2"
                fill="none"
                opacity=".8"
              />

              {/* thumbs up arm */}
              <g className="nx-thumb">
                <g transform="rotate(-18 50 56)">
                  <rect
                    x="46.5"
                    y="42"
                    width="7"
                    height="15"
                    rx="3.5"
                    fill="#f2f5fb"
                    stroke="#cdd5e3"
                    strokeWidth=".5"
                  />
                  <rect
                    x="46.5"
                    y="49"
                    width="7"
                    height="2"
                    fill="#4b5876"
                  />
                  <circle
                    cx="50"
                    cy="40.5"
                    r="4.2"
                    fill="#fff"
                    stroke="#cdd5e3"
                    strokeWidth=".5"
                  />
                  <rect
                    x="48.4"
                    y="32"
                    width="3.6"
                    height="8.5"
                    rx="1.8"
                    fill="#fff"
                    stroke="#cdd5e3"
                    strokeWidth=".5"
                  />
                </g>
              </g>

              {/* glass dome */}
              <path
                d="M38 65C38 14 82 14 82 65"
                fill="#b6ffb0"
                fillOpacity=".1"
                stroke="#86ff4a"
                strokeWidth="1.3"
                filter="url(#nxNeon)"
              />
              <path
                d="M43 42Q47 28 62 24"
                stroke="#fff"
                strokeOpacity=".6"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />

              {/* front lip hides the seat */}
              <path
                d="M38 64Q60 75 82 64L82 67.5Q60 79 38 67.5Z"
                fill="url(#nxTop)"
              />
              <circle
                cx="74"
                cy="67"
                r="3.6"
                fill="#fff"
                stroke="#cdd5e3"
                strokeWidth=".5"
              />

              {/* neon lights */}
              <g fill="#9bff63" filter="url(#nxNeon)">
                <rect
                  className="nx-led"
                  style={{ '--d': '0s' } as CSSProperties}
                  x="21"
                  y="77"
                  width="14"
                  height="3"
                  rx="1.5"
                  transform="rotate(8 28 78)"
                />
                <circle
                  className="nx-led"
                  style={{ '--d': '.3s' } as CSSProperties}
                  cx="42"
                  cy="79"
                  r="2.1"
                />
                <rect
                  className="nx-led"
                  style={{ '--d': '.6s' } as CSSProperties}
                  x="48"
                  y="80"
                  width="26"
                  height="3"
                  rx="1.5"
                />
                <circle
                  className="nx-led"
                  style={{ '--d': '.9s' } as CSSProperties}
                  cx="80"
                  cy="79"
                  r="2.1"
                />
                <rect
                  className="nx-led"
                  style={{ '--d': '1.2s' } as CSSProperties}
                  x="86"
                  y="77"
                  width="12"
                  height="3"
                  rx="1.5"
                  transform="rotate(-8 92 78)"
                />
              </g>
            </g>
          </svg>
        </span>
        <span className="nova-label">Ask Nova AI</span>
      </button>
    )
  },
)
