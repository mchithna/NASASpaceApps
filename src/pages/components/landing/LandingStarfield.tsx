import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  radius: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  alpha: number
  life: number
  maxLife: number
}

const STAR_PALETTE = [
  '245, 247, 251', // pure starlight white
  '201, 226, 255', // hot blue-white
  '217, 252, 167', // subtle nova lime tint
  '255, 228, 196', // warm amber giant
  '168, 216, 255', // cyan-blue
]

export function LandingStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )
    let isReducedMotion = reducedMotionQuery?.matches ?? false

    let width = 0
    let height = 0
    let dpr = 1
    let stars: Star[] = []
    let shootingStar: ShootingStar | null = null
    let animationFrameId = 0
    let lastShootingStarTime = performance.now()

    const createStars = (w: number, h: number) => {
      const area = w * h
      const count = Math.min(220, Math.max(85, Math.floor(area / 9500)))
      const nextStars: Star[] = []

      for (let i = 0; i < count; i++) {
        // Depth layer z: 0.2 (far) to 1.0 (near)
        const depthRoll = Math.random()
        const z =
          depthRoll < 0.6
            ? 0.2 + Math.random() * 0.3
            : depthRoll < 0.9
              ? 0.5 + Math.random() * 0.3
              : 0.8 + Math.random() * 0.2

        const radius =
          z > 0.8
            ? 1.25 + Math.random() * 0.85
            : z > 0.5
              ? 0.8 + Math.random() * 0.5
              : 0.45 + Math.random() * 0.35

        const colorIndex =
          Math.random() < 0.72
            ? Math.random() < 0.55
              ? 0
              : 1
            : Math.floor(Math.random() * STAR_PALETTE.length)

        nextStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          radius,
          baseAlpha: 0.28 + z * 0.62,
          twinkleSpeed: 0.0008 + Math.random() * 0.0024,
          twinklePhase: Math.random() * Math.PI * 2,
          color: STAR_PALETTE[colorIndex] ?? STAR_PALETTE[0],
        })
      }
      stars = nextStars
    }

    const resize = () => {
      width = window.innerWidth || 1280
      height = window.innerHeight || 800
      dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createStars(width, height)
    }

    const renderFrame = (now: number) => {
      ctx.clearRect(0, 0, width, height)

      const scrollOffset = window.scrollY * 0.08

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        if (!star) continue

        if (!isReducedMotion) {
          // Gentle horizontal cosmic drift proportional to depth
          star.x -= star.z * 0.085
          if (star.x < -4) star.x = width + 4
        }

        const parallaxY =
          ((star.y - scrollOffset * star.z) % height + height) % height

        const twinkle = isReducedMotion
          ? 1
          : 0.68 + 0.32 * Math.sin(now * star.twinkleSpeed + star.twinklePhase)
        const alpha = Math.min(1, Math.max(0.08, star.baseAlpha * twinkle))

        ctx.beginPath()
        ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`
        ctx.fill()

        // Soft halo on bright foreground stars
        if (star.z > 0.84 && alpha > 0.62) {
          ctx.beginPath()
          ctx.arc(star.x, parallaxY, star.radius * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${star.color}, ${(alpha * 0.14).toFixed(3)})`
          ctx.fill()
        }
      }

      // Occasional subtle shooting star in upper cosmos
      if (!isReducedMotion) {
        if (!shootingStar && now - lastShootingStarTime > 7500) {
          if (Math.random() < 0.03) {
            const angle = Math.PI * (0.12 + Math.random() * 0.1)
            const speed = 7 + Math.random() * 4
            shootingStar = {
              x: width * (0.15 + Math.random() * 0.65),
              y: height * (0.06 + Math.random() * 0.32),
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              length: 55 + Math.random() * 35,
              alpha: 0,
              life: 0,
              maxLife: 42 + Math.floor(Math.random() * 20),
            }
          }
          lastShootingStarTime = now - 6800
        }

        if (shootingStar) {
          shootingStar.x += shootingStar.vx
          shootingStar.y += shootingStar.vy
          shootingStar.life += 1
          const progress = shootingStar.life / shootingStar.maxLife
          shootingStar.alpha =
            progress < 0.25
              ? progress / 0.25
              : Math.max(0, 1 - (progress - 0.25) / 0.75)

          const tailX =
            shootingStar.x -
            (shootingStar.vx / 9) * shootingStar.length * progress
          const tailY =
            shootingStar.y -
            (shootingStar.vy / 9) * shootingStar.length * progress

          const grad = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            tailX,
            tailY,
          )
          grad.addColorStop(
            0,
            `rgba(217, 252, 167, ${(shootingStar.alpha * 0.85).toFixed(3)})`,
          )
          grad.addColorStop(
            0.4,
            `rgba(168, 216, 255, ${(shootingStar.alpha * 0.4).toFixed(3)})`,
          )
          grad.addColorStop(1, 'rgba(168, 216, 255, 0)')

          ctx.strokeStyle = grad
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(shootingStar.x, shootingStar.y)
          ctx.lineTo(tailX, tailY)
          ctx.stroke()

          if (shootingStar.life >= shootingStar.maxLife) {
            shootingStar = null
            lastShootingStarTime = now
          }
        }

        if (document.visibilityState !== 'hidden') {
          animationFrameId = requestAnimationFrame(renderFrame)
        }
      }
    }

    resize()
    renderFrame(performance.now())

    const onVisibilityChange = () => {
      cancelAnimationFrame(animationFrameId)
      if (document.visibilityState === 'visible' && !isReducedMotion) {
        animationFrameId = requestAnimationFrame(renderFrame)
      }
    }

    const onMotionChange = (event: MediaQueryListEvent) => {
      isReducedMotion = event.matches
      cancelAnimationFrame(animationFrameId)
      renderFrame(performance.now())
    }

    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    reducedMotionQuery?.addEventListener('change', onMotionChange)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotionQuery?.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="lp-starfield-canvas"
      aria-hidden="true"
    />
  )
}
